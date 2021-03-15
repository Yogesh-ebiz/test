const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');

const {getCompanyById,  isPartyActive} = require('../services/party.service');
const {findByUserId} = require('../services/api/feed.service.api');

const {getTemplateById, deleteTemplateById} = require('../services/template.service');

const Template = require('../models/template.model');
const Question = require('../models/question.model');

let Pagination = require('../utils/job.pagination');
let SearchParam = require('../const/searchParam');

const templateSchema = Joi.object({
  templateId: Joi.number().optional(),
  createdBy: Joi.number().required(),
  title: Joi.string().required(),
  category: Joi.string().required(),
  questions: Joi.array().optional(),
});


module.exports = {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate
}

async function createTemplate(currentUserId, template) {

  let result;

  result = await new Template(template).save();
  return result;
}



async function getTemplate(currentUserId, templateId) {


  let template = Template.findOne({templateId:templateId});

  return template;
}


async function updateTemplate(currentUserId, templateId, template) {

  let result = await Template.update({templateId:templateId},{title:template.title,category:template.category});


  return result;
}


async function deleteTemplate(currentUserId,templateId, cat) {


  let result= await Template.deleteMany({category:cat});


  return result;
}
