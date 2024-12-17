// script.js

// Sample invoice data (this would later come from a database)
const invoices = [
    { id: "INV001", date: "2024-10-01", model: "iPhone 11", cost: 270, profit: 130, status: "Closed" },
    { id: "INV002", date: "2024-10-05", model: "iPhone XR", cost: 220, profit: 80, status: "Open" },
];

// Metrics
function calculateMetrics() {
    let totalExpenses = 0;
    let actualProfit = 0;
    let openInvoices = 0;

    invoices.forEach((invoice) => {
        totalExpenses += invoice.cost;
        actualProfit += invoice.profit;
        if (invoice.status === "Open") openInvoices++;
    });

    document.getElementById("total-expenses").innerText = `$${totalExpenses}`;
    document.getElementById("actual-profit").innerText = `$${actualProfit}`;
    document.getElementById("open-invoices").innerText = openInvoices;
}

// Populate Invoice Table
function populateTable() {
    const tbody = document.getElementById("invoice-body");
    tbody.innerHTML = ""; // Clear existing rows

    invoices.forEach((invoice) => {
        const row = `<tr>
            <td>${invoice.id}</td>
            <td>${invoice.date}</td>
            <td>${invoice.model}</td>
            <td>$${invoice.cost}</td>
            <td>$${invoice.profit}</td>
            <td>${invoice.status}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Chart.js for Profit Overview
function renderChart() {
    const ctx = document.getElementById("profitChart").getContext("2d");
    const profitChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: invoices.map((i) => i.id),
            datasets: [
                {
                    label: "Profit per Invoice",
                    data: invoices.map((i) => i.profit),
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
            ],
        },
    });
}

// Initialize Dashboard
function init() {
    calculateMetrics();
    populateTable();
    renderChart();
}

init();
