const Transaction = require("../models/mongoSchema");

async function queryBulk(filter, skip, pageSize) {
  try {
    const documents = await Transaction.find(filter)
      .sort({ Date: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean()
      .exec();
    return documents;
  } catch (error) {
    throw error;
  }
}

module.exports = queryBulk;
