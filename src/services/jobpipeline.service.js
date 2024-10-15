const _ = require('lodash');
const {ObjectId} = require('mongodb');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const JobPipeline = require('../models/jobpipeline.model');
const stageService = require('./stage.service');
const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');



const pipelineSchema = Joi.object({
  name: Joi.string().allow('').optional(),
  createdBy: Joi.object().optional(),
  updatedBy: Joi.object().optional(),
  company: Joi.object().optional(),
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
  if(!form){
    return;
  }
  console.log(`form: ${form}`);
  const { error, value } = pipelineSchema.validate(form, { abortEarly: false });

  if (error) {
    throw new Error(`Validation Error: ${error.details.map(e => e.message).join(', ')}`);
  }

  let pipeline = new JobPipeline(value).save();
  return pipeline;

}


async function update(id, form, jobId) {
  let data = null;

  if(!id || !form || !jobId){
    return;
  }

  await pipelineSchema.validate(form, { abortEarly: false });

  let pipeline = await findByJobId(jobId);
  let oldPipeline = pipeline;
  let oldStages = _.clone(oldPipeline.stages);
  if(pipeline){
    pipeline.name = form.name;
    pipeline.category=form.category;
    pipeline.department=form.department;
    pipeline.stages=form.stages;
    pipeline.autoRejectBlackList = form.autoRejectBlackList;
    pipeline.pipelineTemplateId = form._id;
    pipeline.updatedDate = Date.now();
    let result = await pipeline.save();

    let stageMigration = form.stageMigration;
    if(stageMigration?.length > 0 && result){
      let newStages = _.clone(pipeline.stages);

      // Find all applications for the job
      const applications = await Application.aggregate([
        { $match: { job: pipeline.jobId } },
        { $project: { progress: 1, _id: 0 } }
      ]);
      if (!applications.length) {
        return pipeline;
      }

      // Flatten the progress IDs into a single array
      const applicationProgressIds = applications.flatMap(app => app.progress);

      for (let migration of stageMigration){
        const oldStage = oldStages[migration.old];
        const newStage = newStages[migration.new];
        if(oldStage && newStage){
          await ApplicationProgress.updateMany(
            { _id: { $in: applicationProgressIds }, stage: oldStage.type },
            { $set: { stage: newStage.type } }
          );
        }
      }
    }
    
  }
  return pipeline;

}


async function remove(id) {
  if(!id){
    return;
  }

  return JobPipeline.deleteOne({_id: id});

}


async function findById(id) {
  if(!id){
    return;
  }


  return await JobPipeline.findById(id).populate('stages');
}


async function findByJobId(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  data = JobPipeline.findOne({jobId: jobId});
  return data;
}


async function findByPipelineTemplateId(templateId) {
  let data = null;

  if(!templateId){
    return;
  }

  data = JobPipeline.findOne({pipelineTemplateId: templateId}).populate('stages');
  return data;
}

async function findAllByPipelineTemplateId(templateId) {
  let data = null;

  if(!templateId){
    return;
  }

  return JobPipeline.find({pipelineTemplateId: templateId});
}


function findByCompany(company) {
  let data = null;

  if(!company){
    return;
  }

  return JobPipeline.aggregate([
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

  return JobPipeline.find({$or: [{company: company}, {default: true}]}).sort({default: -1});
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

  newPipeline = new JobPipeline(newPipeline).save();


  return newPipeline;

}



async function getDefaultTemplate() {

  return JobPipeline.findOne({default: true});

}


async function deactivate(id, member) {
  if(!id || !member){
    return;
  }
  let result = null;
  result = await JobPipeline.update({_id: id}, {$set: {status: statusEnum.DISABLED, updatedBy: member._id, updatedAt: Date.now()}});
  return {success: true};

}


async function activate(id, member) {
  if(!id ||  !member){
    return;
  }
  let result = await JobPipeline.update({_id: id}, {$set: {status: statusEnum.ACTIVE, updatedBy: member._id, updatedAt: Date.now()}});
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
