const mongoose = require("mongoose");
const Transaction = require("../models/mongoSchema");
const {
  getExchangeRatesWithINR,
  convertToINR,
} = require("../middleware/currencyConverter");
const { default: Decimal } = require("decimal.js");

async function saveTransaction(transactionData, next) {
  const { Date, Description, Amount, Currency } = transactionData;

  await getExchangeRatesWithINR(next);

  const INRAmount = convertToINR(Currency, Amount, next);
  const roundedAmount = new Decimal(INRAmount).toFixed(2);

  const transaction = new Transaction({
    Date: Date,
    Description: Description,
    Amount:
      Amount !== undefined
        ? mongoose.Types.Decimal128.fromString(Amount.toString())
        : undefined,
    Currency: Currency,
    amountInINR:
      roundedAmount !== undefined
        ? mongoose.Types.Decimal128.fromString(roundedAmount.toString())
        : undefined,
  });

  return await transaction.save();
}

module.exports = saveTransaction;
