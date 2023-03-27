const axios = require("axios");
const DataModel = require("./data.model");
const date = require("date-and-time");

const getDataFromAPI = async (symbol, interval) => {
  const results = await axios.get(
    `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}`
  );

  const dataModel = new DataModel();

  results.data.map((result) => {
    dataModel.symbol.push(symbol);
    let sec = result[0];
    let normalDate = new Date(sec).toLocaleString("en-GB", {
      timeZone: "UTC",
    });
    dataModel.open_date_time.push(normalDate);
    dataModel.open.push(parseFloat(result[1]));
    dataModel.high.push(result[2]);
    dataModel.low.push(result[3]);
    dataModel.close.push(result[4]);
    dataModel.volume.push(result[5]);
    dataModel.num_trades.push(result[8]);
    dataModel.taker_base_vol.push(result[9]);
    dataModel.taker_quote_vol.push(result[10]);
  });

  return dataModel;
};

module.exports = {
  getDataFromAPI,
};
