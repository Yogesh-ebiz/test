const _ = require('lodash');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const CompanyDepartment = require('../models/companydepartment.model');

const departmentSchema = Joi.object({
  _id: Joi.object().optional(),
  name: Joi.string().required(),
  company: Joi.number().required(),
  background: Joi.string().allow('').optional(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional()
});

function getDepartments(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  return CompanyDepartment.aggregate([ {$match: {company: company}}, {$lookup: {from: "jobrequisitions", localField: "_id", foreignField: "department", as: "jobs"}}, {$project: {_id: 1, company: 1, name: 1, background: 1, noOfJobs: {$size: "$jobs"}}} ]);
}

function findDepartmentsByCompany(company) {
  let data = null;

  if(company==null){
    return;
  }

  return CompanyDepartment.find({company: company});
}


async function add(form) {
  let data = null;

  if(!form){
    return;
  }

  form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  form.background = form.background?form.background:'#' + Math.floor(Math.random()*16777215).toString(16);
  data = new CompanyDepartment(form).save();
  return data;

}


async function update(form) {

  if(!form){
    return;
  }

  form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  let department = await CompanyDepartment.findById(form._id);

  if(department){
    department.name = form.name;
    department.background = form.background;
    department.updatedBy = form.updatedBy;
    department = await department.save();
  }
  return department;

}

function getDepartmentsByList(departments) {
  let data = null;

  if(departments==null){
    return;
  }

  data = CompanyDepartment.find({_id: {$in: departments}});
  return data;

}

module.exports = {
  getDepartments:getDepartments,
  findDepartmentsByCompany:findDepartmentsByCompany,
  getDepartmentsByList:getDepartmentsByList,
  add:add,
  update: update
}
