const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let Pagination = require('../utils/pagination');

let SearchParam = require('../const/searchParam');

let statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const taskType = require('../const/taskType');

const feedService = require('../services/api/feed.service.api');
const taskService = require('../services/task.service');
const memberService = require('../services/member.service');



module.exports = {
  addTask,
  getTask,
  updateTask,
  markComplete,
  closeTask,
  removeTask,
}



async function addTask(companyId, currentUserId, task) {

  if(!companyId || !currentUserId || !task){
    return null;
  }

  let member = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  task.owner = member._id;
  task.members = _.reduce(task.members, function(res, o){res.push(ObjectID(o)); return res;}, []);
  let result = await taskService.add(task);
  return result;

}



async function getTask(companyId, currentUserId, taskId) {
  if(!companyId || !currentUserId || !taskId){
    return null;
  }


  let member = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result = await taskService.findById(taskId);
  return result;

}


async function updateTask(companyId, currentUserId, taskId, task) {

  if(!companyId || !currentUserId || !task){
    return null;
  }

  let member = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  task.updatedBy = member._id
  let result = await taskService.update(taskId, task);
  return result;

}


async function markComplete(companyId, currentUserId, taskId, hasCompleted) {
  if(!companyId || !currentUserId || !taskId){
    return null;
  }


  let result = { success: false };
  let member = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let task = await taskService.markComplete(taskId, hasCompleted, member._id);
  if(task && task.nModified){
    result = {success: true}
  }


  return result;
}

async function closeTask(companyId, currentUserId, taskId, hasCompleted) {
  if(!companyId || !currentUserId || !taskId){
    return null;
  }

  let result = { success: false };
  let member = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let task = await taskService.closeTask(taskId, member._id);
  if(task && task.nModified){
    result = {success: true, status: statusEnum.CLOSED}
  }

  return result;
}



async function removeTask(companyId, currentUserId, taskId) {

  if(!companyId || !currentUserId || !taskId){
    return null;
  }

  let member = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }


  let result = await taskService.remove(taskId,  memberRole.member._id);
  result = {success: true}


  return result;

}

