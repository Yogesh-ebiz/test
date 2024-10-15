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
  userId: Joi.number(),
  createdBy: Joi.object()
});


async function add(source) {

  if(!source){
    return;
  }


  await sourceSchema.validate(source, {abortEarly: false});

  source.campaigns = [];
  source = await new Source(source).save();

  return source;

}

async function addWithCheck(source) {
  if(!source){
    return;
  }

  await sourceSchema.validate(source, {abortEarly: false});
  source.status = statusEnum.ACTIVE;
  source.campaigns = [];
  source.createdDate = Date.now();
  source = await Source.findOneAndUpdate({job: source.job, candidate: source.candidate}, source, {upsert: true});

  return source;

}



async function addSources(candidate, jobIds, member) {

  if(!candidate || !jobIds || !member){
    return;
  }


  let sources = [];
  let jobs = await jobService.findJob_Ids(jobIds);

  console.log(jobs)
  for(const [i, job] of jobs.entries()){
    let source = {
      job: job._id,
      candidate: candidate._id,
      createdBy: member._id
    };
    await sourceSchema.validate(source, {abortEarly: false});

    sources.push(source);
    let meta= {candidateName: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, jobTitle: job.title, job: job._id};
    let activity = await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.CANDIDATE, subject: candidate._id, action: actionEnum.ADDED, meta: meta});
    console.log(activity)
  }

  await Source.insertMany(sources);
}


async function remove(ids) {
  if(!ids){
    return;
  }

  await Source.deleteMany({_id: {$in: ids}});
}

async function removeByCandidateId(candidateId) {
  if(!candidateId){
    return;
  }

  try {
    const sources = await Source.find({ candidate: candidateId });

    if (sources && sources.length > 0) {
      for (const source of sources) {
        await Source.findByIdAndDelete(source._id);
      }
    }
  } catch (error) {
    console.error('Error removing sources by candidate ID:', error);
    throw error;
  }
}

async function removeByCandidateIds(candidateIds) {
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return;
  }

  try {
    const sources = await Source.find({ candidate: { $in: candidateIds } });

    if (sources && sources.length > 0) {
      const sourceIds = sources.map(source => source._id);
      await Source.deleteMany({ _id: { $in: sourceIds } });
    }
  } catch (error) {
    console.error('Error removing sources by candidate ID:', error);
    throw error;
  }
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


function findByJobIdAndCandidateId(jobId, candidateId) {
  if(!jobId || !candidateId){
    return;
  }

  return Source.findOne({job: jobId, candidate: candidateId}).populate('campaigns');

}


function findByJobIdAndUserId(jobId, userId) {
  if(!jobId || !userId){
    return;
  }

  return Source.aggregate([
    {$match: {job: jobId}},
    { $lookup: {from: 'emailcampaigns', localField: 'campaigns', foreignField: '_id', as: 'campaigns' } },
    {$lookup:{
        from:"candidates",
        let:{candidate: '$candidate'},
        pipeline:[
          {$match:{$expr:{$eq:["$$candidate","$_id"]}}}
        ],
        as: 'candidate'
      }},
    {$unwind: '$candidate'},
    {$match: {'candidate.userId': userId}},
    {$limit: 1 }
  ]);;
}

async function search(filter, sort) {

  if(!filter || !sort){
    return;
  }

  sort.page = sort.page || 0;
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

  aList.push({$match: {job: { $in: filter.jobs }}});
  aList.push(
    {$lookup:{
        from:"candidates",
        let:{candidate:"$candidate"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$candidate"]}}},
          {$lookup: {from: 'applications', localField: 'applications', foreignField: '_id', as: 'applications' } },
          {$lookup: {from: 'evaluations', localField: 'evaluations', foreignField: '_id', as: 'evaluations' } },
          { $addFields:
              {
                rating: {$round: [{$avg: "$evaluations.rating"}, 1]},
                evaluations: []
              }
          },
        ],
        as: 'candidate'
      },
    },
    {$unwind: '$candidate'},
    // {$lookup: {from: 'emailcampaigns', localField: '_id', foreignField: 'candidate', as: 'campaigns' } },
    {$lookup:{
        from:"emailcampaigns",
        let:{campaigns:"$campaigns"},
        pipeline:[
          {$match:{$expr:{$in:["$_id","$$campaigns"]}}},
          {$lookup: {from: 'emailcampaignstages', localField: 'currentStage', foreignField: '_id', as: 'currentStage' } },
          {$unwind: '$currentStage'}
        ],
        as: 'campaigns'
      },
    },
    // {$unwind: '$campaign'}
    // {$unwind: {
    //     path: "$campaigns",
    //     preserveNullAndEmptyArrays: true
    //   }
    // }
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


function updateViewed(id, hasViewed) {

  hasViewed = hasViewed?true:false;
  return Source.update({_id: id}, {$set: {hasViewed: hasViewed}});
}


function updateSaved(id, hasSaved) {

  hasSaved = hasSaved?true:false;
  return Source.update({_id: id}, {$set: {hasSaved: hasSaved}});
}


function updateApplied(id, hasApplied) {

  hasApplied = hasApplied?true:false;
  return Source.update({_id: id}, {$set: {hasApplied: hasApplied}});
}


module.exports = {
  add:add,
  addWithCheck:addWithCheck,
  addSources:addSources,
  remove:remove,
  removeByCandidateId:removeByCandidateId,
  removeByCandidateIds,
  findById:findById,
  findByCandidateId:findByCandidateId,
  findByJobId:findByJobId,
  findByJobIdAndCandidateId:findByJobIdAndCandidateId,
  findByJobIdAndUserId:findByJobIdAndUserId,
  search:search,
  updateViewed:updateViewed,
  updateSaved:updateSaved,
  updateApplied:updateApplied

}
