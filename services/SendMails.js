const nodemailer = require("nodemailer");
const config = require("../config");

const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      // host: "mx1.titan.email",
      // port: 25,
      // auth: {
      //   user: "verify@nebfi.com",
      //   pass: "iErODFCa9p",
      // },
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: "bananas00912@gmail.com",
        pass: "jmqatfawmhjrqxrr",
      },
    });

    await transporter.sendMail({
      from: "bananas00912@gmail.com",
      // from: "verify@nebfi.com",
      to: email,
      subject: subject,
      html: html,
    });

    console.log("Email Sent");
  } catch (error) {
    console.log("Email Not Sent");
    console.log(error);
  }
};


module.exports = {
  sendEmail,
};
