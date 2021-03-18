const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Department = require('../models/department.model');


function getDepartments(company) {
  let data = null;

  if(company==null){
    return;
  }

  return Department.find({company: company});
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
