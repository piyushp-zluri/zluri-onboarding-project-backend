const mongoose = require("mongoose");
const Transaction = require("../models/mongoSchema");

async function deleteTransaction(req, res) {
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
}

module.exports = deleteTransaction;
