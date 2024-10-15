const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const getById = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
};
const uploadCV = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};

module.exports = {
  getById,
  uploadCV
};
