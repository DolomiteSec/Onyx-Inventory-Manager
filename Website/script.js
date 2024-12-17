const backendURL = "https://onyx-inventory-manager-backend.onrender.com/api/invoices";

let invoices = [];

// Fetch invoices from the backend
async function fetchInvoices() {
    try {
        const response = await fetch(backendURL);
        invoices = await response.json();
        updateDashboard();
    } catch (error) {
        console.error("Error fetching invoices:", error);
    }
}

// Update the dashboard metrics and table
function updateDashboard() {
    calculateMetrics();
    populateTable();
    renderChart();
}

// Calculate and display metrics
function calculateMetrics() {
    const totalExpenses = invoices.reduce((sum, i) => sum + (i.purchasePrice || 0), 0);
    const actualProfit = invoices.reduce((sum, i) => sum + ((i.giftCardValue || 0) - (i.purchasePrice || 0)), 0);
    const potentialProfit = invoices.reduce((sum, i) => sum + ((i.potentialProfit || 0) - (i.purchasePrice || 0)), 0);
    const openInvoices = invoices.filter(i => i.status === "Open").length;

    document.getElementById("total-expenses").innerText = `$${totalExpenses}`;
    document.getElementById("actual-profit").innerText = `$${actualProfit}`;
    document.getElementById("potential-profit").innerText = `$${potentialProfit}`;
    document.getElementById("open-invoices").innerText = openInvoices;
}

// Populate the invoice table
function populateTable() {
    const tableBody = document.getElementById("invoice-table-body");
    tableBody.innerHTML = "";

    invoices.forEach(invoice => {
        const row = `
            <tr>
                <td>${invoice.invoiceID}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>${invoice.phoneModel}</td>
                <td>$${invoice.purchasePrice}</td>
                <td>$${(invoice.giftCardValue || 0) - (invoice.purchasePrice || 0)}</td>
                <td>${invoice.status}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Render the profit chart
function renderChart() {
    const ctx = document.getElementById("profitChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: invoices.map(i => i.invoiceID),
            datasets: [{
                label: "Profit per Invoice",
                data: invoices.map(i => (i.giftCardValue || 0) - (i.purchasePrice || 0)),
                backgroundColor: "rgba(75, 192, 192, 0.6)"
            }]
        }
    });
}

// Table sorting functionality
function sortTable(columnIndex) {
    const table = document.querySelector("table tbody");
    const rows = Array.from(table.rows);

    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].innerText;
        const cellB = b.cells[columnIndex].innerText;

        return cellA.localeCompare(cellB, undefined, { numeric: true });
    });

    table.innerHTML = "";
    rows.forEach(row => table.appendChild(row));
}

// Initialize dashboard
fetchInvoices();
