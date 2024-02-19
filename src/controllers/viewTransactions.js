const queryBulk = require("../services/queryBulk");
const formatDate = require("../middleware/dateFormatter");

async function viewTransactions(req, res) {
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
    console.error("Error retrieving documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = viewTransactions;
