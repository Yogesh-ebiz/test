const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Subscription = require('../models/subscription.model');

const subscriptionSchema = Joi.object({
  subscriptionId: Joi.string(),
  status: Joi.string().allow('').optional(),
  plan: Joi.object(),
  createdDate: Joi.number(),
  startDate: Joi.number(),
  endDate: Joi.number().optional(),
  trialStart: Joi.number().optional(),
  trialEnd: Joi.number().optional(),
  cancelAt: Joi.number().optional(),
  canceledAt: Joi.number().optional(),
  cancelAtPeriodEnd: Joi.string().allow('').optional(),
  type: Joi.string().allow('').optional()
});


async function add(subscription) {

  if(!subscription){
    return;
  }

  subscription = await Joi.validate(subscription, subscriptionSchema, {abortEarly: false});
  subscription = await new Subscription(subscription).save();

  return subscription;

}



async function findById(id) {

  if(!id){
    return;
  }

  return Subscription.findById(id);

}


module.exports = {
  add:add,
  findById:findById
}
