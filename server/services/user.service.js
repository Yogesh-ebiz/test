const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const User = require('../models/user.model');
const JobPreference = require("../models/jobpreferences.model");

const userSchema = Joi.object({
  userId: Joi.number().allow(null).optional(),
  firstName: Joi.string(),
  middleName: Joi.string().allow('').optional(),
  lastName: Joi.string(),
  email: Joi.string(),
  phoneNumber: Joi.string().allow(null).optional(),
  resumes: Joi.array().optional(),
  preferences: Joi.object().optional(),
  createdBy: Joi.number().allow(null).optional()
});

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

const jobPreferenceSchema = Joi.object({
  jobTitles: Joi.array().optional(),
  jobTypes: Joi.array().optional(),
  jobLocations: Joi.array().required().optional(),
  openToRelocate: Joi.boolean().optional(),
  openToJob: Joi.boolean().optional(),
  openToRemote: Joi.boolean().optional(),
  startDate: Joi.string().allow(''),
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

async function add(form) {

  if(!form){
    return;
  }

  form = await Joi.validate(form, userSchema, {abortEarly: false});
  const user = await new User(form).save();
  return user;

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
  return _.orderBy(user.resumes, ['createdDate'], ['desc']);

}

async function updateJobPreferences(userId, jobPreferences) {

  if(!userId || !jobPreferences){
    return;
  }

  jobPreferences = await Joi.validate(jobPreferences, jobPreferenceSchema, {abortEarly: false});
  let user  = await User.findOne({userId: userId});
  user.preferences = jobPreferences;
  user = await user.save();

  return user.preferences;

}


async function getJobPreferences(userId) {
  if(!userId){
    return;
  }

  let user  = await User.findOne({userId: userId});
  return user?.preferences;
}


module.exports = {
  add:add,
  register:register,
  findByUserId:findByUserId,
  getUserLast5Resumes:getUserLast5Resumes,
  updateJobPreferences: updateJobPreferences,
  getJobPreferences: getJobPreferences
}
