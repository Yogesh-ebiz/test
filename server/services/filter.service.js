const _ = require('lodash');


const ExperienceLevel = require('../models/experiencelevel.model');
const JobFunction = require('../models/jobfunctions.model');
const EmploymentTypes = require('../models/employmenttypes.model');
const Industry = require('../models/industry.model');
const SkillType = require('../models/skilltype.model');
const EmploymentType = require('../models/employmenttypes.model');
const JobRequisition = require('../models/jobrequisition.model');
const FieldStudy = require('../models/fieldstudy.model');
const Country = require('../models/country.model');
const State = require('../models/state.model');
const City = require('../models/city.model');
const Category = require('../models/category.model');


function getAllCountries(filter, locale) {
  let localeStr = locale? locale : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;
  if(keyword) {
    let match = {};
    match = { $regex: keyword, $options: 'i'};
    data = Country.find({ name: { $regex: keyword, $options: 'i'} });
  } else {
    data = Country.find({});
  }
  return data;
}


function getAllStates(filter, locale) {
  let localeStr = locale? locale : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;
  if(keyword) {
    console.log('filter', filter.country_code)
    data = State.find({ name: { $regex: keyword, $options: 'i'}, country_code: filter.country_code });
  } else {
    data = State.find({country_code: filter.country_code});
  }
  return data;
}

function getAllCities(filter, locale) {
  let localeStr = locale? locale : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;

  let match = {};

  if(filter.query){
    match.name = { $regex: keyword, $options: 'i'};
  }

  // if(filter.state_code){
  //   match.state_code = { state_code: filter.state_code};
  // }
  //
  // if(filter.country_code){
  //   match.country_code = { country_code: filter.country_code};
  // }

  console.log('match', match)
  data = City.find(match);
  return data;
}

function getAllFieldStudy(filter, locale) {
  let localeStr = locale? locale : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;
  let propLocale = '$locale.'+localeStr;
  if(keyword) {
    let match = {};
    match['locale.'+localeStr] = { $regex: keyword, $options: 'i'};
    data = FieldStudy.aggregate([
      { $match: match },
      {$project: {fieldStudyId: 1, description: 1, parent: 1, icon: 1, sequence: 1, shortCode: 1, createdDate: 1, name: propLocale}}
    ]);
  } else {
    data = FieldStudy.aggregate([
      {$project: {fieldStudyId: 1, description: 1, parent: 1, icon: 1, sequence: 1, shortCode: 1, createdDate: 1, name: propLocale}}
    ]);
  }
  return data;
}


function getFieldOfStudyListByShortCode(shortCodes, locale) {
  let localeStr = locale? locale : 'en';
  let data = null;
  let propLocale = '$locale.'+localeStr;
  data = FieldStudy.aggregate([
    { $match: { shortCode: {$in: shortCodes} } },
    {$project: {_id: 0, fieldStudyId: 1, description: 1, parent: 1, icon: 1, sequence: 1, shortCode: 1, createdDate: 1, name: propLocale}}
  ]);

  return data;
}


function getAllJobLocations(filter) {
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;

  if(keyword){

    // let match = {};
    // match = { $regex: keyword, $options: 'i'};
    // data = JobFunction.aggregate([
    //   { $match: match },
    //   { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    // ]);
  }else {
    data = JobRequisition.aggregate([
      // { $group : { _id : "$city", _id: "$state"  } },
      { $project: {city: 1, state: 1, country: 1} }
    ]);
  }
  return data;
}

function getAllExperienceLevels(filter, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;

  let propLocale = '$name.'+localeStr;
  if(keyword){
    let match = {};
    match['name.'+localeStr] = { $regex: keyword, $options: 'i'};
    data = EmploymentTypes.aggregate([
      { $match: match },
      { $project: {shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }else {
    data = ExperienceLevel.aggregate([
      { $project: {shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }
  return data;
}



function getAllJobFunctions(filter, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;

  let propLocale = '$name.'+localeStr;
  let match = {};

  if(keyword){
    match['name.'+localeStr] = { $regex: keyword, $options: 'i'};
  }
  if(filter.shortCode){
    let listOfIds = _.reduce(filter.shortCode.split(','), function(res, item){
      res.push(item);
      return res;
    }, []);
    match.shortCode = {$in: listOfIds};
  }


  if(keyword){

    data = JobFunction.aggregate([
      { $match: match },
      { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
    ]);
  }else {
    data = JobFunction.aggregate([
      { $match: match },
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

  let propLocale = '$locale.'+localeStr;
  let match = {};
  if(keyword) {
    match['locale.' + localeStr] = {$regex: keyword, $options: 'i'};
  }

  if(filter.shortCode){
    let shortCode = _.reduce(filter.shortCode.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);

    console.log(filter.shortCode, shortCode)
    match.shortCode = {$in: shortCode};
  }

  data = Industry.aggregate([
    { $match: match },
    { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
  ]);

  //   data = Industry.aggregate([
  //     { $match: match },
  //     { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
  //   ]);
  // }else {
  //   data = Industry.aggregate([
  //     { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
  //   ]);
  // }
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

function getAllSkillTypes(filter, locale) {
  let localeStr = locale? locale : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;
  let propLocale = '$locale.'+localeStr;
  if(keyword) {
    let match = {};
    match['locale.'+localeStr] = { $regex: keyword, $options: 'i'};
    data = SkillType.aggregate([
      { $match: match },
      {$project: {skillTypeId: 1, description: 1, parent: 1, sequence: 1, createdDate: 1, name: propLocale}}
    ]);
  } else {
    data = SkillType.aggregate([
      {$project: {skillTypeId: 1, description: 1, parent: 1, sequence: 1, createdDate: 1, name: propLocale}}
    ]);
  }
  return data;
}



function getAllJobLocations(filter) {
  let aggregate = [];
  if(filter.company){
    aggregate.push({$match: {company: parseInt(filter.company)}});
  }

  let group = { $group: {_id:{district:"$district", city:"$city", state: '$state', country: '$country'}, count:{$sum:1} } };
  aggregate.push(group);

  let data = JobRequisition.aggregate(aggregate);
  return data;
}



function getAllCategories(filter, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;

  let propLocale = '$locale.'+localeStr;
  let match = {};
  if(keyword) {
    match['locale.' + localeStr] = {$regex: keyword, $options: 'i'};
  }

  if(filter.shortCode){
    let shortCode = _.reduce(filter.shortCode.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);
    match.shortCode = {$in: shortCode};
  }

  data = Category.aggregate([
    { $match: match },
    { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale, categoryId: 1 } }
  ]);

  return data;
}



module.exports = {
  getAllCountries:getAllCountries,
  getAllStates:getAllStates,
  getAllCities:getAllCities,
  getAllJobLocations: getAllJobLocations,
  getAllExperienceLevels: getAllExperienceLevels,
  getAllJobFunctions: getAllJobFunctions,
  getAllEmploymentTypes: getAllEmploymentTypes,
  getAllIndustries: getAllIndustries,
  getAllSkillTypes: getAllSkillTypes,
  getAllJobLocations:getAllJobLocations,
  getAllFieldStudy:getAllFieldStudy,
  getAllCategories:getAllCategories,
  getFieldOfStudyListByShortCode:getFieldOfStudyListByShortCode
}
