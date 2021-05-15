const _ = require('lodash');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const PipelineTemplate = require('../models/pipelineTemplate.model');
const Stage = require('../models/stage.model');
const {addStage} = require('../services/stage.service');
const ObjectID = require('mongodb').ObjectID;

const pipelineSchema = Joi.object({
  name: Joi.string().required(),
  department: Joi.number().required(),
  category: Joi.string().required(),
  company: Joi.number().required(),
  stages: Joi.array().required(),
  createdBy: Joi.number()
});

function getPipelineTemplateById(pipeLineId) {
  let data = null;

  if(!pipeLineId){
    return;
  }

  return PipelineTemplate.findById(pipeLineId);
}


function getPipelineTemplates(company) {
  let data = null;

  if(!company){
    return;
  }

  return PipelineTemplate.find({$or: [{company: company}, {default: true}]}).sort({default: -1});
}


async function addPipelineTemplate(newPipeline) {
  let data = null;

  newPipeline = await Joi.validate(newPipeline, pipelineSchema, { abortEarly: false });

  if(!newPipeline){
    return;
  }

  let pipeline = null;
  // for (let stage of newPipeline.stages) {
  //   stage._id = new ObjectID();
  //   stage = await addStage(stage)
  // }

  newPipeline = new PipelineTemplate(newPipeline).save();
  return newPipeline;

}



module.exports = {
  getPipelineTemplateById:getPipelineTemplateById,
  getPipelineTemplates:getPipelineTemplates,
  addPipelineTemplate:addPipelineTemplate
}
