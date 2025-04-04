const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Education = require('../models/education.model');
const feedService = require('../services/api/feed.service.api');


const educationSchema = Joi.object({
  _id: Joi.string().allow('').optional(),
  district: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  institute: Joi.object(),
  degree: Joi.string().allow('').optional(),
  fieldOfStudy: Joi.object().optional(),
  fromDate: Joi.string().optional(),
  thruDate: Joi.string().optional().allow(''),
  isCurrent: Joi.boolean(),
  hasGraduated: Joi.boolean(),
  gpa: Joi.number().optional()
});

async function add(form) {
  if(!form){
    return;
  }

  await educationSchema.validate(form, {abortEarly: false});
  const education = await new Education(form).save();
  return education;
}

function findById(id) {
  if(!id){
    return;
  }

  return Education.findById(id);
}

async function update(education) {

  if(!education){
    return;
  }

  return education;

}

function remove(id) {
  if(!id){
    return;
  }

  return Education.findByIdAndDelete(id);
}


module.exports = {
  add,
  findById,
  update,
  remove

}
