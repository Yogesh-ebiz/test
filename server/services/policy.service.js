const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Policy = require('../models/policy.model');


function getPoliciesByCategory(category, locale) {
  let data = null;

  if(category==null){
    return;
  }

  return Policy.find({category: category});
}


function addPolicy(policy) {
  let data = null;

  if(policy==null){
    return;
  }

  policy = new Policy(policy).save();
  return policy;

}



module.exports = {
  getPoliciesByCategory:getPoliciesByCategory,
  addPolicy:addPolicy
}
