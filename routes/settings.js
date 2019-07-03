const express = require('express'); 
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const User = require('../models/user');
const router = express.Router();
const decode = require('../misc/decodetoken');
const errors = require('../misc/errorhandlers');

//local variables
var token;

router.post('/resetpassword',passport.authenticate('jwt',{session: false}),(req,res) => {
    decode.decodeToken(req.headers.authorization,(err,decode) => {
        if(err)
            errors.err500(err,res);
        token = decode;    
    });
    var email = token.email;
    var oldpassword = req.body.oldpassword;
    var newpassword = req.body.newpassword;
    User.getUserByEmail(email,(err,user) =>{
        if(err)
            errors.err500(err,res);
        bcrypt.genSalt(10,(err,salt) => {
            if(err)
                errors.err500(err,res); 
            bcrypt.hash(oldpassword,salt,(err,hash) => {
                if(err)
                    errors.err500(err,res);
                User.comparePassword(oldpassword,hash,(err,isMatch) => {                    
                    if(err)
                        errors.err500(err,res);
                    if(isMatch){ 
                        bcrypt.hash(newpassword,salt,(err,newhash) => {
                            if(err)
                                errors.err500(err,res);
                            User.updatepassword(email,newhash,(err,user) => {
                                if(err)
                                    errors.err500(err,res);
                                if(user){
                                    console.log("password changed");
                                    res.json({success: true, message: "Password successfully changed!!"});
                                }
                            })
                        });
                    }
                    else{
                        console.log("incorrect password for resetting password!!");
                        res.json({success: false, message: "You have entered incorrect password, Please enter correct password!!"});
                                    return;
                    }        
                });                
            });
        });
    });
});

module.exports = router;





