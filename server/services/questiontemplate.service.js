const ObjectID = require('mongodb').ObjectID;
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
  name: Joi.string().required(),
  questions: Joi.array().required(),
  company: Joi.number().required(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional()
});

function getQuestionTemplates(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  return QuestionTemplate.find({company: company}).populate('questions');
}


// async function addQuestionTemplate(form) {
//   let data = null;
//
//   if(form==null){
//     return;
//   }
//
//   form = await Joi.validate(form, questionTemplateSchema, { abortEarly: false });
//
//   for (let question of form.questions) {
//     await Joi.validate(question, questionSchema, { abortEarly: false });
//   }
//
//
//   let template = new QuestionTemplate(form).save();
//   return template;
//
// }

async function addQuestionTemplate(form) {
  let data = null;

  if(form==null){
    return;
  }

  form = await Joi.validate(form, questionTemplateSchema, { abortEarly: false });

  let questions = form.questions;
  delete form.questions;
  let template = await new QuestionTemplate(form).save();


  for (let question of questions) {
    question._id = new ObjectID();
    question = await questionService.addQuestion(question)
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

  form = await Joi.validate(form, questionTemplateSchema, { abortEarly: false });
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
          question = await found.save();
        }

      } else {
        question._id = new ObjectID();
        question = await questionService.addQuestion(question)
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

  if(questionTemplateId==null){
    return;
  }


  let question = await QuestionTemplate.findById(questionTemplateId);
  if(question){
    let result = await question.delete();
    if(result){
      data = {deleted: 1};
    }

  }

  return data;

}

module.exports = {
  addQuestionTemplate:addQuestionTemplate,
  updateQuestionTemplate:updateQuestionTemplate,
  deleteQuestionTemplate:deleteQuestionTemplate,
  getQuestionTemplates: getQuestionTemplates
}
