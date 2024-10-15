const _ = require('lodash');
const { ObjectId } = require('mongodb');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Evaluation = require('../models/evaluation.model');
const assessmentService = require('./assessment.service');
const applicationService = require('./application.service');
const applicationProgressService = require('./applicationprogress.service');
const jobService = require('./jobrequisition.service');
const answerService = require('./answer.service');


const evaluationSchema = Joi.object({
  createdBy: Joi.object().optional(),
  application: Joi.object(),
  applicationProgress: Joi.object(),
  candidate: Joi.object(),
  user: Joi.object(),
  partyId: Joi.number().optional(),
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
    },
    {
      path: 'evaluationForm',
      model: 'Answer',
      populate: {
        path: 'question',
        model: 'Question'
      }
    }
  ]);

  return evaluation;

}
async function add(form) {
  if(!form){
    return;
  }

  await evaluationSchema.validate(form, {abortEarly: false});

  let assessment;
  if(form.assessment){
    form.assessment.candidate = form.candidateId;
    form.assessment.createdBy = form.createdBy;
    assessment = await assessmentService.add(form.assessment);
    if(assessment){
      form.assessment = assessment._id;
    }

    if(assessment){
      form.assessment = assessment._id;
    }

    if(form.evaluationForm) {
      for (let answer of form.evaluationForm) {
        answer._id = new ObjectId();
        answer.question = answer.question ? new ObjectId(answer.question):null;
        answer = await answerService.add(answer);
      }

    }
  }
  let evaluation = await new Evaluation(form).save();
  evaluation.assessment = assessment;
  return evaluation;
}



