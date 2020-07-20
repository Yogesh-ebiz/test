const bcrypt = require('bcrypt');
const Joi = require('joi');
const Industry = require('../models/industry.model');
const filterService = require('../services/filter.service');


module.exports = {
  getAllCategories
}

async function getAllCategories(query, locale) {
  let localeStr = locale? locale : 'en';

  let data = await filterService.getAllCategories(query, locale);
  return data;
}
