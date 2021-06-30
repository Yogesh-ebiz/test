const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const actionEnum = require('../const/actionEnum');
const subjectType = require('../const/subjectType');

let SourceParam = require('../const/sourceParam');

const Source = require('../models/source.model');
const candidateService = require('../services/candidate.service');
const jobService = require('../services/jobrequisition.service');
const activityService = require('../services/activity.service');


const sourceSchema = Joi.object({
  job: Joi.object(),
  candidate: Joi.object(),
  createdBy: Joi.object()
});


async function add(source) {

  if(!source){
    return;
  }

  source = await Joi.validate(source, sourceSchema, {abortEarly: false});
  source = await new Source(source).save();

  return source;

}



async function addSources(candidate, jobIds, member) {

  if(!candidate || !jobIds || !member){
    return;
  }


  let sources = [];
  let jobs = await jobService.findJob_Ids(jobIds);

  for(const [i, job] of jobs.entries()){
    let source = {
      job: job._id,
      candidate: candidate._id,
      createdBy: member._id
    };
    await Joi.validate(source, sourceSchema, {abortEarly: false});

    sources.push(source);
    let meta= {candidateName: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, jobTitlte: job.title, jobId: job._id};
    await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.CANDIDATE, subject: candidate._id, action: actionEnum.ADDED, meta: meta});

  }

  await Source.insertMany(sources);
}


async function remove(ids) {
  if(!ids){
    return;
  }

  await Source.deleteMany({_id: {$in: ids}});
}

function findById(id) {
  if(!id){
    return;
  }

  return Source.findById(id);
}

async function findByCandidateId(candidateId) {
  if(!candidateId){
    return;
  }

  return Source.find({candidate: candidateId});

}


function findByJobId(jobId) {
  if(!jobId){
    return;
  }

  return Source.find({job: jobId});

}


async function search(filter, sort) {

  if(!filter || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page)+1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;



  const options = {
    page: page,
    limit: limit,
  };


  let aList = [];
  let aLookup = [];
  let aMatch = { $match: new SourceParam(filter)};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(
    {$lookup:{
        from:"candidates",
        let:{candidate:"$candidate"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$candidate"]}}},
          {$lookup: {from: 'evaluations', localField: 'evaluations', foreignField: '_id', as: 'evaluations' } },
          { $addFields:
              {
                rating: {$avg: "$evaluations.rating"},
                evaluations: []
              }
          },
        ],
        as: 'candidate'
      },
    },
    {$unwind: '$candidate'},
    // {$lookup: {from: 'emailcampaigns', localField: 'campaign', foreignField: '_id', as: 'campaign' } },
    {$lookup:{
        from:"emailcampaigns",
        let:{campaign:"$campaign"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$campaign"]}}},
          {$lookup: {from: 'emailcampaignstages', localField: 'currentStage', foreignField: '_id', as: 'currentStage' } },
          {$unwind: '$currentStage'}
        ],
        as: 'campaign'
      },
    },
    // {$unwind: '$campaign'}
    {$unwind: {
        path: "$campaign",
        preserveNullAndEmptyArrays: true
      }
    }
  );

  aList.push(aMatch);



  if(sort && sort.sortBy=='rating'){
    aSort = { $sort: { rating: direction} };
    aList.push(aSort);
  } else {
    aList.push(aSort);
  }


  const aggregate = Source.aggregate(aList);

  return await Source.aggregatePaginate(aggregate, options);

  // return await Source.find({})
}

module.exports = {
  add:add,
  addSources:addSources,
  remove:remove,
  findById:findById,
  findByCandidateId:findByCandidateId,
  findByJobId:findByJobId,
  search:search
}
