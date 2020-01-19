const bcrypt = require('bcrypt');
const Joi = require('joi');
const ExperienceLevel = require('../models/experiencelevel.model');

const industrySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  sequence: Joi.string().required()
})

module.exports = {
  insert,
  getAllExperienceLevels,
  getExperienceLevelById
}

async function insert(experience) {
  return await new ExperienceLevel(experience).save();
}

async function getExperienceLevels(locale) {
  return await ExperienceLevel.find()
}

async function getExperienceLevelByType(type, locale) {
  return await ExperienceLevel.find({type: type})
}
