const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Experience = require('../models/experience.model');
const jobType = require('../const/jobType');

const experienceSchema = Joi.object({
  _id: Joi.string().allow('').optional(),
  district: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  employer: Joi.object(),
  description: Joi.string().allow('').optional(),
  employmentTitle: Joi.string().allow('').optional(),
  employmentType: Joi.string().allow('').optional(),
  fromDate: Joi.string().optional(),
  thruDate: Joi.string().optional().allow(''),
  isCurrent: Joi.boolean(),
  terminationReason: Joi.string().allow('').optional(),
  terminationType: Joi.string().allow('').optional(),
  jobFunction: Joi.string().allow('').optional(),
  jobType: Joi.string().allow('').optional(),
  website: Joi.string().allow('').optional(),
});


async function add(form) {
  if(!form){
    return;
  }

  await experienceSchema.validate(form, {abortEarly: false});
  const experience = await new Experience(form).save();
  return experience;
}

function findById(id) {
  if(!id){
    return;
  }

  return Experience.findById(id);
}

async function update(experience) {

  if(!experience){
    return;
  }

  experience = await Joi.validate(experience, experienceSchema, {abortEarly: false});
  experience = await new Experience(experience).save();
  return experience;

}



function remove(id) {
  if(!id){
    return;
  }

  return Experience.findByIdAndDelete(id);
}


module.exports = {
  add,
  findById,
  update,
  remove

}
