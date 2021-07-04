const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Ad = require('../models/ad.model');

const targetService = require('../services/target.service');

const adSchema = Joi.object({
  name: Joi.object(),
  lifetimeBudget: Joi.number(),
  startTime: Joi.number(),
  endTime: Joi.number(),
  bidAmount: Joi.number(),
  billingEvent: Joi.string(),
  optimizationGoal: Joi.string().allow('').optional(),
  targeting: Joi.object(),
  productId: Joi.string().allow('').optional()
});


async function add(ad) {

  if(!ad){
    return;
  }

  ad = await Joi.validate(ad, adSchema, {abortEarly: false});

  let targeting = await targetService.add(ad.targeting);
  ad.targeting = targeting;
  ad = await new Ad(ad).save();

  return ad;

}


module.exports = {
  add:add

}
