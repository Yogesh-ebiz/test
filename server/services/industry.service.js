const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const Industry = require('../models/industry.model');


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


module.exports = {
  getIndustry: getIndustry
}
