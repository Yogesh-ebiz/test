const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const Activity = require('../models/activity.model');
const Joi = require('joi');


const activitySchema = Joi.object({
  causerType: Joi.string(),
  causerId: Joi.string(),
  action: Joi.string().required(),
  subjectType: Joi.string(),
  subjectId: Joi.string(),
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


async function findBySubjectTypeAndSubjectId(subjectType, subjectId, filter) {
  if(!subjectType || !subjectId || !filter){
    return;
  }


  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;


  let select = '';
  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  return Activity.paginate({subjectType: subjectType, subjectId: subjectId}, options);
  // return Activity.find({subjectType: subjectType, subjectId: subjectId});

}


async function findByJobId(jobId, filter) {
  if(!jobId || !filter){
    return;
  }

  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;


  let select = '';
  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };
  return Activity.paginate({'meta.jobId': ObjectID(jobId)}, options);
  // return Activity.find({subjectType: subjectType, subjectId: subjectId});

}


module.exports = {
  addActivity:addActivity,
  findBySubjectTypeAndSubjectId:findBySubjectTypeAndSubjectId,
  findByJobId:findByJobId
}
