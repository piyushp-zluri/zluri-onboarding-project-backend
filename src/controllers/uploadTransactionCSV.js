const saveTransaction = require("../services/saveTransaction");

async function uploadTransactionCSV(req, res) {
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
        await saveTransaction(transaction);
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

module.exports = uploadTransactionCSV;
