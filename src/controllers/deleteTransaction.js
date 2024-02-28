const deleteByID = require("../services/deleteByID");
const mongoose = require("mongoose");
const { AppError } = require("../errors/customErrors");

async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const result = await deleteByID(id);
      if (result) {
        res.json({ message: "Document deleted successfully" });
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } else {
      res.status(400).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    const customError = new AppError(
      "MONGO_ERROR",
      "Error deleting document",
      500,
      error
    );
    next(customError);
  }
}

module.exports = deleteTransaction;
