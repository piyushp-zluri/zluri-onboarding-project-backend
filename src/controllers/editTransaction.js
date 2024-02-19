const mongoose = require("mongoose");
const Transaction = require("../models/mongoSchema");
const formatDate = require("../middleware/dateFormatter");
const { convertToINR } = require("../middleware/currencyConverter");
const { default: Decimal } = require("decimal.js");

async function editTransaction(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    if (mongoose.Types.ObjectId.isValid(id)) {
      if (body.Date) body.Date = formatDate(body.Date);
      const result = await Transaction.findByIdAndUpdate(id, { $set: body });
      if (result) {
        res.json({ message: "Document updated successfully" });
        if (body.Amount || body.Currency) {
          const document = await Transaction.findById(id).lean().exec();
          const amountInINR = await convertToINR(
            document.Currency,
            document.Amount
          );
          let roundedAmount = new Decimal(amountInINR).toFixed(2);
          roundedAmount = mongoose.Types.Decimal128.fromString(roundedAmount);
          await Transaction.findByIdAndUpdate(id, {
            $set: { amountInINR: roundedAmount },
          });
        }
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } else {
      res.status(400).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = editTransaction;
