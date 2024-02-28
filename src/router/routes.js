const express = require("express");

const { upload } = require("../middleware/useMulter");
const parseCSV = require("../middleware/csvParser");
const { validateTransactions } = require("../middleware/validations");

const addTransaction = require("../controllers/addTransaction");
const viewTransactions = require("../controllers/viewTransactions");
const getTransactionByID = require("../controllers/getTransactionByID");
const deleteTransaction = require("../controllers/deleteTransaction");
const editTransaction = require("../controllers/editTransaction");
const uploadTransactionCSV = require("../controllers/uploadTransactionCSV");

const router = express.Router();

router.post("/transactions", addTransaction);

router.get("/transactions", viewTransactions);

router.get("/transactions/:id", getTransactionByID);

router.delete("/transactions/:id", deleteTransaction);

router.put("/transactions/:id", editTransaction);

router.post(
  "/transactions/uploadCSV",
  upload.single("csvFile"),
  parseCSV,
  validateTransactions,
  uploadTransactionCSV
);

module.exports = router;
