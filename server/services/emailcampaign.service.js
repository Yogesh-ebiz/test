const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const EmailCampaign = require('../models/emailcampaign.model');
const Joi = require('joi');


const emailCampaignSchema = Joi.object({
  causerType: Joi.string(),
  causerId: Joi.string(),
  action: Joi.string().required(),
  subjectType: Joi.string(),
  subjectId: Joi.string(),
  meta: Joi.object().optional(),
});


async function add(emailCampaign) {

  if(!emailCampaign){
    return;
  }

  emailCampaign = await Joi.validate(emailCampaign, emailCampaignSchema, {abortEarly: false});
  emailCampaign = new EmailCampaign(emailCampaign).save();
  return activity;

}


async function findByEmailAndJobId(email, jobId) {
  if(!email || !jobId){
    return;
  }

  return EmailCampaign.findOne({email: email, jobId: jobId}).populate('stages');
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
  add:add,
  findByEmailAndJobId:findByEmailAndJobId,
  findByJobId:findByJobId
}
