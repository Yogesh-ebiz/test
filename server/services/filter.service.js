const ExperienceLevel = require('../models/experiencelevel.model');
const JobFunction = require('../models/jobfunctions.model');
const EmploymentTypes = require('../models/employmenttypes.model');
const Industry = require('../models/industry.model');
const SkillType = require('../models/skilltype.model');
const EmploymentType = require('../models/employmenttypes.model');

function getAllExperienceLevels(locale) {
  let localeStr = locale? locale : 'en';
  let data = ExperienceLevel.aggregate([
    { $project: {id: 1, shortCode: 1, description: 1, sequence: 1, icon: 1, name: ('$name.' + localeStr) } }
  ]);

  return data;
}

function getAllJobFunctions(locale) {
  let localeStr = locale? locale : 'en';
  let data = JobFunction.aggregate([
    { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: ('$name.' + localeStr) } }
  ]);
  return data;
}

function getAllEmploymentTypes(locale) {
  let localeStr = locale? locale : 'en';
  let data = EmploymentTypes.aggregate([
    { $project: {description: 1, shortCode: 1, icon: 1, sequence: 1, name: ('$name.' + localeStr) } }
  ]);
  return data;
}

function getAllIndustries(locale) {
  let localeStr = locale? locale : 'en';
  let data = Industry.aggregate([
    { $project: {description: 1, shortCode: 1, icon: 1, sequence: 1, createdDate:1, name: ('$name.' + localeStr) } }
  ]);
  return data;
}

function getAllSkillTypes(locale) {
  let localeStr = locale? locale : 'en';
  console.log('locale', localeStr)
  let data = SkillType.aggregate([
    { $project: {skillTypeId: 1, description: 1, parent: 1, sequence: 1, createdDate:1, name: 1} }
  ]);
  return data;
}



function getAllEmploymentTypes(locale) {
  let localeStr = locale? locale : 'en';
  console.log('locale', localeStr)
  let data = EmploymentType.aggregate([
    { $project: {id: 1, description: 1, icon: 1, sequence: 1, createdDate:1, name: ('$name.' + localeStr)} }
  ]);
  return data;
}


module.exports = {
  getAllExperienceLevels: getAllExperienceLevels,
  getAllJobFunctions: getAllJobFunctions,
  getAllEmploymentTypes: getAllEmploymentTypes,
  getAllIndustries: getAllIndustries,
  getAllSkillTypes: getAllSkillTypes,
  getAllEmploymentTypes:getAllEmploymentTypes
}
