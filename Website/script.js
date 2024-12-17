const backendURL = "https://onyx-inventory-manager-backend.onrender.com/api/invoices";

let invoices = []; // Global variable for invoices

// Fetch all invoices from the backend
async function fetchInvoices() {
    try {
        const response = await fetch(backendURL);
        if (!response.ok) throw new Error("Failed to fetch invoices");

        invoices = await response.json();
        console.log("Fetched Invoices:", invoices);

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

// Update dashboard metrics
function updateDashboard() {
    const totalExpenses = invoices.reduce((sum, i) => sum + (i.purchasePrice || 0), 0);
    const actualProfit = invoices.reduce((sum, i) => sum + ((i.giftCardValue || 0) - (i.purchasePrice || 0)), 0);
    const openInvoices = invoices.filter(i => i.status === "Open").length;

    document.getElementById("total-expenses").innerText = `$${totalExpenses}`;
    document.getElementById("actual-profit").innerText = `$${actualProfit}`;
    document.getElementById("open-invoices").innerText = openInvoices;
}

// Display invoices in the table
function displayInvoices(invoicesToDisplay) {
    const tableBody = document.getElementById("invoice-table-body");
    tableBody.innerHTML = ""; // Clear existing rows

    invoicesToDisplay.forEach(invoice => {
        const row = `
            <tr>
                <td>${invoice.invoiceID}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>${invoice.phoneModel}</td>
                <td>$${invoice.purchasePrice}</td>
                <td>$${invoice.giftCardValue || 0}</td>
                <td>$${(invoice.giftCardValue || 0) - (invoice.purchasePrice || 0)}</td>
                <td>${invoice.status}</td>
                <td>
                    <button onclick="toggleStatus('${invoice._id}', '${invoice.status}')">
                        Mark as ${invoice.status === "Open" ? "Closed" : "Open"}
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Toggle invoice status (Open/Closed)
async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === "Open" ? "Closed" : "Open";

    try {
        const response = await fetch(`${backendURL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert(`Invoice marked as ${newStatus}`);
            fetchInvoices(); // Reload invoices
        } else {
            alert("Failed to update invoice status.");
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
    fetchInvoices();
    setupSearch();
});

// Search functionality
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
                invoice.status.toLowerCase().includes(searchQuery)
            );
        });

        displayInvoices(filteredInvoices);
    });
}
