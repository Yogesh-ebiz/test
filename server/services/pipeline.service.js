const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobRequisition = require('../models/jobrequisition.model');
const Pipeline = require('../models/pipeline.model');
const PipelineTemplate = require('../models/pipelineTemplate.model');
const Stage = require('../models/stage.model');
const stageService = require('../services/stage.service');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const pipelineSchema = Joi.object({
  name: Joi.string().allow('').optional(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional(),
  company: Joi.object(),
  stages: Joi.array().required(),
  department: Joi.number().optional(),
  category: Joi.string().optional(),
  jobId: Joi.object().optional(),
  pipelineTemplateId: Joi.object().optional(),
  autoRejectBlackList: Joi.boolean().optional(),
  custom: Joi.boolean().optional(),
  default: Joi.boolean().optional(),
  stageMigration: Joi.array().optional()
});



async function add(form) {
  let data = null;

  if(!form){
    return;
  }

  form = await Joi.validate(form, pipelineSchema, {abortEarly: false});

  for (let stage of form.stages) {
    stage._id = new ObjectID();
    stage = await stageService.addStage(stage)
  }

  let pipeline = new Pipeline(form).save();
  return pipeline;

}


async function update(id, form) {
  let data = null;

  if(!id || !form){
    return;
  }

  form = await Joi.validate(form, pipelineSchema, {abortEarly: false});

  let pipeline = await findById(id);
  console.log(pipeline)
  if(pipeline){
    pipeline.name = form.name;
    pipeline.category=form.category;
    pipeline.department=form.department;
    pipeline.updatedDate = Date.now();

    let newStages = [];
    for(let [i, stage] of pipeline.stages.entries()){
      let existStage = _.find(form.stages, {type: stage.type});
      if(!existStage){
        await stage.delete();
        pipeline.stages.splice(i, 1);
      }
    }

    for(let [i, stage] of form.stages.entries()){
      let existStage = _.find(pipeline.stages, {type: stage.type});
      if(existStage){
        existStage = await existStage.save();
        newStages.push(existStage._id);
      } else {
        stage._id = new ObjectID();
        let newStage = await stageService.addStage(stage);
        newStages.push(newStage._id)
      }
    }
    pipeline.stages = newStages;
    pipeline = await pipeline.save();
  }
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


async function findByPipelineTemplateId(templateId) {
  let data = null;

  if(!templateId){
    return;
  }

  data = Pipeline.findOne({pipelineTemplateId: templateId}).populate('stages');
  return data;
}

async function findAllByPipelineTemplateId(templateId) {
  let data = null;

  if(!templateId){
    return;
  }

  return Pipeline.find({pipelineTemplateId: templateId}).populate('stages');;
}


function findByCompany(company) {
  let data = null;

  if(!company){
    return;
  }

  return Pipeline.aggregate([
    {$match: {$or: [{company: company}, {default: true, status: {$ne: statusEnum.DISABLED}}]}},
    {
      $lookup: {
        from: 'stages',
        localField: 'stages',
        foreignField: '_id',
        as: 'stages',
      },
    },
    {$lookup:{
        from:"jobrequisitions",
        let:{pipelineId: '$_id'},
        pipeline:[
          {$match:
              {$and: [
                  {$expr:{$eq:["$$pipelineId","$pipeline"]}},
                  {$expr:{$eq:[company,"$company"]}}
                ]}
          },
        ],
        as: 'noOfJobs'
      }},
    {
      $addFields: {noOfJobs: {$size: '$noOfJobs'} }
    }
  ]);
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
    stage = await stageService.addStage(stage)
  }

  newPipeline = new Pipeline(newPipeline).save();


  return newPipeline;

}



async function getDefaultTemplate() {

  return Pipeline.findOne({default: true});

}


async function deactivate(id, member) {
  if(!id || !member){
    return;
  }
  let result = null;
  result = await Pipeline.update({_id: id}, {$set: {status: statusEnum.DISABLED, updatedBy: member._id, updatedAt: Date.now()}});
  return {success: true};

}


async function activate(id, member) {
  if(!id ||  !member){
    return;
  }
  let result = await Pipeline.update({_id: id}, {$set: {status: statusEnum.ACTIVE, updatedBy: member._id, updatedAt: Date.now()}});
  return {success: true};

}




module.exports = {
  add:add,
  update:update,
  remove:remove,
  findById:findById,
  findByJobId:findByJobId,
  findByPipelineTemplateId:findByPipelineTemplateId,
  findAllByPipelineTemplateId:findAllByPipelineTemplateId,
  findByCompany:findByCompany,
  getPipelines:getPipelines,
  addPipeline:addPipeline,
  getDefaultTemplate:getDefaultTemplate,
  deactivate:deactivate,
  activate:activate
}
