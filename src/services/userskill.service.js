const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const UserSkill = require('../models/userskill.model');

function add(skill) {

  if(!skill){
    return null;
  }



  return new UserSkill(skill).save();
}


module.exports = {
  add
}
