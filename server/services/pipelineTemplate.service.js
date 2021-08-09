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
  company: Joi.object().optional(),
  stages: Joi.array().required(),
  createdBy: Joi.number().optional(),
  updatedBy: Joi.number().optional(),
  default: Joi.boolean().optional(),
  custom: Joi.boolean().optional(),
  stageMigration: Joi.array().optional()
});


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
    {$match: {$or: [{company: company}, {default: true, status: {$ne: statusEnum.DISABLED}}]}},
    {$lookup:{
        from:"pipelines",
        let:{pipelineTemplateId: '$_id', company: '$company'},
        pipeline:[
          {$match:{$expr:{$eq:["$$pipelineTemplateId","$pipelineTemplateId"]}}},
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
        ],
        as: 'noOfJobs'
      }
    },
    {
      $addFields: {noOfJobs: {$sum: '$noOfJobs.noOfJobs'} }
    }
    ]);
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
  add:add,
  findById:findById,
  getPipelineTemplates:getPipelineTemplates,
  remove:remove,
  update:update,
  deactivate:deactivate,
  activate:activate,
  getDefaultTemplate: getDefaultTemplate
}
