const _ = require('lodash');

const statusEnum = require('../const/statusEnum');
const alertEnum = require('../const/alertEnum');

const JobAlert = require('../models/job_alert.model');
const JobRequisition = require('../models/jobrequisition.model');
const Joi = require("joi");


const jobAlertSchema = Joi.object({
  jobId: Joi.number().optional(),
  partyId: Joi.number(),
  title: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  level: Joi.string().allow('').optional(),
  industry: Joi.string().allow('').optional(),
  jobFunction: Joi.string().allow('').optional(),
  employmentType: Joi.string().allow('').optional(),
  distance: Joi.string().allow('').optional(),
  company: Joi.number().allow(null).optional(),
  companySize: Joi.string().allow('').optional(),
  repeat: Joi.string().allow('').optional(),
  notification: Joi.array().optional(),
  status: Joi.string().optional(),
  remote: Joi.boolean().optional()

});

async function add(alert) {
  let data = null;

  if(alert==null){
    return;
  }

  alert = await Joi.validate(alert, jobAlertSchema, { abortEarly: false });
  // alert.notification = [alertEnum.EMAIL, alertEnum.NOTIFICATION];
  // alert.repeat = alertEnum.DAILY;
  return new JobAlert(alert).save();
}

function findJobAlertById(jobAlertId) {
  let data = null;

  if(jobAlertId==null){
    return;
  }

  return JobAlert.findOne({jobAlertId: jobAlertId});
}


function findAlertByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobAlert.findOne({partyId: userId, jobId: jobId});
}


function removeAlertByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobAlert.remove({partyId: userId, jobId: jobId});
}

function removeAlertById(alertId) {
  let data = null;

  if(alertId==null){
    return;
  }

  return JobAlert.deleteOne({jobAlertId: alertId});
}



module.exports = {
  add: add,
  findJobAlertById:findJobAlertById,
  findAlertByUserIdAndJobId: findAlertByUserIdAndJobId,
  removeAlertByUserIdAndJobId: removeAlertByUserIdAndJobId,
  removeAlertById:removeAlertById
}
