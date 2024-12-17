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

        // Display invoices only if the table exists
        if (document.getElementById("invoice-table-body")) {
            displayInvoices(invoices);
        }

        // Update dashboard only if dashboard elements exist
        if (
            document.getElementById("total-expenses") &&
            document.getElementById("open-invoices") &&
            document.getElementById("total-devices")
        ) {
            updateDashboard();
        }
    } catch (error) {
        console.error("Error fetching invoices:", error);
    }
}


// Update dashboard metrics
function updateDashboard() {
    const totalExpensesElem = document.getElementById("total-expenses");
    const actualProfitElem = document.getElementById("actual-profit");
    const potentialProfitElem = document.getElementById("potential-profit");
    const openInvoicesElem = document.getElementById("open-invoices");

    // Safely check for required elements
    if (
        !totalExpensesElem ||
        !actualProfitElem ||
        !potentialProfitElem ||
        !openInvoicesElem
    ) {
        console.warn("Dashboard elements not found. Skipping dashboard update.");
        return;
    }

    // Initialize metrics
    let totalExpenses = 0;
    let actualProfit = 0;
    let potentialProfit = 0;
    let openInvoices = 0;

    invoices.forEach((invoice) => {
        totalExpenses += invoice.purchasePrice || 0; // Sum up purchase prices
        actualProfit += (invoice.giftCardValue || 0) - (invoice.purchasePrice || 0); // Calculate actual profit
        potentialProfit += (invoice.giftCardValue || 0); // Potential profit is gift card value
        if (invoice.status === "Open") openInvoices++; // Count open invoices
    });

    // Update the DOM with calculated values
    totalExpensesElem.innerText = `$${totalExpenses}`;
    actualProfitElem.innerText = `$${actualProfit}`;
    potentialProfitElem.innerText = `$${potentialProfit}`;
    openInvoicesElem.innerText = openInvoices;
}


// Add Rows to Device Table
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
            <td><input type="text" placeholder="How Sold"></td>
        </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", newRow);
}

// Display invoices in the table
function displayInvoices(invoicesToDisplay) {
    const tableBody = document.getElementById("invoice-table-body");

    // Check if the table body exists
    if (!tableBody) {
        console.error("Table body with ID 'invoice-table-body' not found.");
        return;
    }

    console.log("Invoices to Display:", invoicesToDisplay); // Debugging
    tableBody.innerHTML = ""; // Clear existing rows

    // Loop through invoices
    invoicesToDisplay.forEach((invoice) => {
        const row = `
            <tr>
                <td>${invoice.invoiceID || "N/A"}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>${invoice.phoneModel || "N/A"}</td>
                <td>$${invoice.purchasePrice || 0}</td>
                <td>$${invoice.giftCardValue || 0}</td>
                <td>$${(invoice.giftCardValue || 0) - (invoice.purchasePrice || 0)}</td>
                <td>${invoice.status || "Open"}</td>
                <td>
                    <button onclick="toggleInvoiceStatus('${invoice._id}', '${invoice.status}')">
                        Mark as ${invoice.status === "Open" ? "Closed" : "Open"}
                    </button>
                    <button onclick="navigateToInvoice('${invoice._id}')">
                        View/Edit
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
    });
}

// Function to handle navigation to the invoice-details page
function navigateToInvoice(invoiceId) {
    // Redirect to the invoice-details page with the invoice ID as a query parameter
    window.location.href = `invoice-details.html?id=${invoiceId}`;
}


// Submit the Invoice Form
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-invoice-form");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Collect Invoice Data
            const invoiceData = {
                customerName: document.getElementById("customer-name").value,
                date: document.getElementById("invoice-date").value,
                trackingNumber: document.getElementById("tracking-number").value || null,
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
                    alert("Error creating invoice. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error connecting to server.");
            }
        });
    }

    // Fetch invoices if on dashboard page
    if (document.getElementById("invoice-table-body")) {
        fetchInvoices();
    }
});
