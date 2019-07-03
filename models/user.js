const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const UserSchema = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true  
    },
    password : {
        type:String,
        required: true
    },
    company_name:{
        type: String,
        required: true
    },
    vtoken:{
        type: String,
        required: true
    },
    is_verified:{
        type: Boolean,
        required: true
    }
});

const User = module.exports = mongoose.model('customers', UserSchema);

module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
};
module.exports.getUserByUsername = function(username,callback){
    const query = { username: username};
    User.findOne(query,callback);
};

module.exports.getUserByCompanyName = function(company_name,callback){
    const query = {company_name: company_name};
    User.findOne(query,callback);
}

module.exports.getUserByToken = function(vtoken,callback){
    const query = {vtoken: vtoken}
    User.findOne(query,callback);
}

module.exports.addUser = function(newuser,callback){
    bcrypt.genSalt(10,(err,salt) => {
        bcrypt.hash(newuser.password,salt,(err,hash) =>{
            if(err) throw err;
            newuser.password = hash;
            newuser.save(callback);
        });
    });
};
module.exports.comparePassword = function(password, hash, callback){
    bcrypt.compare(password, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
 
};
module.exports.getUserByEmail = function(email,callback){
    const query = {email: email}
    User.findOne(query,callback)      
};

module.exports.replace = function(email,user,callback){
    const query = {email: email}
    User.replaceOne(query,user,{upsert:false},callback);
}

module.exports.updatepassword = function(email,password,callback){
    const query = {email: email}
    User.updateOne({email: email},{$set:{password: password}},callback);
}

module.exports.updateVtoken = function(email,vtoken,callback){
    const query = {email: email}
    User.updateOne({email: email},{$set:{vtoken: vtoken}},callback);
}