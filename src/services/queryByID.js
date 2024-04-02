const Transaction = require("../models/mongoSchema");

async function queryByID(id) {
  const document = await Transaction.findById(id).lean().exec();
  if (!document) {
    return null;
  }
  return document;
}

module.exports = queryByID;
