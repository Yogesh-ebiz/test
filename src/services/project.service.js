const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Project = require('../models/project.model');
const Member = require('../models/member.model');
const People = require("../models/people.model");
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const projectSchema = Joi.object({
  company: Joi.object().required(),
  createdBy: Joi.object().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
});

function findById(id) {
  let data = null;
  if(!id){
    return;
  }


  let project = Project.findById(id);
  return project;
}

async function findByCompany(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  let projects = Project.find({company: company});
  return projects
}

async function getCompanyProjects(company, query) {
  let data = null;

  if(!company){
    return;
  }

  let projects = Project.find({company: company});
  return projects
}

async function getMemberProjects(memberId, query) {
  let data = null;

  if(!memberId){
    return;
  }

  let projects = Project.find({$or: [{createdBy: memberId}]});
  return projects;
}

async function searchProject(filter) {
  let data = [];

  if(!filter){
    return data;
  }
  let andList = [];
  let match = {};

  if(filter.memberId){
    andList.push({$or: [{createdBy: filter.memberId}]});
  }

  if(andList.length){
    match = {$and: andList};
  }

  data = Project.find(match);
  return data;
}

async function addProject(project) {
  if(!project){
    return;
  }

  let result;
  await projectSchema.validate(project, {abortEarly: false});
  result = new Project(project).save();

  return result;

}

async function updateProject(projectId, form) {
  if(!projectId || !form){
    return;
  }


  await projectSchema.validate(form, {abortEarly: false});
  let project = await findById(projectId);

  if(project){
    project.name = form.name;
    project.description = form.description;
    result = await project.save();
  }
  return result;

}

async function updateProjectName(projectId, form) {
  if(!projectId || !form){
    return;
  }

  let project = await findById(projectId);
  if(project){
    project.name = form.name;
    project.updatedBy = form.updatedBy;
    result = await project.save();
  }
  return result;
}


async function getProjectPeoples(projectId, options) {
  if(!projectId || !options){
    return;
  }

  const aggregate = Project.aggregate([
    { $match: { _id: projectId } },
    {
      $lookup: {
        from: 'peoples',
        localField: 'people',
        foreignField: '_id',
        as: 'people',
      },
    },
    { $unwind: '$people' },
    { $project: { people:'$people'} }
  ]);


  const peoples = await Project.aggregatePaginate(aggregate, options);
  peoples.docs = _.reduce(peoples.docs, function(res, item){
    const people = new People(item.people);
    res.push(people.transform()); return res;
  }, []);
  return peoples;

}

async function getProjectSettings(projectId) {
  if(!projectId){
    return;
  }

  let settings = {};

  const project = await Project.aggregate([
    { $match: { _id: projectId } },
    {
      $lookup: {
        from: 'members',
        localField: 'viewers',
        foreignField: '_id',
        as: 'viewers',
      },
    },
  ]);

  if(!project){
    return;
  }

  console.log(project)
  const {viewers, shareType, sharePermission, shareLink} = project[0];
  settings.viewers = _.reduce(viewers, function(res, m){
    const member = new Member(m);
    res.push(member.transform());
    return res;}, []);
  settings.shareType = shareType ? shareType : '';
  settings.sharePermission = sharePermission ? sharePermission : '';
  settings.shareLink = shareLink ? shareLink : '';
  return settings;
}
async function getProjectViewers(projectId) {
  if(!projectId){
    return;
  }

  let members = await Project.aggregate([
    { $match: { _id: projectId } },
    {
      $lookup: {
        from: 'members',
        localField: 'viewers',
        foreignField: '_id',
        as: 'viewers',
      },
    },
    { $unwind: '$viewers' },
    { $project: { viewer:'$viewers'} }
  ]);



  // const members = await Project.aggregatePaginate(aggregate, options);
  members = _.reduce(members, function(res, item){
    const member = new Member(item.viewer);
    res.push(member.transform());
    return res;
  }, []);
  return members;
}


module.exports = {
  findById,
  findByCompany,
  getCompanyProjects,
  getMemberProjects,
  searchProject,
  addProject,
  updateProject,
  updateProjectName,
  getProjectPeoples,
  getProjectSettings,
  getProjectViewers
}
