const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const EmailTemplate = require('../models/emailtemplate.model');
const questionService = require('../services/question.service');

const evaluationTemplateService = require('../services/evaluationtemplate.service');



const questionSchema = Joi.object({
  type: Joi.string(),
  text: Joi.string().required(),
  hint: Joi.any().optional(),
  options: Joi.array().optional(),
  required: Joi.boolean(),
  noMaxSelection: Joi.number().optional()
});

const emailTemplateSchema = Joi.object({
  name: Joi.string().required(),
  bodyHtml: Joi.string().required(),
  company: Joi.number().required(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional()
});



function findById(id) {
  let data = null;

  if(id==null){
    return;
  }

  return EmailTemplate.findById(id);
}


function search(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  return EmailTemplate.find({company: company});
}


async function add(form) {
  let data = null;

  if(form==null){
    return;
  }

  console.log(form)
  form = await Joi.validate(form, emailTemplateSchema, { abortEarly: false });

  let template = await new EmailTemplate(form).save();
  return template;

}

async function update(id, form) {
  let data = null;

  if(!id || !form){
    return;
  }

  console.log(id, form)
  form = await Joi.validate(form, emailTemplateSchema, { abortEarly: false });
  let template = await findById(id);

  if(template){
    let questions = [];
    template.name = form.name;
    template.bodyHtml = form.bodyHtml;
    template = await template.save();
  }

  return template;

}

async function remove(id) {
  let data = null;

  if(id==null){
    return;
  }

  let template = await EmailTemplate.findById(id);
  if(template){
    template.status = statusEnum.DELETED;
    let result = await template.save();
    if(result){
      data = {success: true};
    }

  }

  return data;

}

module.exports = {
  add:add,
  update:update,
  remove:remove,
  search: search,
  findById:findById
}
