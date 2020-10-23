const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const Industry = require('../models/industry.model');
const JobRequisition = require('../models/jobrequisition.model');


function getIndustry(list, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(!list){
    return [];
  }

  let propLocale = '$name.'+localeStr;

  let match = { shortCode: {$in: list} };

  data = Industry.aggregate([
    { $match: match },
    { $project: {experienceLevelId: 1, name: propLocale, shortCode: 1 } }
  ]);

  return data;
}

function getTopIndustry() {
  let data = null;

  data = JobRequisition.aggregate([
    {$group: {_id: {industry: '$industry'}, count: {$sum: 1} }},
    {$project: {_id: 0, shortCode: { $arrayElemAt: [ '$_id.industry', 0 ] }, count: 1}},
    {$sort: {count: -1}},
    {$limit: 4}
  ])



  return data;
}



module.exports = {
  getIndustry: getIndustry,
  getTopIndustry:getTopIndustry
}
