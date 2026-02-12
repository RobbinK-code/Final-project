// Transaction logic with validation and helpful messages
const form = document.getElementById('transaction-form');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const typeInput = document.getElementById('type');
const transactionsList = document.getElementById('transactions-list');
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const errorMsg = document.getElementById('error-msg');

let transactions = [];

// Load saved transactions if available. Using try/catch to avoid errors when
// localStorage is disabled (some privacy modes disable it).
try {
	const saved = localStorage.getItem('transactions');
	if (saved) transactions = JSON.parse(saved);
} catch (e) {
	transactions = [];
}

// Render transactions and totals
function render() {
	transactionsList.innerHTML = '';

	// Function to calculate totals.
	// Total is the sum of signed amounts: incomes positive, expenses negative.
	const total = transactions.reduce((s, t) => s + t.amount, 0);
	const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
	const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

	totalBalanceEl.textContent = formatCurrency(total);
	totalIncomeEl.textContent = formatCurrency(income);
	totalExpensesEl.textContent = formatCurrency(Math.abs(expenses));

	// Render each transaction with category and delete action
	transactions.forEach(tx => {
		const li = document.createElement('li');
		const left = document.createElement('div');
		left.className = 'tx-left';
		const desc = document.createElement('div');
		desc.innerHTML = `<div class="tx-desc">${escapeHtml(tx.description)}</div><div class="tx-meta">${tx.category}</div>`;
		left.appendChild(desc);

		const amount = document.createElement('div');
		amount.className = 'tx-amount ' + (tx.amount >= 0 ? 'income' : 'expense');
		amount.textContent = formatCurrency(tx.amount);

		const actions = document.createElement('div');
		actions.className = 'tx-actions';
		const del = document.createElement('button');
		del.textContent = 'Delete';
		del.addEventListener('click', () => { removeTransaction(tx.id); });
		actions.appendChild(del);

		li.appendChild(left);
		li.appendChild(amount);
		li.appendChild(actions);
		transactionsList.appendChild(li);
	});
}

// Validate input fields before adding a transaction
function validateInput(description, rawAmount, category) {
	// Required fields: description and category
	if (!description || !category) {
		// Required fields missing: show an alert per requirement
		alert('All fields are required to track your finances accurately');
		return false;
	}

	// Amount must be a number and strictly positive
	if (isNaN(rawAmount) || rawAmount <= 0) {
		errorMsg.textContent = 'Please enter a valid positive amount';
		return false;
	}

	// Clear previous error if validation passes
	errorMsg.textContent = '';
	return true;
}

// Add a new transaction with validation and feedback
function addTransaction(e) {
	e.preventDefault();
	const description = descInput.value.trim();
	const rawAmount = parseFloat(amountInput.value);
	const category = categoryInput.value;
	const type = typeInput.value;

	// Validate inputs; shows either alert or inline message
	if (!validateInput(description, rawAmount, category)) return;

	// Convert to signed amount (expenses stored as negative values)
	const amount = type === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

	const tx = { id: Date.now(), description, amount, category };
	transactions.push(tx);
	save();
	render();
	form.reset();
}

function removeTransaction(id) {
	transactions = transactions.filter(t => t.id !== id);
	save();
	render();
}

function save() {
	try { localStorage.setItem('transactions', JSON.stringify(transactions)); } catch (e) { /* ignore */ }
}

// Format currency display consistently
function formatCurrency(num) {
	return (num >= 0 ? '$' + num.toFixed(2) : '-$' + Math.abs(num).toFixed(2));
}

// Escape HTML when rendering user-provided text to avoid injection
function escapeHtml(s) {
	return String(s).replace(/[&"'<>]/g, c => ({'&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'}[c]));
}

form.addEventListener('submit', addTransaction);

// Initial render
render();

