const tulind = require("tulind");
const { getDataFromAPI } = require("../data/data");

const getMACDValue = async () => {
  const results = await getDataFromAPI();
  let close = [];

  results.data.map((result) => {
    close.push(result[4]);
  });

  tulind.indicators.macd.indicator([close], [12, 26, 9], (err, res) => {
    if (err) return console.log(err);

    console.log(res[0].slice(-1)[0]);
  });
};

module.exports = {
  getMACDValue,
};
