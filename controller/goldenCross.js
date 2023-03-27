const CoinGecko = require("coingecko-api");
const SMA = require("technicalindicators").SMA;
const CrossUp = require("technicalindicators").CrossUp;

const getLatestValues = (values, period) => values.slice(-period);

const getGoldenCross = async (req, res) => {
  const prices = await getPastCryptoPrices();

  const priceTimeOnly = prices?.map((price) => price[0]);
  const pricesOnly = prices?.map((price) => price[1]);

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

  return res.status(200).json({
    error: false,
    data: results,
  });
};

const getPastCryptoPrices = async () => {
  const coinGeckoClient = new CoinGecko();

  const data = await coinGeckoClient.coins.fetchMarketChart("bitcoin", {
    vs_currency: "usd",
    days: 1,
  });

  return data.data.prices;
};

module.exports = {
  getGoldenCross,
};
