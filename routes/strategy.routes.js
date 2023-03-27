const express = require("express");
const { futures_trade } = require("../futures_trade/future_trade_entry");
const { macd_trade } = require("../futures_trade/Macd_trade");
const { macdrsi_trade } = require("../futures_trade/RSI_trade");
const { tripleEma_trade } = require("../futures_trade/tripleEma");
const { stochbb_trade } = require("../futures_trade/stochbb_trade");
// const { tokenGuard } = require("../services/tokenGuard");

const router = express.Router();

router.post("/trade", futures_trade);
router.post("/macd", macd_trade);
router.post("/macdnrsi", macdrsi_trade);
router.post("/tripleema", tripleEma_trade);
router.post("/stochbb", stochbb_trade);

module.exports = {
  routes: router,
};
