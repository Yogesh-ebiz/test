const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const {ObjectId} = require('mongodb');
const _ = require('lodash');
let Pagination = require('../utils/pagination');
const catchAsync = require("../utils/catchAsync");

let SearchParam = require('../const/searchParam');

let statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const taskType = require('../const/taskType');

const feedService = require('../services/api/feed.service.api');
const taskService = require('../services/task.service');
const memberService = require('../services/member.service');
const applicationService = require('../services/application.service');
const messagingService = require('../services/api/messaging.service.api');
const {generateNewTaskEmail} = require('../utils/emailHelper');


const addTask = catchAsync(async (req, res) => {
  const {user, params, query, body} = req;
  const {companyId} = query;
  const {meta} = body;

  meta.applicationId = meta.applicationId ? new ObjectId(meta.applicationId) : null;
  meta.candidate = meta.candidate ? new ObjectId(meta.candidate) : null;

  let newTask = {
    name: body.name,
    type: body.type,
    description: body.description,
    required: body.required,
    startDate: new Date(body.startDate).getTime() < 10000000000 ? new Date(body.startDate).getTime() * 1000 : new Date(body.startDate).getTime(),
    endDate: new Date(body.endDate).getTime() < 10000000000 ? new Date(body.endDate).getTime() * 1000 : new Date(body.endDate).getTime(),
    reminders: body.reminders,
    owner: user._id,
    members: body.members.map(memberId => new ObjectId(memberId)),
    meta: meta,
    priority: body.priority,
  }


  const task = await taskService.add(newTask);
  console.log(task)
  if(task && meta?.applicationId){
    applicationService.addTaskToApplication(new ObjectId(meta.applicationId), task);
  }

  // Fetch member emails
  const members = await memberService.findMembersByIds(newTask.members);
  if (members.length > 0){
    const attendeeEmails = members.map(member => ({
      name: member.firstName + " " + member.lastName,
      email: member.email
    }));
    // Generate and send email
    const emailContent = await generateNewTaskEmail(user, attendeeEmails, newTask);
    await messagingService.sendMail(user.messengerId, user.userId, emailContent);
  }


  res.json(task);
});
const searchTasks = catchAsync(async (req, res) => {

  const {user, params, query, body} = req;

  let result = null;
  if (!body.members || body.members.length === 0) {
    body.members = [new ObjectId(user._id)];
  } else {
    body.members = body.members.map(o => new ObjectId(o));
  }
  result = await taskService.search(body, query, query.query);


  res.json(new Pagination(result));
});
const getTask = catchAsync(async (req, res) => {

  const {user, params, query} = req;
  const {companyId} = query;
  const {taskId} = params;

  let result = null;
  let member = await memberService.findById(user._id);
  if(member){
    result = await taskService.findById(taskId);
  }

  res.json(result);
});

const updateTask = catchAsync(async (req, res) => {
  const {user, params, query, body} = req;
  const {companyId} = query;
  const {taskId} = params;

  let result = null;
  // Convert dates to milliseconds
  if (body.startDate) {
    body.startDate = new Date(body.startDate).getTime() < 10000000000 ? new Date(body.startDate).getTime() * 1000: new Date(body.startDate).getTime();
  }
  if (body.endDate) {
    body.endDate = new Date(body.endDate).getTime() < 10000000000 ? new Date(body.endDate).getTime() * 1000: new Date(body.endDate).getTime();
  }
  body.members = body.members.map(memberId => new ObjectId(memberId));
  body.candidate = body.candidate ? new ObjectId(body.candidate) : null;
  body.updatedBy = user._id;
  result = await taskService.update(taskId, body);
  console.log(result);


  res.json(result);
});

const markComplete = catchAsync(async (req, res) => {
  const {user, params, query, body} = req;
  const {companyId, hasCompleted} = query;
  const {taskId} = params;

  let result = null;
  let member = await memberService.findById(user._id);
  if(member){
    let updateResult;
    if(hasCompleted && hasCompleted === "false"){
      updateResult = await taskService.markInComplete(new ObjectId(taskId), member._id);
    }else{
      updateResult = await taskService.markComplete(new ObjectId(taskId), member._id);
    }
    if(updateResult.modifiedCount > 0){
      result = {success: true};
    }else {
      return res.status(500).json({ success: false, message: 'Failed to mark task as complete. Either the task does not exist or the user is not a member of the task' });
    }
  }else {
    return res.status(500).json({ success: false, message: 'Member not found' });
  }

  res.json(result);
});

const removeTask = catchAsync(async (req, res) => {
  const {user, params, query, body} = req;
  const {companyId} = query;
  const {taskId} = params;

  let result = null;
  result = await taskService.remove(taskId,  user._id).then(async(response) => {
    if(response.acknowledged){
      res.json({success: true});
    }
  });

  res.json(result);
});

module.exports = {
  addTask,
  searchTasks,
  getTask,
  updateTask,
  markComplete,
  removeTask,
}
