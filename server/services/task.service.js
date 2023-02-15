const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const statusEnum = require('../const/statusEnum');
const TaskSearchParam = require('../const/taskSearchParam');

const Task = require('../models/task.model');
const Application = require('../models/application.model');

const applicationService = require('../services/application.service');


const taskSchema = Joi.object({
  _id: Joi.string().optional(),
  updatedBy: Joi.object().optional(),
  required: Joi.boolean().optional(),
  type: Joi.string().allow('').optional(),
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  members: Joi.array().required(),
  owner: Joi.object().optional(),
  createdDate: Joi.number().optional(),
  updatedDate: Joi.number().optional(),
  startDate: Joi.number().optional(),
  endDate: Joi.number(),
  meta: Joi.object().optional(),
  priority: Joi.number().optional(),
  notes: Joi.string().allow('').optional(),
  reminders: Joi.array().optional(),
  tags: Joi.array().optional(),
  order: Joi.number().optional(),
  hasCompleted: Joi.boolean().optional(),
  status: Joi.string().optional(),
});

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return Task.findById(id).populate('members').populate('owner');
}


async function add(task) {
  let data = null;

  if(!task){
    return;
  }

  task = await Joi.validate(task, taskSchema, { abortEarly: false });

  task = await new Task(task).save();
  return task;

}


async function update(id, form) {
  if(!id || !form){
    return;
  }


  form = await Joi.validate(form, taskSchema, { abortEarly: false });
  let task = await findById(id);
  let result = null;

  if(!task || (task.owner && !task.owner.equals(form.updatedBy))){
    return;
  }

  task.name = form.name;
  task.description = form.description;
  task.members = form.members;
  task.type = form.type;
  task.startDate = form.startDate;
  task.endDate = form.endDate;
  task.meta = form.meta;
  task.reminders = form.reminders;
  task.notes = form.notes;
  task.priority = form.priority;
  task.tags = _.reduce(form.tags, function(res, o){res.push(ObjectID(o)); return res;}, []);
  result = await task.save();


  return result;

}



async function remove(id) {
  let data = null;

  if(id==null){
    return;
  }


  let task = await Task.deleteOne({_id: id});
  return task;

}

async function markComplete(id, memberId) {
  let data = null;

  if(!id || !memberId){
    return;
  }

  let task = await Task.updateOne({_id: id, $or: [{members: memberId}, {owner: memberId}]}, { $set: {status: statusEnum.COMPLETED, hasCompleted:true} });
  return task;

}



async function getTasksDueSoon(member) {
  let result = null;

  if(!member){
    return;
  }

  let today = Date.now();
  let tasks = await Task.aggregate([
    {$match: {members: member._id, status: {$ne: statusEnum.COMPLETED}, endDate: {$gt: today}} },
    {$sort: {endDate: 1}},
    {$limit: 5}
  ]);

  return tasks;
}


async function search(filter, sort, query) {
  let result = null;
  if(!filter || !sort){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  let aList = [];
  // let $match = {$or: [{members: [memberId]}, {owner: memberId}], status: filter.status};
  let $match = new TaskSearchParam(filter)
  if(query){
    $match.name = {$regex: query, $options: 'i'};
  }

  if(filter.application) {
    $match['meta.application'] = {$exists: true};
  }

  let aMatch = { $match:  $match};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);
  aList.push(aSort);

  let aggregate = Task.aggregate(aList);
  let tasks = await Task.aggregatePaginate(aggregate, options);

  return tasks;
}


module.exports = {
  findById:findById,
  add:add,
  update:update,
  remove:remove,
  markComplete:markComplete,
  getTasksDueSoon:getTasksDueSoon,
  search: search
}
