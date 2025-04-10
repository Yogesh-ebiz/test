const {ObjectId} = require('mongodb');
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
  _id: Joi.string().optional(),
  name: Joi.string().required(),
  questions: Joi.array().required(),
  company: Joi.object().optional(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional(),
  status: Joi.string().optional()
});



function findById(id) {
  let data = null;

  if(id==null){
    return;
  }

  return EvaluationTemplate.findById(id).populate('questions');
}


function search(company, filter) {
  let data = null;

  if(!company || !filter){
    return;
  }
  let $or = [];

  if(filter.all){
    $or.push({company: company}, {default: true, status: {$ne: statusEnum.DISABLED}});
  } else {
    $or.push({company: company,  status: {$ne: statusEnum.DISABLED}}, {default: true, status: {$ne: statusEnum.DISABLED}});
  }

  return EvaluationTemplate.aggregate([
    {$match: {$or: $or}},
    {
      $lookup: {
        from: 'questions',
        localField: 'questions',
        foreignField: '_id',
        as: 'questions',
      },
    },
    {$sort: {default:-1, name: 1}}
  ]);
  // return EvaluationTemplate.find({company: company}).populate('questions');
}


async function add(form) {
  if(!form){
    return;
  }

  await evaluationTemplateSchema.validate(form, { abortEarly: false });
  let questions = form.questions;
  delete form.questions;
  let template = await new EvaluationTemplate(form).save();


  for (let question of questions) {
    question._id = new ObjectId();
    question = await questionService.add(question);
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

  await evaluationTemplateSchema.validate(form, { abortEarly: false });
  let template = await findById(id);

  if(template){
    let questions = [];
    template.name = form.name;
    template.required = form.required;

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

async function remove(questionTemplateId) {
  let data = null;

  if(!questionTemplateId){
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

async function deleteById(id) {
  if(!id){
    return;
  }

  return EvaluationTemplate.findByIdAndDelete(id);
}



async function deactivate(id, member) {
  if(!id || !member){
    return;
  }
  let result = null;
  await EvaluationTemplate.updateOne({_id: id}, {$set: {status: statusEnum.DISABLED, updatedBy: member._id, updatedAt: Date.now()}}).then(async () => {
    result = {success: true};
  });
  return result;
}


async function activate(id, member) {
  if(!id ||  !member){
    return;
  }

  let result;
  await EvaluationTemplate.updateOne({_id: id}, {$set: {status: statusEnum.ACTIVE, updatedBy: member._id, updatedAt: Date.now()}}).then(async () => {
    result = {success: true};
  });

  return result;

}

module.exports = {
  add,
  update,
  remove,
  search,
  findById,
  deactivate,
  activate,
  deleteById
}
