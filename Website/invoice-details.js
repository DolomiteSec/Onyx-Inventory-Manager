const backendURL = "https://onyx-inventory-manager-backend.onrender.com/api/invoices";
let invoiceId = ""; // Store the ID globally
let invoiceData = {}; // Hold the invoice data

// Extract Invoice ID from URL
function getInvoiceId() {
    const params = new URLSearchParams(window.location.search);
    invoiceId = params.get("id");
    if (!invoiceId) {
        alert("No invoice ID provided.");
        window.location.href = "index.html"; // Redirect back to dashboard
    }
}

// Fetch Invoice Data and Populate the Form
async function fetchInvoiceData() {
    try {
        const response = await fetch(`${backendURL}/${invoiceId}`);
        if (!response.ok) throw new Error("Failed to fetch invoice data.");

        invoiceData = await response.json();
        populateInvoiceForm(invoiceData);
    } catch (error) {
        console.error("Error fetching invoice data:", error);
        alert("Error loading invoice details.");
    }
}

// Populate the Invoice Form with Data
function populateInvoiceForm(invoice) {
    document.getElementById("invoice-id").value = invoice.invoiceID || "";
    document.getElementById("customer-name").value = invoice.customerName || "";
    document.getElementById("invoice-date").value = invoice.date
        ? new Date(invoice.date).toISOString().split("T")[0]
        : "";

    const tableBody = document.getElementById("device-table-body");
    tableBody.innerHTML = ""; // Clear existing rows

    // Populate Devices Table
    if (invoice.devices && invoice.devices.length > 0) {
        invoice.devices.forEach((device) => {
            const row = `
                <tr>
                    <td><input type="text" value="${device.imei || ""}" placeholder="IMEI" /></td>
                    <td><input type="text" value="${device.model || ""}" placeholder="Model" /></td>
                    <td><input type="number" value="${device.price || 0}" placeholder="Price" /></td>
                    <td>
                        <select>
                            <option value="Open" ${device.status === "Open" ? "selected" : ""}>Open</option>
                            <option value="Sold" ${device.status === "Sold" ? "selected" : ""}>Sold</option>
                        </select>
                    </td>
                    <td><button type="button" onclick="removeDeviceRow(this)">Remove</button></td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    }
}

// Add a New Device Row
function addDeviceRow() {
    const tableBody = document.getElementById("device-table-body");
    const newRow = `
        <tr>
            <td><input type="text" placeholder="IMEI" /></td>
            <td><input type="text" placeholder="Model" /></td>
            <td><input type="number" placeholder="Price" /></td>
            <td>
                <select>
                    <option value="Open">Open</option>
                    <option value="Sold">Sold</option>
                </select>
            </td>
            <td><button type="button" onclick="removeDeviceRow(this)">Remove</button></td>
        </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", newRow);
}

// Remove a Device Row
function removeDeviceRow(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}

// Save Changes to Backend
async function saveChanges(e) {
    e.preventDefault();

    const updatedInvoice = {
        customerName: document.getElementById("customer-name").value,
        date: document.getElementById("invoice-date").value,
        devices: [],
    };

    // Collect Devices from Table
    const rows = document.querySelectorAll("#device-table-body tr");
    rows.forEach((row) => {
        const inputs = row.querySelectorAll("input, select");
        const device = {
            imei: inputs[0].value,
            model: inputs[1].value,
            price: parseFloat(inputs[2].value) || 0,
            status: inputs[3].value,
        };
        updatedInvoice.devices.push(device);
    });

    try {
        const response = await fetch(`${backendURL}/${invoiceId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedInvoice),
        });

        if (response.ok) {
            alert("Invoice updated successfully!");
            window.location.href = "index.html"; // Redirect back to dashboard
        } else {
            throw new Error("Failed to update invoice.");
        }
    } catch (error) {
        console.error("Error saving invoice:", error);
        alert("Error updating invoice. Please try again.");
    }
}

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    getInvoiceId(); // Extract the ID from URL
    fetchInvoiceData(); // Fetch invoice data

    // Add event listeners
    document
        .getElementById("save-changes-btn")
        .addEventListener("click", saveChanges);
    document
        .getElementById("add-device-btn")
        .addEventListener("click", addDeviceRow);
});
