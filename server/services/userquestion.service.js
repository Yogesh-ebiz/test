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
const CandidateParam = require("../const/candidateParam");
const Candidate = require("../models/candidate.model");



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

async function getQuestionResponses(id, sort) {
  if(!id || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page)+1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;
  const options = {
    page: page,
    limit: limit,
  };

  let aMatch = { $match: {questionId: id}};
  let aSort = { $sort: {createdDate: direction} };

  let aList = [aMatch, aSort];

  let aggregate = UserAnswer.aggregate(aList);
  return await UserAnswer.aggregatePaginate(aggregate, options);
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

async function findByCompanyId(company, sort) {
  if(!company || !sort){
    return;
  }

  // let questions = await UserQuestion.find({companyId: companyId});
  // if(!questions.length){
  //   questions = await UserQuestion.find({isDefault: true});
  // }


  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page)+1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;



  const options = {
    page: page,
    limit: limit,
  };



  let aLookup = [];
  let aMatch = { $match: {companyId: company}};
  let aSort = { $sort: {createdDate: direction} };

  let aList = [aMatch, aSort];
  aList.push({
    $addFields: {
      "totalCount": {$count: "answers"}
    }
  });
  // aList.push(
  //   {$lookup:{
  //     from:"useranswers",
  //     let:{answers: '$answers'},
  //     pipeline:[
  //       {$match:{$expr:{$eq:["$$answers","$_id"]}}},
  //     ],
  //     as: 'answers'
  //   }});

  let aggregate = UserQuestion.aggregate(aList);
  let result = await UserQuestion.aggregatePaginate(aggregate, options);

  if(!result.docs.length){
    aMatch = { $match: {isDefault: true}};
    aggregate = UserQuestion.aggregate([aMatch, aSort]);
    result = await UserQuestion.aggregatePaginate(aggregate, options);
  }

  const mostResponses = _.maxBy(result.docs, 'answers');
  console.log(mostResponses)
  for(q of result.docs){
    // console.log(q)
  }

  return result;
}

module.exports = {
  findById: findById,
  getQuestionResponses:getQuestionResponses,
  addQuestion:addQuestion,
  addResponse:addResponse,
  findByCompanyId:findByCompanyId

}
