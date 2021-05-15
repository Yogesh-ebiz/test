const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobRequisition = require('../models/jobrequisition.model');
const Question = require('../models/question.model');
const Stage = require('../models/stage.model');
const {addStage} = require('../services/stage.service');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const questionSchema = Joi.object({
  _id: Joi.object().optional(),
  text: Joi.string().required(),
  type: Joi.string().required(),
  hint: Joi.string().allow('').optional(),
  options: Joi.array().optional()
});

function getQuestionById(questionId) {
  let data = null;

  if(!questionId){
    return;
  }

  return Question.findById(questionId).populate('answers');
}



async function addQuestion(question) {

  if(!question){
    return;
  }

  console.log(question)
  question = await Joi.validate(question, questionSchema, {abortEarly: false});
  question = new Question(question).save();

  return question;

}



module.exports = {
  getQuestionById:getQuestionById,
  addQuestion:addQuestion
}
