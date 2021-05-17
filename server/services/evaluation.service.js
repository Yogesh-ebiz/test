const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const Evaluation = require('../models/evaluation.model');
const Joi = require('joi');


const evaulationSchema = Joi.object({
  createdBy: Joi.number().optional(),
  applicationId: Joi.object(),
  applicationProgressId: Joi.object(),
  rating: Joi.number(),
  assessment: Joi.object().optional(),
  answer: Joi.array().optional()
});

async function addEvaluation(evaluation) {

  if(!evaluation){
    return;
  }

  evaluation = await Joi.validate(evaluation, evaulationSchema, {abortEarly: false});
  evaluation = new Evaluation(evaluation).save();

  return evaluation;

}


async function findByUserIdAndProgressId(userId, applicationProgressId) {
  if(!userId || !applicationProgressId){
    return;
  }

  return Evaluation.findOne({createdBy: userId, applicationProgressId: applicationProgressId});

}


module.exports = {
  addEvaluation:addEvaluation,
  findByUserIdAndProgressId:findByUserIdAndProgressId
}
