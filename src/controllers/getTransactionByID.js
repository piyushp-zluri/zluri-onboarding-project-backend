const mongoose = require("mongoose");
const Transaction = require("../models/mongoSchema");

async function getTransactionByID(req, res) {
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
}

module.exports = getTransactionByID;
