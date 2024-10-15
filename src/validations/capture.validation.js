const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const jobSourceEnum = require('../const/sourceType');

const capture = {
    params: Joi.object().keys({
      userId: Joi.number().integer(),
    }),
    query: Joi.object().keys({
      token: Joi.string().allow('').optional(),
      type: Joi.string().valid('VIEWED', 'LIKED', 'SAVED', 'APPLIED', 'SHARED', 'UNLIKE', 'UNSAVE').required(),
      source: Joi.string().valid(...Object.values(jobSourceEnum)).required(),
      subject: Joi.required(),
      subjectType: Joi.string().valid('JOB', 'COMPANY').required(),
    }),
  };

module.exports = {
    capture,
};
