const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Pool = require('../models/pool.model');
const MemberInvitation = require('../models/memberInvitation.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const feedService = require('../services/api/feed.service.api');


const poolSchema = Joi.object({
  company: Joi.number().required(),
  name: Joi.string().required(),
  candidates: Joi.array().optional(),
  description: Joi.string().allow(''),
  createdBy: Joi.number()
});



async function add(pool) {
  if(!pool){
    return;
  }


  let result;
  pool = await Joi.validate(pool, poolSchema, {abortEarly: false});
  result = new Pool(pool).save();

  return result;

}


function findByCompany(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  return Pool.find({company: company});
}

function findPoolBy_Id(poolId) {
  let data = null;

  if(poolId==null){
    return;
  }

  let pool = Pool.findById(poolId);
  return pool
}


async function getPoolCandidates(poolId) {
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
          hasApplied: '$candidate.hasApplied'
        }
    }

  ]);


  let pool = await Pool.aggregatePaginate(aggregate, {});
  return pool
}


async function updatePool(poolId, form) {
  if(!poolId || !form){
    return;
  }


  form = await Joi.validate(form, poolSchema, {abortEarly: false});
  let pool = await findPoolBy_Id(poolId);

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

  await  Pool.update({candidates: candidateId}, {$pull: { candidates: { $in: [candidateId] } } }, { multi: true });

}


module.exports = {
  add:add,
  findByCompany:findByCompany,
  findPoolBy_Id:findPoolBy_Id,
  getPoolCandidates: getPoolCandidates,
  updatePool:updatePool,
  removeCandidate:removeCandidate
}
