const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const uploadResume = {
  body: Joi.object().keys({
  }),
};

const generate = {
  body: Joi.object().keys({
  }),
};
module.exports = {
  uploadResume,
  generate
};
