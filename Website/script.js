const backendURL = "https://onyx-inventory-manager-backend.onrender.com/api/invoices";

let invoices = []; // Global variable for invoices

// Fetch all invoices from the backend
async function fetchInvoices() {
    try {
        const response = await fetch(backendURL);
        if (!response.ok) throw new Error("Failed to fetch invoices");

        invoices = await response.json();
        console.log("Fetched Invoices:", invoices); // Debugging

        if (document.getElementById("invoice-table-body")) {
            displayInvoices(invoices);
        }
        if (document.getElementById("total-expenses")) {
            updateDashboard();
        }
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
    const openInvoices = invoices.filter(i => i.status === "Open").length;

    document.getElementById("total-expenses").innerText = `$${totalExpenses}`;
    document.getElementById("actual-profit").innerText = `$${actualProfit}`;
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
                <td>$${invoice.giftCardValue || 0}</td>
                <td>${invoice.status}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Render the profit chart
function renderChart() {
    const ctx = document.getElementById("profitChart")?.getContext("2d");
    if (!ctx) return;

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

// Search functionality for invoices
function setupSearch() {
    const searchBar = document.getElementById("search-bar");
    if (!searchBar) return;

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
}

// Display invoices in the table
function displayInvoices(invoicesToDisplay) {
    const tableBody = document.getElementById("invoice-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";
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

// Handle form submission to create invoices
function setupForm() {
    const form = document.getElementById("add-invoice-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newInvoice = {
            invoiceID: document.getElementById("invoice-id").value,
            date: document.getElementById("invoice-date").value,
            phoneModel: document.getElementById("phone-model").value,
            purchasePrice: parseFloat(document.getElementById("purchase-price").value),
            screenCost: parseFloat(document.getElementById("screen-cost").value) || 0,
            laborCost: parseFloat(document.getElementById("labor-cost").value) || 0,
            giftCardValue: parseFloat(document.getElementById("gift-card-value").value) || 0,
            status: "Open"
        };

        try {
            const response = await fetch(backendURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newInvoice)
            });

            if (response.ok) {
                alert("Invoice added successfully!");
                form.reset();
                fetchInvoices(); // Reload invoices after adding
                window.location.href = "index.html"; // Redirect to dashboard
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error adding invoice:", error);
            alert("Error connecting to the server. Please try again.");
        }
    });
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    fetchInvoices();
    setupSearch();
    setupForm();
});
