const axios = require("axios");
require("dotenv").config();

let conversionRates;

async function getExchangeRatesWithINR(currency) {
  try {
    if (!conversionRates || Object.keys(conversionRates).length === 0) {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/INR`
      );

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch exchange rates. Status: ${response.status}`
        );
      }

      conversionRates = response.data.conversion_rates;
    }

    if (currency in conversionRates) {
      return conversionRates[currency];
    } else {
      throw new Error(`Exchange rate for ${currency} not found.`);
    }
  } catch (error) {
    console.error(`Error fetching exchange rates: ${error.message}`);
    throw error;
  }
}

async function convertToINR(currency, amount) {
  try {
    const exchangeRate = await getExchangeRatesWithINR(currency);

    if (exchangeRate !== null) {
      const amountInINR = parseFloat(amount) / exchangeRate;
      return amountInINR;
    } else {
      throw new Error(
        `Cannot convert ${amount} ${currency} to INR. Exchange rate not available.`
      );
    }
  } catch (error) {
    console.error(`Error converting to INR: ${error.message}`);
    return 0;
  }
}

module.exports = { getExchangeRatesWithINR, convertToINR };
