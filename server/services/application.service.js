const _ = require('lodash');
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const Application = require('../models/application.model');


function findApplicationById(applicationid) {
  let data = null;

  if(applicationid==null){
    return;
  }

  return Application.findOne({applicationId: applicationid});
}

function findAppliedCountByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return Application.find({partyId: userId, jobId: jobId}).count();
}

function findApplicationByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  console.log('userId', userId);

  return Application.find({partyId: userId});
}


function findApplicationByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return Application.findOne({partyId: userId, jobId: jobId});
}

function findAppliedCountByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return Application.find({partyId: userId, jobId: jobId}).count();
}



function applyJob(application) {
  let data = null;

  console.debug('applyJob', application)
  if(application==null){
    return;
  }

  application.createdDate = Date().now;
  application.attachment = '';
  application.status = applicationEnum.APPLIED;

  return new Application(application).save();
}


module.exports = {
  findApplicationById: findApplicationById,
  findApplicationByUserId: findApplicationByUserId,
  findApplicationByUserIdAndJobId: findApplicationByUserIdAndJobId,
  findAppliedCountByUserIdAndJobId: findAppliedCountByUserIdAndJobId,
  applyJob: applyJob
}
