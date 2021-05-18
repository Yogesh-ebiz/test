const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Evaluation = require('../models/evaluation.model');
const assessmentService = require('../services/assessment.service');




const evaulationSchema = Joi.object({
  createdBy: Joi.number().optional(),
  applicationId: Joi.object(),
  applicationProgressId: Joi.object(),
  candidateId: Joi.number(),
  rating: Joi.number(),
  comment: Joi.string(),
  assessment: Joi.object().optional(),
  answer: Joi.array().optional()
});

async function addEvaluation(form) {

  if(!form){
    return;
  }

  form = await Joi.validate(form, evaulationSchema, {abortEarly: false});

  if(form.assessment){
    form.assessment.candidateId = form.candidateId;
    form.assessment.createdBy = form.createdBy;
    let assessment = await assessmentService.addAssessment(form.assessment);
    if(assessment){
      form.assessment = assessment._id;
    }
  }
  let evaluation = new Evaluation(form).save();


  return evaluation;

}


async function removeEvaluation(evaluation) {

  if(!evaluation){
    return;
  }


  if(evaluation.assessment){
    evaluation.assessment.candidateId = evaluation.candidateId;
    evaluation.assessment.createdBy = evaluation.createdBy;
    let assessment = await assessmentService.addAssessment(evaluation.assessment);
    if(assessment){
      evaluation.assessment = assessment._id;
    }
  }
  evaluation = new Evaluation(evaluation).save();

  return evaluation;

}

async function findByUserIdAndProgressId(userId, applicationProgressId) {
  if(!userId || !applicationProgressId){
    return;
  }

  return Evaluation.findOne({createdBy: userId, applicationProgressId: applicationProgressId});

}


module.exports = {
  addEvaluation:addEvaluation,
  findByUserIdAndProgressId:findByUserIdAndProgressId
}
