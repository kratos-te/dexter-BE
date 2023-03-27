const express = require("express");
const {
  getBotById,
  addBot,
  getAllBot,
  updateRatings,
} = require("../controller/bot.controller");

const router = express.Router();

router.post("/", addBot);
router.get("/:id", getBotById);
router.get("/", getAllBot);
router.patch("/:id", updateRatings);

module.exports = {
  routes: router,
};
