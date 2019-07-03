const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Ques_opts = require('../models/question_ans');
const Employee = require('../models/employees');
const randomstring = require('randomstring');
const mail = require('../misc/email');
const credentials = require('../config/credentials');
const router = express.Router();
const routersettings = require('../routes/settings');
const Feedback = require('../models/feedback');
const decode = require('../misc/decodetoken');
const errors = require('../misc/errorhandlers');

//local variables
var token;

//settings middleware
router.use('/settings',passport.authenticate('jwt',{session: false}),routersettings);

router.post('/register', (req,res) => {
    let newuser = new User({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        company_name : req.body.company_name,
        vtoken: randomstring.generate(200),
        is_verified: false
    });
    User.getUserByEmail(newuser.email,(err,user) => {
        if(err)
            errors.err500(err,res); 
        if(user)
        {
            res.json({
                success: false,
                message: "user with "+ user.email + " already exits!!!"
            })
            return;
        }
        User.getUserByCompanyName(newuser.company_name,(err,user) => {
            if(err)
                errors.err500(err,res);
            if(user){
                console.log("company_name exist");
                res.json({success: false, message:"company name: "+user.company_name+" already exist"});
                return;
            }
            if(!user){
                User.addUser(newuser,(err,user) => {
                    if(err)
                        errors.err500(err,res);
                    if(user){
                        const maildata = {
                            from: credentials.email,
                            to: user.email,
                            subject: "Confirm Your Registration",
                            html: 
                                `
                                <h1>Confirm Your Registration</h1>
                                <p>To verify your account <a href="https://enigmatic-savannah-38254.herokuapp.com/users/verify?token=${user.vtoken}">click here</a></p>
                                <br>
                                <p>This is auto-generated mail do not reply to this!!
                                    in case yo have any queries you can contact us on <b>sabir.shaik.789@gmail.com</b><p>
                                <p>thanks!!! Have a nice day</p>       
                                `
                        }
                        mail.sendemail(maildata);
                        res.json({success : true,message : "user registered"});
                        console.log("user registered:"+user.email);
                    }
                });
            }
        });
    });
});

router.get('/verify',(req,res) =>{
    token = req.query.token;
    if(token == 'verified'){
        res.send("Not smart enough to hack!!!");
        return;
    }
    User.getUserByToken(token,(err,user) => {
        if(err){
            errors.err500(err,res);
        }
        else if(!user){
            console.log("already verified!!");
            res.send("This email is already verified!!!");
            return;
        }
        const new_company = new Feedback({
            company_name: user.company_name,
            Feedbacks:[]
        });
        Feedback.addCompany(new_company,(err,company) =>{
            if(err)
                errors.err500(err,res);
            if(company){
                console.log("new company added to feedback database!!");
            }
        })
        user.vtoken = "verified";
        user.is_verified = true;
        console.log(user);
        User.replace(user.email,user,(err,info) => {
            if(err){
                errors.err500(err,res);
            }
            console.log(info);
            res.send("<h1>Your email has been verified");
        });
    });
});
router.post('/authenticate', (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.getUserByEmail(email, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({ success: false, message: 'user not found' });
        }
        User.comparePassword(password, user.password, (err, isMatch) =>{
            if(err)
            errors.err500(err,res);
            if(isMatch){
                if(!user.is_verified){
                    res.json({success: false, message:"User registration is not verified!!"});
                    return;
                }
                const token = jwt.sign(user.toJSON(), config.secretKey, {
                    expiresIn: 604800
                });
                res.json({
                    success: true,
                    token: 'JWT '+token,
                    user: {
                      id: user._id,
                      name: user.name,
                      username: user.username,
                      email: user.email
                    }
                  })
            }else{
                res.json({success: false, message: "password incorrect"});
            }
            
        });

    });
    
});

router.post('/forgotpassword',(req,res) =>{
        email = req.body.email;
        User.getUserByEmail(email,(err,user) => {
            if(err)
                errors.err500(err,res);
            if(!user){
                console.log("unregistered user tried to send request");
                res.json({success: false,message: "You are not registered to our application!!"});
                return;
            }
            if(!user.is_verified){
                console.log("user is not verified and requesting email for forget password!!!");
                res.json({success: false,message: "First verify your account and then proceed!!"});
                return;
            }
            user.vtoken = randomstring.generate(5);
            User.updateVtoken(email,user.vtoken,(err,info) =>{
                if(err)
                    errors.err500(err,res);
                if(info){
                    console.log(info);
                    const maildata = {
                        from: credentials.email,
                        to: email,
                        subject: "Forgot Password",
                        html: 
                        `
                            <h1>Here's your OTP(One Time Password) for resetting your password</h1>
                            <br>
                            <h2>OTP: <b>${user.vtoken}</h2>
                            <br>
                            <h4>This is auto-generated mail do not reply to this!!
                                    in case yo have any queries you can contact us on <b>sabir.shaik.789@gmail.com</b></h4>
                                <p>Have a nice day</p>
                        `
                    }
                    mail.sendemail(maildata);
                    res.json({success: true, message:"An OTP has been sent to your email !!!"});    
                }
            });
        });
});

