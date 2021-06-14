const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

let SearchParam = require('../const/searchParam');
const statusEnum = require('../const/statusEnum');
const Candidate = require('../models/candidate.model');
const evaluationService = require('../services/evaluation.service');
const feedService = require('../services/api/feed.service.api');

const {convertToCandidate} = require('../utils/helper');


const candidateSchema = Joi.object({
  userId: Joi.number().optional(),
  company: Joi.number(),
  avatar: Joi.string().allow('').optional(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  middleName: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  skills: Joi.array().optional(),
  jobTitle: Joi.string().allow('').optional(),
  phoneNumber: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  applications: Joi.array().optional(),
  url: Joi.string().allow('').optional(),
  hasApplied: Joi.boolean().optional()
});


async function addCandidate(candidate) {

  if(!candidate){
    return;
  }

  candidate = await Joi.validate(candidate, candidateSchema, {abortEarly: false});
  candidate = new Candidate(candidate).save();

  return candidate;

}


async function findById(id) {

  if(!id){
    return;
  }

  return await Candidate.findById(id);
}

async function findByUserId(userId) {

  if(!userId){
    return;
  }

  return await Candidate.findOne({userId: userId});
}




async function findByCompany(company, filter) {

  if(!company || !filter){
    return;
  }

  let select = '';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  const aggregate = Candidate.aggregate([{
    $match: {company: company}
  },
    {
      $lookup: {
        from: 'applications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applications',
      },
    },
    {
      $lookup: {
        from: 'candidates',
        localField: 'application.currentProgress',
        foreignField: '_id',
        as: 'currentProgress',
      }
    },
  ]);
  return await Candidate.aggregatePaginate(aggregate, options);
}



function findByUserIdAndCompanyId(userId, companyId) {


  if(!userId || !companyId){
    return;
  }

  return Candidate.findOne({userId: userId, company: companyId});
}


function getListofCandidates(userIds, companyId) {


  if(!userIds || !companyId){
    return;
  }
  return Candidate.find({userId: {$in: userIds}, company: companyId});
}


function searchCandidates(company, query) {


  if(!company){
    return;
  }
  let result = Candidate.find({company: company, $or: [{firstName: { $regex: query.toLowerCase(), $options: 'i' }}, {lastName: { $regex: query, $options: 'i' }}]});

  return result;
}



async function search(filter, sort) {

  if(!filter || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  let aList = [];
  let aLookup = [];
  let aMatch = { $match: new SearchParam(filter)};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);

  aList.push(
    {$lookup:{
        from:"applications",
        let:{user:"$_id"},
        pipeline:[
          {$match:{$expr:{$eq:["$user","$$user"]}}},
          {$lookup:{
              from:"applicationprogresses",
              let:{currentProgress:"$currentProgress"},
              pipeline:[
                {$match:{$expr:{$eq:["$_id","$$currentProgress"]}}},
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
              as: 'currentProgress'
            }
          },
          { $unwind: '$currentProgress'}
        ],
        as: 'applications'
      },
    },
    {$lookup: {from: 'evaluations', localField: 'evaluations', foreignField: '_id', as: 'evaluations' } },
    { $addFields:
        {
          rating: {$avg: "$evaluations.rating"},
          evaluations: [],
          applications: []
        }
    },
  );


  if(filter.stages.length){
    aList.push({ $match: {'applications.currentProgress.stage.type': {$in: filter.stages} } });
  }

  if(filter.sources.length){
    filter.sources = _.reduce(filter.sources, function (res, source) {
      res.push(ObjectID(source));
      return res;
    }, []);

    aList.push(
      {$lookup: {from: 'labels', localField: 'sources', foreignField: '_id', as: 'sources' } },
      // { $match: {'sources': {$in: filter.sources} } }
    );
  }

  if(sort && sort.sortBy=='rating'){
    aSort = { $sort: { rating: direction} };
    aList.push(aSort);
  } else {
    aList.push(aSort);
  }


  const aggregate = Candidate.aggregate(aList);

  return await Candidate.aggregatePaginate(aggregate, options);
}



async function getAllCandidatesSkills(company) {

  if(!company){
    return;
  }

  let skills = await Candidate.find({company: company}).select({skills: 1});

  skills = _.reduce(skills, function(res, candidate){
    res = res.concat(candidate.skills);
    return res;findById
  }, []);
  return skills
}



async function getCandidatesSimilar(userId) {


  if(!userId){
    return;
  }
  // let candidates = await Candidate.find({userId: {$ne: userId}}).limit(10);
  // let candidateIds = _.map(candidates, 'userId');
  let filter = {
    "jobTitles": ["Sr. Manager"],
    "locations": ["US"],
    "skills": [],
    "companies": [""],
    "schools": [],
    "industries": [],
    "employmentTypes": []
  }
  let result = await feedService.searchPeople(filter, {});
  let people = _.reduce(result.content, function(res, p){
    res.push(p);
    return res;
  }, []);

  return people;
}



async function getCompanyBlacklisted(company, sort) {

  if(!company){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;
  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  let aList = [];
  let aMatch = { $match: {company: company, flag: {$exists: true}}};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);
  aList.push(
    {
      $lookup: {
        from: 'flags',
        localField: "flag",
        foreignField: "_id",
        as: "flag"
      }
    },
    { $unwind: '$flag'}
  );


  aList.push(aSort);

  const aggregate = Candidate.aggregate(aList);
  let candidates = await Candidate.aggregatePaginate(aggregate, options);
  return candidates;
}

module.exports = {
  addCandidate:addCandidate,
  findById:findById,
  findByUserId:findByUserId,
  findByCompany:findByCompany,
  findByUserIdAndCompanyId:findByUserIdAndCompanyId,
  getListofCandidates:getListofCandidates,
  searchCandidates:searchCandidates,
  search:search,
  getAllCandidatesSkills:getAllCandidatesSkills,
  getCandidatesSimilar:getCandidatesSimilar,
  getCompanyBlacklisted:getCompanyBlacklisted
}
