const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
let SearchParam = require('../const/searchParam');

const statusEnum = require('../const/statusEnum');
const Receipt = require('../models/receipt.model');
const Joi = require('joi');


const receiptSchema = Joi.object({
  amount: Joi.number(),
  currency: Joi.string(),
  description: Joi.string().required(),
  chargeId: Joi.string(),
  metadata: Joi.object(),
  type: Joi.string(),
  isPaid: Joi.boolean(),
  paymentType: Joi.string(),
  receiptUrl: Joi.string(),
  member: Joi.object(),
  userId: Joi.number()
});


async function add(receipt) {

  if(!receipt){
    return;
  }

  receipt = await Joi.validate(receipt, receiptSchema, {abortEarly: false});
  receipt = new Receipt(receipt).save();

  return receipt;

}


async function findById(id) {
  if(!id){
    return;
  }

  return Receipt.findById(id);

}

async function findByJobId(jobId) {
  if(!jobId){
    return;
  }

  return Receipt.find({'meta.jobId': jobId});

}

async function search(filter, sort) {
  if(!filter || sort){
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

  let params = new SearchParam(filter);
  aList.push({ $match: params});
  aList.push(
    {
      $lookup: {
        from: 'applicationprogresses',
        localField: 'currentProgress',
        foreignField: '_id',
        as: 'currentProgress',
      },
    },
    {$unwind: '$currentProgress'}
  );

  aList.push(
    {$lookup:{
        from:"candidates",
        let:{user:"$user"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$user"]}}},
          {
            $lookup: {
              from: 'labels',
              localField: 'sources',
              foreignField: '_id',
              as: 'sources',
            },
          },
          {
            $lookup: {
              from: 'evaluations',
              localField: 'evaluations',
              foreignField: '_id',
              as: 'evaluations',
            },
          },
          { $addFields:
              {
                rating: {$avg: "$evaluations.rating"},
                evaluations: [],
                applications: []
              }
          },
        ],
        as: 'user'
      }},
    {$unwind: '$user'}
  );




  const aggregate = Application.aggregate(aList);

  let result = await Application.aggregatePaginate(aggregate, options);

}


module.exports = {
  add:add,
  findById:findById,
  findByJobId:findByJobId,
  search:search
}
