const moment = require("moment");

function formatDate(rawDate) {
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

  return moment(rawDate, supportedFormats, true);
}

module.exports = formatDate;
