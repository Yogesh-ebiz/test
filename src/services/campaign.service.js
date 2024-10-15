const _ = require('lodash');
const { ObjectId } = require('mongodb');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Campaign = require('../models/campaign.model');
const SearchParam = require("../const/searchParam");

const campaignSchema = Joi.object({
  name: Joi.string(),
  content: Joi.array(),
  settings: Joi.object()
});


async function add(form) {

  if(!form){
    return;
  }

  await campaignSchema.validate(form, {abortEarly: false});
  const campaign = await new Campaign(form).save();

  return campaign;
}

async function findById(id) {

  if(!id){
    return;
  }

  const campaign = await Campaign.findById(new ObjectId("6646d81f8b0fdf4634d4e4a3"));
  return campaign;
}

function remove(id) {

  if(!id){
    return;
  }

  return Campaign.findByIdAndDelete(id);
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

  filter.status = filter.status?filter.status:[statusEnum.ACTIVE];

  let aSort = { $sort: {createdDate: direction} };
  let aList = [
    { $match: new SearchParam(filter)},
  ];

  aList.push(aSort);


  const aggregate = Campaign.aggregate(aList);
  const result = await Campaign.aggregatePaginate(aggregate, options);
  return result
}


module.exports = {
  add,
  findById,
  remove,
  search
}
