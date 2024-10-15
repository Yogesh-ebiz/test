const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const config = require('../config/config');

const statusEnum = require('../const/statusEnum');
const JobPreference = require('../models/jobpreferences.model');

const jobPreferenceSchema = Joi.object({
  userId: Joi.number().required(),
  jobTitles: Joi.array().optional(),
  jobTypes: Joi.array().optional(),
  jobLocations: Joi.array().required().optional(),
  openToRelocate: Joi.boolean().optional(),
  openToJob: Joi.boolean().optional(),
  openToRemote: Joi.boolean().optional(),
  startDate: Joi.string().allow(''),
});


async function updateJobPreferences(jobPreferences) {

  if(!jobPreferences){
    return;
  }

  jobPreferences = await Joi.validate(jobPreferences, jobPreferenceSchema, {abortEarly: false});
  jobPreferences = await JobPreference.update({userId:jobPreferences.userId}, {$set:{...jobPreferences}}, {upsert:true})

  return jobPreferences;

}


async function getJobPreferences(userId) {
  if(!userId){
    return;
  }

  return JobPreference.findOne({userId: userId});
}

module.exports = {
  updateJobPreferences:updateJobPreferences,
  getJobPreferences:getJobPreferences

}
