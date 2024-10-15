const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const getResumeTemplates = {
  query: Joi.object().keys({
    query:Joi.string().optional().allow(''),
  }),
};


module.exports = {
  getResumeTemplates
};
