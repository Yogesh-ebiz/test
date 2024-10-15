const _ = require('lodash');
const Joi = require('joi');
const Salary = require('../models/salary.model');
const SearchParam = require("../const/searchParam");
const JobRequisition = require("../models/jobrequisition.model");

const salarySchema = Joi.object({
  _id: Joi.object().optional(),
  name: Joi.string().required(),
  company: Joi.object().required(),
  background: Joi.string().allow('').optional(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional()
});



async function add(form) {
  if(!form){
    return;
  }
  let data;
  await salarySchema.validate(form, { abortEarly: false });
  data = new Salary(form).save();
  return data;
}

async function getSalaryByTitle(title) {

  if(!title){
    return null;
  }

  let result = {
    companyResults: []
  };
  let salary = await Salary.aggregate([
    // { $match: { employmentTitle: { $regex: title, $options: 'i' } } },
    // { $match: { employmentTitle: { $regex: `/\b${title}\b/i` } } },
    { $match: { $text: { $search: title } } },
    { $sort: { score: { $meta: "textScore" } } },
    { $project: {_id: 0, employmentTitle: 1, company: 1,  country: 1, baseSalary: 1, score: { $meta: "textScore" }}},
    { $match: { score: { $gt: 1.4 } } },
    { "$group": {
        "_id": {employmentTitle: '$employmentTitle', country: "$country"},
        "min": { "$min": "$baseSalary" },
        "avg": { "$avg": "$baseSalary" },
        "max": { "$max": "$baseSalary" }
      }},
    { $project: {_id: 0, employmentTitle: "$_id.employmentTitle", company: "$_id.company",  minBaseSalary: "$min", avgBaseSalary: "$avg", maxBaseSalary: "$max"}},
  ]);

  let companyResults = await Salary.aggregate([
    // { $match: { employmentTitle: { $regex: title, $options: 'i' } } },
    { $match: { $text: { $search: title } } },
    { $sort: { score: { $meta: "textScore" } } },
    { $project: {_id: 0, employmentTitle: 1, company: 1,  country: 1, baseSalary: 1, score: { $meta: "textScore" }}},
    { $match: { score: { $gt: 1.4 } } },
    { "$group": {
        "_id": {employmentTitle: '$employmentTitle', company: "$company"},
        "min": { "$min": "$baseSalary" },
        "avg": { "$avg": "$baseSalary" },
        "max": { "$max": "$baseSalary" }
      }},
    { $project: {_id: 0, employmentTitle: "$_id.employmentTitle", company: "$_id.company",  minBaseSalary: "$min", avgBaseSalary: "$avg", maxBaseSalary: "$max", score: { $meta: "textScore" }}},
    { $limit: 10 }
  ]);

  salary = salary?salary[0]:null;
  result = _.merge({}, result, salary);
  result.companyResults = companyResults;
  return result;
}


async function getTopPayingCompanies(industry) {


  const result = await Salary.aggregate([
    {
      $group: {
        _id: { company: "$company"},
        avg: { $avg: "$baseSalary" },
        count:{$sum:1}
      }
    },
    { $project: {_id: 0, company: "$_id.company",  avgBaseSalary: "$avg", count: "$count"}}
  ]);

  console.log('result', result)
  return result;
}

async function search(title) {

  if(!title){
    return null;
  }

  let salaries = await Salary.aggregate([
    { $match: { employmentTitle: { $regex: title, $options: 'i' } } },
    { "$group": {
        "_id": {employmentTitle: '$employmentTitle', country: "$country"},
        "min": { "$min": "$baseSalary" },
        "avg": { "$avg": "$baseSalary" },
        "max": { "$max": "$baseSalary" }
      }},
    { $project: {_id: 0, employmentTitle: "$_id.employmentTitle", company: "$_id.company",  minBaseSalary: "$min", avgBaseSalary: "$avg", maxBaseSalary: "$max"}},
    { $limit: 10 }
  ]);

  console.log(salaries)
  return salaries;
}

async function searchByCompany(company, sort, filter) {
  console.log(company, sort, filter)
  if(!company || !sort){
    return null;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };



  let result;
  let currentDate = Date.now();
  let aList = [
    { $match: {company: company}},
    { $group: {_id: {employmentTitle: '$employmentTitle', basePayPeriod: '$basePayPeriod', country: '$country'}, basePayPeriod: {$first: '$basePayPeriod'}, currency: {$first: '$currency'}, avgBaseSalary: {'$avg': '$baseSalary'}, minBaseSalary: {'$min': '$baseSalary'}, maxBaseSalary: {'$max': '$baseSalary'}, avgAdditionalIncome: {'$avg': {'$add': ["$cashBonus", "$stockBonus", "$profitSharing", "$commission", "$tip"]}}, count: {'$sum': 1}}},
    { $project: {_id: 0, employmentTitle: '$_id.employmentTitle', country: '$_id.country', basePayPeriod: '$basePayPeriod', currency: '$currency', count: 1, avgTotalSalary:{'$avg': {'$add': ['$avgBaseSalary', '$avgAdditionalIncome']}}, avgBaseSalary: 1, minBaseSalary: 1, maxBaseSalary: 1, avgAdditionalIncome: 1}}
  ];

  if(sort && sort.sortBy=='employmentTitle'){
    aList.push({ $sort: { employmentTitle: direction} });
  } else {
    aList.push({ $sort: {createdDate: direction} });
  }

  const aggregate = Salary.aggregate(aList);
  result = await Salary.aggregatePaginate(aggregate, options);

  return result;
}


module.exports = {
  add,
  getSalaryByTitle,
  getTopPayingCompanies,
  search,
  searchByCompany
}
