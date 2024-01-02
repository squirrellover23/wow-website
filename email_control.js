const nodemailer = require('nodemailer');

// Create a transporter using your email service provider's SMTP settings

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      type: 'OAuth2',
      user: 'petersonwingate1@gmail.com',
      clientId: '554913482176-jul7r8i5m1q8npgf6ipg5rbdl1papclf.apps.googleusercontent.com',
      clientSecret: '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',
      refreshToken: "1//04eDKMb-4gQONCgYIARAAGAQSNwF-L9IrTMgP5jdy3JS9csmKJ-D_7YouLToylrsjZ2xMZR5IA4dqbEz9cXXPTRV4AkLZwZw4LSA",
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
