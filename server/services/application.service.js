const _ = require('lodash');
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');


function findApplicationById(applicationId) {
  let data = null;

  if(applicationId==null){
    return;
  }

  return Application.findOne({applicationId: applicationId}).populate('job');
}

function findAppliedCountByJobId(jobId) {
  let data = null;

  if(jobId==null){
    return;
  }

  return Application.find({jobId: jobId}).count();
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



async function applyJob(application) {
  let data = null;

  if(application==null){
    return;
  }

  application.createdDate = Date.now();
  application.attachment = '';
  application.status = applicationEnum.APPLIED;

  // return new Application(application).save();

  // let saveApplication = new Application(application).save(function (err) {
  //   if (err) return handleError(err);
  //
  //   console.log('saved', this._id);
  //   const applicationProgress = new ApplicationProgress({
  //     status: applicationEnum.APPLIED,
  //     application: this._id
  //   });
  //
  //   applicationProgress.save(function (err) {
  //     if (err) return handleError(err);
  //   });
  //
  //
  // });
  // return saveApplication;

  // return new Application(application).save();

  console.log(application)
  application = await new Application(application).save();

  const applicationProgress = await new ApplicationProgress({
    status: applicationEnum.APPLIED,
    application: application._id
  });

  console.log('progress', applicationProgress)


  return application;

}


module.exports = {
  findApplicationById: findApplicationById,
  findApplicationByUserId: findApplicationByUserId,
  findApplicationByUserIdAndJobId: findApplicationByUserIdAndJobId,
  findAppliedCountByJobId: findAppliedCountByJobId,
  applyJob: applyJob
}
