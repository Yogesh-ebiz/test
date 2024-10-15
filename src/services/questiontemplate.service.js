const {ObjectId} = require('mongodb');
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
let SearchParam = require('../const/searchParam');
const QuestionTemplate = require('../models/questiontemplate.model');
const questionService = require('../services/question.service');



const questionSchema = Joi.object({
  type: Joi.string(),
  text: Joi.string().required(),
  hint: Joi.any().optional(),
  options: Joi.array().optional(),
  required: Joi.boolean(),
  noMaxSelection: Joi.number().optional()
});

const questionTemplateSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().required(),
  questions: Joi.array().required(),
  company: Joi.number().required(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional(),
  status: Joi.string().optional()
});

function getQuestionTemplates(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  return QuestionTemplate.find({ $or: [{company}, {default: true}]})
                          .populate('questions')
                          .sort({ default: -1, name: 1 });;
}


async function findById(id) {
  if(!id){
    return;
  }

  let template = await QuestionTemplate.findById(id).populate('questions');
  return template;

}


async function addQuestionTemplate(form) {
  if(!form){
    return;
  }

  await questionTemplateSchema.validate(form, { abortEarly: false });
  let questions = form.questions;
  delete form.questions;
  let template = await new QuestionTemplate(form).save();
  for (let question of questions) {
    question._id = new ObjectId();
    question = await questionService.add(question)
  }

  template.questions = questions;
  template = await template.save();
  return template;
}

async function updateQuestionTemplate(id, form) {
  let data = null;

  if(!id || !form){
    return;
  }

  await questionTemplateSchema.validate(form, { abortEarly: false });
  let template = await QuestionTemplate.findById(id);

  if(template){
    let questions = [];
    template.name = form.name;

    for (let question of form.questions) {

      if (question._id) {
        let found = await questionService.findById(question._id);

        if (found) {
          found.type = question.type;
          found.text = question.text;
          found.hint = question.hint;
          found.noMaxSelection = question.noMaxSelection;
          found.options = question.options;
          found.status = question.status?question.status:found.status;
          question = await found.save();
        }

      } else {
        question._id = new ObjectId();
        question = await questionService.add(question)
      }
      questions.push(question._id);
    }

    template.questions = questions;
    template = await template.save();
  }

  return template;

}

async function deleteQuestionTemplate(questionTemplateId) {
  let data = null;

  if(!questionTemplateId){
    return;
  }


  let question = await QuestionTemplate.findById(questionTemplateId);
  if(question){
    let result = await QuestionTemplate.findByIdAndDelete(questionTemplateId);
    if(result){
      data = {success: true};
    }

  }

  return data;

}


async function deactivate(id, member) {
  if(!id || !member){
    return;
  }

  let result = null;

  result = await QuestionTemplate.findByIdAndUpdate({_id: id}, {$set: {status: statusEnum.DISABLED, updatedBy: member._id, updatedAt: Date.now()}});
  return {success: true};

}


async function activate(id, member) {
  if(!id ||  !member){
    return;
  }

  let result = await QuestionTemplate.findByIdAndUpdate({_id: id}, {$set: {status: statusEnum.ACTIVE, updatedBy: member._id, updatedAt: Date.now()}});
  if(result){

  }

  return {success: true};

}

module.exports = {
  findById,
  addQuestionTemplate,
  updateQuestionTemplate,
  deleteQuestionTemplate,
  getQuestionTemplates,
  deactivate,
  activate
}
