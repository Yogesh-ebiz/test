const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Evaluation = require('../models/evaluation.model');
const assessmentService = require('../services/assessment.service');
const applicationService = require('../services/application.service');
const applicationProgressService = require('../services/applicationprogress.service');
const answerService = require('../services/answer.service');


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
  evaluationForm: Joi.array().optional()
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

    if(assessment){
      form.assessment = assessment._id;
    }

    if(form.evaluationForm) {
      for (let answer of form.evaluationForm) {
        answer._id = new ObjectID();
        answer = await answerService.addAnswer(answer);
      }

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


async function findByCandidate(userId, filter, sort) {
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

  let aList = [{
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
    {$lookup:{
        from:"applicationprogresses",
        let:{applicationProgressId:"$applicationProgressId"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgressId"]}}},
          {$lookup:{
              from:"stages",
              let:{stage:"$stage"},
              pipeline:[
                {$match:{$expr:{$eq:["$_id","$$stage"]}}},
              ],
              as: 'stage'
            }},
          { $unwind: '$stage'}
        ],
        as: 'applicationProgressId'
      }},
    { $unwind: '$applicationProgressId' }
  ];


  if(filter.stages && filter.stages.length){
    aList.push({ $match: {'applicationProgressId.stage.type': {$in: filter.stages} } });
  }

  const aggregate = Evaluation.aggregate(aList);

  return await Evaluation.aggregatePaginate(aggregate, options);

}


async function findByCandidateAndCompany(userId, filter, sort) {
  if(!userId || !filter || !sort){
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

  let aList = [{
    $match: {partyId: userId, companyId: filter.companyId}
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
    {$lookup:{
        from:"applicationprogresses",
        let:{applicationProgressId:"$applicationProgressId"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgressId"]}}},
          {$lookup:{
              from:"stages",
              let:{stage:"$stage"},
              pipeline:[
                {$match:{$expr:{$eq:["$_id","$$stage"]}}},
              ],
              as: 'stage'
            }},
          { $unwind: '$stage'}
        ],
        as: 'applicationProgressId'
      }},
    { $unwind: '$applicationProgressId' }
  ];

  if(filter.stages && filter.stages.length){
    aList.push({ $match: {'applicationProgressId.stage.type': {$in: filter.stages} } });
  }

  const aggregate = Evaluation.aggregate(aList);

  return await Evaluation.aggregatePaginate(aggregate, options);

}



async function findByCandidateAndApplicationId(userId, filter, sort) {
  if(!userId || !filter || !sort){
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

  let aList = [{
    $match: {partyId: userId, applicationId: ObjectID(filter.applicationId)}
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
    {$lookup:{
        from:"applicationprogresses",
        let:{applicationProgressId:"$applicationProgressId"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgressId"]}}},
          {$lookup:{
              from:"stages",
              let:{stage:"$stage"},
              pipeline:[
                {$match:{$expr:{$eq:["$_id","$$stage"]}}},
              ],
              as: 'stage'
            }},
          { $unwind: '$stage'}
        ],
        as: 'applicationProgressId'
      }},
    { $unwind: '$applicationProgressId' }
  ];

  if(filter.stages && filter.stages.length){
    aList.push({ $match: {'applicationProgressId.stage.type': {$in: filter.stages} } });
  }

  const aggregate = Evaluation.aggregate(aList);

  let evaluations = await Evaluation.aggregatePaginate(aggregate, options);
  return evaluations;
}




async function getCandidateEvaluationsStats(userId, companyId, type, stages) {
  if(!userId || !companyId || !type || !stages){
    return;
  }

  let result = {internal: {}, external: {}};
  let match = {partyId: userId};
  if(type==='INTERNAL'){
    match.companyId = companyId;
  } else if(type==='EXTERNAL'){
    match.companyId = {$ne: companyId };
  }

  let aggregate = [{
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
    {$lookup:{
        from:"applicationprogresses",
        let:{applicationProgressId:"$applicationProgressId"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgressId"]}}},
          {$lookup:{
              from:"stages",
              let:{stage:"$stage"},
              pipeline:[
                {$match:{$expr:{$eq:["$_id","$$stage"]}}},
              ],
              as: 'stage'
            }},
          { $unwind: '$stage'}
        ],
        as: 'applicationProgressId'
      }},
    { $unwind: '$applicationProgressId' }
  ];

  if(stages.length){
    aggregate.push({ $match: {'applicationProgressId.stage.type': {$in: stages} } });
  }
  let evaluations = await Evaluation.aggregate(aggregate);

  if(evaluations) {


    let data = _.reduce(evaluations, function (res, evaluation) {
      let assessment = _.omit(evaluation.assessment, ['_id', 'createdBy', 'createdDate', 'candidateId',])


      for (const prop in assessment) {

        if (res.group[evaluation.companyId] && res.group[evaluation.companyId][prop]) {
          res.group[evaluation.companyId][prop] += evaluation.assessment[prop];
        } else {
          if(!res.group[evaluation.companyId]){
            res.group[evaluation.companyId] = {};
          }

          res.group[evaluation.companyId][prop] = {};
          res.group[evaluation.companyId][prop] = evaluation.assessment[prop];
        }
      }

      res.rating += evaluation.rating;
      return res;
    }, {rating: 0, group: {}});

    result.rating = Math.round(data.rating / evaluations.length * 10)/10;
    delete data.rating;
    for (const company in data.group) {
      let external = {};
      if(company==companyId){
        result.internal = data.group[company];

        for (const prop in result.internal) {
          result.internal[prop] = result.internal[prop] / evaluations.length;
        }
      } else {
        for (const prop in data.group[company]) {
          if(result.external[data.group[company][prop]]){
            result.external[prop] += data.group[company][prop];
          } else {
            result.external[prop] = data.group[company][prop];
          }
        }

        for (const prop in result.external) {
          result.external[prop] = result.external[prop] / evaluations.length;
        }

      }

      if (type==='INTERNAL') {
        result.external = null;
      } else if (type==='EXTERNAL'){
        result.internal = null;
      }
    }
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
