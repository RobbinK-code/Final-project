# Personal Finance Tracker

A personal finance tool designed to help users track monthly income and expenses to improve financial literacy.

**Technologies Used:**
- HTML
- CSS
- JavaScript (vanilla)

**How it works:**
- Add transactions with a description, amount, category and type (Income or Expense).
- Dashboard shows Total Balance, Total Income, and Total Expenses.
- Transactions are color-coded: green for income, red for expenses. Category badges use a consistent palette to make categories easy to scan.

**Known Bugs / Limitations:**
- Data is stored locally in the browser `localStorage` — there is no user authentication and data will not sync across devices.
- If `localStorage` is disabled in the browser (privacy modes), data will not persist between sessions.

**Colors / Palette:**
- Housing: --accent-1 (warm amber)
- Food: --accent-2 (soft red)
- Transportation: --accent-3 (teal)
- Entertainment: --accent-4 (purple)
- Utilities: --accent-5 (light blue)
- Other: --accent-6 (gray)

To clear all saved transactions locally, open the browser DevTools Console and run:

```javascript
localStorage.removeItem('transactions');
```

**Notes for the repository owner:**
- Add the following short summary to the repository About section on GitHub:
  "A personal finance tool designed to help users track monthly income and expenses to improve financial literacy."
