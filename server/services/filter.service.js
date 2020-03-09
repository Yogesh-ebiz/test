const ExperienceLevel = require('../models/experiencelevel.model');
const JobFunction = require('../models/jobfunctions.model');
const EmploymentTypes = require('../models/employmenttypes.model');
const Industry = require('../models/industry.model');
const SkillType = require('../models/skilltype.model');
const EmploymentType = require('../models/employmenttypes.model');


function getAllExperienceLevels(locale) {
  let localeStr = locale? locale : 'en';
  let propLocale = '$name.'+localeStr;
  let data = ExperienceLevel.aggregate([
    { $project: {id: 1, shortCode: 1, description: 1, sequence: 1, icon: 1, name: propLocale } }
  ]);

  return data;
}

function getAllJobFunctions(filter, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;

  let propLocale = '$name.'+localeStr;
  if(keyword){
    let match = {};
    match['name.'+localeStr] = { $regex: keyword, $options: 'i'};
    data = JobFunction.aggregate([
      { $match: match },
      { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }else {
    data = JobFunction.aggregate([
      { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }
  return data;
}

function getAllEmploymentTypes(filter, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;

  let propLocale = '$name.'+localeStr;
  if(keyword){
    console.log('key', keyword)
    let match = {};
    match['name.'+localeStr] = { $regex: keyword, $options: 'i'};
    data = EmploymentTypes.aggregate([
      { $match: match },
      { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }else {
    data = EmploymentTypes.aggregate([
      { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }
  return data;
}


function getAllIndustries(filter, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;

  let propLocale = '$name.'+localeStr;
  if(keyword){
    console.log('key', keyword)
    let match = {};
    match['name.'+localeStr] = { $regex: keyword, $options: 'i'};
    data = Industry.aggregate([
      { $match: match },
      { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }else {
    data = Industry.aggregate([
      { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }
  return data;
}


// function getAllIndustries(locale) {
//   let localeStr = locale? locale : 'en';
//   let propLocale = '$name.'+localeStr;
//   let data = Industry.aggregate([
//     { $project: {description: 1, shortCode: 1, icon: 1, sequence: 1, createdDate:1, name: propLocale } }
//   ]);
//   return data;
// }

function getAllSkillTypes(locale) {
  let localeStr = locale? locale : 'en';
  let propLocale = '$name.'+localeStr;
  let data = SkillType.aggregate([
    { $project: {skillTypeId: 1, description: 1, parent: 1, sequence: 1, createdDate:1, name: 1} }
  ]);
  return data;
}



module.exports = {
  getAllExperienceLevels: getAllExperienceLevels,
  getAllJobFunctions: getAllJobFunctions,
  getAllEmploymentTypes: getAllEmploymentTypes,
  getAllIndustries: getAllIndustries,
  getAllSkillTypes: getAllSkillTypes
}
