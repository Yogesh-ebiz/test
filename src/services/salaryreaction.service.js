const _ = require('lodash');
const SalaryReaction = require('../models/salaryreaction.model');



function addReaction(reaction) {

  if(!reaction){
    return null;
  }
  return new SalaryReaction(reaction).save();
}


function getReactionsCountBySalaryHistoryId(salaryHistoryId) {

  if(!salaryHistoryId){
    return null;
  }
  return SalaryReaction.aggregate([
    { $match: {salaryHistoryId: salaryHistoryId} },
    { $group:{_id:{reactionType:'$reactionType'}, count:{$sum:1}} },
    { $project:{_id:0, reactionType: '$_id.reactionType', count: 1 } }
  ]);
}

module.exports = {
  addReaction: addReaction,
  getReactionsCountBySalaryHistoryId:getReactionsCountBySalaryHistoryId
}
