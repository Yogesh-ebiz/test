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
  subject: Joi.string().optional(),
  bodyHtml: Joi.string().required(),
  company: Joi.object().optional(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional()
});



function findById(id) {
  if(!id){
    return;
  }

  return EmailTemplate.findById(id);
}


function search(company, filter) {
  if(!company || !filter){
    return;
  }
  let $or = [];

  if(filter.all){
    $or.push({company: company}, {default: true, status: {$ne: statusEnum.DISABLED}});
  } else {
    $or.push({company: company,  status: {$ne: statusEnum.DISABLED}}, {default: true, status: {$ne: statusEnum.DISABLED}});
  }


  return EmailTemplate.aggregate([
    {$match: {$or: $or}},
    {$sort: {default: -1, name: 1}}
  ]);
}


async function add(form) {
  if(!form){
    return;
  }

  await emailTemplateSchema.validate(form, { abortEarly: false });

  const template = await new EmailTemplate(form).save();
  return template;
}

async function update(id, form) {
  if(!id || !form){
    return;
  }

  await emailTemplateSchema.validate(form, { abortEarly: false });
  let template = await findById(id);

  if(template){
    let questions = [];
    template.name = form.name;
    template.subject = form.subject;
    template.bodyHtml = form.bodyHtml;
    template.updatedBy = form.updatedBy;
    template = await template.save();
  }

  return template;
}

async function remove(id) {
  if(!id){
    return;
  }

  let template = await EmailTemplate.findByIdAndDelete(id);

  return template;
}



async function deactivate(id, member) {
  if(!id || !member){
    return;
  }
  let template = null;
  template = await EmailTemplate.findByIdAndUpdate({_id: id}, {$set: {status: statusEnum.DISABLED, updatedBy: member._id, updatedAt: Date.now()}});
  if(template){
    template.status = statusEnum.DISABLED;
  }
  return template;
}


async function activate(id, member) {
  if(!id ||  !member){
    return;
  }

  let template = await EmailTemplate.findByIdAndUpdate({_id: id}, {$set: {status: statusEnum.ACTIVE, updatedBy: member._id, updatedAt: Date.now()}});
  if(template){
    template.status = statusEnum.ACTIVE;
  }

  return template;
}

module.exports = {
  add,
  update,
  remove,
  search,
  findById,
  deactivate,
  activate
}
