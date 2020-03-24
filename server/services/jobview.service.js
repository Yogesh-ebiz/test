const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobView = require('../models/jobview.model');




function findJobViewByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return JobView.findOne({partyId: userId, jobId: jobId});
}

function addJobViewByUserId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  console.log(userId, jobId)
  let jobView = {partyId: userId, jobId: jobId, createdDate: Date().now}
  return new JobView(jobView).save();
}


module.exports = {
  findJobViewByUserId: findJobViewByUserId,
  addJobViewByUserId: addJobViewByUserId
}
