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

const backendURL = "https://onyx-inventory-manager-backend.onrender.com/api/invoices";

// Handle "Create Invoice" Form Submission
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-invoice-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const newInvoice = {
                invoiceID: document.getElementById("invoice-id").value,
                date: document.getElementById("invoice-date").value,
                phoneModel: document.getElementById("phone-model").value,
                purchasePrice: parseFloat(document.getElementById("purchase-price").value),
                screenCost: parseFloat(document.getElementById("screen-cost").value) || 0,
                giftCardValue: parseFloat(document.getElementById("gift-card-value").value) || 0,
                status: "Open"
            };

            fetch(backendURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newInvoice)
            })
            .then(response => response.json())
            .then(data => {
                alert("Invoice added successfully!");
                form.reset();
                window.location.href = "index.html"; // Redirect back to Home Page
            })
            .catch(error => console.error("Error adding invoice:", error));
        });
    }
});

const backendURL = "https://onyx-inventory-manager-backend.onrender.com/api/invoices";

document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("search-bar");
    const tableBody = document.getElementById("invoice-table-body");
    let invoices = [];

    // Fetch all invoices from the backend
    async function fetchInvoices() {
        try {
            const response = await fetch(backendURL);
            invoices = await response.json();
            displayInvoices(invoices);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    }

    // Display invoices in the table
    function displayInvoices(invoicesToDisplay) {
        tableBody.innerHTML = ""; // Clear previous rows

        invoicesToDisplay.forEach(invoice => {
            const row = `
                <tr>
                    <td>${invoice.invoiceID}</td>
                    <td>${new Date(invoice.date).toLocaleDateString()}</td>
                    <td>${invoice.phoneModel}</td>
                    <td>$${invoice.purchasePrice}</td>
                    <td>$${invoice.giftCardValue || 0}</td>
                    <td>${invoice.status}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // Filter invoices based on search input
    searchBar.addEventListener("input", (e) => {
        const searchQuery = e.target.value.toLowerCase();
        const filteredInvoices = invoices.filter(invoice => {
            return (
                invoice.invoiceID.toLowerCase().includes(searchQuery) ||
                new Date(invoice.date).toLocaleDateString().includes(searchQuery) ||
                invoice.phoneModel.toLowerCase().includes(searchQuery) ||
                String(invoice.purchasePrice).includes(searchQuery) ||
                String(invoice.giftCardValue).includes(searchQuery) ||
                invoice.status.toLowerCase().includes(searchQuery)
            );
        });

        displayInvoices(filteredInvoices);
    });

    // Fetch invoices on page load
    fetchInvoices();
});

