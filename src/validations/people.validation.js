const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const searchPeople = {
  query: Joi.object().keys({
    direction: Joi.string(),
    sort: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    scroll_token: Joi.string().optional().allow(null).allow('')
  }),
  body: Joi.object().keys({
    options: Joi.object().optional(),
    must: Joi.object().optional(),
    must_not: Joi.object().optional(),
  }),
};
const getPeopleById = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId)
  }),
};
const getPeopleContact = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
    type:Joi.string()
  }),
};


const getPeopleFlagged = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  // body: Joi.object().keys({
  //   jobTitles: Joi.array().optional(),
  //   locations: Joi.array().optional(),
  //   skills: Joi.array().optional(),
  //   companies: Joi.array().optional(),
  //   schools: Joi.array().optional(),
  //   industries: Joi.array().optional(),
  //   employmentTypes: Joi.array().optional(),
  // }),
  query: Joi.object().keys({
    direction: Joi.string(),
    sort: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer()
  }),
};


const addPeopleToBlacklist = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    companyId: Joi.number().integer(),
    type: Joi.string(),
    comment: Joi.string().allow('').optional(),
  }),
};

const removePeopleToBlacklist = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    companyId: Joi.number().integer(),
    type: Joi.string(),
    comment: Joi.string().allow('').optional(),
  }),
};

module.exports = {
  searchPeople,
  getPeopleById,
  getPeopleContact,
  getPeopleFlagged,
  addPeopleToBlacklist
};
