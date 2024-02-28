const formatDate = require("./dateFormatter");

const parseCSV = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No CSV file uploaded." });
  }

  const lines = req.file.buffer.toString("utf8").split("\n").slice(1);
  req.parsedTransactions = [];

  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }
    const [rawDate, Description, Amount, Currency] = line.trim().split(",");
    const formattedDate = formatDate(rawDate);
    req.parsedTransactions.push({
      Date: formattedDate,
      Description,
      Amount,
      Currency,
    });
  }
  next();
};

module.exports = parseCSV;
