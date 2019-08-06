const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const PipelineTemplate = require('../models/pipelineTemplate.model');
const Stage = require('../models/stage.model');
const {addStage} = require('../services/stage.service');
const companyService = require('../services/company.service');


const pipelineSchema = Joi.object({
  name: Joi.string().required(),
  department: Joi.number().optional(),
  category: Joi.string().optional(),
  company: Joi.object(),
  stages: Joi.array().required(),
  createdBy: Joi.number(),
  updatedBy: Joi.number(),
  default: Joi.boolean().optional(),
  custom: Joi.boolean().optional()
});

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return PipelineTemplate.findById(id);
}


function getPipelineTemplates(company) {
  let data = null;

  if(!company){
    return;
  }

  return PipelineTemplate.aggregate([
    {$match: {$or: [{company: company, status: {$ne: statusEnum.DISABLED}}, {default: true, status: {$ne: statusEnum.DISABLED}}]}}
    ]);
}


async function add(newPipeline) {
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

async function update(id, form, member) {
  if(!id || !form || !member){
    return;
  }

  let result = null;

  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });

  let pipeline = await findById(id);
  if(pipeline){
    pipeline.name = form.name;
    pipeline.stages=form.stages;
    pipeline.category=form.category;
    pipeline.department=form.department;
    pipeline.updatedBy = member._id;
    pipeline.updatedDate = Date.now();
    result = await pipeline.save();
  }

  return result;

}



async function deactivate(id, member) {
  if(!id || !member){
    return;
  }
  let result = null;
  result = await PipelineTemplate.update({_id: id}, {$set: {status: statusEnum.DISABLED, updatedBy: member._id, updatedAt: Date.now()}});
  return {success: true};

}


async function activate(id, member) {
  if(!id ||  !member){
    return;
  }
  console.log(id)
  let result = await PipelineTemplate.update({_id: id}, {$set: {status: statusEnum.ACTIVE, updatedBy: member._id, updatedAt: Date.now()}});
  if(result){

  }

  return {success: true};

}

async function remove(id) {

  if(!id){
    return;
  }
  let result = null;
  let pipeline = await findById(id);

  if(pipeline){
    result = await pipeline.delete();
    if(result){
      result = {successed: true};
    }
  }
  return result;

}

async function getDefaultTemplate() {

  return PipelineTemplate.findOne({default: true});

}


module.exports = {
  findById:findById,
  getPipelineTemplates:getPipelineTemplates,
  add:add,
  remove:remove,
  update:update,
  deactivate:deactivate,
  activate:activate,
  getDefaultTemplate: getDefaultTemplate
}
