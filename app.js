require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDatabase = require("./config/database");
const StrategyRoutes = require("./routes/strategy.routes");
const UserRoutes = require("./routes/user.routes");
const ContactRoutes = require("./routes/contact.routes");
const BotRoutes = require("./routes/bot.routes");
const BotBuyRoutes = require("./routes/botbuy.routes");
const TradeResultRoutes = require("./routes/traderesult.routes");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.use(bodyParser.json({ limit: "200mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

app.use("/api/v1/strategy", StrategyRoutes.routes);
app.use("/api/v1/user", UserRoutes.routes);
app.use("/api/v1/contact", ContactRoutes.routes);
app.use("/api/v1/bot", BotRoutes.routes);
app.use("/api/v1/buy", BotBuyRoutes.routes);
app.use("/api/v1/trade", TradeResultRoutes.routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

connectDatabase();

module.exports = app;
