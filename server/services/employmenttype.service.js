const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const EmploymentType = require('../models/employmenttypes.model');


function getEmploymentTypes(list, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(!list){
    return [];
  }

  let propLocale = '$name.'+localeStr;
  let match = { shortCode: {$in: list} };
  // match['name.'+localeStr] = { $regex: keyword, $options: 'i'};
  data = EmploymentType.aggregate([
    { $match: match },
    { $project: {employmentTypeId: 1, name: propLocale, shortCode: 1 } }
  ]);

  return data;
}


module.exports = {
  getEmploymentTypes: getEmploymentTypes
}
