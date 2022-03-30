const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const User = require('../models/user.model');


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

async function findByUserId(userId) {

  if(!userId){
    return;
  }

  let user  = await User.findOne({userId: userId});
  return user;

}



async function getUserLast5Resumes(userId) {

  if(!userId){
    return;
  }

  let user  = await User.findOne({userId: userId}).populate('resumes').sort({createdDate: -1}).limit(5);
  console.log(user)
  return _.orderBy(user.resumes, ['createdDate'], ['desc']);

}


module.exports = {
  register:register,
  findByUserId:findByUserId,
  getUserLast5Resumes:getUserLast5Resumes
}
