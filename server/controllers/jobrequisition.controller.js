const bcrypt = require('bcrypt');
const Joi = require('joi');
const JobRequisition = require('../models/jobrequisition.model');

const jobRequisitionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.any(),
  experienceMonths: Joi.number(),
  lastCurrencyUom: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  isPromoted: Joi.boolean(),
  noOfResources: Joi.any(),
  type: Joi.string(),
  expirationDate: Joi.number(),
  requiredOnDate: Joi.number(),
  salaryRangeLow: Joi.number(),
  salaryRangeHigh: Joi.number(),
  salaryFixed: Joi.any(),
  level: Joi.string(),
  responsibilities: Joi.array(),
  qualifications: Joi.array(),
  skills: Joi.array()
})


module.exports = {
  insert,
  getJobById,
  getJobs
}

async function insert(job) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  return await new JobRequisition(job).save();
}



async function getJobById(id) {

  id=(typeof id !== 'undefined') ? id : null;

  console.log('id', typeof id);
  return await JobRequisition.findById(id);
}


async function getJobs(params) {

  console.log('params', typeof params);
  return await JobRequisition.find({});
}
