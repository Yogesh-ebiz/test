const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const Activity = require('../models/activity.model');
const Joi = require('joi');


const activitySchema = Joi.object({
  applicationId: Joi.object().required(),
  createdBy: Joi.number().required(),
  action: Joi.string().required(),
  type: Joi.string().required(),
  meta: Joi.object().optional(),
});


async function addActivity(activity) {

  if(!activity){
    return;
  }

  activity = await Joi.validate(activity, activitySchema, {abortEarly: false});
  activity = new Activity(activity).save();

  return activity;

}



module.exports = {
  addActivity:addActivity
}
