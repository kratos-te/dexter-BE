const Bot = require("../models/bot");

const addBot = (req, res) => {
  try {
    const data = req.body;

    const bot = new Bot(data);

    bot
      .save()
      .then((result) => {
        return res.status(200).json({
          error: false,
          message: "created",
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

const getBotById = (req, res) => {
  const id = req.params.id;

  Bot.findById(id)
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
};

const getAllBot = (req, res) => {
  Bot.find()
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
};

const updateRatings = (req, res) => {
  const id = req.body.id;

  const data = {
    rating: req.body.rating,
  };

  Bot.findByIdAndUpdate(id, data)
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
};

module.exports = {
  addBot,
  getBotById,
  getAllBot,
  updateRatings,
};
