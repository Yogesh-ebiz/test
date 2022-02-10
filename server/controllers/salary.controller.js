const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const {isUserActive} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');
const salaryReactionService = require('../services/salaryreaction.service');



module.exports = {
  addSalaryReaction,
  getSalaryReactionCount
}


async function addSalaryReaction(currentUserId, salaryHistoryId, reaction) {

  if(!currentUserId || !salaryHistoryId || !reaction){
    return null;
  }

  let result = null;
  try {
    let currentParty = await feedService.findByUserId(currentUserId);

    if (isUserActive(currentParty)) {
      reaction.salaryHistoryId = salaryHistoryId;
      reaction.userId = currentUserId;
      result = await salaryReactionService.addReaction(reaction);
    }



  } catch (e) {
    console.log('Error: addSalaryReaction', e)
  }
  return result;
}



async function getSalaryReactionCount(salaryHistoryId) {

  if(!salaryHistoryId){
    return null;
  }

  let result = null;
  try {

    result = await salaryReactionService.getReactionsCountBySalaryHistoryId(salaryHistoryId);

  } catch (e) {
    console.log('Error: getSalaryReactionCount', e)
  }
  return result;
}
