const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Education = require('../models/education.model');

const educationSchema = Joi.object({
  _id: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  institute: Joi.object(),
  degree: Joi.string().allow('').optional(),
  fieldOfStudy: Joi.object().optional(),
  fromDate: Joi.number().optional(),
  thruDate: Joi.number().optional(),
  isCurrent: Joi.boolean(),
  hasGraduated: Joi.boolean(),
  gpa: Joi.number().optional()
});


async function add(education) {

  if(!education){
    return;
  }

  education = await Joi.validate(education, educationSchema, {abortEarly: false});
  education = await new Education(education).save();
  return education;

}


async function update(education) {

  if(!education){
    return;
  }

  return education;

}

module.exports = {
  add:add,
  update:update

}
