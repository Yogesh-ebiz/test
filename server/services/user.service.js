const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');


const form = Joi.object({
  name: Joi.string(),
  lifetimeBudget: Joi.number(),
  startTime: Joi.number(),
  endTime: Joi.number(),
  bidAmount: Joi.number(),
  billingEvent: Joi.string(),
  optimizationGoal: Joi.string().allow('').optional(),
  targeting: Joi.object(),
  productId: Joi.string().allow('').optional()
});


async function register(form) {

  if(!form){
    return;
  }

  form = await Joi.validate(form, form, {abortEarly: false});
  //
  // let targeting = await targetService.add(ad.targeting);
  // ad.targeting = targeting;
  // ad = await new Ad(ad).save();
  //
  // return user;

}


module.exports = {
  register:register

}
