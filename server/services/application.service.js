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

  console.log('applicationId', applicationId)
  return Application.findOne({applicationId: applicationId}).populate('job').populate([
    {
      path: 'progress',
      model: 'ApplicationProgress',
      //select: 'id applicationId status',  //return all fields
      populate: {
        path: 'schedule',
        model: 'Event'
      }
    }
  ]);
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


function findApplicationByIdAndUserId(applicationId, userId) {
  let data = null;

  if(applicationId==null || userId==null){
    return;
  }


  return Application.findOne({applicationId: applicationId, partyId: userId}).populate('job').populate([
    {
      path: 'progress',
      model: 'ApplicationProgress',
      //select: 'id applicationId status',  //return all fields
      populate: {
        path: 'schedule',
        model: 'Event'
      }
    }
  ]);
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

  if(application==null){
    return;
  }

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

  console.log('applyJob', application)
  application = new Application(application).save();

  // const applicationProgress = await new ApplicationProgress({
  //   status: applicationEnum.APPLIED,
  //   application: application._id
  // });

  // console.log('progress', applicationProgress)


  return application;

}


module.exports = {
  findApplicationById: findApplicationById,
  findApplicationByUserId: findApplicationByUserId,
  findApplicationByUserIdAndJobId: findApplicationByUserIdAndJobId,
  findApplicationByIdAndUserId:findApplicationByIdAndUserId,
  findAppliedCountByJobId: findAppliedCountByJobId,
  applyJob: applyJob
}
