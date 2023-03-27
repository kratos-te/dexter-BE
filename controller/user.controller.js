const User = require("../models/user.models");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../services/SendMails");
const { makeMail } = require("../services/makeEmail");
const Token = require("../models/token.model");
const { encrypt } = require("../services/encryptPrivate");
const { USDMClient } = require("binance");
const { decrypt } = require("../services/encryptPrivate");
const crypto = require("crypto");

const signup = async (req, res, next) => {
  const email = req.body.email;
  let timestamps = Date.now();
  const number = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
  let data = null;

  const referralNo = timestamps.toString() + number;

  if (!req.body.fullName) {
    return res.status(400).json({
      error: true,
      message: "user name is required",
      data: {},
    });
  }
  if (!req.body.email) {
    return res.status(400).json({
      error: true,
      message: "email is required",
      data: {},
    });
  }
  if (!req.body.password) {
    return res.status(400).json({
      error: true,
      message: "password is required",
      data: {},
    });
  }

  let userFindEmail = await User.findOne({ email });
  if (userFindEmail) return res.status(400).send("Email already exists");

  await bcrypt.hash(req.body.password, 10).then((hashedpassword) => {
    data = {
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedpassword,
      referralNo: referralNo,
      userRef: req.body.userRef,
      verified: false,
    };
  });

  const jwtSecret = process.env.JWT_SECRET;

  const user = new User(data);
  user
    .save()
    .then(async (result) => {
      console.log(result);

      let tokendata = {
        userId: result._id,
        token: crypto.randomBytes(32).toString("hex"),
      };

      console.log(tokendata);

      const token = await new Token(tokendata);
      await token.save();

      console.log(token);

      const url = `${process.env.REACT_APP_URL}/verify/${result._id}/${token.token}`;
      console.log(url);
      emailBody = makeMail(url)
      await sendEmail(user.email, "Verify Email", emailBody);

      res.status(200).json({
        success: true,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: err.message,
        data: {},
        token: null,
      });
    });
};

const login = async (req, res, next) => {
  const email = req.body.email;
  const jwtSecret = process.env.JWT_SECRET;

  if (!req.body.email) {
    return res.status(400).json({
      error: true,
      message: "email is required",
      data: {},
    });
  }
  if (!req.body.password) {
    return res.status(400).json({
      error: true,
      message: "password is required",
      data: {},
    });
  }

  User.findOne({ email }).then((result) => {
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "User Doesn't Exist",
        data: {},
        token: null,
      });
    }
    if (result?.verified) {
      bcrypt
        .compare(req.body.password, result.password)
        .then((doMatch) => {
          if (doMatch) {
            const token = jwt.sign({ email: result.email }, jwtSecret);
            return res.status(200).json({
              success: true,
              data: result,
              token: token,
            });
          } else {
            return res.status(400).json({
              success: false,
              message: "Invalid Password",
              data: {},
              token: null,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return res.status(400).json({
        success: false,
        message: "Please Verified your Email",
        data: {},
        token: null,
      });
    }
  });
};

const verifyUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "invalid link" });

    const token = await Token.findOne({
      userId: id,
      token: req.params.token,
    });

    // if (!token) return res.status(400).send({ message: "Invalid Link" });

    const data = {
      verified: true,
    };

    await User.findByIdAndUpdate(id, data);
    // await token.remove();

    return res.status(200).send({ message: "Email Verfied Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).catch((err) => {
    return res.status(500).json({
      success: false,
      message: err.message,
      data: {},
    });
  });

  if (!user.privateKey) {
    return res.status(200).json({
      success: true,
      data: user,
    });
  } else {
    const privateKey = decrypt(user.privateKey);
    const secret = decrypt(user.secrete);

    const client = new USDMClient({
      api_key: privateKey,
      api_secret: secret,
      baseUrl: "https://testnet.binancefuture.com",
    });

    // get all trades in account
    const account_trades = await client.getAccountTrades();

    let totalProfit = 0;

    account_trades.forEach((e) => {
      totalProfit = totalProfit + parseFloat(e.realizedPnl);
    });

    return res.status(200).json({
      success: true,
      data: user,
      trades: account_trades.reverse(),
      totalProfit: totalProfit,
    });
  }
};

const updateUserSubscription = (req, res) => {
  const userId = req.params.id;
  const start = new Date();
  const end = new Date();

  end.setDate(end.getDate() + 30);

  console.log(start, end);

  const data = {
    subcriptionStart: start,
    subcriptionEnd: end,
  };

  User.findByIdAndUpdate(userId, data)
    .then((result) => {
      res.status(200).json({
        success: true,
        data: result,
      });
    })
    .catch((err) => {
      res.status(503).json({
        success: false,
        message: err.message,
      });
    });
};

const checkUserSubscription = (req, res) => {
  const userRef = req.body.userRef;

  User.find({ userRef })
    .then((result) => {
      res.status(200).json({
        success: true,
        data: result,
      });
    })
    .catch((err) => {
      res.status(503).json({
        success: false,
        message: err.message,
      });
    });
};

const updateUserById = (req, res) => {
  const id = req.params.id;

  const data = {
    avatar: req.body.avatar,
  };

  User.findByIdAndUpdate(id, data)
    .then((result) => {
      return res.status(200).json({
        success: true,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: err.message,
        data: {},
      });
    });
};

const updateUserPrivateAndSecret = (req, res) => {
  const id = req.params.id;
  console.log("1.!!!!");

  const privateKey = encrypt(req.body.privateKey);
  const secrete = encrypt(req.body.secrete);

  const data = {
    privateKey,
    secrete,
  };

  User.findByIdAndUpdate(id, data)
    .then((result) => {
      console.log("2.!!!!");
      return res.status(200).json({
        success: true,
        data: result,
      });
    })
    .catch((err) => {
      console.log("3.!!!!");
      return res.status(500).json({
        success: false,
        message: err.message,
        data: {},
      });
    });
};

module.exports = {
  signup,
  login,
  getUserById,
  updateUserSubscription,
  checkUserSubscription,
  updateUserById,
  verifyUser,
  updateUserPrivateAndSecret,
};
