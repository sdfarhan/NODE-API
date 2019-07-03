const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const cors = require('cors');
const passport  = require('passport');
const mongoose = require('mongoose');
const users = require('./routes/users');
const config = require('./config/database');
const emp = require('./routes/emp');
const mail = require('./misc/email'); 
//conect to database
mongoose.connect(config.database,{ useNewUrlParser: true} );
mongoose.connection.on('connected',() => {
    console.log('connected to database:' + config.database);
});

mongoose.connection.on('error',(err) => {
    console.log('database error' + err);
})



const app = express();
//CORS Middleware 
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname,'public')));

//BODY-PARSER Middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

//users route middleware
app.use('/users',users);

//employees route middleware
app.use('/emp',emp);

//default route 
app.get('/',(req,res) =>{
    var mailOptions = {
        from: 'sabir.shaik.poorna@gmail.com',
        to: 'sabir.shaik.poorna@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
        };
        mail.sendemail(mailOptions);
    res.send('inavalid page!!');
})

//start server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => 
{
    if(err) throw err;
    console.log("server started")
});