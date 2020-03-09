const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const Skilltype = require('../models/skilltype.model');


function getListofSkillTypes(list, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(!list){
    return [];
  }

  console.log('list', list)
  let propLocale = '$name.'+localeStr;
  let match = { skillTypeId: {$in: list} };
  // match['name.'+localeStr] = { $regex: keyword, $options: 'i'};
  data = Skilltype.aggregate([
    { $match: match },
    { $project: {parent: 1, skillTypeId: 1, description: 1, icon: 1, name: propLocale } }
  ]);

  return data;
}


module.exports = {
  getListofSkillTypes: getListofSkillTypes
}
