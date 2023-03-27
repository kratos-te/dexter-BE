const { getDataFromAPI } = require("../data/data");
const { USDMClient } = require("binance");
const axios = require("axios");
const { getMACDArray } = require("../indicators/indicators");
const Trade = require("../models/trade.model");
const moment = require("moment");
const ccxt = require("ccxt");

const futures_trade = async (request, response) => {
  const symbol = request.body.symbol;
  const timeInterval = request.body.interval;

  console.log("golden cross");

  const currentDate = moment().format("L");

  const email = request.body.email;
  const date = moment().format("L");

  const userTrades = await Trade.find({ email, date });

  const date1 = new Date();

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

      const macd = await getMACDArray(model.close);

      let test1 = macd.macd_signal.slice(-1)[0] - macd.macd.slice(-1)[0];
      let test2;

      console.log("test1:", test1);

      for (let i = 2; i < model.close.length; i++) {
        test2 = macd.macd_signal.slice(-i)[0] - macd.macd.slice(-i)[0];
        if (test1 > 0 && test2 < 0) {
          break;
        }
        if (test1 < 0 && test2 > 0) {
          break;
        }
      }

      console.log("test2:", test2);

      let test3 = macd.macd_signal.slice(-2)[0] - macd.macd.slice(-2)[0];
      console.log("test3:", test3);

      let call = null;
      let call1 = null;

      if (test1 < 0 && test2 > 0 && Math.abs(test1) >= buyd) {
        if (test3 / test1 > 0 && Math.abs(test3) < buyd) {
          call1 = "Goldencross for entry";
        }
        if (test3 / test1 < 0) {
          call1 = "Goldencross for entry";
        }
      }

      if (test1 > 0 && test2 < 0 && Math.abs(test1) >= buyd) {
        if (test3 / test1 > 0 && Math.abs(test3) < buyd) {
          call1 = "Deadcross for entry";
        }
        if (test3 / test1 < 0) {
          call1 = "Deadcross for entry";
        }
      }

      if (test1 < 0 && test2 > 0) {
        call = "Goldencross";
      }
      if (test1 > 0 && test2 < 0) {
        call = "Deadcross";
      }

      console.log(call1);
      console.log(call);

      let initialmargin;
      let unrealizedprofit;
      let usdtbalance = 0;

      const balance = await client.getBalance().catch((err) => {
        console.log(err);
      });
      // console.log(balance);
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
      // console.log(account);
      await sleep(4000);

      account.assets.forEach((asset) => {
        if (asset.asset == "USDT") {
          initialmargin = asset.initialMargin;
          unrealizedprofit = asset.unrealizedProfit;
        }
      });

      console.log(initialmargin);
      console.log(unrealizedprofit);

      let roe = 0;
      try {
        roe = unrealizedprofit / initialmargin;
      } catch {
        roe = 0;
      }

      if (ptest1 == 0) roelist = [];
      let roe2 = null;
      let roe3 = null;

      if (ptest1 != 0) {
        roelist.push(roe);
        console.log(roelist);
        roe2 = Math.max(roelist) * profitcut1;
        roe3 = Math.max(roelist) * profitcut2;
        roelist = [Math.max(roelist)];
        console.log(roe2);
        console.log(roe3);
      }

      if (ptest1 != 3 && roe >= profittarget1) ptest1 = 1;

      if (ptest1 == 1 && roe <= roe2) ptest1 = 2;

      if (roe >= profittarget2) ptest1 = 3;

      if (ptest1 == 3 && roe <= roe3) ptest1 = 4;

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

      console.log(roe2, roe3);
      let symbolbalance = 0;
      let entryprice = 0;

      account.positions.forEach((position) => {
        if (position.symbol == symbol) {
          symbolbalance = parseFloat(position.positionAmt);
          entryprice = parseFloat(position.entryPrice);
        }
      });

      console.log("symbolbalance:", symbolbalance);

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

      if (symbolbalance < 0 && userTrades.length < request.body.tradeCount) {
        if (roe < losscut * -1) {
          try {
            console.log("Stop loss buy");
            let order = await client
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
            console.log(order);

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
          } catch (err) {
            console.log(err);
          }
        }

        if (roe > profitcut) {
          try {
            console.log("Profit take buy");
            let order = await client
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
            console.log(order);

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
          } catch (err) {
            console.log(err);
          }
        }

        if (ptest1 == 2) {
          try {
            console.log("Profit take buy (Profit Take Stop 1)");
            let order = await client
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
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }

        if (ptest1 == 4) {
          try {
            console.log("Profit take buy (Profit Take Stop 2)");
            let order = await client
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
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }
      }

      if (symbolbalance > 0 && userTrades.length < request.body.tradeCount) {
        if (roe < losscut * -1) {
          try {
            console.log("Loss cut sell");
            let order = await client
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
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }

        if (roe > profitcut) {
          try {
            console.log("Profit take sell");
            let order = await client
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
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }

        if (ptest1 == 2) {
          try {
            console.log("Profit take sell (Profit Take Stop 1)");
            let order = await client
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
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }

        if (ptest1 == 4) {
          try {
            console.log("Profit take sell (Profit Take Stop 2)");
            let order = await client
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
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }
      }

      if (
        call == "Goldencross" &&
        userTrades.length < request.body.tradeCount
      ) {
        if (symbolbalance < 0) {
          try {
            console.log("Golden Cross Buy");
            let buyorderq = Math.abs(symbolbalance)
              .toFixed(precision)
              .toString();

            let order = await client
              .submitNewOrder({
                symbol: symbol,
                side: "BUY",
                type: "MARKET",
                quantity: buyorderq,
                positionSide: "BOTH",
              })
              .catch((err) => {
                console.log(err);
              });
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }
      }

      if (
        call1 == "Goldencross for entry" &&
        userTrades.length < request.body.tradeCount
      ) {
        if (symbolbalance == 0) {
          try {
            console.log("Golden Cross Buy");
            let buyorderq = order_amount_buy.toFixed(precision).toString();
            let order = await client
              .submitNewOrder({
                symbol: symbol,
                side: "BUY",
                type: "MARKET",
                quantity: buyorderq,
                positionSide: "BOTH",
              })
              .catch((err) => {
                console.log(err);
              });
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }
      }

      if (call == "Deadcross" && userTrades.length < request.body.tradeCount) {
        if (symbolbalance > 0) {
          try {
            console.log("Deadcross sell");
            let buyorderq = Math.abs(symbolbalance)
              .toFixed(precision)
              .toString();

            let order = await client
              .submitNewOrder({
                symbol: symbol,
                side: "SELL",
                type: "MARKET",
                quantity: buyorderq,
                positionSide: "BOTH",
              })
              .catch((err) => {
                console.log(err);
              });
            console.log(order);
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
          } catch (err) {
            console.log(err);
          }
        }
      }

      if (
        call1 == "Deadcross for entry" &&
        userTrades.length < request.body.tradeCount
      ) {
        if (symbolbalance == 0) {
          try {
            console.log("Deadcross sell");
            let buyorderq = order_amount_sell.toFixed(precision).toString();
            let order = await client
              .submitNewOrder({
                symbol: symbol,
                side: "SELL",
                type: "MARKET",
                quantity: buyorderq,
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
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        console.log("There are no entry");

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
  futures_trade,
};
