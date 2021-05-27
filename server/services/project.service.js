const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Project = require('../models/project.model');
const MemberInvitation = require('../models/memberInvitation.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const feedService = require('../services/api/feed.service.api');


const projectSchema = Joi.object({
  company: Joi.number().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
});



async function findByCompany(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  let projects = Project.find({company: company});
  return projects
}

function findPoolBy_Id(poolId) {
  let data = null;

  if(poolId==null){
    return;
  }

  let pool = Pool.findById(poolId);
  return pool
}


async function getProjects(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  let projects = Project.find({company: company});
  return projects
}

function findProjectBy_Id(projectId) {
  let data = null;
  if(!projectId){
    return;
  }


  let project = Project.findById(projectId);
  return project
}

async function addProject(currentUserId, project) {
  if(!currentUserId || !project){
    return;
  }


  let result;
  project = await Joi.validate(project, projectSchema, {abortEarly: false});
  project.createdBy = currentUserId;
  result = new Project(project).save();

  return result;

}

async function updateProject(projectId, form) {
  if(!projectId || !form){
    return;
  }


  form = await Joi.validate(form, projectSchema, {abortEarly: false});
  let project = await findProjectBy_Id(projectId);

  if(project){
    project.name = form.name;
    project.description = form.description;
    result = await project.save();
  }
  return result;

}


module.exports = {
  findByCompany:findByCompany,
  getProjects:getProjects,
  addProject:addProject,
  findProjectBy_Id:findProjectBy_Id,
  updateProject:updateProject
}
