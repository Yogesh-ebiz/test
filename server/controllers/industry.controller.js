const bcrypt = require('bcrypt');
const Joi = require('joi');
const Industry = require('../models/industry.model');
const filterService = require('../services/filter.service');

const industrySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  sequence: Joi.string().required()
})

module.exports = {
  insert,
  getAllIndustries,
  getIndustryById
}

async function insert(experience) {
  return await new ExperienceLevel(experience).save();
}

async function getAllIndustries(query, locale) {
  let localeStr = locale? locale : 'en';

  let data = await filterService.getAllIndustries(query, locale);
  return data;
}

async function getIndustryById(id, locale) {
  let localeStr = locale? locale : 'en';
  let data = await Industry.aggregate([
    { $match: { id: parseInt(id) },  },
    { $project: {id: 1, description: 1, shortCode: 1, sequence: 1, name: '$name.' + localeStr }}
  ]);
  return data?data[0]:null;
}
