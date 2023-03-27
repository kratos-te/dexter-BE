const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  subcriptionStart: {
    type: Date,
  },
  subcriptionEnd: {
    type: Date,
  },
  referralNo: {
    type: String,
    required: true,
  },
  userRef: {
    type: String,
  },
  verified: {
    type: Boolean,
    required: true,
  },
  subscribe: {
    type: Boolean,
    default: false,
  },
  privateKey: {
    type: Object,
  },
  secrete: {
    type: Object,
  },
});

var User = mongoose.model("users", userSchema);
module.exports = User;
