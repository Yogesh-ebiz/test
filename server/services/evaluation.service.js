const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Evaluation = require('../models/evaluation.model');
const assessmentService = require('../services/assessment.service');
const applicationService = require('../services/application.service');
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




async function remove(memberId, applicationId, applicationProgressId) {
  if(!memberId || !applicationId || !applicationProgressId){
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
        model: 'Evaluation',
        populate: {
          path: 'assessment',
          model: 'Assessment'
        }
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

  let isAllow = false;
  let evaluation;
  application.currentProgress.evaluations.forEach(function(ev){
    if(ev.createdBy.equals(memberId)){
      isAllow = true;
      evaluation = ev
    }
  });

  if(application && application.currentProgress && isAllow) {


    for(const [i, ev] of application.user.evaluations.entries()){
      if(ev.equals(evaluation._id)){
        application.user.evaluations.splice(i, 1);
      }
    }

    for(const [i, evaluation] of application.currentProgress.evaluations.entries()){
      if(evaluation.equals(evaluation._id)){
        if(evaluation.assessment){
          await evaluation.assessment.delete();
        }
        result = await evaluation.delete();
        application.currentProgress.evaluations.splice(i, 1);
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



async function getCandidateEvaluationsStats(userId, companyId, type) {
  if(!userId || !companyId || !type){
    return;
  }

  let result;
  let match = {partyId: userId};
  if(type==='INTERNAL'){
    match.companyId = companyId;
  } else if(type==='EXTERNAL'){
    match.companyId = {$ne: companyId };
  }

  let evaluations = await Evaluation.aggregate([{
    $match: match
  },
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

  if(evaluations) {

    result = _.reduce(evaluations, function (res, evaluation) {
      let assessment = _.omit(evaluation.assessment, ['_id', 'createdBy', 'createdDate', 'candidateId',])


      for (const prop in assessment) {
        if (res[evaluation.companyId] && res[evaluation.companyId][prop]) {
          res[evaluation.companyId][prop] += evaluation.assessment[prop];
        } else {
          res[evaluation.companyId] = {};
          res[evaluation.companyId][prop] = evaluation.assessment[prop];
        }
      }

      res.rating += evaluation.rating;
      return res;
    }, {rating: 0});


    console.log(result);
    result.rating = result.rating / evaluations.length;
    // for (const prop in result.assessment) {
    //   if (result.assessment[prop]) {
    //     result.assessment[prop] = result.assessment[prop] / evaluations.length;
    //   }
    // }
  }
  return result;

}


module.exports = {
  findById:findById,
  add:add,
  remove:remove,
  findByUserIdAndProgressId:findByUserIdAndProgressId,
  search:search,
  findByCandidate:findByCandidate,
  findByCandidateAndCompany:findByCandidateAndCompany,
  findByCandidateAndApplicationId:findByCandidateAndApplicationId,
  getCandidateEvaluationsStats:getCandidateEvaluationsStats
}
