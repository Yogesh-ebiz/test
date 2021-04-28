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
  createdBy: Joi.number().required(),
  jobId: Joi.string().required(),
  pipelineTemplateId: Joi.string().required(),
  stages: Joi.array().required()
});

function getPipelineById(pipeLineId) {
  let data = null;

  if(!pipeLineId){
    return;
  }

  return Pipeline.findById(pipeLineId).populate('stages');
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

  let job = await JobRequisition.findById(jobId);

  if(job) {
    newPipeline = await Joi.validate(newPipeline, pipelineSchema, {abortEarly: false});

    let pipeline = null;

    for (let stage of newPipeline.stages) {
      stage._id = new ObjectID();
      stage = await addStage(stage)
    }

    newPipeline = new Pipeline(newPipeline).save();
    job.pipeLine = newPipeline._id;
    job = await job.save();
  }

  return newPipeline;

}



module.exports = {
  getPipelineById:getPipelineById,
  getPipelines:getPipelines,
  addPipeline:addPipeline
}
