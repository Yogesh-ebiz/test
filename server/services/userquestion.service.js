const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const config = require('../config/config');

const statusEnum = require('../const/statusEnum');
const {buildCandidateUrl} = require('../utils/helper');
const UserQuestion = require('../models/userquestion.model');
const UserAnswer = require('../models/useranswer.model');
const File = require("../models/file.model");
const Benefit = require("../models/benefit.model");



const questionSchema = Joi.object({
  companyId: Joi.number(),
  userId: Joi.number(),
  text: Joi.string(),
  department: Joi.string().allow('').optional(),
});

async function findById(id) {
  if(!id){
    return;
  }

  let question = await UserQuestion.findById(id);

  return question;
}

async function getQuestionResponse(id, pagination) {
  if(!id || !pagination){
    return;
  }

  let answers = await UserAnswer.aggregate([
    {$match: {questionId: id}}
  ]);

  return answers;
}

async function addQuestion(companyId, question) {

  if(!companyId || !question){
    return;
  }
  let result;

  question = await Joi.validate(question, questionSchema, {abortEarly: false});
  question = new UserQuestion(question).save();


  return question;
}

async function addResponse(company, response) {

  if(!company || !response){
    return;
  }

  let result;
  let question = await UserQuestion.findById(ObjectID(response.question));
  if(question) {
    if(question.isDefault){
      let newQuestion = {companyId: company, text: question.text, feature: question.feature, sequence: question.sequence};
      question = await new UserQuestion(newQuestion).save();
      console.log('new', question)
    }

    response.question = question._id;
    result = await new UserAnswer(response).save();
    if (result) {
      question.answers.push(result._id);
      await question.save();
    }
  }
  return result;
}

async function findByCompanyId(companyId) {
  if(!companyId){
    return;
  }

  let questions = await UserQuestion.find({companyId: companyId});
  if(!questions.length){
    questions = await UserQuestion.find({isDefault: true});
  }

  return questions;
}

module.exports = {
  findById: findById,
  getQuestionResponse:getQuestionResponse,
  addQuestion:addQuestion,
  addResponse:addResponse,
  findByCompanyId:findByCompanyId

}
