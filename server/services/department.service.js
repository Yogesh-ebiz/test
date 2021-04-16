const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Department = require('../models/department.model');


function getDepartments(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  console.log(company, query)
  return Department.find({company: company, name: { $regex: query, $options: "si" }});
}


function addDepartment(department) {
  let data = null;

  if(department==null){
    return;
  }

  department = new Department(department).save();
  return department;

}



module.exports = {
  getDepartments:getDepartments,
  addDepartment:addDepartment
}
