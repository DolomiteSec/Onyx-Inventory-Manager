const backendURL = "https://onyx-inventory-manager-backend.onrender.com/api/invoices";

// Function to fetch and display invoices
function fetchInvoices() {
    fetch(backendURL)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched invoices:", data);
            displayInvoices(data);
        })
        .catch(error => console.error("Error fetching invoices:", error));
}

// Function to display invoices in a table
function displayInvoices(invoices) {
    const tableBody = document.getElementById("invoice-table-body");
    tableBody.innerHTML = ""; // Clear the table before repopulating

    invoices.forEach(invoice => {
        const row = `
            <tr>
                <td>${invoice.invoiceID}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>${invoice.phoneModel}</td>
                <td>$${invoice.purchasePrice}</td>
                <td>$${invoice.screenCost || 0}</td>
                <td>$${invoice.giftCardValue || 0}</td>
                <td>${invoice.status}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Function to add a new invoice
function addInvoice(event) {
    event.preventDefault(); // Prevent form reload

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
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newInvoice)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Invoice added:", data);
        alert("Invoice added successfully!");
        fetchInvoices(); // Refresh the invoice list
    })
    .catch(error => console.error("Error adding invoice:", error));
}

// Event Listener for Add Invoice Form
document.getElementById("add-invoice-form").addEventListener("submit", addInvoice);

// Fetch invoices when the page loads
fetchInvoices();
