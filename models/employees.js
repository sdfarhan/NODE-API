const mongoose = require('mongoose');

const Employees_schema = mongoose.Schema({
    company_name:{
        type: String,
        required: true
    },
    emp_id:{
        type: String,
        required: true
    },
    emp_password:{
        type: String,
        required: true
    }
});

const Employee = module.exports = mongoose.model("Employees",Employees_schema); 

module.exports.getEmpById = function(id,callback){
    Employee.findById(id,callback);
};

module.exports.getEmpByEmpId = function(company_name,emp_id,callback){ 
    const query = {
        company_name: company_name,
        emp_id: emp_id
    }
    Employee.findOne(query,callback);
}

module.exports.addEmp = function(new_emp,callback){
    new_emp.save(callback);
}

module.exports.removeEmployee = function(company_name,emp_id,callback){
    const query = {company_name: company_name,emp_id: emp_id};
    Employee.deleteOne(query,callback);
}

module.exports.getEmployees = function(company_name,callback){
    Employee.find({company_name : company_name},callback);
}