const mongoose = require("mongoose");

const tradeResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

var TradeResult = mongoose.model("traderesults", tradeResultSchema);
module.exports = TradeResult;
