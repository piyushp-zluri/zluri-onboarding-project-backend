const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    Date: Date,
    Description: String,
    Amount: mongoose.Types.Decimal128,
    Currency: String,
    amountInINR: mongoose.Types.Decimal128,
  },
  { versionKey: false }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
