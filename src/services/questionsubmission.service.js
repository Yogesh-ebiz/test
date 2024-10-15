const _ = require('lodash');
const { ObjectId } = require('mongodb');

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



async function add(submission) {
  let result = null;
  if(!submission){
    return;
  }

  submissionSchema.validate(submission, {abortEarly: false});

  const { answers } = submission;
  submission.answers = [];
  for (const item of answers) {
    const answer = await answerService.add(item);
    if(answer){
      submission.answers.push(answer._id);
    }
  }

  result = new QuestionSubmission(submission).save();


  return result;

}



module.exports = {
  getSubmissionById:getSubmissionById,
  add
}
