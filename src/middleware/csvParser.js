const mongoose = require("mongoose");
const formatDate = require("./dateFormatter");
const { convertToINR } = require("./currencyConverter");
const { default: Decimal } = require("decimal.js");

const parseCSV = async (req, res, next) => {
  const lines = req.file.buffer.toString("utf8").split("\n").slice(1);
  req.parsedTransactions = [];

  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }
    const [rawDate, Description, Amount, Currency] = line.trim().split(",");
    const formattedDate = formatDate(rawDate);
    const amountInINR = await convertToINR(Currency, Amount);
    const roundedAmount = new Decimal(amountInINR).toFixed(2);
    req.parsedTransactions.push({
      Date: formattedDate,
      Description,
      Amount:
        Amount !== undefined
          ? mongoose.Types.Decimal128.fromString(Amount.toString())
          : undefined,
      Currency,
      amountInINR: mongoose.Types.Decimal128.fromString(
        roundedAmount.toString()
      ),
    });
  }
  next();
};

module.exports = parseCSV;
