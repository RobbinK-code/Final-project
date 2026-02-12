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
let monthlyIncome = 0;
let monthlyDues = [];

// Load saved data if available. Using try/catch to avoid errors when
// localStorage is disabled (some privacy modes disable it).
try {
  const saved = localStorage.getItem('transactions');
  if (saved) transactions = JSON.parse(saved);
  const savedIncome = localStorage.getItem('monthlyIncome');
  if (savedIncome) monthlyIncome = parseFloat(savedIncome);
  const savedDues = localStorage.getItem('monthlyDues');
  if (savedDues) monthlyDues = JSON.parse(savedDues);
} catch (e) {
  transactions = [];
  monthlyIncome = 0;
  monthlyDues = [];
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
		// Create a category badge and metadata element
		const badge = document.createElement('span');
		badge.className = 'category-badge';
		badge.style.backgroundColor = categoryColor(tx.category);
		const meta = `<div class="tx-meta"><span class="cat">${escapeHtml(tx.category)}</span></div>`;
		desc.innerHTML = `<div class="tx-desc">${escapeHtml(tx.description)}</div>${meta}`;
		// Insert badge before the category text
		const metaEl = desc.querySelector('.tx-meta');
		if (metaEl) metaEl.prepend(badge);
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

// Map categories to palette colors. If a category is unknown, return a neutral color.
function categoryColor(category) {
	const map = {
		'Housing': getComputedStyle(document.documentElement).getPropertyValue('--accent-1').trim() || '#ffb74d',
		'Food': getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#ff8a80',
		'Transportation': getComputedStyle(document.documentElement).getPropertyValue('--accent-3').trim() || '#80cbc4',
		'Entertainment': getComputedStyle(document.documentElement).getPropertyValue('--accent-4').trim() || '#9575cd',
		'Utilities': getComputedStyle(document.documentElement).getPropertyValue('--accent-5').trim() || '#64b5f6',
		'Other': getComputedStyle(document.documentElement).getPropertyValue('--accent-6').trim() || '#bdbdbd'
	};
	return map[category] || '#bdbdbd';
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
  try { 
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('monthlyIncome', monthlyIncome.toString());
    localStorage.setItem('monthlyDues', JSON.stringify(monthlyDues));
  } catch (e) { /* ignore */ }
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

// Event listeners for monthly income
document.getElementById('set-income-btn').addEventListener('click', () => {
  const rawIncome = parseFloat(document.getElementById('monthly-income').value);
  if (isNaN(rawIncome) || rawIncome < 0) {
    alert('Please enter a valid non-negative monthly income');
    return;
  }
  monthlyIncome = rawIncome;
  save();
  renderMonthlyIncome();
  render();
});

// Event listeners for monthly dues
document.getElementById('add-due-btn').addEventListener('click', () => {
  const dueName = document.getElementById('due-name').value.trim();
  const dueAmount = parseFloat(document.getElementById('due-amount').value);
  const dueErrorMsg = document.getElementById('due-error-msg');

  // Validate input
  if (!dueName || isNaN(dueAmount) || dueAmount <= 0) {
    dueErrorMsg.textContent = 'Please enter a valid due name and positive amount';
    return;
  }

  dueErrorMsg.textContent = '';
  const due = { id: Date.now(), name: dueName, amount: dueAmount };
  monthlyDues.push(due);
  save();
  renderMonthlyDues();
  render();
  document.getElementById('due-name').value = '';
  document.getElementById('due-amount').value = '';
});

// Render monthly income section
function renderMonthlyIncome() {
  document.getElementById('monthly-income-display').textContent = `Monthly Income: ${formatCurrency(monthlyIncome)}`;
}

// Render monthly dues list and summary
function renderMonthlyDues() {
  const duesList = document.getElementById('dues-list');
  duesList.innerHTML = '';

  // Calculate total dues
  const totalDues = monthlyDues.reduce((sum, due) => sum + due.amount, 0);
  const remainingAfterDues = monthlyIncome - totalDues;

  // Render each due
  monthlyDues.forEach(due => {
    const li = document.createElement('li');
    const nameEl = document.createElement('div');
    nameEl.className = 'due-name';
    nameEl.textContent = escapeHtml(due.name);

    const amountEl = document.createElement('div');
    amountEl.className = 'due-amount';
    amountEl.textContent = formatCurrency(due.amount);

    const actionsEl = document.createElement('div');
    actionsEl.className = 'due-actions';
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      monthlyDues = monthlyDues.filter(d => d.id !== due.id);
      save();
      renderMonthlyDues();
      render();
    });
    actionsEl.appendChild(delBtn);

    li.appendChild(nameEl);
    li.appendChild(amountEl);
    li.appendChild(actionsEl);
    duesList.appendChild(li);
  });

  // Update summary
  document.getElementById('total-dues').textContent = formatCurrency(totalDues);
  document.getElementById('remaining-after-dues').textContent = formatCurrency(remainingAfterDues);
}

// Initial render
render();
renderMonthlyIncome();
renderMonthlyDues();
