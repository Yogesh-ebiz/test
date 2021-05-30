const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
let SearchParam = require('../const/searchParam');
const EvaluationTemplate = require('../models/evaluationtemplate.model');
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

const evaluationTemplateSchema = Joi.object({
  name: Joi.string().required(),
  questions: Joi.array().required(),
  company: Joi.number().required(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional()
});



function findById(id) {
  let data = null;

  if(id==null){
    return;
  }

  console.log(id)
  return EvaluationTemplate.findById(id).populate('questions');
}


function search(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  return EvaluationTemplate.find({company: company}).populate('questions');
}


async function add(form) {
  let data = null;

  if(form==null){
    return;
  }

  console.log(form)
  form = await Joi.validate(form, evaluationTemplateSchema, { abortEarly: false });

  let questions = form.questions;
  delete form.questions;
  let template = await new EvaluationTemplate(form).save();


  for (let question of questions) {
    question._id = new ObjectID();
    question = await questionService.addQuestion(question)
  }

  template.questions = questions;
  template = await template.save();

  return template;

}

async function update(id, form) {
  let data = null;

  if(!id || !form){
    return;
  }

  form = await Joi.validate(form, evaluationTemplateSchema, { abortEarly: false });
  let template = await findById(id);

  console.log(template)
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
          found.required = question.required;
          found.description = question.description;
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

async function remove(questionTemplateId) {
  let data = null;

  if(questionTemplateId==null){
    return;
  }

  let template = await QuestionTemplate.findById(questionTemplateId);
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
