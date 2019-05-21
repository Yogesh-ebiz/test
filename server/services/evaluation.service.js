const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Evaluation = require('../models/evaluation.model');
const assessmentService = require('../services/assessment.service');
const applicationProgressService = require('../services/applicationprogress.service');


const evaulationSchema = Joi.object({
  createdBy: Joi.number().optional(),
  applicationId: Joi.object(),
  applicationProgressId: Joi.object(),
  candidateId: Joi.object(),
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


async function removeEvaluation(userId, applicationProgressId) {

  if(!userId || !applicationProgressId){
    return;
  }

  let result;
  let progress = await applicationProgressService.getApplicationProgressEvaluations(applicationProgressId);

  if(progress && progress.evaluations.length) {


    for(const [i, evaluation] of progress.evaluations.entries()){
      if(evaluation.createdBy==userId){
        if(evaluation){
          if(evaluation.assessment){
            await evaluation.assessment.delete();
          }
          await evaluation.delete();
        }

        progress.evaluations.splice(i, 1);
      }
    }
    progress = await progress.save();
    if(progress){
      result = {success: true}
    }
  }

  return result;

}

async function findByUserIdAndProgressId(userId, applicationProgressId) {
  if(!userId || !applicationProgressId){
    return;
  }

  return Evaluation.findOne({createdBy: userId, applicationProgressId: applicationProgressId});

}



async function getEvaluations(candidateId, companyId, applicationId, progressId, filter) {
  if(!candidateId || !filter){
    return;
  }


  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;


  let select = '';
  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  const aggregate = Evaluation.aggregate([{
    $match: {candidateId: candidateId}
  },
    {
      $lookup: {
        from: 'assesment',
        localField: 'assessment',
        foreignField: '_id',
        as: 'assessment',
      },
    }
  ]);

  return Evaluation.aggregatePaginate(aggregate, options);

}


module.exports = {
  addEvaluation:addEvaluation,
  removeEvaluation:removeEvaluation,
  findByUserIdAndProgressId:findByUserIdAndProgressId,
  getEvaluations:getEvaluations
}
