const mongoose = require("mongoose");

const botBuySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  bot: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  valid: {
    type: Boolean,
    required: true,
  },
});

var BotBuy = mongoose.model("botbuys", botBuySchema);
module.exports = BotBuy;
