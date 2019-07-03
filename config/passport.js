const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const key = require('../config/database');
const Employee = require('../models/employees');

module.exports = function(passport){
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = key.secretKey;
    passport.use(new jwtStrategy(opts, (jwt_payload, done)=>{
        if(jwt_payload.emp_id == undefined){
            console.log("admin login");
            User.getUserById(jwt_payload._id, (err, user) =>{
                if(err){
                    return done(err, false);
                }
                if(user){
                    return done(null, user);
                } else{
                    return done(err, false);
                }
            });
        }
        if(jwt_payload.is_verified == undefined){
            console.log("emp login");
            Employee.getEmpById(jwt_payload._id, (err, emp) =>{
                if(err){
                    return done(err, false);
                }
                if(emp){
                    return done(null, emp);
                } else{
                    return done(err, false);
                }
            });
        }
        
    })
)};
