// Basic transaction logic: store transactions in memory (and localStorage when supported)
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

// Load saved transactions if available
try {
	const saved = localStorage.getItem('transactions');
	if (saved) transactions = JSON.parse(saved);
} catch (e) {
	// localStorage might be unavailable in some environments
	transactions = [];
}

// Render transactions and totals
function render() {
	transactionsList.innerHTML = '';

	// Calculate totals: incomes are positive, expenses negative
	const total = transactions.reduce((s, t) => s + t.amount, 0);
	const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
	const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

	// Update dashboard values
	totalBalanceEl.textContent = formatCurrency(total);
	totalIncomeEl.textContent = formatCurrency(income);
	totalExpensesEl.textContent = formatCurrency(Math.abs(expenses));

	// Render each transaction
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

// Add a new transaction (basic: no strict validation yet)
function addTransaction(e) {
	e.preventDefault();
	const description = descInput.value.trim();
	const rawAmount = parseFloat(amountInput.value);
	const category = categoryInput.value;
	const type = typeInput.value;

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

function formatCurrency(num) {
	return (num >= 0 ? '$' + num.toFixed(2) : '-$' + Math.abs(num).toFixed(2));
}

// Simple HTML escape to prevent injection when rendering descriptions
function escapeHtml(s) {
	return String(s).replace(/[&"'<>]/g, c => ({'&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'}[c]));
}

form.addEventListener('submit', addTransaction);

// Initial render
render();

