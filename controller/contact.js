const nodemailer = require("nodemailer");

const contact = async (req, res) => {
  try {
    const email = req.body.email;
    const message = req.body.message;
    const name = req.body.name;

    const subject = "Get Information about DEXter";

    console.log(email);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 465,
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });

    const sent_email = await transporter.sendMail({
      from: email,
      to: "ravinrayan55@gmail.com",
      subject: subject,
      text: message,
    });

    console.log(sent_email);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log("Email Not Sent");
    console.log(error);
    return res.status(200).json({
      success: false,
      message: "Email not sent successfully",
      error: error,
    });
  }
};

module.exports = {
  contact,
};
