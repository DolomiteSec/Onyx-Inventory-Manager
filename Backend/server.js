const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const invoiceRoutes = require("./routes/invoices");

// Initialize the App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const dbURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://administrator:FandM1221%217@phoneresalecluster.hnx3w.mongodb.net/PhoneResaleCluster?retryWrites=true&w=majority";

mongoose
    .connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1); // Exit if MongoDB connection fails
    });

// Routes
app.use("/api/invoices", invoiceRoutes);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
);
