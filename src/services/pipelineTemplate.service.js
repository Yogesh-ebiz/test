const _ = require('lodash');
const Joi = require('joi');
const { ObjectId } = require('mongodb');

const statusEnum = require('../const/statusEnum');
const PipelineTemplate = require('../models/pipelineTemplate.model');
const Stage = require('../models/stage.model');
const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');
const stageService = require('../services/stage.service');
const companyService = require('../services/company.service');
const pipelineService = require('./jobpipeline.service');
const applicationProgressService = require('../services/applicationprogress.service');


const pipelineSchema = Joi.object({
  name: Joi.string().required(),
  department: Joi.object().optional(),
  category: Joi.string().optional(),
  company: Joi.object(),
  createdBy: Joi.object(),
  stages: Joi.array(),
  updatedBy: Joi.number().optional(),
  default: Joi.boolean().optional(),
  custom: Joi.boolean().optional(),
  stageMigration: Joi.array().optional(),
  autoRejectBlackList: Joi.boolean().optional()
});


async function add(newPipeline) {
  let data = null;
  if(!newPipeline){
    return;
  }

  await pipelineSchema.validate(newPipeline, { abortEarly: false });
  // for (let stage of newPipeline.stages) {
  //   stage._id = new ObjectID();
  //   stage = await addStage(stage)
  // }

  let pipeline = new PipelineTemplate(newPipeline).save();
  return pipeline;

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
    {
      $match: {
        $or: [
          { company: company },
          { default: true, status: { $ne: statusEnum.DISABLED } }
        ]
      }
    },
    {
      $lookup: {
        from: "jobpipelines",
        let: { pipelineTemplateId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$pipelineTemplateId", "$$pipelineTemplateId"] },
                  { $eq: ["$company", company] }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "jobrequisitions",
              localField: "_id",
              foreignField: "pipeline",
              as: "jobs"
            }
          },
          {
            $unwind: "$jobs"
          },
          {
            $group: {
              _id: null,
              noOfJobs: { $sum: 1 },
              noOfActiveJobs: {
                $sum: {
                  $cond: [{ $eq: ["$jobs.status", statusEnum.ACTIVE] }, 1, 0]
                }
              }
            }
          }
        ],
        as: 'jobCounts'
      }
    },
    {
      $addFields: {
        noOfJobs: { $ifNull: [{ $arrayElemAt: ["$jobCounts.noOfJobs", 0] }, 0] },
        noOfActiveJobs: { $ifNull: [{ $arrayElemAt: ["$jobCounts.noOfActiveJobs", 0] }, 0] }
      }
    },
    {
      $project: {
        jobCounts: 0,
        createdBy: 0,
        updatedBy: 0,
        company: 0
      }
    },
    {
      $sort: {
        default: -1,
        name: 1
      }
    }
  ]);

}



async function update(id, form, jobId) {
  if(!id || !form){
    return;
  }

  let result = null;

  await pipelineSchema.validate(form, { abortEarly: false });
  let template = await findById(id);
  
  if(template){
    template.name = form.name;
    template.stages=form.stages;
    template.category=form.category;
    template.department=form.department;
    template.updatedDate = Date.now();
    template.autoRejectBlackList = form.autoRejectBlackList;
    result = await template.save();
    
  }
  return result;
}



async function deactivate(id, member) {
  if(!id || !member){
    return;
  }
  let result = null;
  result = await PipelineTemplate.findOneAndUpdate({_id: id}, {$set: {status: statusEnum.DISABLED, updatedBy: member._id, updatedAt: Date.now()}});
  return {success: true};

}


async function activate(id, member) {
  if(!id ||  !member){
    return;
  }

  let result = await PipelineTemplate.findOneAndUpdate({_id: id}, {$set: {status: statusEnum.ACTIVE, updatedBy: member._id, updatedAt: Date.now()}});
  return {success: true};

}

async function remove(id) {

  if(!id){
    return;
  }
  let pipeline = await PipelineTemplate.findOneAndDelete({_id: id});

  return pipeline;
}

async function getDefaultTemplate() {

  return PipelineTemplate.findOne({default: true});

}


module.exports = {
  add,
  findById,
  getPipelineTemplates,
  remove,
  update,
  deactivate,
  activate,
  getDefaultTemplate
}
