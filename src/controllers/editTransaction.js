const mongoose = require("mongoose");
const editByID = require("../services/editByID");
const { AppError } = require("../errors/customErrors");

async function editTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const { body } = req;

    if (mongoose.Types.ObjectId.isValid(id)) {
      const result = await editByID(id, body, next);

      if (result) {
        res.json({ message: "Document updated successfully" });
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } else {
      res.status(400).json({ error: "Invalid ObjectId" });
    }
  } catch (error) {
    const customError = new AppError(
      "MONGO_ERROR",
      "Error updating document",
      500,
      error
    );
    next(customError);
  }
}

module.exports = editTransaction;
