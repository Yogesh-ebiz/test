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
  required: Joi.boolean().required(),
  options: Joi.array().optional(),
  noMaxSelection: Joi.number(),
  hint: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional()
});

function findById(questionId) {
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

  question = await Joi.validate(question, questionSchema, {abortEarly: false});
  question = new Question(question).save();

  return question;

}



module.exports = {
  findById:findById,
  addQuestion:addQuestion
}
