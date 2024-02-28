const mongoose = require("mongoose");
const Transaction = require("../models/mongoSchema");
const formatDate = require("../middleware/dateFormatter");
const {
  convertToINR,
  getExchangeRatesWithINR,
} = require("../middleware/currencyConverter");
const { default: Decimal } = require("decimal.js");

async function editByID(id, body, next) {
  if (body.Date) body.Date = formatDate(body.Date);
  const document = await Transaction.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  );
  if (!document) {
    return null;
  }
  if (body.Amount || body.Currency) {
    await getExchangeRatesWithINR(next);

    const amountInINR = await convertToINR(
      document.Currency,
      document.Amount,
      next
    );
    let roundedAmount = new Decimal(amountInINR).toFixed(2);
    roundedAmount = mongoose.Types.Decimal128.fromString(roundedAmount);
    await Transaction.findByIdAndUpdate(id, {
      $set: { amountInINR: roundedAmount },
    });
  }
  return document;
}

module.exports = editByID;
