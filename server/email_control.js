// const nodemailer = require("nodemailer");
// require("dotenv").config();

// Emails are not working because the oath 2 set up expired
// I will need to set something else up that works better probably with another email service provider


// Checking to see if the env vars are set up
// console.log(
// !process.env.CLIENT_ID ||
//     !process.env.CLIENT_SECRET ||
//     !process.env.REFRESH_TOKEN ||
//     !process.env.EMAIL
//     ? "Env info missing"
//     : "Env should be good"
// );

// const transporter = nodemailer.createTransport({
// service: "Gmail",
// auth: {
//     type: "OAuth2",
//     user: "petersonwingate1@gmail.com",
//     clientId: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     refreshToken: process.env.REFRESH_TOKEN,
//     expires: 1484314697598,
// },
// });

// function send_email(to, subject, text, callback = null) {
//     console.log('emails disabled')
//     return;
//     const mailOptions = {
//         from: "petersonwingate1@gmail.com",
//         to: to,
//         subject: subject,
//         text: text,
//     };
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error("Error sending email:", error);
//         }
//         if (callback) {
//             callback(error, info.response);
//         }
//     });
// }
function send_email(to, subject, text, callback = null) {
    console.log('emails disabled')
    return;
}
module.exports = { send_email };
