const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
let CandidateParam = require('../const/candidateParam');

const Source = require('../models/source.model');
const candidateService = require('../services/candidate.service');

const sourceSchema = Joi.object({
  jobId: Joi.object(),
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



async function addSources(sources) {

  if(!sources){
    return;
  }

  for(const [i, source] of sources.entries()){
    await Joi.validate(source, sourceSchema, {abortEarly: false});
  }

  await Source.insertMany(sources);
}


async function remove(id) {
  if(!id){
    return;
  }

  return Source.findById(id);
}

async function removeMany(ids) {
  if(!ids){
    return;
  }

  return Source.remove({jobId: {$in: ids}});
}

async function findById(id) {
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

  return Source.find({jobId: jobId});

}


async function search(jobId, filter, sort) {

  if(!jobId || !filter || !sort){
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
  let aMatch = { $match: new CandidateParam(filter)};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);

  aList.push(
    {$lookup:{
        from:"members",
        let:{user:"$createdBy"},
        pipeline:[
          {$match:{$expr:{$eq:["$_","$$user"]}}}
        ],
        as: 'createdBy'
      },
    },
    {$unwind: '$createdBy'},

  );


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
  removeMany:removeMany,
  findById:findById,
  findByCandidateId:findByCandidateId,
  findByJobId:findByJobId,
  search:search
}
