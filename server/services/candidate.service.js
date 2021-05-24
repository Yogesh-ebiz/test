const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const Candidate = require('../models/candidate.model');
const Joi = require('joi');


const candidateSchema = Joi.object({
  userId: Joi.number().optional(),
  company: Joi.number(),
  avatar: Joi.string().allow('').optional(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  middleName: Joi.string().allow('').optional(),
  jobTitle: Joi.string().allow('').optional(),
  phoneNumber: Joi.string().allow(''),
  email: Joi.string(),
  applications: Joi.array().optional()
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
    }
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


module.exports = {
  addCandidate:addCandidate,
  findById:findById,
  findByUserId:findByUserId,
  findByCompany:findByCompany,
  findByUserIdAndCompanyId:findByUserIdAndCompanyId,
  getListofCandidates:getListofCandidates
}
