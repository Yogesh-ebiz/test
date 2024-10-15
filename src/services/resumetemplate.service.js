const _ = require('lodash');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const ResumeTemplate = require("../models/resumetemplate.model");



const resumeTemplateSchema = Joi.object({
  name: Joi.string(),
  content: Joi.string().optional().allow(''),
});


async function add(form) {
  let data = null;

  if(!form){
    return;
  }

  await resumeTemplateSchema.validate(form, {abortEarly: false});
  let template = await new ResumeTemplate(form).save();
  return template;
}
function findById(id) {
  if(!id){
    return;
  }

  return ResumeTemplate.findById(id);
}

function find(criteria) {
  criteria = criteria || {};

  return ResumeTemplate.find(criteria);
}


module.exports = {
  add,
  findById,
  find
}
