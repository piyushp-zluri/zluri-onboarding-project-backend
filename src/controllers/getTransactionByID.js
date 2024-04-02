const queryByID = require("../services/queryByID");
const mongoose = require("mongoose");
const { AppError } = require("../errors/customErrors");

async function getTransactionByID(req, res, next) {
  try {
    const { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)) {
      const document = await queryByID(id);
      if (document) {
        res.json(document);
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } else {
      res.status(400).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    const customError = new AppError(
      "MONGO_ERROR",
      "Error retrieving document",
      500,
      error
    );
    next(customError);
  }
}

module.exports = getTransactionByID;
