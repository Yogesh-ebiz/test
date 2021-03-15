const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
let SearchParam = require('../const/searchParam');
const Question = require('../models/question.model');


async function getQuestionById(questionId, locale) {
  let data = null;

  if(questionId==null){
    return;
  }

  data = Question.findOne({questionId: questionId});
  return data;
}

function deleteQuestionIdById(questionId) {
  let data = null;

  if(questionId==null){
    return;
  }

  return Question.remove({questionId: questionId});
}


module.exports = {
  getQuestionById: getQuestionById,
  deleteQuestionIdById: deleteQuestionIdById
}
