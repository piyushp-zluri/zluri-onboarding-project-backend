const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../views/mongoSchema");
const { convertToINR } = require("../middleware/currencyConverter");
const { upload } = require("../middleware/useMulter");
const formatDate = require("../middleware/dateFormatter");
const parseCSV = require("../middleware/csvParser");
const {
  isValidAmount,
  isValidCurrency,
  validateTransactions,
} = require("../middleware/validations");
const { default: Decimal } = require("decimal.js");

const router = express.Router();

router.post("/transactions", async (req, res) => {
  try {
    const { rawDate, Description, Amount, Currency } = req.body;
    const formattedDate = formatDate(rawDate);
    if (isValidAmount(Amount) && isValidCurrency(Currency)) {
      const amountInINR = await convertToINR(Currency, Amount);
      const roundedAmount = new Decimal(amountInINR).toFixed(2);
      const transaction = new Transaction({
        Date: formattedDate,
        Description: Description,
        Amount: mongoose.Types.Decimal128.fromString(Amount.toString()),
        Currency: Currency,
        amountInINR: mongoose.Types.Decimal128.fromString(
          roundedAmount.toString()
        ),
      });
      const result = await transaction.save();
      res.json({ _id: result._id });
    }
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 30,
      Description,
      Date,
      Amount,
      Currency,
    } = req.query;
    const skip = (page - 1) * pageSize; //Even though page and pageSize are strings, their numerical meaning is considered when arithmetic operations are performed on them. For ex., '30' is treated as 30. Called type coersion

    let filter = {};
    if (Description) filter.Description = Description;
    if (Date) filter.Date = formatDate(Date);
    if (Amount) filter.Amount = mongoose.Types.Decimal128.fromString(Amount);
    if (Currency) filter.Currency = Currency;

    const documents = await Transaction.find(filter)
      .sort({ Date: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean()
      .exec();
    res.json(documents);
  } catch (error) {
    console.error("Error retrieving documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const document = await Transaction.findById(id).lean().exec();
      if (document) {
        res.json(document);
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } else {
      res.status(400).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    console.error("Error retrieving documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const result = await Transaction.findByIdAndDelete(id);
      if (result) {
        res.json({ message: "Document deleted successfully" });
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } else {
      res.status(400).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/transactions/:id", async (req, res) => {
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
});

router.post(
  "/transactions/uploadCSV",
  upload.single("csvFile"),
  parseCSV,
  validateTransactions,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No CSV file uploaded." });
      }

      if (req.parsedTransactions.length !== req.validTransactions.length) {
        return res.status(400).json({
          error: "Some transactions are invalid.",
        });
      } else {
        for (const transaction of req.validTransactions) {
          const parsedData = new Transaction(transaction);
          await parsedData.save();
        }
        res.status(200).json({
          message: "All transactions successfully inserted into MongoDB",
        });
      }
    } catch (error) {
      console.error("Error uploading CSV file:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;

// create another branch, push changes to it, raise the pr and share those in the channel
// correct file structure
// controller, mvc, access the req, res, next
// index is only entry point, write the code in index in server.js
// all of index and mongoConnect code will come inside server.js
// services handle the pushing to mongodb part
// routes are extremely short
