const { getDataFromAPI } = require("../data/data");
const { USDMClient } = require("binance");
const axios = require("axios");
const { getMACDArray } = require("../indicators/indicators");

const futures_trade_dup = async (request, response) => {
  const symbol = request.body.symbol;
  const timeInterval = request.body.timeInterval;

  // let leverage = request.body.leverage;
  // let buyd = request.body.buyd;

  console.log("in basic version");

  console.log(symbol, timeInterval);

  let ptest1 = 0;
  let execute;
  let roelist = [];

  const absorderamount = 0;
  const roerderamount = 1;
  let losscut = 1;
  let profitcut = 1;

  let leverage = 5;
  let buyd = 0;

  if (roerderamount >= leverage) {
    leverage = Math.round(leverage + (roerderamount - leverage), 1) + 1;
  }

  let profittarget1 = 10 / 100;
  let profitcut1 = 10 / 100;
  let profittarget2 = 20 / 100;
  let profitcut2 = 20 / 100;

  let insert = 0;
  let insert2 = 0;
  let insert3 = 0;

  // let current_time = new Date().toLocaleString("ko-KR", {
  //   timeZone: "UTC09",
  // });

  var date = new Date();
  var utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  var timeOffset = 9;
  let current_time = new Date(utcTime + 3600000 * timeOffset).toLocaleString(
    "ko-KR"
  );

  let time_stamps = new Date().getTime();

  let symbols_n_precision;

  const client = new USDMClient({
    api_key: "10031610ab8e9e50227654e402916999218258709b0c4eb93af4bb29ec6ec1b7",
    api_secret:
      "f101b6db5cd376796369a36fee740d8dd306129355a635b270e37fa473b5d815",
    baseUrl: "https://testnet.binancefuture.com",
  });

  let info;

  await client.getExchangeInfo().then((result) => {
    info = result.symbols;
  });

  info.forEach((item) => {
    if (item.symbol == symbol) {
      symbols_n_precision = item.quantityPrecision;
    }
  });

  await client
    .setLeverage({ symbol: symbol, leverage: leverage })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });

  //   await client
  //     .setMarginType({ symbol: symbol, marginType: "CROSSED" })
  //     .then((response) => {
  //       console.log(response);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });

  const model = await getDataFromAPI(symbol, timeInterval);
  const marketprice =
    "https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=" + symbol;

  const res = await axios.get(marketprice);

  const price = res.data.lastPrice;
  model.open.push(price);

  const macd = await getMACDArray(model.close);

  let test1 = macd.macd_signal.slice(-1)[0] - macd.macd.slice(-1)[0];
  let test2;

  console.log("test1:", test1);

  let currentPrice = 0;
  let timeframe = "";

  for (let i = 2; i < model.close.length; i++) {
    test2 = macd.macd_signal.slice(-i)[0] - macd.macd.slice(-i)[0];
    if (test1 > 0 && test2 < 0) {
      currentPrice = model.close.slice(i)[0];
      timeframe = model.open_date_time.slice(i)[0];
      break;
    }
    if (test1 < 0 && test2 > 0) {
      currentPrice = model.close.slice(i)[0];
      timeframe = model.open_date_time.slice(i)[0];
      break;
    }
  }

  console.log(currentPrice, timeframe);

  console.log("test2:", test2);

  let test3 = macd.macd_signal.slice(-2)[0] - macd.macd.slice(-2)[0];
  console.log("test3:", test3);

  let call = null;
  let call1 = null;

  if (test1 < 0 && test2 > 0 && Math.abs(test1) >= buyd) {
    if (test3 / test1 > 0 && Math.abs(test3) < buyd) {
      call1 = "Goldencross for entry";
      console.log("Goldencross for entry");

      const data = {
        type: "Long",
        symbol: symbol,
        price: price,
        interval: timeInterval,
        time: current_time,
        time_stamps: time_stamps,
        result: "buy",
      };

      return response.status(200).json({
        error: false,
        entry: true,
        data: data,
      });
    }

    if (test3 / test1 < 0) {
      call1 = "Goldencross for entry";
      console.log("Goldencross for entry");

      const data = {
        type: "Long",
        symbol: symbol,
        price: price,
        interval: timeInterval,
        time: current_time,
        time_stamps: time_stamps,
        result: "buy",
      };

      return response.status(200).json({
        error: false,
        entry: true,
        data: data,
      });
    }
  }
  if (test1 < 0 && test2 > 0) {
    call = "Goldencross";
    console.log("Goldencross");

    const data = {
      type: "Short",
      symbol: symbol,
      price: price,
      interval: timeInterval,
      time: current_time,
      time_stamps: time_stamps,
      result: "buy",
    };

    return response.status(200).json({
      error: false,
      entry: true,
      data: data,
    });
  } else {
    console.log("entry fails");
    return response.status(200).json({
      error: false,
      entry: false,
      data: {},
    });
  }
};

module.exports = {
  futures_trade_dup,
};
