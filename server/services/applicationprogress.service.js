const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
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



function getApplicationProgressEvaluations(applicationProgress_Id) {
  let data = null;

  if(applicationProgress_Id==null){
    return;
  }

  return ApplicationProgress.findById(ObjectID(applicationProgress_Id)).populate(
    {
      path: 'evaluations',
      model: 'Evaluation',
      populate: {
        path: 'assessment',
        model: 'Assessment'
      }
    })
}


function addApplicationProgressEvaluation(applicationProgress_Id, evaluationId) {
  let data = null;

  if(!applicationProgress_Id || !evaluationId){
    return;
  }

  return ApplicationProgress.updateOne({_id: ObjectID(applicationProgress_Id)}, { $push: {
    evaluations: {
      $each: [ObjectID(evaluationId)]
    }
  }});
}


module.exports = {
  findApplicationProgresssById: findApplicationProgresssById,
  findApplicationByCurrentStatus: findApplicationByCurrentStatus,
  addApplicationProgress: addApplicationProgress,
  getApplicationProgressEvaluations:getApplicationProgressEvaluations,
  addApplicationProgressEvaluation:addApplicationProgressEvaluation
}
