const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const {ObjectId} = require('mongodb');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Ad = require('../models/ad.model');

const targetService = require('../services/target.service');

const adSchema = Joi.object({
  name: Joi.string(),
  lifetimeBudget: Joi.number(),
  startTime: Joi.number(),
  endTime: Joi.number(),
  bidAmount: Joi.number(),
  billingEvent: Joi.string(),
  optimizationGoal: Joi.string().allow('').optional(),
  targeting: Joi.object(),
  productId: Joi.string().allow('').optional(),
  feedId: Joi.number().optional()
});


async function add(ad) {

  if(!ad){
    return;
  }

  await adSchema.validate(ad, {abortEarly: false});

  let targeting = await targetService.add(ad.targeting);
  ad.targeting = targeting;
  ad = await new Ad(ad).save();

  return ad;

}

async function findById(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid ID');
  }

  return await Ad.findById(id);
}

module.exports = {
  add:add,
  findById:findById

}
