const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const statusEnum = require('../const/statusEnum');
const Task = require('../models/task.model');
const Application = require('../models/application.model');

const applicationService = require('../services/application.service');


const taskSchema = Joi.object({
  required: Joi.boolean().required(),
  type: Joi.string().required(),
  name: Joi.string().required(),
  member: Joi.object().required(),
  startDate: Joi.number(),
  endDate: Joi.number(),
  meta: Joi.object().optional()
});

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return Task.findById(id);
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

  let task = await Task.updateOne({_id: id, member: memberId}, { $set: {status: statusEnum.COMPLETED, hasCompleted:true} });
  return task;

}



async function getTasksDueSoon(member) {
  let result = null;

  if(!member){
    return;
  }

  let tasks = await Task.aggregate([
    {$match: {member: member._id} },
    {$sort: {endDate: 1}},
    {$limit: 5}
  ]);

  return tasks;
}


async function search(memberId, filter, sort, query) {
  let result = null;
  if(!memberId || !filter || !sort){
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
  let $match = {member: memberId, status: filter.status};
  if(query){
    $match.name = {$regex: query, $options: 'i'};
  }

  if(filter.application) {
    $match['meta.applicationId'] = ObjectID(filter.applicationId);
  }

  let aMatch = { $match:  $match};
  let aSort = { $sort: {createdDate: direction} };

  console.log(aMatch)


  aList.push(aMatch);
  aList.push(aSort);

  let aggregate = Task.aggregate(aList);
  let tasks = await Task.aggregatePaginate(aggregate, options);

  return tasks;
}


module.exports = {
  findById:findById,
  add:add,
  remove:remove,
  markComplete:markComplete,
  getTasksDueSoon:getTasksDueSoon,
  search: search
}
