const mongoose = require('mongoose');


const qa_schema = mongoose.Schema({
        company_name:{
            type: String,
            required: true,
        },
        ques_opts: [
            { 
                _id:false,
                ques: {
            type:String,
            required: false
        },
        opt1:{
            type:String,
            required: false
        },
        opt2:{
            type:String,
            required: false
        },
        opt3:{
            type:String,
            required: false
        },
        opt4:{
            type:String,
            required: false
        },
    }
    ]
    });

const Ques_opts = module.exports = mongoose.model("ques_opts",qa_schema);

module.exports.addQuestions= function(ques,callback)
{
    ques.save(callback);
}

module.exports.getQuestionsByCompanyName = function(company_name,callback){
    const query = {company_name: company_name}
    Ques_opts.findOne(query,callback);
}

module.exports.removeQuestionsByCompanyName = function(company_name,callback){
    const query = {company_name: company_name}
    Ques_opts.deleteOne(query,callback);
}

module.exports.getQuestions = function(company_name,callback){
    const query = {company_name: company_name}
    Ques_opts.findOne(query,callback);
}