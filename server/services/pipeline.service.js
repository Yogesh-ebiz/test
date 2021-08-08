const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobRequisition = require('../models/jobrequisition.model');
const Pipeline = require('../models/pipeline.model');
const PipelineTemplate = require('../models/pipelineTemplate.model');
const Stage = require('../models/stage.model');
const {addStage} = require('../services/stage.service');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const pipelineSchema = Joi.object({
  name: Joi.string().allow('').optional(),
  createdBy: Joi.number().required(),
  jobId: Joi.object().optional(),
  pipelineTemplateId: Joi.object().required(),
  stages: Joi.array().required(),
  autoRejectBlackList: Joi.boolean().optional(),
  custom: Joi.boolean().optional(),
  default: Joi.boolean().optional()
});



async function add(pipeline) {
  let data = null;

  if(!pipeline){
    return;
  }

  pipeline = await Joi.validate(pipeline, pipelineSchema, {abortEarly: false});

  for (let stage of pipeline.stages) {
    stage._id = new ObjectID();
    stage = await addStage(stage)
  }

  pipeline = new Pipeline(pipeline).save();
  return pipeline;

}


async function remove(id) {
  if(!id){
    return;
  }

  return Pipeline.deleteOne({_id: id});

}


async function findById(id) {
  if(!id){
    return;
  }


  return await Pipeline.findById(id).populate('stages');
}


async function findByJobId(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  data = Pipeline.findOne({jobId: jobId}).populate('stages');
  return data;
}


function getPipelines(company) {
  let data = null;

  if(!company){
    return;
  }

  return Pipeline.find({$or: [{company: company}, {default: true}]}).sort({default: -1});
}


async function addPipeline(jobId, newPipeline) {
  let data = null;

  if(!newPipeline){
    return;
  }

  newPipeline = await Joi.validate(newPipeline, pipelineSchema, {abortEarly: false});

  let pipeline = null;

  for (let stage of newPipeline.stages) {
    stage._id = new ObjectID();
    stage = await addStage(stage)
  }

  newPipeline = new Pipeline(newPipeline).save();


  return newPipeline;

}



async function getDefaultTemplate() {

  return Pipeline.findOne({default: true});

}


module.exports = {
  add:add,
  remove:remove,
  findById:findById,
  getPipelines:getPipelines,
  findByJobId:findByJobId,
  addPipeline:addPipeline,
  getDefaultTemplate:getDefaultTemplate
}
