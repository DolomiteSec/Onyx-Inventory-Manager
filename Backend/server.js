const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Force HTTPS Middleware
const enforceHttps = (req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
};

// Initialize the App
const app = express();
if (process.env.NODE_ENV === "production") {
    app.use(enforceHttps);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const invoiceRoutes = require("./routes/invoices");
app.use("/api/invoices", invoiceRoutes);

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

// Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
