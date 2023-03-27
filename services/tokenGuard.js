const jwt = require("jsonwebtoken");
const User = require("../models/user.models");

const tokenGuard = async (request, response, next) => {
  const token = request.headers.token;
  const walletAddress = request.body.walletAddress;

  if (token == null) {
    return response.status(401).json({
      error: true,
      message: "The security token missing from your request",
      data: {},
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  jwt.verify(token, jwtSecret, async function (err, user) {
    if (err) {
      return response.status(401).json({
        error: true,
        message: "The security token has been expired",
        data: {},
      });
    }

    const checkUser = await User.findOne({ walletAddress });

    if (checkUser == undefined) {
      return response.status(401).json({
        error: true,
        message: "The security token has been expired",
        data: {},
      });
    }

    request.user = user;
    next();
  });
};

module.exports = {
  tokenGuard,
};
