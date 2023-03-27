const express = require("express");
const { contact } = require("../controller/contact");
// const { tokenGuard } = require("../services/tokenGuard");

const router = express.Router();

router.post("/", contact);

module.exports = {
  routes: router,
};
