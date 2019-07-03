const  nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const credentials = require('../config/credentials');

const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: credentials.email,
        pass: credentials.pass
    }
  }));
  
/*var mailOptions = {
from: 'sabir.shaik.poorna@gmail.com',
to: 'sabir.shaik789@gmail.com',
subject: 'Sending Email using Node.js',
text: 'That was easy!'
};*/

module.exports.sendemail = function(data){
        transporter.sendMail(data, function(error, info){
            if (error) {
                console.log(error);
            } 
            else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
