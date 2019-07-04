const mongoose = require('mongoose');
const config = require('../config/database');

const feedback_schema = mongoose.Schema({
    company_name: {
        type: String,
        required: true
    },
    feedbacks:[
        {
            emp_id:{
                type: String,
                required: false
            },
            customer_id: {
                type: String,
                required: false
            },
            response:[
                {
                    _id: false,
                    ques: String,
                    opt: String
                }
            ]
        }
    ]
});

module.exports = Feedback = mongoose.model("feedbacks",feedback_schema);

module.exports.getResponsesByCompanyName = function(company_name,callback){
    const query = {company_name: company_name};
    Feedback.findOne(query,callback);
}

module.exports.addCompany = function(new_company,callback){
    new_company.save(callback);
}


module.exports.recordResponse = function(company_name,feedback,callback){
    const query = {company_name: company_name}
    const update = {$push:{feedbacks:{emp_id: feedback.emp_id,customer_id: feedback.customer_id,response: feedback.response}}};
    Feedback.updateOne(query,update,callback);
}
