const saveTransaction = require("../services/saveTransaction");
const formatDate = require("../middleware/dateFormatter");
const { AppError } = require("../errors/customErrors");

async function addTransaction(req, res, next) {
  try {
    const { rawDate, Description, Amount, Currency } = req.body;
    const formattedDate = formatDate(rawDate);

    await saveTransaction(
      {
        Date: formattedDate,
        Description,
        Amount,
        Currency,
      },
      next
    );

    res.json({ message: "Document added successfully" });
  } catch (error) {
    const customError = new AppError(
      "MONGO_ERROR",
      "Error creating document",
      500,
      error
    );
    next(customError);
  }
}

module.exports = addTransaction;
