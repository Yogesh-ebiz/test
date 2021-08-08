const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');



function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return ApplicationProgress.findById(id);
}


function findApplicationProgresssById(applicationProgressId) {
  let data = null;

  if(applicationProgressId==null){
    return;
  }

  return ApplicationProgress.findOne({applicationProgressId: applicationProgressId}).populate('application').populate('progress');
}



function findApplicationProgresssByIds(applicationProgressIds) {
  let data = null;

  if(applicationProgressIds==null){
    return;
  }

  return ApplicationProgress.find({_id: {$in: applicationProgressIds}}).populate('stage');
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


function updateApplicationProgressEvent(applicationProgress_Id, form) {
  let data = null;

  if(!applicationProgress_Id || !form){
    return;
  }

  return ApplicationProgress.updateOne({_id: ObjectID(applicationProgress_Id)}, { $set: {event:form.eventId} });
}


function removeApplicationProgressEvent(applicationProgress_Id) {
  let data = null;

  if(!applicationProgress_Id){
    return;
  }

  return ApplicationProgress.updateOne({_id: ObjectID(applicationProgress_Id)}, { $unset: {event: ''} });
}


function updateApplicationProgressStage(oldStage, newStage) {
  let data = null;

  if(!oldStage || !newStage){
    return;
  }

  return ApplicationProgress.updateMany({stage: oldStage}, { $set: {stage: newStage} });
}


module.exports = {
  findById:findById,
  findApplicationProgresssById: findApplicationProgresssById,
  findApplicationProgresssByIds:findApplicationProgresssByIds,
  findApplicationByCurrentStatus: findApplicationByCurrentStatus,
  addApplicationProgress: addApplicationProgress,
  getApplicationProgressEvaluations:getApplicationProgressEvaluations,
  addApplicationProgressEvaluation:addApplicationProgressEvaluation,
  updateApplicationProgressEvent:updateApplicationProgressEvent,
  removeApplicationProgressEvent:removeApplicationProgressEvent,
  updateApplicationProgressStage:updateApplicationProgressStage
}
