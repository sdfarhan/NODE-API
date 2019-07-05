const  express = require('express');
const emp = require('../models/employees');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const passport = require('passport');
const Feedback = require('../models/feedback');
const Ques_opts = require('../models/question_ans');
const router = express.Router();
const decode = require('../misc/decodetoken');
const errors = require('../misc/errorhandlers');

//local variables
var token;

router.post('/authenticate',(req,res) => {
    let employee = new emp({
        company_name: req.body.company_name,
        emp_id: req.body.emp_id,
        emp_password: req.body.emp_password,
    });
    emp.getEmpByEmpId(employee.company_name,employee.emp_id,(err,emp) =>{
        if(err)
            errors.err500(err,res);
        if(!emp)
            return res.json({success: false, message:"emp not found!!!!"});
            if(employee.emp_password!=emp.emp_password)
                return res.json({success: false, message: "Incorrect password!!!"});
            else{
                    const token = jwt.sign(emp.toJSON(),config.secretKey,{
                    expiresIn: 86400
                });
                res.json({
                    success: true,
                    token:'JWT '+token,
                    emp:{
                        company_name: emp.company_name,
                        emp_id: emp.emp_id,
                        emp_password: emp.emp_password
                    }
                });
            }
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
        else if(ques_opts){
            console.log("questions fetched"+ques_opts);
            res.json({success: true, emp: token.emp_id, ques_opts: ques_opts});
        }
    });
});

router.post('/recordresponse',passport.authenticate('jwt',{session: false}), (req,res,next) => {
    decode.decodeToken(req.headers.authorization,(err,decode) => {
        if(err)
            errors.err500(err,res);
        token = decode;    
    });
    feedback = req.body;
    feedback.emp_id = token.emp_id;
    console.log(feedback);
    Feedback.recordResponse(token.company_name,feedback,(err,info) => {
        if(err)
            errors.err500(err,res);
        console.log(info);
        res.json({success: true, message: "response recorded successfully!!!"});
    })
});

module.exports = router;