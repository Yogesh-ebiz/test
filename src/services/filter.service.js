const _ = require('lodash');
const {convertIndustry} = require('../utils/helper');
let City = require('country-state-city').City;
let State = require('country-state-city').State;
let Country = require('country-state-city').Country;
const feedService = require('../services/api/feed.service.api');

const ExperienceLevel = require('../models/experiencelevel.model');
const JobFunction = require('../models/jobfunction.model');
const EmploymentTypes = require('../models/employmenttypes.model');
const Industry = require('../models/industry.model');
const Skill = require('../models/skill.model');
const EmploymentType = require('../models/employmenttypes.model');
const JobRequisition = require('../models/jobrequisition.model');
const FieldStudy = require('../models/fieldstudy.model');
const Category = require('../models/category.model');


function getAllCountries(filter, locale) {
  let data = [];

  const {query, country, size} = filter;
  if(country){
    data = Country.getCountryByCode(country.toUpperCase())
  } else {
    data = Country.getAllCountries();
  }
  return data;
}


function getAllStates(filter, locale) {
  let data = [];

  const {query, country, size} = filter;
  if(country){
    data = State.getStatesOfCountry(country.toUpperCase())
  } else {
    data = State.getAllStates();
  }
  return data.slice(0, size || 20);
}

function getAllCities(filter, locale) {
  let data = [];

  const {query, country_code, state_code, size} = filter;

  if(country_code && state_code){
    data = City.getCitiesOfState(country_code.toUpperCase(), state_code.toUpperCase())
  } else if(country_code) {
    data = City.getCitiesOfCountry(country_code.toUpperCase())
  } else {
    data = City.getAllCities();
  }

  if (query) {
    const queryLowerCase = query.toLowerCase();
    data = data.filter(city => city.name.toLowerCase().includes(queryLowerCase));
  }

  return data.slice(0, size || 20);
}

function getAllFieldStudy(query, locale) {
  console.log(query, locale)
  let localeStr = locale? locale : 'en';
  let keyword=(typeof query=='undefined' || query=='')? null: query;
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


function searchIndustries(filter, locale, limit=10) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let keyword = filter.query ? filter.query : '';

  let match = {};
  if(keyword) {
    match[`name.${localeStr}`] = { $regex: keyword, $options: 'i' };
  }

  if(filter.shortCode && filter.shortCode.length>0){
    match['shortCode'] = { $in: filter.shortCode };
  }

  if(filter.ids && filter.ids.length>0){
    match['_id'] = { $in: filter.ids };
  }

  console.log(match)
  let data = Industry.aggregate([
    { $match: match },
    { $limit: limit },
    { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: { $ifNull: [`$name.${localeStr}`, "$name.en"]} } }
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



async function getAllFeedIndustries(filter, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let keyword= filter?.query?filter.query:'';
  let data = null;
  let shortCode = filter.shortCode && filter.shortCode.length?filter.shortCode.split:[];
  data = await feedService.findIndustry(keyword, shortCode, locale);

  let groupJobIndustry = await JobRequisition.aggregate([
    {$project: { _id: 0, industry: 1 } },
    {$unwind: "$industry" },
    {$group: { _id: "$industry", count: { $sum: 1 } }},
  ]);

  data.forEach(function(industry){
    industry.noOfJobs = 0;
    let found = _.find(groupJobIndustry, {_id: industry.shortCode});
    if(found){
      industry.noOfJobs = found.count;
    }
    industry.icon = `${process.env.ACCESSED_CDN}/industry/${industry.id}/icon.png`;
    industry.image = `${process.env.ACCESSED_CDN}/industry/${industry.id}/image.jpg`;
    industry = convertIndustry(industry);
  });


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

function getAllSkills(filter, locale) {
  let localeStr = locale? locale : 'en';
  let keyword=(typeof filter.query=='undefined' || filter.query=='')? null: filter.query;
  let data = null;
  let propLocale = '$locale.'+localeStr;
  if(keyword) {
    let match = {};
    match['locale.'+localeStr] = { $regex: keyword, $options: 'i'};
    data = Skill.aggregate([
      { $match: match },
      {$project: {skillId: 1, description: 1, parent: 1, sequence: 1, createdDate: 1, name: propLocale}}
    ]);
  } else {
    data = Skill.aggregate([
      {$project: {skillId: 1, description: 1, parent: 1, sequence: 1, createdDate: 1, name: propLocale}}
    ]);
  }
  return data;
}



function getAllJobLocations(filter) {
  let aggregate = [];
  let match = {};

  if(filter.query){
    let regex = new RegExp(filter.query,"i");
    match['$or']= [{ city: { $regex: regex }}, { state: { $regex: regex }}, { country: { $regex: regex }}, { district: { $regex: regex }} ];
  }

  if(filter.company){
    match.companyId = parseInt(filter.company);
  }

  aggregate.push({$match: match});

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
  getAllCountries,
  getAllStates,
  getAllCities,
  getAllJobLocations,
  getAllExperienceLevels,
  getAllJobFunctions,
  getAllEmploymentTypes,
  searchIndustries,
  getAllFeedIndustries,
  getAllSkills,
  getAllFieldStudy,
  getAllCategories,
  getFieldOfStudyListByShortCode
}
