const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Evaluation = require('../models/evaluation.model');
const assessmentService = require('../services/assessment.service');
const applicationProgressService = require('../services/applicationprogress.service');


const evaluationSchema = Joi.object({
  createdBy: Joi.object().optional(),
  applicationId: Joi.object(),
  applicationProgressId: Joi.object(),
  candidateId: Joi.object(),
  partyId: Joi.number(),
  companyId: Joi.number(),
  rating: Joi.number(),
  comment: Joi.string(),
  assessment: Joi.object().optional(),
  answer: Joi.array().optional()
});


async function findById(evaluationId) {

  if(!evaluationId){
    return;
  }

  let evaluation = await Evaluation.findById(evaluationId).populate([
    {
      path: 'createdBy',
      model: 'Member'
    },
    {
      path: 'assessment',
      model: 'Assessment'
    }
  ]);

  return evaluation;

}


async function add(form) {

  if(!form){
    return;
  }

  form = await Joi.validate(form, evaluationSchema, {abortEarly: false});

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




async function remove(userId, applicationId, applicationProgressId) {

  if(!userId || !applicationProgressId){
    return;
  }

  let result;
  // let progress = await applicationProgressService.getApplicationProgressEvaluations(applicationProgressId);
  let application = await applicationService.findApplicationBy_Id(applicationId).populate([
    {
      path: 'currentProgress',
      model: 'ApplicationProgress',
      populate: [{
        path: 'evaluations',
        model: 'Evaluation'
      },
        {
          path: 'stage',
          model: 'Stage'
        }]
    },
    {
      path: 'user',
      model: 'Candidate'
    }
  ]);

  if(application && application.currentProgress && !_.some(application.currentProgress.evaluations, {createdBy: currentUserId})) {

    for(const [i, evaluation] of application.currentProgress.evaluations.entries()){
      if(evaluation.createdBy==userId){
        if(evaluation){
          if(evaluation.assessment){
            await evaluation.assessment.delete();
          }
          result = await evaluation.delete();
        }

        application.currentProgress.evaluations.splice(i, 1);
      }
    }

    for(const [i, evaluation] of application.user.evaluations.entries()){
      if(evaluation.createdBy==userId){
        application.user.evaluations.splice(i, 1);
      }
    }

    await application.currentProgress.save();
    await application.user.save();

    if(result){
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



async function search(candidateId, companyId, applicationId, progressId, sort) {
  if(!candidateId || !filter){
    return;
  }


  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;


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


async function findByCandidate(userId, sort) {
  if(!userId || !sort){
    return;
  }


  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;


  let select = '';
  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  const aggregate = Evaluation.aggregate([{
    $match: {partyId: userId}
  },
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy' },
    {
      $lookup: {
        from: 'assessments',
        localField: 'assessment',
        foreignField: '_id',
        as: 'assessment',
      },
    },
    { $unwind: '$assessment' },
  ]);

  return Evaluation.aggregatePaginate(aggregate, options);

}


async function findByCandidateAndCompany(userId, companyId, sort) {
  if(!userId || !sort){
    return;
  }


  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;


  let select = '';
  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  const aggregate = Evaluation.aggregate([{
    $match: {partyId: userId, companyId: companyId}
  },
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy' },
    {
      $lookup: {
        from: 'assessments',
        localField: 'assessment',
        foreignField: '_id',
        as: 'assessment',
      },
    },
    { $unwind: '$assessment' },
  ]);

  return Evaluation.aggregatePaginate(aggregate, options);

}


async function findByCandidateAndApplicationId(userId, applicationId, sort) {
  if(!userId || !applicationId || !sort){
    return;
  }


  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;


  let select = '';
  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  const aggregate = Evaluation.aggregate([{
    $match: {partyId: userId, applicationId: applicationId}
  },
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy' },
    {
      $lookup: {
        from: 'assessments',
        localField: 'assessment',
        foreignField: '_id',
        as: 'assessment',
      },
    },
    { $unwind: '$assessment' },
  ]);

  return Evaluation.aggregatePaginate(aggregate, options);

}


module.exports = {
  findById:findById,
  add:add,
  remove:remove,
  findByUserIdAndProgressId:findByUserIdAndProgressId,
  search:search,
  findByCandidate:findByCandidate,
  findByCandidateAndCompany:findByCandidateAndCompany,
  findByCandidateAndApplicationId:findByCandidateAndApplicationId
}
