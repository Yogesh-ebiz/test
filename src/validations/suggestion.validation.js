const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


const getSuggestion = {
  query: Joi.object().keys({
    query:Joi.string().allow('').optional()
  }),
};

module.exports = {
  getSuggestion
};
