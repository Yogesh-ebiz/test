const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Department = require('../models/department.model');


function getDepartments(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  return Department.aggregate([ {$match: {company: company}}, {$lookup: {from: "jobrequisitions", localField: "_id", foreignField: "department", as: "jobs"}}, {$project: {_id: 1, company: 1, name: 1, background: 1, noOfJobs: {$size: "$jobs"}}} ]);
}


function addDepartment(department) {
  let data = null;

  if(department==null){
    return;
  }

  const randomColor = Math.floor(Math.random()*16777215).toString(16);
  department.background = "#" + randomColor;
  department = new Department(department).save();
  return department;

}

function getDepartmentsByList(departments) {
  let data = null;

  if(departments==null){
    return;
  }

  data = Department.find({_id: {$in: departments}});
  return data;

}

module.exports = {
  getDepartments:getDepartments,
  getDepartmentsByList:getDepartmentsByList,
  addDepartment:addDepartment
}
