const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Experience = require('../models/experience.model');

const experienceSchema = Joi.object({
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  employer: Joi.object(),
  description: Joi.string().allow('').optional(),
  employmentTitle: Joi.string().allow('').optional(),
  employmentType: Joi.string().allow('').optional(),
  fromDate: Joi.number().optional(),
  thruDate: Joi.number().optional(),
  isCurrent: Joi.boolean(),
  terminationReason: Joi.string().allow('').optional(),
  terminationType: Joi.string().allow('').optional()
});


async function add(experience) {

  if(!experience){
    return;
  }

  experience = await Joi.validate(experience, experienceSchema, {abortEarly: false});
  experience = await new Experience(experience).save();
  return experience;

}


async function update(experience) {

  if(!experience){
    return;
  }

  experience = await Joi.validate(experience, experienceSchema, {abortEarly: false});
  experience = await new Experience(experience).save();
  return experience;

}

module.exports = {
  add:add,
  update:update

}
