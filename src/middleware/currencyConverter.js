const axios = require("axios");
const { ExternalAPIError } = require("../errors/customErrors");
require("dotenv").config();

let conversionRates;

async function getExchangeRatesWithINR(next) {
  try {
    if (!conversionRates || Object.keys(conversionRates).length === 0) {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/INR`
      );

      if (response.status !== 200) {
        throw new Error(
          `Could not fetch exchange rates. Status: ${response.status}`
        );
      }

      conversionRates = response.data.conversion_rates;
    }
  } catch (error) {
    const apiError = new ExternalAPIError(
      "EXTERNAL_API_ERROR",
      "Error fetching exchange rates",
      500,
      error
    );
    next(apiError);
  }
}

function convertToINR(currency, amount, next) {
  try {
    if (currency in conversionRates) {
      const exchangeRate = conversionRates[currency];

      const amountInINR = parseFloat(amount) / exchangeRate;
      return amountInINR;
    } else {
      throw new Error(`Exchange rate for ${currency} not found.`);
    }
  } catch (error) {
    const apiError = new ExternalAPIError(
      "EXTERNAL_API_ERROR",
      "Error converting to INR",
      500,
      error
    );
    next(apiError);
  }
}

module.exports = { getExchangeRatesWithINR, convertToINR };
