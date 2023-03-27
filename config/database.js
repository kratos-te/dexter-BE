require("dotenv").config();
const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database is connected");
  } catch (error) {
    console.log("Database connection failed ", error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
