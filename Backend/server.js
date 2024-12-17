const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const invoiceRoutes = require("./routes/invoices");

// Initialize the App
const app = express();

// Middleware
app.use(cors({
    origin: "*", // Allows all domains
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json()); // Parse incoming JSON requests

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });

// Routes
app.use("/api/invoices", invoiceRoutes);

// Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