async function removeById(id){
  if(!id){
    return;
  }

  let result;
  // let progress = await applicationProgressService.getApplicationProgressEvaluations(applicationProgressId);
  let application = await applicationService.findById(applicationId).populate([
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

function remove(id) {
  if(!id){
    return;
  }



  return Evaluation.findByIdAndDelete(id);

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


async function filterByCandidateId(candidateId, filter, sort) {
  if(!candidateId || !sort){
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

  let match = { candidate: candidateId };

  if(filter?.applicationId) {
    match.application = filter.applicationId;
  }

  let aList = [
    {
      $match: match
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
        let:{applicationProgress:"$applicationProgress"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgress"]}}},
        ],
        as: 'applicationProgress'
      }},
    { $unwind: '$applicationProgress' }
  ];


  if(filter.stages && filter.stages.length){
    aList.push({ $match: {'applicationProgress.stage': {$in: filter.stages} } });
  }

  console.log(aList)
  const aggregate = Evaluation.aggregate(aList);

  return await Evaluation.aggregatePaginate(aggregate, options);

}

async function filterByUser(user, filter, sort) {

  if(!user || !sort){
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

  let match = { user };

  if(filter?.applicationId) {
    match.application = new ObjectId(filter.applicationId);
  }

  let aList = [
    {  $match: match },
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
    // {$lookup:{
    //     from:"applicationprogresses",
    //     let:{applicationProgress:"$applicationProgress"},
    //     pipeline:[
    //       {$match:{$expr:{$eq:["$_id","$$applicationProgress"]}}},
    //     ],
    //     as: 'applicationProgress'
    //   }},
    // { $unwind: '$applicationProgress' }
  ];


  if(filter.stages && filter.stages.length){
    aList.push({ $match: {'applicationProgress.stage': {$in: filter.stages} } });
  }

  const aggregate = Evaluation.aggregate(aList);

  return await Evaluation.aggregatePaginate(aggregate, options);

}
async function findByPartyId(userId, filter, sort) {

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

  let match = { partyId: userId };

  if(filter?.applicationId) {
    match.application = ObjectID(filter.applicationId);
  }

  console.log(match)

  let aList = [{
    $match: match
  },
    // {
    //   $lookup: {
    //     from: 'members',
    //     localField: 'createdBy',
    //     foreignField: '_id',
    //     as: 'createdBy',
    //   },
    // },
    // { $unwind: '$createdBy' },
    // {
    //   $lookup: {
    //     from: 'assessments',
    //     localField: 'assessment',
    //     foreignField: '_id',
    //     as: 'assessment',
    //   },
    // },
    // { $unwind: '$assessment' },
    // {$lookup:{
    //     from:"applicationprogresses",
    //     let:{applicationProgress:"$applicationProgress"},
    //     pipeline:[
    //       {$match:{$expr:{$eq:["$_id","$$applicationProgress"]}}},
    //     ],
    //     as: 'applicationProgress'
    //   }},
    // { $unwind: '$applicationProgress' }
  ];


  if(filter.stages && filter.stages.length){
    aList.push({ $match: {'applicationProgress.stage': {$in: filter.stages} } });
  }

  console.log(aList)
  const aggregate = Evaluation.aggregate(aList);

  return await Evaluation.aggregatePaginate(aggregate, options);

}

async function findByPartyIdAndCompany(userId, filter, sort) {
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

  let match = {partyId: userId, companyId: filter.companyId};

  if(filter?.applicationId) {
    match.application = ObjectID(filter.applicationId);
  }

  let aList = [{
    $match: match
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
        let:{applicationProgress:"$applicationProgress"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgress"]}, status: statusEnum.ACTIVE}},
        ],
        as: 'applicationProgress'
      }},
    { $unwind: '$applicationProgress' }
  ];

  if(filter.stages && filter.stages.length){
    aList.push({ $match: {'applicationProgress.stage': {$in: filter.stages} } });
  }

  const aggregate = Evaluation.aggregate(aList);

  return await Evaluation.aggregatePaginate(aggregate, options);

}

async function findByPartyIdAndApplicationId(userId, filter, sort) {
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

  let match = {partyId: userId};

  if(filter?.applicationId) {
    match.application = ObjectID(filter.applicationId);
  }

  let aList = [{
    $match: match
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
        let:{applicationProgress:"$applicationProgress"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgress"]}, status: statusEnum.ACTIVE}},
        ],
        as: 'applicationProgress'
      }},
    { $unwind: '$applicationProgress' }
  ];

  if(filter.stages && filter.stages.length){
    aList.push({ $match: {'applicationProgress.stage': {$in: filter.stages} } });
  }

  const aggregate = Evaluation.aggregate(aList);

  let evaluations = await Evaluation.aggregatePaginate(aggregate, options);
  return evaluations;
}

async function findByApplication(applicationId) {
  if(!applicationId){
    return;
  }

  const evaluations = await Evaluation.find({application: applicationId}).populate([
    {
      path: 'createdBy',
      model: 'Member'
    },
    {
      path: 'assessment',
      model: 'Assessment'
    },
    {
      path: 'applicationProgress',
      model: 'ApplicationProgress',
    }]).lean();
  return evaluations;
}

async function findByUser(userId) {
  if(!userId){
    return;
  }

  const evaluations = await Evaluation.find({user: userId}).populate([
    {
      path: 'createdBy',
      model: 'Member'
    },
    {
      path: 'assessment',
      model: 'Assessment'
    },
    {
      path: 'applicationProgress',
      model: 'ApplicationProgress',
    }]).lean();
  return evaluations;
}

async function findByCandidate(candidateId) {
  if(!candidateId){
    return;
  }

  const evaluations = await Evaluation.find({candidate: candidateId}).populate([
    {
      path: 'createdBy',
      model: 'Member'
    },
    {
      path: 'assessment',
      model: 'Assessment'
    },
    {
      path: 'applicationProgress',
      model: 'ApplicationProgress',
    }]).lean();
  return evaluations;
}

async function getCandidateEvaluationsStats(candidateId, companyId, filter, user) {
  if(!candidateId || !companyId || !filter){
    return;
  }

  let result = {internal: {}, external: {}};
  let $match = {candidate: candidateId};
  if(filter.type==='INTERNAL'){
    $match.companyId = companyId;
  } else if(filter.type==='EXTERNAL'){
    $match.companyId = {$ne: companyId };
  }

  if(filter.applicationId){
    $match.application = filter.applicationId;
  }

  let aggregate = [{
    $match: $match
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
        let:{applicationProgress:"$applicationProgress"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgress"]}}}
        ],
        as: 'applicationProgress'
      }},
    { $unwind: '$applicationProgress' }
  ];

  if(filter.stages.length){
    aggregate.push({ $match: {'applicationProgress.stage': {$in: filter.stages} } });
  }
  let evaluations = await Evaluation.aggregate(aggregate);

  let hasUserEvaluated = false;
  if(evaluations) {
    let data = _.reduce(evaluations, function (res, evaluation) {
      let assessment = _.omit(evaluation.assessment, ['_id', 'createdBy', 'createdDate', 'candidate'])


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
      if (evaluation.createdBy._id.equals(user._id)) {
        hasUserEvaluated = true;
      } 
      return res;
    }, {rating: 0, group: {}});

    result.noOfEvaluations = evaluations.length;
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

      if (filter.type==='INTERNAL') {
        result.external = null;
      } else if (filter.type==='EXTERNAL'){
        result.internal = null;
      }
    }
    let job;
    if (evaluations && evaluations.length > 0) {
      job = await jobService.getJobByApplicationId(evaluations[0].application);
    }
    
    const isJobOwner = job && job.createdBy && (job.createdBy.toString() === user._id.toString());
    const isAdmin = user.role && user.role.name && user.role.name.toLowerCase().includes('Administrator'.toLowerCase());
    if (!isJobOwner && !isAdmin && !hasUserEvaluated) {
      result = {}; // If none of the conditions are met, return an empty list
    }
  }
  return result;

}

async function getUserEvaluationsStats(user, filter) {
  if(!user || !filter){
    return;
  }

  let result = {internal: {}, external: {}};
  let $match = {user};
  // if(filter.type==='INTERNAL'){
  //   $match.companyId = companyId;
  // } else if(filter.type==='EXTERNAL'){
  //   $match.companyId = {$ne: companyId };
  // }

  if(filter.applicationId){
    $match.application = filter.applicationId;
  }

  let aggregate = [{
    $match: $match
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
    // {$lookup:{
    //     from:"applicationprogresses",
    //     let:{applicationProgress:"$applicationProgress"},
    //     pipeline:[
    //       {$match:{$expr:{$eq:["$_id","$$applicationProgress"]}}}
    //     ],
    //     as: 'applicationProgress'
    //   }},
    // { $unwind: '$applicationProgress' }
  ];

  if(filter.stages.length){
    aggregate.push({ $match: {'applicationProgress.stage': {$in: filter.stages} } });
  }
  let evaluations = await Evaluation.aggregate(aggregate);

  if(evaluations) {
    let data = _.reduce(evaluations, function (res, evaluation) {
      let assessment = _.omit(evaluation.assessment, ['_id', 'createdBy', 'createdDate', 'candidate'])


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

    result.noOfEvaluations = evaluations.length;
    result.rating = Math.round(data.rating / evaluations.length * 10)/10;
    delete data.rating;
    for (const company in data.group) {
      let external = {};

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



      if (filter.type==='INTERNAL') {
        result.external = null;
      } else if (filter.type==='EXTERNAL'){
        result.internal = null;
      }
    }
  }
  return result;

}


async function getCandidateEvaluationsStatsByPartyId(userId, companyId, filter) {
  if(!userId || !companyId || !filter){
    return;
  }

  let result = {internal: {}, external: {}};
  let $match = {partyId: userId};
  if(filter.type==='INTERNAL'){
    $match.companyId = companyId;
  } else if(filter.type==='EXTERNAL'){
    $match.companyId = {$ne: companyId };
  }

  if(filter.applicationId){
    $match.application = filter.applicationId;
  }

  let aggregate = [{
    $match: $match
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
        let:{applicationProgress:"$applicationProgress"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$applicationProgress"]}}}
        ],
        as: 'applicationProgress'
      }},
    { $unwind: '$applicationProgress' }
  ];

  if(filter.stages.length){
    aggregate.push({ $match: {'applicationProgress.stage': {$in: filter.stages} } });
  }
  let evaluations = await Evaluation.aggregate(aggregate);

  if(evaluations) {
    let data = _.reduce(evaluations, function (res, evaluation) {
      let assessment = _.omit(evaluation.assessment, ['_id', 'createdBy', 'createdDate', 'candidate'])


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

      if (filter.type==='INTERNAL') {
        result.external = null;
      } else if (filter.type==='EXTERNAL'){
        result.internal = null;
      }
    }
  }
  return result;

}

async function getCandidateEvaluations(candidateId) {
  if(!candidateId){
    return;
  }


  return await Evaluation.find({candidate: candidateId});

}


async function getEvaluationsByCandidateList(userIds) {
  if(!userIds){
    return;
  }

  return await Evaluation.aggregate([
    {$match: {partyId: {$in: userIds} } },
    {$group: {_id: '$partyId',  evaluations: {$push: "$$ROOT"}, count: {$sum: 1}} }
  ]);

}


async function getFilters(companyId) {
  if(!companyId){
    return;
  }

  let result = {applications: []};
  let applications = await Evaluation.aggregate([
    {$match: {companyId: companyId } },
    {
      $lookup: {
        from: 'applications',
        localField: 'application',
        foreignField: '_id',
        as: 'application',
      }
    },
    { $unwind: '$application' },
    {$group:{_id:{application:'$application._id', jobTitle: '$application.jobTitle'}}},
    {$project: {_id: '$_id.application', jobTitle: '$_id.jobTitle'} }
  ])

  result.applications = applications;

  return result;

}

module.exports = {
  findById,
  add,
  removeById,
  remove,
  findByUserIdAndProgressId,
  search,
  filterByCandidateId,
  filterByUser,
  findByPartyId,
  findByPartyIdAndCompany,
  findByPartyIdAndApplicationId,
  findByApplication,
  findByCandidate,
  findByUser,
  getCandidateEvaluationsStats,
  getUserEvaluationsStats,
  getCandidateEvaluationsStatsByPartyId,
  getCandidateEvaluations,
  getEvaluationsByCandidateList,
  getFilters
}
