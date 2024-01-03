const nodemailer = require('nodemailer');
require('dotenv').config()

// Create a transporter using your email service provider's SMTP settings

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      type: 'OAuth2',
      user: 'petersonwingate1@gmail.com',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      expires: 1484314697598
    }
  });

function send_email(to, subject, text, callback = null){
    const mailOptions = {
        from: 'petersonwingate1@gmail.com',
        to: to,
        subject: subject,
        text: text,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error); 
        }
        if (callback) {
            callback(error, info.response)
        }
    });
}

module.exports = {send_email}
