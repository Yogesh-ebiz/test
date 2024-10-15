const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getAds = {
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};


module.exports = {
  getAds
};
