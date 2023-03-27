const BotBuy = require("../models/botBuy.model");
const User = require("../models/user.models");

const buyBot = async (req, res) => {
  try {
    const data = req.body;
    const id = req.body.userId;

    const user_data = {
      subscribe: true,
    };

    await User.findByIdAndUpdate(id, user_data);

    const bot = new BotBuy(data);
    bot
      .save()
      .then((result) => {
        return res.status(200).json({
          error: false,
          message: "suceessfully buy",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          error: true,
          message: error,
          data: {},
        });
      });
  } catch (error) {
    console.log(error);
  }
};

const getBotByUserId = (req, res) => {
  try {
    const userId = req.body.userId;

    BotBuy.find({ userId })
      .populate("bot")
      .populate("userId")
      .then((result) => {
        return res.status(200).json({
          error: false,
          message: "found",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          error: true,
          message: error,
          data: {},
        });
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  buyBot,
  getBotByUserId,
};
