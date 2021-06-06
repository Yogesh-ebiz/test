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

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  console.log(id)
  return PipelineTemplate.findById(id);
}


function getPipelineTemplates(company) {
  let data = null;

  if(!company){
    return;
  }

  return PipelineTemplate.find({$or: [{company: company}, {default: true}]}).sort({default: -1});
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

async function update(id, form) {

  if(!id || !form){
    return;
  }

  let result = null;

  form = await Joi.validate(newPipeline, pipelineSchema, { abortEarly: false });

  let pipeline = await findById(id);
  if(pipeline){
    pipeline.name = form.name;
    pipeline.updatedBy = currentUserId;
    pipeline.stages=form.stages;
    pipeline.category=form.category;
    pipeline.department=form.department;
    pipeline.type=form.type;
    result = await pipeline.save();
  }

  return result;

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



module.exports = {
  findById:findById,
  getPipelineTemplates:getPipelineTemplates,
  add:add,
  remove:remove
}
