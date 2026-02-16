document.addEventListener("DOMContentLoaded", function () {

  const transactionsList = document.getElementById("transactions-list");
  const totalBalanceEl = document.getElementById("total-balance");
  const totalIncomeEl = document.getElementById("total-income");
  const totalExpensesEl = document.getElementById("total-expenses");

  const monthlyIncomeInput = document.getElementById("monthly-income");
  const monthlyIncomeDisplay = document.getElementById("monthly-income-display");
  const setIncomeBtn = document.getElementById("set-income-btn");

  const dueNameInput = document.getElementById("due-name");
  const dueAmountInput = document.getElementById("due-amount");
  const addDueBtn = document.getElementById("add-due-btn");
  const duesList = document.getElementById("dues-list");
  const totalDuesEl = document.getElementById("total-dues");
  const remainingAfterDuesEl = document.getElementById("remaining-after-dues");

  const form = document.getElementById("transaction-form");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const dateInput = document.getElementById("date");
  const historyBody = document.getElementById("transaction-history-body");


  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let monthlyIncome = parseFloat(localStorage.getItem("monthlyIncome")) || 0;
  let dues = JSON.parse(localStorage.getItem("dues")) || [];

  function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("monthlyIncome", monthlyIncome);
    localStorage.setItem("dues", JSON.stringify(dues));
  }

  // ADD TRANSACTION

  function addTransaction(e) {
  e.preventDefault();

  const date = dateInput.value;
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;

  if (!date || description === "" || isNaN(amount) || amount <= 0 || type === "") {
    alert("Please fill in all fields correctly.");
    return;
  }

  transactions.push({
    id: Date.now(),
    date: date,
    description: description,
    amount: amount,
    type: type
  });

  saveData();

  dateInput.value = "";
  descriptionInput.value = "";
  amountInput.value = "";
  typeInput.value = "";

  alert("Transaction added successfully!");
}

  // RENDER FUNCTION

  function render() {

    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expenses += t.amount;
    });

    const totalDues = dues.reduce((sum, d) => sum + d.amount, 0);
    const balance = monthlyIncome + income - expenses - totalDues;

    // Dashboard
    if (totalIncomeEl) totalIncomeEl.textContent = `$${income.toFixed(2)}`;
    if (totalExpensesEl) totalExpensesEl.textContent = `$${expenses.toFixed(2)}`;
    if (totalBalanceEl) totalBalanceEl.textContent = `$${balance.toFixed(2)}`;

    if (monthlyIncomeDisplay)
      monthlyIncomeDisplay.textContent = `Monthly Income: $${monthlyIncome.toFixed(2)}`;

    // Transactions list (index page)
    if (transactionsList) {
      transactionsList.innerHTML = "";
      transactions.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `
          ${t.description} - ${t.type === "expense" ? "-" : "+"}$${t.amount}
          <button onclick="deleteTransaction(${t.id})">X</button>
        `;
        transactionsList.appendChild(li);
      });
    }

    // Dues
    if (duesList) {
      duesList.innerHTML = "";
      dues.forEach(d => {
        const li = document.createElement("li");
        li.innerHTML = `
          ${d.name} - $${d.amount}
          <button onclick="deleteDue(${d.id})">X</button>
        `;
        duesList.appendChild(li);
      });

      if (totalDuesEl) totalDuesEl.textContent = `$${totalDues.toFixed(2)}`;
      if (remainingAfterDuesEl)
        remainingAfterDuesEl.textContent = `$${(monthlyIncome - totalDues).toFixed(2)}`;
    }

    // History Page Table
    if (historyBody) {
      historyBody.innerHTML = "";
      transactions.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${t.date}</td>
          <td>${t.description}</td>
          <td>$${t.amount.toFixed(2)}</td>
          <td>${t.type}</td>
        `;
        historyBody.appendChild(row);
      });
    }
  }

  // MONTHLY INCOME

  if (setIncomeBtn) {
    setIncomeBtn.addEventListener("click", function () {
      const value = parseFloat(monthlyIncomeInput.value);
      if (isNaN(value) || value < 0) return alert("Enter valid income.");
      monthlyIncome = value;
      saveData();
      render();
      monthlyIncomeInput.value = "";
    });
  }

  // ADD DUE

  if (addDueBtn) {
    addDueBtn.addEventListener("click", function () {
      const name = dueNameInput.value.trim();
      const amount = parseFloat(dueAmountInput.value);
      if (name === "" || isNaN(amount) || amount <= 0)
        return alert("Enter valid due.");
      dues.push({ id: Date.now(), name, amount });
      saveData();
      render();
      dueNameInput.value = "";
      dueAmountInput.value = "";
    });
  }

  if (form) {
    form.addEventListener("submit", addTransaction);
  }

  render();
});
