const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const ExperienceLevel = require('../models/experiencelevel.model');


function getExperienceLevels(list, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(!list){
    return [];
  }

  let propLocale = '$name.'+localeStr;

  let match = { shortCode: {$in: list} };
  data = ExperienceLevel.aggregate([
    { $match: match },
    { $project: {experienceLevelId: 1, name: propLocale, shortCode: 1 } }
  ]);

  return data;
}


module.exports = {
  getExperienceLevels: getExperienceLevels
}
