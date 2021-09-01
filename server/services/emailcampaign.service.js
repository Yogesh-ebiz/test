const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

let SearchParam = require('../const/searchParam');
const statusEnum = require('../const/statusEnum');
const emailCampaignStageType = require('../const/emailCampaignStageType');

const EmailCampaign = require('../models/emailcampaign.model');
const emailCampaignStageService = require('../services/emailcampaignstage.service');




const emailCampaignSchema = Joi.object({
  token: Joi.string(),
  createdBy: Joi.object(),
  job: Joi.object(),
  candidate: Joi.object().optional(),
  userId: Joi.number().optional(),
  email: Joi.object(),
  emailAddress: Joi.string(),
  meta: Joi.object().optional(),
});


async function add(emailCampaign) {

  if(!emailCampaign){
    return;
  }

  emailCampaign = await Joi.validate(emailCampaign, emailCampaignSchema, {abortEarly: false});
  emailCampaign = await new EmailCampaign(emailCampaign).save();

  let stage = await emailCampaignStageService.add({type: emailCampaignStageType.INVITED});
  emailCampaign.stages.push(stage);
  emailCampaign.currentStage = stage;

  emailCampaign = await emailCampaign.save();

  return emailCampaign;

}


function findById(id) {
  if(!id){
    return;
  }

  return EmailCampaign.findById(id);
}

async function findByEmailAndJobId(email, jobId) {
  if(!email || !jobId){
    return;
  }

  return EmailCampaign.findOne({email: email, job: jobId}).populate('stages').populate('currentStage');
}



async function findByEmailAddressAndJobId(email, jobId) {
  if(!email || !jobId){
    return;
  }

  return EmailCampaign.findOne({emailAddress: email, job: jobId}).populate('stages').populate('currentStage');
}


async function findByJobId(jobId, filter) {
  if(!jobId || !filter){
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
  return EmailCampaign.paginate({'meta.jobId': ObjectID(jobId)}, options);
  // return Activity.find({subjectType: subjectType, subjectId: subjectId});

}



async function findCampaignsByJobId(jobId) {
  if(!jobId){
    return;
  }

  return EmailCampaign.find({jobId: jobId});
}


async function findByToken(token) {
  if(!token){
    return;
  }

  return EmailCampaign.findOne({token: token}).populate('stages').populate('currentStage');

}



async function search(jobId, filter, sort) {
  let data = null;
  console.log(jobId, filter, sort)
  if(jobId==null || !filter || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;
  let aSort = { $sort: {createdDate: direction} };

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  let aList = [];
  let aLookup = [];
  let aMatch = {};


  aList.push({ $match: {jobId: jobId, status: {$in: filter.status} } });
  // aList.push(
  //   {
  //     $lookup: {
  //       from: 'applicationprogresses',
  //       localField: 'currentProgress',
  //       foreignField: '_id',
  //       as: 'currentProgress',
  //     },
  //   },
  //   {$unwind: '$currentProgress'}
  // );
  //
  // aList.push(
  //   {$lookup:{
  //       from:"candidates",
  //       let:{user:"$user"},
  //       pipeline:[
  //         {$match:{$expr:{$eq:["$_id","$$user"]}}},
  //         {
  //           $lookup: {
  //             from: 'labels',
  //             localField: 'sources',
  //             foreignField: '_id',
  //             as: 'sources',
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: 'evaluations',
  //             localField: 'evaluations',
  //             foreignField: '_id',
  //             as: 'evaluations',
  //           },
  //         },
  //         { $addFields:
  //             {
  //               rating: {$avg: "$evaluations.rating"},
  //               evaluations: [],
  //               applications: []
  //             }
  //         },
  //       ],
  //       as: 'user'
  //     }},
  //   {$unwind: '$user'}
  // );


  let params = new SearchParam(filter);
  aList.push({ $match: params});

  const aggregate = EmailCampaign.aggregate(aList);

  let result = await EmailCampaign.aggregatePaginate(aggregate, options);
  if(result.docs.length){
    // let job = await jobService.findJob_Id(result.docs[0].jobId);
    //
    // if(pipeline){
    //   result.docs.forEach(function(app){
    //     let stage = _.find(pipeline.stages, {_id: ObjectID(app.currentProgress.stage)});
    //     if(stage) {
    //       stage.members = [];
    //       stage.tasks = [];
    //       stage.evaluations = [];
    //       app.currentProgress.stage = stage;
    //     }
    //   })
    // }

  }

  return result;

}


module.exports = {
  add:add,
  findById:findById,
  findByEmailAndJobId:findByEmailAndJobId,
  findByEmailAddressAndJobId:findByEmailAddressAndJobId,
  findByJobId:findByJobId,
  findCampaignsByJobId:findCampaignsByJobId,
  findByToken:findByToken,
  search:search
}
