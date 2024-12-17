const backendURL =
    "https://onyx-inventory-manager-backend.onrender.com/api/invoices";

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
    const totalExpenses = invoices.reduce(
        (sum, i) => sum + (i.purchasePrice || 0),
        0
    );
    const actualProfit = invoices.reduce(
        (sum, i) => sum + ((i.giftCardValue || 0) - (i.purchasePrice || 0)),
        0
    );
    const openInvoices = invoices.filter((i) => i.status === "Open").length;

    document.getElementById("total-expenses").innerText = `$${totalExpenses}`;
    document.getElementById("actual-profit").innerText = `$${actualProfit}`;
    document.getElementById("open-invoices").innerText = openInvoices;
}

// Function to Add Rows to Device Table
function addDeviceRow() {
    const tableBody = document.getElementById("device-table-body");
    const newRow = `
        <tr>
            <td><input type="text" placeholder="IMEI" required></td>
            <td><input type="text" placeholder="Model" required></td>
            <td><input type="text" placeholder="Color"></td>
            <td><input type="text" placeholder="Storage"></td>
            <td><input type="text" placeholder="Serial Number"></td>
            <td><input type="text" placeholder="Yes/No"></td>
            <td><input type="text" placeholder="iCloud Status"></td>
            <td><input type="text" placeholder="Blacklist Status"></td>
            <td><input type="text" placeholder="Country"></td>
            <td><input type="text" placeholder="SIM-Lock"></td>
            <td><input type="number" placeholder="Price" required></td>
            <td>
                <select>
                    <option value="Open">Open</option>
                    <option value="Sold">Sold</option>
                </select>
            </td>
            <td><input type="text" placeholder="How Sold (if applicable)"></td>
        </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", newRow);
}

// Display invoices in the table
function displayInvoices(invoicesToDisplay) {
    const tableBody = document.getElementById("invoice-table-body");
    tableBody.innerHTML = ""; // Clear existing rows

    invoicesToDisplay.forEach((invoice) => {
        const row = `
            <tr>
                <td>${invoice.invoiceID}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>${invoice.phoneModel}</td>
                <td>$${invoice.purchasePrice}</td>
                <td>$${invoice.giftCardValue || 0}</td>
                <td>$${
                    (invoice.giftCardValue || 0) - (invoice.purchasePrice || 0)
                }</td>
                <td>${invoice.status}</td>
                <td>
                    <button onclick="toggleStatus('${invoice._id}', '${
            invoice.status
        }')">
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
            body: JSON.stringify({ status: newStatus }),
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
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect Invoice Data
    const invoiceData = {
        customerName: document.getElementById("customer-name").value,
        date: document.getElementById("invoice-date").value,
        trackingNumber:
            document.getElementById("tracking-number").value || null,
        totalPrice: parseFloat(document.getElementById("total-price").value),
        devices: [],
    };

    // Collect Devices from Table
    const rows = document.querySelectorAll("#device-table-body tr");
    rows.forEach((row) => {
        const inputs = row.querySelectorAll("input, select");
        const device = {
            imei: inputs[0].value,
            model: inputs[1].value,
            color: inputs[2].value,
            storage: inputs[3].value,
            serialNumber: inputs[4].value,
            activationStatus: inputs[5].value,
            icloudStatus: inputs[6].value,
            blacklistStatus: inputs[7].value,
            purchaseCountry: inputs[8].value,
            simLockStatus: inputs[9].value,
            price: parseFloat(inputs[10].value),
            status: inputs[11].value,
            howSold: inputs[12].value || null,
        };
        invoiceData.devices.push(device);
    });

    // Validate Total Price
    const priceSum = invoiceData.devices.reduce((sum, d) => sum + d.price, 0);
    if (priceSum !== invoiceData.totalPrice) {
        alert("Error: Device prices do not match the total price.");
        return;
    }

    // Send Data to Backend
    try {
        const response = await fetch(backendURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoiceData),
        });

        if (response.ok) {
            alert("Invoice created successfully!");
            form.reset();
            window.location.href = "index.html"; // Redirect to dashboard
        } else {
            console.error("Failed to create invoice");
            alert("Error creating invoice. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error connecting to server.");
    }
});

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
        const filteredInvoices = invoices.filter((invoice) => {
            return (
                invoice.invoiceID.toLowerCase().includes(searchQuery) ||
                new Date(invoice.date)
                    .toLocaleDateString()
                    .includes(searchQuery) ||
                invoice.phoneModel.toLowerCase().includes(searchQuery) ||
                String(invoice.purchasePrice).includes(searchQuery) ||
                invoice.status.toLowerCase().includes(searchQuery)
            );
        });

        displayInvoices(filteredInvoices);
    });
}
