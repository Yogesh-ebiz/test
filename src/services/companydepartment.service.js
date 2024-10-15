const _ = require('lodash');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const CompanyDepartment = require('../models/companydepartment.model');

const departmentSchema = Joi.object({
  _id: Joi.object().optional(),
  name: Joi.string().required(),
  company: Joi.object().required(),
  background: Joi.string().allow('').optional(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional()
});

function getDepartments(company, query) {
  let data = null;

  if(!company){
    return;
  }

  return CompanyDepartment.aggregate([
    {
      $match: {
        company: company,
        name: { $regex: query, $options: 'i' }
      }
    },
    {
      $lookup: {
        from: "jobrequisitions",
        let: { departmentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$department", "$$departmentId"] },
                  { $in: ["$status", ["ACTIVE", "DRAFT"]] }
                ]
              }
            }
          }
        ],
        as: "jobs"
      }
    },
    {
      $project: {
        _id: 1,
        company: 1,
        name: 1,
        background: 1,
        noOfJobs: { $size: "$jobs" }
      }
    }
  ]);
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

  await departmentSchema.validate(form, { abortEarly: false });
  form.background = form.background?form.background:'#' + Math.floor(Math.random()*16777215).toString(16);
  data = new CompanyDepartment(form).save();
  return data;
}


async function update(id, form) {

  if(!id || !form){
    return;
  }

  await departmentSchema.validate(form, { abortEarly: false });
  let department = await CompanyDepartment.findById(id);

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
  getDepartments,
  findDepartmentsByCompany,
  getDepartmentsByList,
  add,
  update
}
