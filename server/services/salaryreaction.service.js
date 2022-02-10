const _ = require('lodash');
const SalaryReaction = require('../models/salaryreaction.model');



function addReaction(reaction) {

  if(!reaction){
    return null;
  }
  return new SalaryReaction(reaction).save();
}


module.exports = {
  addReaction: addReaction
}
