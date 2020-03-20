const bcrypt = require('bcrypt');
const Joi = require('joi');
var mongoose = require('mongoose');
const ExperienceLevel = require('../models/experiencelevel.model');
const filterService = require('../services/filter.service');


const jobFunctionSchema = Joi.object({
  name: Joi.string().required()
})


module.exports = {
  insert,
  getExperienceLevels
}

async function insert(experienceLevel) {
  return await new ExperienceLevel(experienceLevel).save();
}


async function getExperienceLevels(query, locale) {
  let localeStr = locale? locale : 'en';
  let data = await filterService.getAllExperienceLevels(query, locale);
  return data;
}
