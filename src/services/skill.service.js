const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const Skill = require('../models/skill.model');



function add(skill, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';

  if(!skill){
    return null;
  }


  return new Skill(skill).save();
}

function findById(id) {

  if(!id){
    return null;
  }

  return Skill.findById(id);
};


function getListofSkills(list) {
  let data = null;
  if(!list){
    return [];
  }

  let match = { name: {$in: list} };
  data = Skill.aggregate([
    { $match: match },
    { $project: {parent: 1, description: 1, icon: 1, name: 1, type: 1 } }
  ]);


  return data;
}


module.exports = {
  add,
  findById,
  getListofSkills,
}
