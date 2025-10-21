// Google Apps Script Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxOPU4590NZe28ZQL7O_CVYbDdY3eUrUk2Iis2Gl6FOozef8eVYDw1kgJf-zaD-Adh3/exec';

// Data structure
let subscriptionData = {
    subscriptions: []
};

// Goals configuration
const GOALS = {
    operational: 3420,
    teamTrip: 1500
};

// Tax rate for Stripe payments
const STRIPE_TAX_RATE = 0.23;

// Chart instances
let categoryChart = null;
let monthlyChart = null;

// Initialize dashboard
function init() {
    setupEventListeners();
    loadData();
}

// Setup event listeners
function setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', () => {
        refreshBtn.textContent = 'Refreshing...';
        refreshBtn.disabled = true;
        loadData();
    });
}

// Load data from Google Sheets
async function loadData() {
    try {
        console.log('Loading data from Google Sheets...');
        console.log('Fetching from:', WEB_APP_URL);

        const response = await fetch(WEB_APP_URL, {
            method: 'GET',
            redirect: 'follow'
        });

        console.log('Response received:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data loaded successfully:', data);
        console.log('Number of subscriptions:', data.subscriptions ? data.subscriptions.length : 0);

        subscriptionData = data;
        updateDashboard();

        // Reset refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.textContent = 'Refresh Data';
        refreshBtn.disabled = false;

        console.log('Dashboard updated successfully!');

    } catch (error) {
        console.error('Error loading data:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Failed to load data from Google Sheets. Error: ' + error.message);

        // Reset refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.textContent = 'Refresh Data';
        refreshBtn.disabled = false;
    }
}

// Update all dashboard components
function updateDashboard() {
    updateGoalProgress();
    updateKeyMetrics();
    updateStatusCards();
    updateCharts();
    updateTable();
}

// Calculate actual revenue received (after tax for Stripe)
function getActualRevenue(amount, category) {
    if (category === "Paid Stripe") {
        return amount * (1 - STRIPE_TAX_RATE);
    }
    return amount;
}

// Calculate total revenue
function getTotalRevenue() {
    return subscriptionData.subscriptions.reduce((sum, sub) => {
        return sum + getActualRevenue(sub.paid, sub.category);
    }, 0);
}

// Get active subscriptions count
function getActiveCount() {
    return subscriptionData.subscriptions.filter(sub => sub.active === "Yes").length;
}

// Get inactive subscriptions count
function getInactiveCount() {
    return subscriptionData.subscriptions.filter(sub => sub.active === "No").length;
}

// Get current month revenue
function getCurrentMonthRevenue() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return subscriptionData.subscriptions.reduce((sum, sub) => {
        const activeMonths = sub.activeMonths || 1;
        const totalRevenue = getActualRevenue(sub.paid, sub.category);
        const revenuePerMonth = totalRevenue / activeMonths;
        const startDate = new Date(sub.transactionDate);

        // Check if current month falls within the subscription period
        for (let i = 0; i < activeMonths; i++) {
            const checkDate = new Date(startDate);
            checkDate.setMonth(startDate.getMonth() + i);

            if (checkDate.getMonth() === currentMonth && checkDate.getFullYear() === currentYear) {
                return sum + revenuePerMonth;
            }
        }
        return sum;
    }, 0);
}

// Get average transaction value (after tax)
function getAvgTransaction() {
    const paidSubs = subscriptionData.subscriptions.filter(sub => sub.paid > 0);
    if (paidSubs.length === 0) return 0;
    const total = paidSubs.reduce((sum, sub) => sum + getActualRevenue(sub.paid, sub.category), 0);
    return total / paidSubs.length;
}

// Get expired subscriptions (active but past expiration)
function getExpiredCount() {
    const today = new Date();
    return subscriptionData.subscriptions.filter(sub => {
        if (sub.active === "Yes") {
            const expDate = new Date(sub.expirationDate);
            return expDate < today;
        }
        return false;
    }).length;
}

// Get count by category
function getCategoryCount(category) {
    return subscriptionData.subscriptions.filter(sub => sub.category === category).length;
}

// Get revenue by category (after tax)
function getRevenueByCategory() {
    const categories = {};
    subscriptionData.subscriptions.forEach(sub => {
        if (!categories[sub.category]) {
            categories[sub.category] = 0;
        }
        categories[sub.category] += getActualRevenue(sub.paid, sub.category);
    });
    return categories;
}

// Get monthly revenue data (after tax)
function getMonthlyRevenue() {
    const monthlyData = {};

    subscriptionData.subscriptions.forEach(sub => {
        const activeMonths = sub.activeMonths || 1;
        const totalRevenue = getActualRevenue(sub.paid, sub.category);
        const revenuePerMonth = totalRevenue / activeMonths;

        const startDate = new Date(sub.transactionDate);

        // Distribute revenue across all active months
        for (let i = 0; i < activeMonths; i++) {
            const currentDate = new Date(startDate);
            currentDate.setMonth(startDate.getMonth() + i);

            const monthYear = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = 0;
            }
            monthlyData[monthYear] += revenuePerMonth;
        }
    });

    return monthlyData;
}

