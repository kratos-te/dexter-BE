const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  trade: {
    type: Number,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
});

var User = mongoose.model("trades", tradeSchema);
module.exports = User;
