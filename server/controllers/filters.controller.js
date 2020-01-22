const bcrypt = require('bcrypt');
const Joi = require('joi');
const ExperienceLevel = require('../models/experiencelevel.model');
const JobFunction = require('../models/jobfunctions.model');
const EmploymentTypes = require('../models/employmenttypes.model');
const Industry = require('../models/industry.model');
const filterService = require('../services/filter.service');

const industrySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  sequence: Joi.string().required()
})

module.exports = {
  getAllFilters,
  getExperienceLevels,
  getExperienceLevelById,
  getJobFunctions,
  getJobFunctionById,
  getIndustries,
  getIndustryById
}


// function getAllExperienceLevels(locale) {
//   let localeStr = locale? locale : 'en';
//   let data = ExperienceLevel.aggregate([
//     { $project: {id: 1, shortCode: 1, description: 1, sequence: 1, icon: 1, name: ('$name.' + localeStr) } }
//   ]);
//
//   return data;
// }
//
// function getAllJobFunctions(locale) {
//   let localeStr = locale? locale : 'en';
//   let data = JobFunction.aggregate([
//     { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: ('$name.' + localeStr) } }
//   ]);
//   return data;
// }
//
// function getAllEmploymentTypes(locale) {
//   let localeStr = locale? locale : 'en';
//   let data = EmploymentTypes.aggregate([
//     { $project: {description: 1, shortCode: 1, icon: 1, sequence: 1, name: ('$name.' + localeStr) } }
//   ]);
//   return data;
// }
//
// function getAllIndustries(locale) {
//   let localeStr = locale? locale : 'en';
//   let data = Industry.aggregate([
//     { $project: {description: 1, shortCode: 1, icon: 1, sequence: 1, name: ('$name.' + localeStr) } }
//   ]);
//   return data;
// }

async function getAllFilters(locale) {
  let localeStr = locale? locale : 'en';
  let experienceLevels, jobFunctions, employmentTypes;

  experienceLevels = await filterService.getAllExperienceLevels(localeStr);
  jobFunctions = await filterService.getAllJobFunctions(localeStr);
  employmentTypes = await filterService.getAllEmploymentTypes(localeStr);
  industries = await filterService.getAllIndustries(localeStr);

  return {
    experienceLevels: experienceLevels,
    jobFunctions: jobFunctions,
    employmentTypes: employmentTypes,
    industries: industries
  };
}


async function getExperienceLevels(locale) {
  let data = await getAllExperienceLevels(locale);
  return data;
}

async function getExperienceLevelById(id, locale) {
  let localeStr = locale? locale : 'en';
  let data = await ExperienceLevel.aggregate([
    { $match: { id: parseInt(id) },  },
    { $project: {id: 1, description: 1, shortCode: 1, sequence: 1, name: '$name.' + localeStr }}
  ]);
  return data?data[0]:null;
}


async function getJobFunctions(locale) {
  let data = await getAllJobFunctions(locale)
  return data;
}


async function getJobFunctionById(id, locale) {
  let localeStr = locale? locale : 'en';
  let data = await JobFunction.aggregate([
    { $lookup: { from: "jobfunctions", localField: "jobFunctionId", foreignField: "parent", as: "children" } },
    { $match: { id: parseInt(id) },  },
    { $project: {
        children: { $map: { input: '$children', as: "child", in: { _id: '$$child._id', parent: '$$child.parent', shortCode: '$$child.shortCode', icon: '$$child.icon', id: '$$child.jobFunctionId', sequence: '$$child.sequence', name: '$$child.name.' + localeStr} } },
        parent: 1, shortCode: 1, icon: 1, id: 1, sequence: 1, name: ('$name.' + localeStr) } }
  ]);
  //jobFunction.name = jobFunction.name['en'];
  return data?data[0]:null;

}



async function getIndustries(locale) {
  let data = await getAllIndustries(locale)
  return data;
}


async function getIndustryById(id, locale) {
  console.log(id)
  let localeStr = locale? locale : 'en';
  let data = await JobFunction.aggregate([
    { $match: { id: parseInt(id) },  },
    { $project: {
        children: { $map: { input: '$children', as: "child", in: { _id: '$$child._id', parent: '$$child.parent', shortCode: '$$child.shortCode', icon: '$$child.icon', jobFunctionId: '$$child.jobFunctionId', sequence: '$$child.sequence', name: '$$child.name.' + localeStr} } },
        parent: 1, shortCode: 1, icon: 1, jobFunctionId: 1, sequence: 1, name: ('$name.' + localeStr) } }
  ]);
  //jobFunction.name = jobFunction.name['en'];
  return data?data[0]:null;

}

