const _ = require('lodash');
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');


function findApplicationProgresssById(applicationProgressId) {
  let data = null;

  if(applicationProgressId==null){
    return;
  }

  return ApplicationProgress.findOne({applicationProgressId: applicationProgressId}).populate('application').populate('progress');
}

function findApplicationByCurrentStatus(applicationId) {
  let data = null;

  if(applicationId==null){
    return;
  }

  return ApplicationProgress.findOne({application: applicationId}).sort({createdDate: -1}).limit(1);
}

function addApplicationProgress(applicationProgress) {

  if(!applicationProgress){
    return;
  }

  return new ApplicationProgress(applicationProgress).save();
}



module.exports = {
  findApplicationProgresssById: findApplicationProgresssById,
  findApplicationByCurrentStatus: findApplicationByCurrentStatus,
  addApplicationProgress: addApplicationProgress
}
