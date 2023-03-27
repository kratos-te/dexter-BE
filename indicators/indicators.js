const tulind = require("tulind");

const getMACDValue = async (array) => {
  let value;
  tulind.indicators.macd.indicator([array], [12, 26, 9], (err, res) => {
    if (err) return console.log(err);

    value = res[0].slice(-1)[0];
  });

  return value;
};

const getMACDArray = async (array) => {
  let value = [];
  let macdArray = [];
  tulind.indicators.macd.indicator([array], [12, 26, 9], (err, res) => {
    if (err) return console.log(err);

    // for (let i = 0; i < res[0].length; i++) {
    //   let macdValue = res[0][i] - res[1][i];
    //   macdArray.push(macdValue);
    // }
    macdArray = res[0];
    value = res[1];
  });

  let data = {
    macd: macdArray,
    macd_signal: value,
  };

  return data;
};

const getRSIValue = async (array) => {
  let value;
  tulind.indicators.rsi.indicator([array], [14], (err, res) => {
    if (err) return console.log(err);

    value = res[0].slice(-1)[0];
  });

  return value;
};

const getSMA200Value = async (array) => {
  let value;
  tulind.indicators.sma.indicator([array], [200], (err, res) => {
    if (err) return console.log(err);

    value = res[0].slice(-1)[0];
  });

  return value;
};

const getSMA50Value = async (array) => {
  let value;
  tulind.indicators.sma.indicator([array], [50], (err, res) => {
    if (err) return console.log(err);

    value = res[0].slice(-1)[0];
  });

  return value;
};

const getKAndDValue = async (high, low, close) => {
  let value;
  tulind.indicators.stoch.indicator(
    [high, low, close],
    [5, 3, 3],
    function (err, results) {
      if (err) return console.log(err);

      value = {
        kLine: results[0].slice(-1)[0],
        dLine: results[1].slice(-1)[0],
      };
    }
  );

  return value;
};

const getKAndDArray = async (high, low, close) => {
  let value;
  tulind.indicators.stoch.indicator(
    [high, low, close],
    [5, 3, 3],
    function (err, results) {
      if (err) return console.log(err);

      value = {
        kLineArray: results[0],
        dLineArray: results[1],
      };
    }
  );

  return value;
};

module.exports = {
  getMACDValue,
  getRSIValue,
  getSMA200Value,
  getSMA50Value,
  getKAndDValue,
  getKAndDArray,
  getMACDArray,
};
