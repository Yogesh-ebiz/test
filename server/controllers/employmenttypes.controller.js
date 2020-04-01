const bcrypt = require('bcrypt');
const Joi = require('joi');
const EmploymentType = require('../models/employmenttypes.model');
const filterService = require('../services/filter.service');

const industrySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  sequence: Joi.string().required()
})

module.exports = {
  insert,
  getEmploymentTypes,
  getEmploymentTypeById
}

async function insert(employmenttype) {
  return await new EmploymentType(employmenttype).save();
}

async function getEmploymentTypes(query, locale) {
  let localeStr = locale? locale : 'en';


  let data = await filterService.getAllEmploymentTypes(query, locale)
  return data;
}

async function getEmploymentTypeById(id, locale) {
  let localeStr = locale? locale : 'en';
  let data = await EmploymentType.aggregate([
    { $match: { id: parseInt(id) },  },
    { $project: {id: 1, description: 1, shortCode: 1, sequence: 1, name: '$name.' + localeStr }}
  ]);
  return data?data[0]:null;
}
