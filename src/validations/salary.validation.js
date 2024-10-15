const Joi = require('joi');
const {  objectId } = require('./custom.validation');

const getSalaryByJobTitle = {
  query: Joi.object().keys({
    query:Joi.string()
  }),
};
const getTopPayingCompanies = {
  query: Joi.object().keys({
    jobFunction:Joi.string().optional().allow(null)
  }),
};
const search = {
  query: Joi.object().keys({
    title:Joi.string(),
    city: Joi.string().optional().allow(null),
    state: Joi.string().optional().allow(null),
    country: Joi.string().optional().allow(null)
  }),
};


module.exports = {
  getSalaryByJobTitle,
  getTopPayingCompanies,
  search
};
