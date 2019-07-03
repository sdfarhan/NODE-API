const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports.decodeToken = function(token,done){
    token = token.slice(4,token.length+1);
    jwt.verify(token,config.secretKey,(err,decode) => {
        if(err){
            console.log(err+"an error occured while decoding token!!");
            return done(err,false);
        }
        if(decode){
            return done(null,decode);
        }
    }
)};    