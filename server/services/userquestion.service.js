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


async function add(companyId, question) {

  if(!companyId || !question){
    return;
  }
  let result;

  question = await Joi.validate(question, questionSchema, {abortEarly: false});
  question = new UserQuestion(question).save();


  return question;
}



async function findByCompanyId(companyId) {
  if(!companyId){
    return;
  }

  let questions = await UserQuestion.find({companyId: companyId});
  if(!questions){
    questions = await UserQuestion.find({isDefault: true});
  }

  return questions;
}

module.exports = {
  add:add,
  findByCompanyId:findByCompanyId

}
