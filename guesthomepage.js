// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseDateInput = document.getElementById('expense-date');
const expenseList = document.getElementById('expense-list');
const noExpenseMessage = document.getElementById('no-expense-message');
const totalExpenseElement = document.getElementById('total-expense');
const expenseByCategoryElement = document.getElementById('expense-by-category');
const clearAllBtn = document.getElementById('clear-all-btn');
const editExpenseForm = document.getElementById('edit-expense-form');
const editExpenseId = document.getElementById('edit-expense-id');
const editExpenseName = document.getElementById('edit-expense-name');
const editExpenseAmount = document.getElementById('edit-expense-amount');
const editExpenseCategory = document.getElementById('edit-expense-category');
const editExpenseDate = document.getElementById('edit-expense-date');
const saveEditBtn = document.getElementById('save-edit-btn');
const expenseChart = document.getElementById('expense-chart');
const noChartMessage = document.getElementById('no-chart-message');

// Bootstrap Modal
const editExpenseModal = new bootstrap.Modal(document.getElementById('edit-expense-modal'));

// Set default date to today
const today = new Date().toISOString().split('T')[0];
expenseDateInput.value = today;

// Initialize expenses array
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Chart instance
let myChart = null;

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Render expenses list
function renderExpenses() {
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    expenseList.innerHTML = '';

    if (sortedExpenses.length === 0) {
        noExpenseMessage.style.display = 'block';
    } else {
        noExpenseMessage.style.display = 'none';
        sortedExpenses.forEach(expense => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', expense.id);
            row.classList.add('transition-fade');

            const categoryClass = `category-${expense.category.toLowerCase()}`;

            row.innerHTML = `
                <td>${expense.name}</td>
                <td>${formatCurrency(expense.amount)}</td>
                <td><span class="category-badge ${categoryClass}">${expense.category}</span></td>
                <td>${formatDate(expense.date)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary action-btn edit-btn" data-id="${expense.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn delete-btn" data-id="${expense.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            expenseList.appendChild(row);
        });
    }
}

// Update summary
function updateSummary() {
    const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    totalExpenseElement.textContent = formatCurrency(total);

    const categoryMap = {};
    expenses.forEach(expense => {
        categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    });

    expenseByCategoryElement.innerHTML = '';
    Object.keys(categoryMap).sort().forEach(category => {
        const amount = categoryMap[category];
        const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
        const categoryClass = `category-${category.toLowerCase()}`;

        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <div>
                <span class="category-badge ${categoryClass}">${category}</span>
            </div>
            <div>
                <span class="fw-bold">${formatCurrency(amount)}</span>
                <span class="text-muted ms-2">(${percentage}%)</span>
            </div>
        `;
        expenseByCategoryElement.appendChild(listItem);
    });
}

// Update chart
function updateChart() {
    if (myChart) {
        myChart.destroy();
    }

    if (expenses.length === 0) {
        noChartMessage.style.display = 'block';
        expenseChart.style.display = 'none';
        return;
    }

    noChartMessage.style.display = 'none';
    expenseChart.style.display = 'block';

    const categoryMap = {};
    expenses.forEach(expense => {
        categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    });

    const categories = Object.keys(categoryMap);
    const amounts = categories.map(category => categoryMap[category]);

    const categoryColors = {
        'Food': 'rgba(46, 125, 50, 0.7)',
        'Transport': 'rgba(21, 101, 192, 0.7)',
        'Entertainment': 'rgba(255, 143, 0, 0.7)',
        'Shopping': 'rgba(194, 24, 91, 0.7)',
        'Utilities': 'rgba(57, 73, 171, 0.7)',
        'Health': 'rgba(85, 139, 47, 0.7)',
        'Other': 'rgba(97, 97, 97, 0.7)'
    };

    const colors = categories.map(cat => categoryColors[cat] || 'rgba(97, 97, 97, 0.7)');

    myChart = new Chart(expenseChart, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Add expense
function addExpense(e) {
    e.preventDefault();

    const name = expenseNameInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);
    const category = expenseCategoryInput.value;
    const date = expenseDateInput.value;

    if (!name || isNaN(amount) || !category || !date) {
        alert('Please fill all fields with valid data');
        return;
    }

    const expense = {
        id: Date.now().toString(),
        name,
        amount,
        category,
        date,
        timestamp: new Date().getTime()
    };

    expenses.push(expense);
    saveExpenses();
    renderExpenses();
    updateSummary();
    updateChart();
    
    expenseForm.reset();
    expenseDateInput.value = today;
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        renderExpenses();
        updateSummary();
        updateChart();
    }
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    editExpenseId.value = expense.id;
    editExpenseName.value = expense.name;
    editExpenseAmount.value = expense.amount;
    editExpenseCategory.value = expense.category;
    editExpenseDate.value = expense.date;

    editExpenseModal.show();
}

// Save edited expense
function saveEditedExpense() {
    const id = editExpenseId.value;
    const updated = {
        name: editExpenseName.value.trim(),
        amount: parseFloat(editExpenseAmount.value),
        category: editExpenseCategory.value,
        date: editExpenseDate.value
    };

    const index = expenses.findIndex(exp => exp.id === id);
    if (index !== -1) {
        expenses[index] = { ...expenses[index], ...updated };
        saveExpenses();
        renderExpenses();
        updateSummary();
        updateChart();
        editExpenseModal.hide();
    }
}

// Clear all expenses
function clearAllExpenses() {
    if (confirm('Are you sure you want to delete ALL expenses?')) {
        expenses = [];
        saveExpenses();
        renderExpenses();
        updateSummary();
        updateChart();
    }
}

// Initialize the application
function init() {
    renderExpenses();
    updateSummary();
    updateChart();
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    expenseForm.addEventListener('submit', addExpense);

    expenseList.addEventListener('click', e => {
        const target = e.target.closest('button');
        if (!target) return;

        const id = target.getAttribute('data-id');

        if (target.classList.contains('delete-btn')) {
            deleteExpense(id);
        } else if (target.classList.contains('edit-btn')) {
            editExpense(id);
        }
    });

    saveEditBtn.addEventListener('click', saveEditedExpense);
    clearAllBtn.addEventListener('click', clearAllExpenses);
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);