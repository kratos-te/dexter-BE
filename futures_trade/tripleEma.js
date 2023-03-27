const { getDataFromAPI } = require("../data/data");
const { USDMClient } = require("binance");
const axios = require("axios");
const Trade = require("../models/trade.model");
const moment = require("moment");
const ccxt = require("ccxt");
const ema = require("trading-indicator").ema;

const tripleEma_trade = async (request, response) => {
  const symbol = request.body.symbol;
  const timeInterval = request.body.interval;

  console.log("triple ema");

  const currentDate = moment().format("L");

  const email = request.body.email;
  const date = moment().format("L");

  const userTrades = await Trade.find({ email, date });

  console.log(symbol, timeInterval);

  let ptest1 = 0;
  let execute;
  let roelist = [];

  const absorderamount = 0; // use try catch block
  const reorderamount = 1;

  let losscut = request.body.sl; // get data from frontend
  let profitcut = request.body.tp; // get data from frontend

  let leverage = request.body.leverage; // get data from frontend
  let buyd = 0; // get data from frontend

  if (reorderamount >= leverage) {
    leverage = Math.round(leverage + (reorderamount - leverage), 1) + 1;
  }

  let profittarget1 = 10 / 100;
  let profitcut1 = 10 / 100;
  let profittarget2 = 20 / 100;
  let profitcut2 = 20 / 100;

  let insert = 0;
  let insert2 = 0;
  let insert3 = 0;

  let current_time = new Date().toLocaleString("en-GB", {
    timeZone: "UTC",
  });

  let time_stamps = new Date().getTime();

  let symbols_n_precision;

  const client = new USDMClient({
    api_key: request.body.APIKEY,
    api_secret: request.body.APISECRET,
    baseUrl: "https://testnet.binancefuture.com",
  });

  const exchangeId = "binanceusdm",
    exchangeClass = ccxt[exchangeId],
    exchange = new exchangeClass({
      api_key: request.body.APIKEY,
      api_secret: request.body.APISECRET,
      baseUrl: "https://testnet.binancefuture.com",
    });
    
  exchange.setSandboxMode(true);

  let info;

  let trdcount = 0;

  // get all trades in account
  await client.getAccountTrades().then((trds) => {
    trds.forEach((t) => {
      if (moment(date1).format("l") == moment(t.time).format("l")) {
        trdcount = trdcount + 1;
      }
    });
  });

  console.log(trdcount);

  const test = exchange.balance;
  console.log(test);

  await sleep(4000);

  await client
    .getExchangeInfo()
    .then((result) => {
      info = result.symbols;
    })
    .catch((err) => {
      console.log(err);
    });

  await sleep(4000);

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

  if (trdcount < request.body.tradeCount) {
    setTimeout(async () => {
      const model = await getDataFromAPI(symbol, timeInterval);
      const marketprice =
        "https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=" + symbol;

      const res = await axios.get(marketprice);

      const price = res.data.lastPrice;
      model.open.push(price);

      let ema3_res = await ema(5, "close", "binance", "BTC/USDT", "15m", true);
      let ema6_res = await ema(20, "close", "binance", "BTC/USDT", "15m", true);
      let ema9_res = await ema(50, "close", "binance", "BTC/USDT", "15m", true);

      const ema3_val = ema3_res[ema3_res.length - 1];
      const ema6_val = ema6_res[ema6_res.length - 1];
      const ema9_val = ema9_res[ema9_res.length - 1];

      const ema3_val_pre1 = ema9_res[ema9_res.length - 2];
      const ema6_val_pre1 = ema9_res[ema9_res.length - 2];
      const ema9_val_pre1 = ema9_res[ema9_res.length - 2];

      const ema3_val_pre2 = ema9_res[ema9_res.length - 3];
      const ema6_val_pre2 = ema9_res[ema9_res.length - 3];
      const ema9_val_pre2 = ema9_res[ema9_res.length - 3];

      const ema3_val_pre3 = ema9_res[ema9_res.length - 4];
      const ema6_val_pre3 = ema9_res[ema9_res.length - 4];
      const ema9_val_pre3 = ema9_res[ema9_res.length - 4];

      const ema3_val_pre4 = ema9_res[ema9_res.length - 5];
      const ema6_val_pre4 = ema9_res[ema9_res.length - 5];
      const ema9_val_pre4 = ema9_res[ema9_res.length - 5];

      let initialmargin;
      let unrealizedprofit;
      let usdtbalance = 0;

      const balance = await client.getBalance().catch((err) => {
        console.log(err);
      });
      await sleep(4000);

      balance.forEach((data) => {
        if (data.asset == "USDT") {
          usdtbalance = data.maxWithdrawAmount;
        }
      });
      await sleep(4000);

      const account = await client.getAccountInformation().catch((err) => {
        console.log(err);
      });
      await sleep(4000);

      account.assets.forEach((asset) => {
        if (asset.asset == "USDT") {
          initialmargin = asset.initialMargin;
          unrealizedprofit = asset.unrealizedProfit;
        }
      });

      if (usdtbalance < absorderamount) {
        leverage = Math.round(absorderamount / usdtbalance + 0.5, 1);
        try {
          leverage = await client.setLeverage({
            symbol: symbol,
            leverage: leverage,
          });
          console.log("new leverage: ", leverage);
        } catch (error) {
          console.log(error);
        }
      }

      let symbolbalance = 0;
      let entryprice = 0;

      account.positions.forEach((position) => {
        if (position.symbol == symbol) {
          symbolbalance = parseFloat(position.positionAmt);
          entryprice = parseFloat(position.entryPrice);
        }
      });

      await sleep(4000);

      const orderbook = await client
        .getOrderBook({ symbol: symbol, limit: 5 })
        .catch((err) => {
          console.log(err);
        });

      await sleep(4000);

      const bid = parseFloat(orderbook?.bids[0][0]);
      const ask = parseFloat(orderbook?.asks[0][0]);

      let trade_size_in_dollars = usdtbalance * reorderamount;

      if (absorderamount != 0) trade_size_in_dollars = absorderamount;

      const order_amount = trade_size_in_dollars / price;
      const order_amount_buy = trade_size_in_dollars / ask;
      const order_amount_sell = trade_size_in_dollars / bid;

      const precision = symbols_n_precision;

      if (symbolbalance < 0) {
        if (
          (ema3_val_pre4 > ema6_val_pre4 && ema3_val_pre4 > ema9_val_pre4) ||
          (ema3_val_pre3 > ema6_val_pre3 && ema3_val_pre3 > ema9_val_pre3) ||
          (ema3_val_pre2 > ema6_val_pre2 && ema3_val_pre2 > ema9_val_pre2) ||
          (ema3_val_pre1 > ema6_val_pre1 && ema3_val_pre1 > ema9_val_pre1) ||
          (ema3_val > ema6_val && ema3_val > ema9_val)
        ) {
          let buyorder = await client
            .submitNewOrder({
              symbol: symbol,
              side: "BUY",
              type: "MARKET",
              quantity: Math.abs(symbolbalance),
              positionSide: "BOTH",
            })
            .catch((err) => {
              console.log(err);
            });
          console.log(buyorder);
          const data = {
            symbol: symbol,
            price: price,
            time: current_time,
            interval: timeInterval,
            result: "buy",
          };

          return response.status(200).json({
            error: false,
            entry: true,
            data: data,
          });
        }
      }

      if (symbolbalance > 0) {
        if (
          (ema3_val_pre4 < ema6_val_pre4 && ema3_val_pre4 < ema9_val_pre4) ||
          (ema3_val_pre3 < ema6_val_pre3 && ema3_val_pre3 < ema9_val_pre3) ||
          (ema3_val_pre2 < ema6_val_pre2 && ema3_val_pre2 < ema9_val_pre2) ||
          (ema3_val_pre1 < ema6_val_pre1 && ema3_val_pre1 < ema9_val_pre1) ||
          (ema3_val < ema6_val && ema3_val < ema9_val)
        ) {
          let sellorder = await client
            .submitNewOrder({
              symbol: symbol,
              side: "SELL",
              type: "MARKET",
              quantity: Math.abs(symbolbalance),
              positionSide: "BOTH",
            })
            .catch((err) => {
              console.log(err);
            });

          console.log(sellorder);
          const data = {
            symbol: symbol,
            price: price,
            time: current_time,
            interval: timeInterval,
            result: "sell",
          };

          return response.status(200).json({
            error: false,
            entry: true,
            data: data,
          });
        }
      } else {
        console.log("entry fails");

        return response.status(200).json({
          error: false,
          entry: false,
          data: {},
        });
      }
    }, 5000);
  } else {
    console.log("Daily Trade Count is Exceed");
    return response.status(200).json({
      error: true,
      message: "Daily Trade Count is Exceed",
      data: {},
    });
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  tripleEma_trade,
};