router.post('/resetpassword',(req,res) => {
    vtoken = req.body.vtoken;
    new_password = req.body.password;
    User.getUserByToken(vtoken, (err,user) => {
        if(err)
            errors.err500(err,res);
        if(!user){
            console.log("wrong otp!!");
            res.json({success: false, message: "Either you are entering wrong otp or opt from an old mail"});
            return;
        }
        user.vtoken = "verified";
        bcrypt.genSalt(10,(err,salt) => {
            if(err)
                errors.err500(err,res);
            bcrypt.hash(new_password,salt,(err,hash) => {
                if(err)
                    errors.err500(err,res);
                user.password = hash;
                User.replace(user.email,user,(err,info) => {
                    if(err)
                        errors.err500(err,res);
                    console.log(info);
                    res.send({success: true, message: "Password successfully reset, Now you can login"});
                });
            })
        })
    })
});

router.get('/profile',passport.authenticate('jwt',{session: false}),(req,res,next) =>{
    decode.decodeToken(req.headers.authorization,(err,decode)=> {
        if(err){
            errors.err500(err,res);
        }
        if(decode)
            console.log(decode);
            res.send("welcome "+ decode.name);
    });
});
router.post('/addquestions',passport.authenticate('jwt',{session: false}),(req,res) =>{
    decode.decodeToken(req.headers.authorization,(err,decode) => {
        if(err)
            errors.err500(err,res);
        token = decode;    
    });    
    let new_ques = new Ques_opts({
        company_name : token.company_name,
        ques_opts :  req.body,
    });
    Ques_opts.getQuestionsByCompanyName(new_ques.company_name,(err,ques_opts) =>{
        if(err)
            errors.err500(err,res);
        if(ques_opts){
            Ques_opts.removeQuestionsByCompanyName(ques_opts.company_name,(err,info) =>{
                if(err)
                    errors.err500(err,res);
                console.log(info);
            });
        }
            Ques_opts.addQuestions(new_ques,(err,ques)=>{
                if(err)
                    errors.err500(err,res);
                if(ques)
                {
                    console.log("questions added" + ques);
                    res.json({ success: true, message: "questions added succesfully"});
                }
            });
    });
    
});

router.get('/getquestions',passport.authenticate('jwt',{session:false}),(req,res) => {
    decode.decodeToken(req.headers.authorization,(err,decode) => {
        if(err)
            errors.err500(err,res);
        token = decode;    
    });
    Ques_opts.getQuestions(token.company_name,(err,ques_opts) => {
        if(err)
            errors.err500(err,res);
        if(!ques_opts)
            res.json({success: true, user: token.name, ques_opts: ques_opts});        
        else{
            console.log("questions fetched"+ques_opts);
            res.json({success: true, user: token.name, ques_opts: ques_opts});
        }
    });
});

router.post('/addemployee',passport.authenticate('jwt',{session: false}),(req,res) =>{
    decode.decodeToken(req.headers.authorization,(err,decode) => {
        if(err)
            errors.err500(err,res);
        token = decode;    
    });
    const new_emp = new Employee({
        company_name: token.company_name,
        emp_id: req.body.emp_id,
        emp_password: req.body.emp_password 
    });
    Employee.getEmpByEmpId(new_emp.company_name,new_emp.emp_id,(err,emp) => {
        if(err)
            errors.err500(err,res);
        if(emp){
            res.json({success: false, message:"employee with empid:"+emp.emp_id+" already exist"});
            return;
        }
        Employee.addEmp(new_emp,(err,emp) =>{
            if(err)
                errors.err500(err,res);
            if(emp){
                console.log("employee added");
                res.json({success:true, message:"emp with empid:"+emp.emp_id+" added"});
            }
        });
    })
}); 
router.post('/removeemployee',passport.authenticate('jwt',{session: false}),(req,res) => {
    decode.decodeToken(req.headers.authorization,(err,decode) => {
        if(err)
            errors.err500(err,res);
        token = decode;    
    });
    const del_emp = new Employee({
        company_name: token.company_name,
        emp_id: req.body.emp_id,
        emp_password: req.body.emp_password 
    });
    Employee.removeEmployee(del_emp.company_name,del_emp.emp_id,(err,info) => {
        if(err)
            errors.err500(err,res);    
        if(info){    
            console.log("employee removed!!!");
            res.json({success: true, message:"employee with emp_id:"+req.body.emp_id+" removed"});
        }    
    });
});

router.get('/getemployees',passport.authenticate('jwt',{session: false}),(req,res) => {
    decode.decodeToken(req.headers.authorization,(err,decode) => {
        if(err)
            errors.err500(err,res);
        token = decode;    
    });
    var company_name = token.company_name;
    Employee.getEmployees(company_name,(err,employees) => {
        if(err)
            errors.err500(err,res);
        if(employees){
            console.log("employees has been sent!!!");
                res.json({success: true, user: token.name, employees: employees});
        }
    })
});

router.get('/getcustomerresponses',passport.authenticate('jwt',{session: false}),(req,res) =>{
    decode.decodeToken(req.headers.authorization,(err,decode) => {
        if(err)
            errors.err500(err,res);
        token = decode;    
    });
    var company_name = token.company_name;
    Feedback.getResponsesByCompanyName(company_name,(err,feedback) =>{
        if(err)
            errors.err500(err,res);
        if(feedback){
            console.log(feedback);
            res.json({success: true, feedback: feedback, message: "feedbacks has been sent"});
        }
    });
});

module.exports = router;

