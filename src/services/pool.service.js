const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Pool = require('../models/pool.model');
const MemberInvitation = require('../models/memberInvitation.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const feedService = require('../services/api/feed.service.api');


const poolSchema = Joi.object({
  name: Joi.string().required(),
  candidates: Joi.array().optional(),
  description: Joi.string().allow(''),
  createdBy: Joi.object().required(),
  company: Joi.object().required(),
});



async function add(pool) {
  if(!pool){
    return;
  }


  let result;
  // pool =await poolSchema.validate(pool, {abortEarly: false});
  result = new Pool(pool).save();

  return result;
}

function findByCompany(company, query) {
  let data = null;

  if(!company){
    return;
  }

  const match = { company };
  if(query){
    match.name = { $regex: query, $options: 'i' };
  }
  return Pool.find(match);
}

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  let pool = Pool.findById(id);
  return pool;
}

function findPoolBy_Id(poolId) {
  let data = null;

  if(poolId==null){
    return;
  }

  let pool = Pool.findById(poolId);
  return pool
}

async function findByIds(ids) {
  if (!ids) {
    return;
  }

  const pools = await Pool.find({ _id: {$in: ids} });
  return pools;
}

async function getPoolCandidates(poolId, options) {
  let data = null;

  if(poolId==null){
    return;
  }

  const aggregate = Pool.aggregate([{
    $match: {_id: poolId, }
  },
    {
      $lookup: {
        from: 'candidates',
        localField: 'candidates',
        foreignField: '_id',
        as: 'candidates',
      },
    },
    { $unwind: '$candidates'},
    { $project:
        {
          _id:'$candidates._id',
          _avatar: '$candidates._avatar',
          status: '$candidates.status',
          rating: '$candidates.rating',
          level: '$candidates.level',
          teamRating: '$candidates.teamRating',
          links: '$candidates.links',
          skills: '$candidates.skills',
          experiences: '$candidates.experiences',
          educations: '$candidates.educations',
          tags: '$candidates.tags',
          sources: '$candidates.sources',
          applications:'$candidates.applications',
          evaluations: '$candidates.evaluations',
          userId: '$candidates.userId',
          avatar: '$candidates.avatar',
          company: '$candidates.firstName',
          firstName: '$candidates.firstName',
          middleName: '$candidates.middleName',
          lastName: '$candidates.lastName',
          jobTitle: '$candidates.jobTitle',
          email: '$candidates._id',
          phoneNumber: '$candidates.phoneNumber',
          city: '$candidates.city',
          state: '$candidates.state',
          country: '$candidates.country',
          createdDate: '$candidates.createdDate',
          hasImported: '$candidate.hasImported',
          hasApplied: '$candidate.hasApplied',
          noOfMonthExperiences: '$candidates.noOfMonthExperiences'
        }
    }

  ]);


  let pool = await Pool.aggregatePaginate(aggregate, options);
  return pool
}

async function remove(id) {
  if(!id){
    return;
  }

  return Pool.findByIdAndDelete(id);
}
async function updatePool(poolId, form) {
  if(!poolId || !form){
    return;
  }

  await poolSchema.validate(form, {abortEarly: false});
  let pool = await findById(poolId);

  if(pool){
    pool.name = form.name;
    pool.description = form.description;
    result = await pool.save();
  }
  return result;
}

async function removeCandidate(candidateId) {
  if(!candidateId){
    return;
  }

  //await  Pool.update({candidates: candidateId}, {$pull: { candidates: { $in: [candidateId] } } }, { multi: true });
  await Pool.updateMany(
    { candidates: candidateId },
    { $pull: { candidates: candidateId } }
  );
}

async function removeCandidates(candidateIds) {
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return;
  }

  await Pool.updateMany(
    { candidates: { $in: candidateIds } },
    { $pull: { candidates: { $in: candidateIds } } }
  );
}

async function findPoolsByCandidateId(candidateId) {
  if (!candidateId) {
    return;
  }

  const pools = await Pool.find({ candidates: candidateId }, '_id company status name').exec();
  return pools;
};


module.exports = {
  add,
  findByCompany,
  findById,
  findPoolBy_Id,
  findByIds,
  getPoolCandidates,
  remove,
  updatePool,
  removeCandidate,
  removeCandidates,
  findPoolsByCandidateId
}
