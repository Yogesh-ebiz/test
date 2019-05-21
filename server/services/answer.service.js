const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const JobRequisition = require('../models/jobrequisition.model');
const Answer = require('../models/answer.model');
const Stage = require('../models/stage.model');
const {addStage} = require('../services/stage.service');
const Joi = require('joi');


const answerSchema = Joi.object({
  _id: Joi.object().optional(),
  answer: Joi.string().allow('').required(),
  options: Joi.array().optional(),
  question: Joi.object()
});

function getAnswerById(answerId) {
  let data = null;

  if(!answerId){
    return;
  }

  return Answer.findById(answerId).populate('question');
}



async function addAnswer(answer) {

  if(!answer){
    return;
  }

  answer.question = ObjectID(answer.question);
  answer = await Joi.validate(answer, answerSchema, {abortEarly: false});
  answer = new Answer(answer).save();

  return answer;

}



module.exports = {
  getAnswerById:getAnswerById,
  addAnswer:addAnswer
}
