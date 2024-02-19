const mongoose = require("mongoose");
const Transaction = require("../models/mongoSchema");

async function saveTransaction(transactionData) {
  try {
    const { Date, Description, Amount, Currency, amountInINR } =
      transactionData;

    const transaction = new Transaction({
      Date: Date,
      Description: Description,
      Amount:
        Amount !== undefined
          ? mongoose.Types.Decimal128.fromString(Amount)
          : undefined,
      Currency: Currency,
      amountInINR:
        amountInINR !== undefined
          ? mongoose.Types.Decimal128.fromString(amountInINR)
          : undefined,
    });

    return await transaction.save();
  } catch (error) {
    throw error;
  }
}

module.exports = saveTransaction;
