const Transaction = require("../models/mongoSchema");

async function deleteByID(id) {
  const document = await Transaction.findByIdAndDelete(id);
  if (!document) {
    return null;
  }
  return document;
}

module.exports = deleteByID;
