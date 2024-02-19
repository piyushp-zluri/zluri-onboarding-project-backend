const saveTransaction = require("../services/saveTransaction");
const formatDate = require("../middleware/dateFormatter");
const { isValidAmount, isValidCurrency } = require("../middleware/validations");
const { convertToINR } = require("../middleware/currencyConverter");
const { default: Decimal } = require("decimal.js");

async function addTransaction(req, res) {
  try {
    const { rawDate, Description, Amount, Currency } = req.body;
    const Date = formatDate(rawDate);
    if (isValidAmount(Amount) && isValidCurrency(Currency)) {
      const INRAmount = await convertToINR(Currency, Amount);
      const roundedAmount = new Decimal(INRAmount).toFixed(2);

      const result = await saveTransaction({
        Date,
        Description,
        Amount: Amount.toString(),
        Currency,
        amountInINR: roundedAmount.toString(),
      });

      res.json({ _id: result._id });
    }
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = addTransaction;
