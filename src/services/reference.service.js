const _ = require('lodash');
const Joi = require('joi');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const Reference = require('../models/reference.model');



const referenceSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().allow(''),
  phone: Joi.string().allow(''),
  title: Joi.string().allow(''),
  relationship: Joi.string().allow(''),
  company: Joi.string().allow(''),
});

async function add(form) {
  if(!form){
    return null;
  }

  await referenceSchema.validate(form, {abortEarly: false});
  return new Reference(form).save();
}

module.exports = {
  add
}
