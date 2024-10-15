const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const getJobfunctions = {
  query: Joi.object().keys({
    query:Joi.string().optional().allow(''),
  }),
};


const addJobfunction = {
  body: Joi.object().keys({
    name: Joi.object().required(),
    shortCode: Joi.string(),
    icon: Joi.string().optional().allow(''),
    parent: Joi.number().integer().optional().allow('null')
  }),
};



const getJobfunctionById = {
  params: Joi.object().keys({
    id:Joi.number().custom(objectId),
  }),
};


const updateJobfunction = {
  params: Joi.object().keys({
    id:Joi.number().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.object().required(),
    shortCode: Joi.string(),
    icon: Joi.string().optional().allow(''),
    parent: Joi.number().integer().optional().allow('null')
  }),
};


const deleteJobfunction = {
  params: Joi.object().keys({
    id:Joi.number().custom(objectId),
  }),
};


const addResumeTemplate = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    content: Joi.string().optional().allow('')
  }),
};

const getResumeTemplateById = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
};

const uploadResumeTemplateImage = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
};


module.exports = {
  getJobfunctions,
  addJobfunction,
  getJobfunctionById,
  updateJobfunction,
  deleteJobfunction,
  addResumeTemplate,
  getResumeTemplateById,
  uploadResumeTemplateImage
};
