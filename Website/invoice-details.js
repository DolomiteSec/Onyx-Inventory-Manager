const backendURL = "https://onyx-inventory-manager-backend.onrender.com/api/invoices";

// Fetch Invoice Details
async function fetchInvoice() {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get("id");

    try {
        const response = await fetch(`${backendURL}/${invoiceId}`);
        const invoice = await response.json();

        displayInvoiceDetails(invoice);
    } catch (error) {
        console.error("Error fetching invoice:", error);
    }
}

// Display Invoice Details and Devices
function displayInvoiceDetails(invoice) {
    document.getElementById("invoice-id").innerText = invoice.invoiceID;
    document.getElementById("customer-name").innerText = invoice.customerName;
    document.getElementById("invoice-date").innerText = new Date(invoice.date).toLocaleDateString();

    const tableBody = document.getElementById("device-table-body");
    tableBody.innerHTML = "";

    invoice.devices.forEach((device, index) => {
        const row = `
            <tr>
                <td><input type="text" value="${device.imei || ''}"></td>
                <td><input type="text" value="${device.model || ''}"></td>
                <td><input type="number" value="${device.price || 0}"></td>
                <td>
                    <select>
                        <option value="Open" ${device.status === "Open" ? "selected" : ""}>Open</option>
                        <option value="Sold" ${device.status === "Sold" ? "selected" : ""}>Sold</option>
                    </select>
                </td>
                <td><button onclick="removeDeviceRow(this)">Remove</button></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
    });
}

// Add Device Row
function addDeviceRow() {
    const tableBody = document.getElementById("device-table-body");
    const newRow = `
        <tr>
            <td><input type="text" placeholder="IMEI"></td>
            <td><input type="text" placeholder="Model"></td>
            <td><input type="number" placeholder="Price"></td>
            <td>
                <select>
                    <option value="Open">Open</option>
                    <option value="Sold">Sold</option>
                </select>
            </td>
            <td><button onclick="removeDeviceRow(this)">Remove</button></td>
        </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", newRow);
}

// Remove Device Row
function removeDeviceRow(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}

// Save Changes
async function saveInvoice() {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get("id");

    const rows = document.querySelectorAll("#device-table-body tr");
    const devices = Array.from(rows).map(row => {
        const inputs = row.querySelectorAll("input, select");
        return {
            imei: inputs[0].value,
            model: inputs[1].value,
            price: parseFloat(inputs[2].value),
            status: inputs[3].value
        };
    });

    const updatedInvoice = { devices };

    try {
        const response = await fetch(`${backendURL}/${invoiceId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedInvoice)
        });

        if (response.ok) {
            alert("Invoice updated successfully!");
            window.location.href = "index.html";
        } else {
            alert("Failed to update invoice.");
        }
    } catch (error) {
        console.error("Error updating invoice:", error);
    }
}

// Fetch invoice on page load
document.addEventListener("DOMContentLoaded", fetchInvoice);
