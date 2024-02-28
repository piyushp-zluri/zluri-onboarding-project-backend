const moment = require("moment");

function formatDate(date) {
  const supportedFormats = [
    "DD-MM-YYYY",
    "MM-DD-YYYY",
    "DD.MM.YYYY",
    "MM.DD.YYYY",
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "YYYY.MM.DD",
    "YYYY/MM/DD",
    "YYYY-DD-MM",
    "YYYY.DD.MM",
    "YYYY/DD/MM",
  ];

  return moment(date, supportedFormats, true);
}

module.exports = formatDate;
