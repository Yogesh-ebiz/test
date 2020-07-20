const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobView = require('../models/jobview.model');


function findJobViewByUserId(userId, size) {
  let data = null;

  if(userId==null){
    return;
  }

  return size?JobView.find({partyId: userId}).sort({createdDate: -1}).limit(size):JobView.find({partyId: userId}).sort({createdDate: -1});
}

function findJobViewByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobView.findOne({partyId: userId, jobId: jobId});
}

function addJobViewByUserId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }


  let timestamp = Date.now();

  let jobView = {partyId: userId, jobId: jobId, createdDate: timestamp}
  return new JobView(jobView).save();
}


module.exports = {
  findJobViewByUserId: findJobViewByUserId,
  findJobViewByUserIdAndJobId:findJobViewByUserIdAndJobId,
  addJobViewByUserId: addJobViewByUserId
}
