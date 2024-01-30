const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const axios = require("axios");
const moment = require("moment");
const currencyCodes = require("currency-codes");
const { default: Decimal } = require("decimal.js");
const e = require("express");

const app = express();
const port = 3000;

app.use(express.json());

mongoose.connect(
  "mongodb+srv://piyush_zluri:piyush%401234@cluster0.fqocxgk.mongodb.net/transProjDB?retryWrites=true&w=majority"
);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function isValidDate(date) {
  return date < new Date();
}

function isValidCurrency(currency) {
  return currencyCodes.codes().includes(currency);
}

let conversionRates;

async function exchangeRates() {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/d0a205ebbecfb1dec02eafb7/latest/INR`
    );
    const jsonResponse = response.data;
    if ("conversion_rates" in response.data) {
      const conversionRates = jsonResponse.conversion_rates;
      console.log(conversionRates);
    }
  } catch (error) {
    console.error("Error fetching all exchange rates:", error.message);
    return null;
  }
}

async function getExchangeRatesWithINR(currency) {
  if (!conversionRates || Object.keys(conversionRates).length === 0) {
    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/d0a205ebbecfb1dec02eafb7/latest/INR`
      );
      conversionRates = response.data.conversion_rates;
    } catch (error) {
      console.error("Error fetching all exchange rates:", error.message);
      return null;
    }
  }

  if (currency in conversionRates) {
    return conversionRates[currency];
  } else {
    console.error(`Exchange rate for ${currency} not found.`);
    return null;
  }
}

async function convertToINR(currency, amount) {
  const exchangeRate = await getExchangeRatesWithINR(currency);

  if (exchangeRate !== null) {
    const amountInINR = parseFloat(amount) / exchangeRate;
    return amountInINR;
  } else {
    console.error(
      `Cannot convert ${amount} ${currency} to INR. Exchange rate not available.`
    );
    return null;
  }
}

convertToINR("GBP", 1);

app.post("/api/transactions", async (req, res) => {
  try {
    const { rawDate, Description, Amount, Currency } = req.body;
    const formattedDate = moment(
      rawDate,
      [
        "DD-MM-YYYY",
        "MM-DD-YYYY",
        "DD.MM.YYYY",
        "MM.DD.YYYY",
        "DD/MM/YYYY",
        "MM/DD/YYYY",
        "YYYY-MM-DD",
        "YYYY.MM.DD",
        "YYYY/MM/DD",
        "YYYY-DD-MM",
        "YYYY.DD.MM",
        "YYYY/DD/MM",
      ],
      true
    );
    if (
      !isNaN(parseFloat(Amount)) &&
      parseFloat(Amount) > 0 &&
      isValidCurrency(Currency)
    ) {
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

app.get("/api/transactions", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 30,
      Description,
      Date,
      Amount,
      Currency,
      amountInINR,
    } = req.query;
    const skip = (page - 1) * pageSize; //Even though page and pageSize are strings, their numerical meaning is considered when arithmetic operations are performed on them. For ex., '30' is treated as 30. Called type coersion

    let filter = {};
    if (Description) filter.Description = Description;
    if (Date)
      filter.Date = moment(
        Date,
        [
          "DD-MM-YYYY",
          "MM-DD-YYYY",
          "DD.MM.YYYY",
          "MM.DD.YYYY",
          "DD/MM/YYYY",
          "MM/DD/YYYY",
          "YYYY-MM-DD",
          "YYYY.MM.DD",
          "YYYY/MM/DD",
          "YYYY-DD-MM",
          "YYYY.DD.MM",
          "YYYY/DD/MM",
        ],
        true
      );
    if (Amount) filter.Amount = mongoose.Types.Decimal128.fromString(Amount);
    if (Currency) filter.Currency = Currency;

    const documents = await Transaction.find(filter)
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

app.get("/api/transactions/:id", async (req, res) => {
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
      res.status(404).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    console.error("Error retrieving documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
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
      res.status(404).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    if (mongoose.Types.ObjectId.isValid(id)) {
      if (body.Date) {
        body.Date = moment(
          body.Date,
          [
            "DD-MM-YYYY",
            "MM-DD-YYYY",
            "DD.MM.YYYY",
            "MM.DD.YYYY",
            "DD/MM/YYYY",
            "MM/DD/YYYY",
            "YYYY-MM-DD",
            "YYYY.MM.DD",
            "YYYY/MM/DD",
            "YYYY-DD-MM",
            "YYYY.DD.MM",
            "YYYY/DD/MM",
          ],
          true
        );
      }
      const result = await Transaction.findByIdAndUpdate(id, { $set: body });
      if (result) {
        res.json({ message: "Document updated successfully" });
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
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } else {
      res.status(404).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/api/transactions/uploadCSV",
  upload.single("csvFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No CSV file uploaded." });
      }

      const transactions = [];
      const invalidTransactions = [];

      for (const line of req.file.buffer
        .toString("utf8")
        .split("\n")
        .slice(1)) {
        const [rawDate, Description, Amount, Currency] = line.trim().split(",");
        const formattedDate = moment(
          rawDate,
          [
            "DD-MM-YYYY",
            "MM-DD-YYYY",
            "DD.MM.YYYY",
            "MM.DD.YYYY",
            "DD/MM/YYYY",
            "MM/DD/YYYY",
            "YYYY-MM-DD",
            "YYYY.MM.DD",
            "YYYY/MM/DD",
            "YYYY-DD-MM",
            "YYYY.DD.MM",
            "YYYY/DD/MM",
          ],
          true
        );
        if (
          isValidDate(formattedDate) &&
          Description.trim() !== "" &&
          !isNaN(parseFloat(Amount)) &&
          parseFloat(Amount) > 0 &&
          isValidCurrency(Currency)
        ) {
          const amountInINR = await convertToINR(Currency, Amount);
          const roundedAmount = new Decimal(amountInINR).toFixed(2);
          transactions.push({
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
        } else {
          invalidTransactions.push({
            Date: rawDate,
            Description,
            Amount,
            Currency,
          });
        }
      }

      for (const transaction of transactions) {
        const parsedData = new Transaction(transaction);
        await parsedData.save();
      }

      if (invalidTransactions.length > 0) {
        res.status(400).json({
          invalidTransactions,
        });
      } else {
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

app.listen(port, () => {
  console.log(`Service is hosted at http://127.0.0.1:${port}`);
});
