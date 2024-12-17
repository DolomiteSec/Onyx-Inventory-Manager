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

        // Safely display invoices and update the dashboard
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
    const totalExpensesElem = document.getElementById("total-expenses");
    const openInvoicesElem = document.getElementById("open-invoices");
    const totalDevicesElem = document.getElementById("total-devices");

    // Check if all required elements exist
    if (!totalExpensesElem || !openInvoicesElem || !totalDevicesElem) {
        console.warn("Dashboard elements not found. Skipping dashboard update.");
        return;
    }

    let totalExpenses = 0;
    let totalDevices = 0;
    let openInvoices = 0;

    invoices.forEach((invoice) => {
        // Safely check for devices array
        const devices = invoice.devices || [];
        totalDevices += devices.length;

        // Add total price of each device
        totalExpenses += devices.reduce((sum, d) => sum + (d.price || 0), 0);

        // Count invoices with open devices
        if (devices.some((d) => d.status === "Open")) {
            openInvoices++;
        }
    });

    // Update dashboard metrics
    totalExpensesElem.innerText = `$${totalExpenses}`;
    openInvoicesElem.innerText = openInvoices;
    totalDevicesElem.innerText = totalDevices;
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
    tableBody.innerHTML = ""; // Clear existing rows

    invoicesToDisplay.forEach((invoice) => {
        const devices = invoice.devices || []; // Default to empty array

        if (devices.length === 0) {
            // Placeholder for invoices without devices
            const row = `
                <tr>
                    <td>${invoice.customerName || "Unknown"}</td>
                    <td>${new Date(invoice.date).toLocaleDateString()}</td>
                    <td colspan="12">No devices available</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        } else {
            // Display devices if they exist
            devices.forEach((device) => {
                const row = `
                    <tr>
                        <td>${invoice.customerName || "Unknown"}</td>
                        <td>${new Date(invoice.date).toLocaleDateString()}</td>
                        <td>${device.imei || "N/A"}</td>
                        <td>${device.model || "N/A"}</td>
                        <td>${device.color || "N/A"}</td>
                        <td>${device.storage || "N/A"}</td>
                        <td>${device.serialNumber || "N/A"}</td>
                        <td>${device.activationStatus || "N/A"}</td>
                        <td>${device.icloudStatus || "N/A"}</td>
                        <td>${device.blacklistStatus || "N/A"}</td>
                        <td>${device.purchaseCountry || "N/A"}</td>
                        <td>${device.simLockStatus || "N/A"}</td>
                        <td>$${device.price || 0}</td>
                        <td>${device.status || "Open"}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML("beforeend", row);
            });
        }
    });
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
