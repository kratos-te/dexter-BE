const express = require("express");
const {
  signup,
  login,
  getUserById,
  updateUserSubscription,
  checkUserSubscription,
  updateUserById,
  verifyUser,
  updateUserPrivateAndSecret,
} = require("../controller/user.controller");
// const { tokenGuard } = require("../services/tokenGuard");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/:id", getUserById);
router.patch("/:id", updateUserSubscription);
router.post("/subcription", checkUserSubscription);
router.patch("/update/:id", updateUserById);
router.get("/:id/verify/:token", verifyUser);
router.patch("/traupt/:id", updateUserPrivateAndSecret);

module.exports = {
  routes: router,
};
