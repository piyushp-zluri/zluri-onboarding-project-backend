const queryBulk = require("../services/queryBulk");
const mongoose = require("mongoose");
const formatDate = require("../middleware/dateFormatter");
const { AppError } = require("../errors/customErrors");

async function viewTransactions(req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      Description,
      Date,
      Amount,
      Currency,
    } = req.query;
    const skip = (page - 1) * pageSize;

    let filter = {};
    if (Description) filter.Description = Description;
    if (Date) filter.Date = formatDate(Date);
    if (Amount) filter.Amount = mongoose.Types.Decimal128.fromString(Amount);
    if (Currency) filter.Currency = Currency;

    const documents = await queryBulk(filter, skip, pageSize);
    res.json(documents);
  } catch (error) {
    const customError = new AppError(
      "MONGO_ERROR",
      "Error retrieving documents",
      500,
      error
    );
    next(customError);
  }
}

module.exports = viewTransactions;
