const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const Assessment = require('../models/assessment.model');
const Joi = require('joi');

const assessmentSchema = Joi.object({
  createdBy: Joi.object(),
  candidateId: Joi.object(),
  workExperience: Joi.number(),
  skillCompetencies: Joi.number(),
  attitude: Joi.number(),
  communication: Joi.number(),
  criticalThinking: Joi.number(),

});


async function addAssessment(assessment) {

  if(!assessment){
    return;
  }

  assessment = await Joi.validate(assessment, assessmentSchema, {abortEarly: false});
  assessment = new Assessment(assessment).save();

  return assessment;

}


module.exports = {
  addAssessment:addAssessment
}
