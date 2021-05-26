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
  candidates: Joi.array(),
  description: Joi.string().allow(''),
  department: Joi.object()
});


async function findByCompany(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  let pools = Pool.find({company: company});
  return pools
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
    $match: {_id: ObjectID(poolId)}
  },
    {
      $lookup: {
        from: 'candidates',
        localField: 'candidates',
        foreignField: '_id',
        as: 'candidates',
      },
    },
    {
      $project: {
        candidates: {
          $slice: [{
            "$filter": {
              "input": "$candidates",
              "as": "item",
              "cond": { "$eq": [] }
            }
          }, (perPage * page), perPage]
        }
      }
    }
  ]);

  console.log(poolId)

  let pool = await Pool.aggregatePaginate(aggregate, {});
  console.log(pool)
  return pool
}

async function addPool(currentUserId, pool) {
  if(!currentUserId || !pool || !pool.department){
    return;
  }


  let result;
  pool.department = ObjectID(pool.department);
  pool = await Joi.validate(pool, poolSchema, {abortEarly: false});
  pool.createdBy = currentUserId;
  result = new Pool(pool).save();

  return result;

}

async function updatePool(poolId, form) {
  if(!poolId || !form){
    return;
  }


  form = await Joi.validate(form, poolSchema, {abortEarly: false});
  let pool = await findPoolBy_Id(poolId);

  if(pool){
    pool.name = form.name;
    pool.department = form.department;
    pool.description = form.description;
    pool.candidates = form.candidates;
    result = await pool.save();
  }
  return result;

}


module.exports = {
  findByCompany:findByCompany,
  addPool:addPool,
  findPoolBy_Id:findPoolBy_Id,
  getPoolCandidates: getPoolCandidates,
  updatePool:updatePool
}
