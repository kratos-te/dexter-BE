const TradeResult = require("../models/tradeResult");

const trade = (req, res) => {
  try {
    const data = req.body;

    const trade = new TradeResult(data);

    trade
      .save()
      .then((result) => {
        return res.status(200).json({
          error: false,
          message: "suceessfully buy",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          error: true,
          message: error,
          data: {},
        });
      });
  } catch (error) {
    console.log(error);
  }
};

const getTradeByUserId = (req, res) => {
  try {
    const userId = req.body.userId;

    TradeResult.find({ userId })
      .populate("userId")
      .then((result) => {
        return res.status(200).json({
          error: false,
          message: "found",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          error: true,
          message: error,
          data: {},
        });
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  trade,
  getTradeByUserId,
};
