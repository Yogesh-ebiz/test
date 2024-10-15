const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');



function add(applicationProgress) {

  if(!applicationProgress){
    return;
  }

  return new ApplicationProgress(applicationProgress).save();
}


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


function deleteByList(ids) {

  if(!ids){
    return;
  }

  return ApplicationProgress.update({_id: {$in: ids}}, {$set: {status: statusEnum.DELETED}});
}

function removeByList(ids) {

  if(!ids){
    return;
  }

  return ApplicationProgress.remove({_id: {$in: ids}});
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


function updateApplicationProgressEvent(id, form) {
  let data = null;

  if(!id || !form){
    return;
  }

  return ApplicationProgress.updateOne({_id: id}, { $set: {event:form.eventId} });
}


function removeApplicationProgressEvent(id) {
  let data = null;

  if(!id){
    return;
  }

  return ApplicationProgress.updateOne({_id: ObjectID(id)}, { $unset: {event: null} });
}


function updateApplicationProgressStage(oldStage, newStage) {
  let data = null;

  if(!oldStage || !newStage){
    return;
  }

  return ApplicationProgress.updateMany({stage: oldStage}, { $set: {stage: newStage} });
}


module.exports = {
  add,
  findById,
  findApplicationProgresssById,
  findApplicationProgresssByIds,
  findApplicationByCurrentStatus,
  deleteByList,
  removeByList,
  getApplicationProgressEvaluations,
  addApplicationProgressEvaluation,
  updateApplicationProgressEvent,
  removeApplicationProgressEvent,
  updateApplicationProgressStage
}
