const mongoose = require("mongoose");
require("dotenv").config();

async function mongoConnect() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.fqocxgk.mongodb.net/transProjDB?retryWrites=true&w=majority`
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

module.exports = { mongoConnect };
