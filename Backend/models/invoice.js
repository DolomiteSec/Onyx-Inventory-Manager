const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoiceID: { type: String, required: true },
  date: { type: Date, required: true },
  phoneModel: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  screenCost: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 },
  totalCost: { type: Number },
  giftCardValue: { type: Number },
  giftCardSalePrice: { type: Number },
  potentialProfit: { type: Number },
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