// Update goal progress
function updateGoalProgress() {
    const totalRevenue = getTotalRevenue();

    // Goal 1: Operational Cost
    const goal1Progress = Math.min((totalRevenue / GOALS.operational) * 100, 100);
    const goal1Remaining = Math.max(GOALS.operational - totalRevenue, 0);
    const goal1Current = Math.min(totalRevenue, GOALS.operational);

    document.getElementById('goal1-progress').style.width = `${goal1Progress}%`;
    document.getElementById('goal1-current').textContent = `$${goal1Current.toFixed(2)}`;
    document.getElementById('goal1-percent').textContent = `${goal1Progress.toFixed(1)}%`;
    document.getElementById('goal1-remaining').textContent = `$${goal1Remaining.toFixed(2)}`;

    // Goal 2: Team Trip - Only allocate after operational cost is met
    let goal2Current = 0;
    let goal2Progress = 0;
    let goal2Remaining = GOALS.teamTrip;

    if (totalRevenue > GOALS.operational) {
        // Operational goal met, now allocate excess to team trip
        goal2Current = totalRevenue - GOALS.operational;
        goal2Progress = Math.min((goal2Current / GOALS.teamTrip) * 100, 100);
        goal2Remaining = Math.max(GOALS.teamTrip - goal2Current, 0);
    }

    document.getElementById('goal2-progress').style.width = `${goal2Progress}%`;
    document.getElementById('goal2-current').textContent = `$${goal2Current.toFixed(2)}`;
    document.getElementById('goal2-percent').textContent = `${goal2Progress.toFixed(1)}%`;
    document.getElementById('goal2-remaining').textContent = `$${goal2Remaining.toFixed(2)}`;
}

// Update key metrics
function updateKeyMetrics() {
    document.getElementById('total-revenue').textContent = `$${getTotalRevenue().toFixed(2)}`;
    document.getElementById('active-subs').textContent = getActiveCount();
    document.getElementById('monthly-revenue').textContent = `$${getCurrentMonthRevenue().toFixed(2)}`;
    document.getElementById('avg-transaction').textContent = `$${getAvgTransaction().toFixed(2)}`;
}

// Update status cards
function updateStatusCards() {
    document.getElementById('status-active').textContent = getActiveCount();
    document.getElementById('status-inactive').textContent = getInactiveCount();
    document.getElementById('category-stripe').textContent = getCategoryCount("Paid Stripe");
    document.getElementById('category-nowpayments').textContent = getCategoryCount("Paid Nowpayments");
    document.getElementById('category-giveaway').textContent = getCategoryCount("Giveaway");
    document.getElementById('expired-count').textContent = getExpiredCount();
}

// Update charts
function updateCharts() {
    updateCategoryChart();
    updateMonthlyChart();
}

// Update category revenue chart
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categoryRevenue = getRevenueByCategory();

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryRevenue),
            datasets: [{
                data: Object.values(categoryRevenue),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f1f5f9',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: $${context.parsed.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Update monthly revenue trend chart
function updateMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const monthlyRevenue = getMonthlyRevenue();

    if (monthlyChart) {
        monthlyChart.destroy();
    }

    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyRevenue),
            datasets: [{
                label: 'Revenue',
                data: Object.values(monthlyRevenue),
                borderColor: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Revenue: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return '$' + value;
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            }
        }
    });
}

// Update subscriptions table
function updateTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    // Sort by transaction date (most recent first)
    const sortedSubs = [...subscriptionData.subscriptions].sort((a, b) => {
        return new Date(b.transactionDate) - new Date(a.transactionDate);
    });

    // Show only the 10 most recent
    sortedSubs.slice(0, 10).forEach(sub => {
        const row = document.createElement('tr');

        // Check if expired
        const isExpired = sub.active === "Yes" && new Date(sub.expirationDate) < new Date();
        const statusClass = isExpired ? 'expired' : (sub.active === "Yes" ? 'active' : 'inactive');
        const statusText = isExpired ? 'Expired' : sub.active;

        // Calculate actual revenue for display
        const actualRevenue = getActualRevenue(sub.paid, sub.category);
        const displayAmount = sub.category === "Paid Stripe"
            ? `$${actualRevenue.toFixed(2)} <span style="color: #94a3b8; font-size: 0.85em;">($${sub.paid.toFixed(2)} - 23%)</span>`
            : `$${sub.paid.toFixed(2)}`;

        row.innerHTML = `
            <td>${sub.email}</td>
            <td>${sub.category}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${displayAmount}</td>
            <td>${sub.transactionDate}</td>
            <td>${sub.expirationDate}</td>
        `;

        tbody.appendChild(row);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
