const express = require("express");
const { getBotByUserId, buyBot } = require("../controller/botbuy.controller");

const router = express.Router();

router.post("/", buyBot);
router.post("/id", getBotByUserId);

module.exports = {
  routes: router,
};
