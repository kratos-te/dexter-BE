const express = require("express");
const {
  getTradeByUserId,
  trade,
} = require("../controller/traderesult.controller");

const router = express.Router();

router.post("/", trade);
router.post("/id", getTradeByUserId);

module.exports = {
  routes: router,
};
