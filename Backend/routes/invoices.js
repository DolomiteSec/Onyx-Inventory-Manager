const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");

// GET all invoices
router.get("/", async (req, res) => {
    try {
        const invoices = await Invoice.find();
        console.log("Fetched Invoices:", invoices);
        res.json(invoices);
    } catch (err) {
        console.error("Error fetching invoices:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET a single invoice by ID
router.get("/:id", async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.json(invoice);
    } catch (err) {
        console.error("Error fetching invoice:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST: Create a new invoice
router.post("/", async (req, res) => {
    const { customerName, date, trackingNumber, totalPrice, devices } = req.body;

    // Input validation
    if (!customerName || !date || !devices || devices.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const invoice = new Invoice({
            customerName,
            date,
            trackingNumber,
            totalPrice,
            devices,
        });

        const savedInvoice = await invoice.save();
        console.log("Invoice Created:", savedInvoice);
        res.status(201).json(savedInvoice);
    } catch (err) {
        console.error("Error creating invoice:", err.message);
        res.status(400).json({ message: err.message });
    }
});

// PUT: Update an existing invoice (including adding/removing devices)
router.put("/:id", async (req, res) => {
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, // Update only provided fields
            { new: true, runValidators: true } // Return updated document and validate input
        );

        if (!updatedInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        console.log("Invoice Updated:", updatedInvoice);
        res.json(updatedInvoice);
    } catch (err) {
        console.error("Error updating invoice:", err.message);
        res.status(400).json({ message: err.message });
    }
});

// DELETE: Remove an invoice
router.delete("/:id", async (req, res) => {
    try {
        const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!deletedInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        console.log("Invoice Deleted:", deletedInvoice);
        res.json({ message: "Invoice deleted successfully" });
    } catch (err) {
        console.error("Error deleting invoice:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
