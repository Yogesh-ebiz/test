const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const Skill = require('../models/skill.model');


function getListofSkills(list, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(!list){
    return [];
  }

  let propLocale = '$locale.'+localeStr;
  let match = { skillId: {$in: list} };
  // match['name.'+localeStr] = { $regex: keyword, $options: 'i'};
  data = Skill.aggregate([
    { $match: match },
    { $project: {parent: 1, skillId: 1, description: 1, icon: 1, name: propLocale, type: 1 } }
  ]);


  return data;
}


function addSkill(skill, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';

  if(!skill){
    return null;
  }


  return new Skill(skill).save();
}


module.exports = {
  getListofSkills: getListofSkills,
  addSkill:addSkill
}
