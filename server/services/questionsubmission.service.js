const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const QuestionSubmission = require('../models/questionsubmission.model');
const Answer = require('../models/answer.model');
const answerService = require('../services/answer.service');
const Joi = require('joi');


const submissionSchema = Joi.object({
  _id: Joi.object().optional(),
  answers: Joi.array().required(),
  createdBy: Joi.number().required(),
});

function getSubmissionById(answerId) {
  let data = null;

  if(!answerId){
    return;
  }

  return Answer.findById(answerId).populate('question');
}



async function addSubmission(submission) {
  let data = null;

  if(!submission){
    return;
  }

  submission = await Joi.validate(submission, submissionSchema, {abortEarly: false});

  let pipeline = null;

  for (let answer of submission.answers) {
    answer._id = new ObjectID();
    answer = await answerService.addAnswer(answer);
  }

  submission = new QuestionSubmission(submission).save();


  return submission;

}



module.exports = {
  getSubmissionById:getSubmissionById,
  addSubmission:addSubmission
}
