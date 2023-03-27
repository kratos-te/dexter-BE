const {
  getMACDValue,
  getRSIValue,
  getSMA200Value,
  getSMA50Value,
  getKAndDValue,
  getKAndDArray,
} = require("../indicators/indicators");
const { getDataFromAPI } = require("../data/data");
var nj = require("numjs");

const strategyFunctionMRKD = async (req, res) => {
  const symbol = req.body.symbol;
  const timeInterval = req.body.timeInterval;
  // const symbol = "BNBUSDT";
  // const timeInterval = "1m";

  const model = await getDataFromAPI(symbol, timeInterval);
  let buy = false;

  const macdValue = await getMACDValue(model.close);
  const rsiValue = await getRSIValue(model.close);
  const KDValue = await getKAndDValue(model.high, model.low, model.close);
  const KDArray = await getKAndDArray(model.high, model.low, model.close);

  const kLine = KDValue.kLine;
  const dLine = KDValue.dLine;

  const kLineArr = KDArray.kLineArray;
  const dLineArr = KDArray.dLineArray;

  const checkBuyTrigger = await buyTrigger(kLineArr, dLineArr, 25);
  // console.log(checkBuyTrigger);

  const currentPrice = Number(model.close.slice(-1)[0]).toFixed(2);
  console.log(macdValue, rsiValue, kLine, dLine);
  console.log(currentPrice);

  if (rsiValue > 50 && macdValue > 0 && 20 < kLine < 80 && 20 < dLine < 80) {
    buy = true;
  }

  const dataResult = {
    symbol: symbol,
    currentPrice: currentPrice,
    buy: buy,
  };

  return res.status(200).json({
    error: false,
    data: dataResult,
  });
};

const buyTrigger = async (arrayKL, arrayDL, lags) => {
  let mask;
  let dfx = [];

  for (let i = 0; i < lags + 1; i++) {
    mask = arrayKL.shift() < 20 && arrayDL.shift() < 20;
    if (mask) {
      dfx.push(1);
    } else {
      dfx.push(0);
    }
  }
  dfx.forEach((index) => {
    if (index == 1) {
      return true;
    }
  });
  return false;
};

const strategyFunctionBBSMA = async () => {
  const model = await getDataFromAPI();

  const sma200Value = await getSMA200Value(model.close);
  const sma50Value = await getSMA50Value(model.close);
};

module.exports = {
  strategyFunctionMRKD,
};
