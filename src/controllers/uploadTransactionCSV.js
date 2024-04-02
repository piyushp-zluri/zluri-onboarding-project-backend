const saveTransaction = require("../services/saveTransaction");
const { AppError } = require("../errors/customErrors");

async function uploadTransactionCSV(req, res, next) {
  try {
    await Promise.all(
      req.validTransactions.map((transaction) => saveTransaction(transaction))
    );
    res.status(200).json({
      message: "All transactions successfully inserted into MongoDB",
    });
  } catch (error) {
    const customError = new AppError(
      "MONGO_ERROR",
      "Error uploading CSV file",
      500,
      error
    );
    next(customError);
  }
}

module.exports = uploadTransactionCSV;
