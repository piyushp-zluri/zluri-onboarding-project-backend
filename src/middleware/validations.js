const currencyCodes = require("currency-codes");

function isValidDate(date) {
  return date < new Date();
}

function isValidAmount(amount) {
  return !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
}

function isValidCurrency(currency) {
  return currencyCodes.codes().includes(currency);
}

const validateTransactions = (req, res, next) => {
  req.validTransactions = req.parsedTransactions.filter(
    (transaction) =>
      isValidDate(transaction.Date) &&
      transaction.Description.trim() !== "" &&
      isValidAmount(transaction.Amount) &&
      isValidCurrency(transaction.Currency)
  );
  next();
};

module.exports = {
  isValidDate,
  isValidAmount,
  isValidCurrency,
  validateTransactions,
};
