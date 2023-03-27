require("dotenv").config;
var ccxt = require("ccxt");
const config = require("./config");
const CoinGecko = require("coingecko-api");
const SMA = require("technicalindicators").SMA;
const CrossUp = require("technicalindicators").CrossUp;

const getLatestValues = (values, period) => values.slice(-period);

const getGoldenCross = async (prices) => {
  const priceTimeOnly = prices.map((price) => price[0]);
  const pricesOnly = prices.map((price) => price[1]);

  const sma200 = SMA.calculate({ period: 200, values: pricesOnly });
  const sma50 = SMA.calculate({ period: 50, values: pricesOnly });

  const latestSma50 = await getLatestValues(sma50, sma200.length);
  const latestPriceTimes = await getLatestValues(priceTimeOnly, sma200.length);

  const crosses = CrossUp.calculate({ lineA: latestSma50, lineB: sma200 });

  const crossIndices = crosses.reduce((accumulator, element, index) => {
    if (element === true) {
      accumulator.push(index);
    }
    return accumulator;
  }, []);

  const results = crossIndices.map((i) => ({
    time: new Date(latestPriceTimes[i]).toISOString(),
    fastSma: latestSma50[i],
    slowSma: sma200[i],
  }));

  return results;
};

const getPastCryptoPrices = async () => {
  const coinGeckoClient = new CoinGecko();

  const data = await coinGeckoClient.coins.fetchMarketChart("bitcoin", {
    vs_currency: "usd",
    days: 1,
  });

  return data.data.prices;
};

(async function () {
  var exchange = new ccxt.binance({
    apiKey: config.API_KEY,
    secret: config.SECRET_KEY,
  });

  const data = await getPastCryptoPrices();

  //   const response = await getGoldenCross(data);

  //   console.log(response);

  var ticker = await exchange.fetchTicker(config.SYMBOL);

  var buyOrders = [];
  var sellOrders = [];

  for (var i = 1; i <= config.NUM_BUY_GRID_LINES; i++) {
    var price = ticker["bid"] - config.GRID_SIZE * i;
    console.log(`submitting market limit buy order at ${price}`);
    var order = await exchange.createLimitBuyOrder(
      config.SYMBOL,
      config.POSITION_SIZE,
      price
    );
    buyOrders.push(order["info"]);
  }

  for (var i = 1; i <= config.NUM_SELL_GRID_LINES; i++) {
    var price = ticker["bid"] - config.GRID_SIZE * i;
    console.log(`submitting market limit sell order at ${price}`);
    var order = await exchange.createLimitSellOrder(
      config.SYMBOL,
      config.POSITION_SIZE,
      price
    );
    sellOrders.push(order["info"]);
  }

  while (true) {
    var closedOrderIds = [];

    for (var buyOrder of buyOrders) {
      console.log(`checking buy order ${buyOrder["id"]}`);

      try {
        order = await exchange.fetchOrder(buyOrder["id"]);
      } catch (err) {
        console.log(err);
      }

      var orderInfo = order["info"];

      if (orderInfo["status"] == config.CLOSED_ORDER_STATUS) {
        closedOrderIds.push(orderInfo["id"]);
        console.log(`buy order executed at ${orderInfo["price"]}`);
        var newSellPrice = parseFloat(orderInfo["price"] + config.GRID_SIZE);
        var newSellOrder = await exchange.createLimitSellOrder(
          config.SYMBOL,
          config.POSITION_SIZE,
          newSellPrice
        );
        sellOrders.push(newSellOrder);
      }

      await new Promise((resolve) =>
        setTimeout(resolve, config.CHECK_ORDERS_FREQUENCY)
      );
    }

    for (var sellOrder of sellOrders) {
      console.log(`checking buy order ${sellOrder["id"]}`);

      try {
        order = await exchange.fetchOrder(sellOrder["id"]);
      } catch (err) {
        console.log(err);
      }

      var orderInfo = order["info"];

      if (orderInfo["status"] == config.CLOSED_ORDER_STATUS) {
        closedOrderIds.push(orderInfo["id"]);
        console.log(`buy order executed at ${orderInfo["price"]}`);
        var newBuyPrice = parseFloat(orderInfo["price"] + config.GRID_SIZE);
        var newBuyOrder = await exchange.createLimitSellOrder(
          config.SYMBOL,
          config.POSITION_SIZE,
          newBuyPrice
        );
        buyOrders.push(newBuyOrder);
      }

      await new Promise((resolve) =>
        setTimeout(resolve, config.CHECK_ORDERS_FREQUENCY)
      );
    }

    closedOrderIds.forEach((closedOrderId) => {
      buyOrders = buyOrders.filter(
        (buyOrder) => buyOrder["id"] != closedOrderId
      );
      sellOrders = sellOrders.filter(
        (sellOrder) => sellOrder["id"] != closedOrderId
      );
    });

    if (sellOrders.length == 0) {
      console.log("nothing left to sell, exit..");
      process.exit(1);
    }
  }
})();
