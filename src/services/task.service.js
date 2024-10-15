const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const moment = require('moment-timezone');

const statusEnum = require('../const/statusEnum');
const TaskSearchParam = require('../const/taskSearchParam');

const Task = require('../models/task.model');
const Application = require('../models/application.model');
const JobRequisition = require('../models/jobrequisition.model');

const applicationService = require('../services/application.service');


const taskSchema = Joi.object({
  updatedBy: Joi.object().optional(),
  required: Joi.boolean().required(),
  type: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  members: Joi.array().required(),
  owner: Joi.object().optional(),
  startDate: Joi.number(),
  endDate: Joi.number(),
  meta: Joi.object().optional(),
  reminders: Joi.array().optional(),
  note: Joi.string().allow('').optional(),
  priority: Joi.number().optional()
});

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return Task.findById(id).populate('members').populate('owner').populate({ path: 'meta.candidate', model: 'Candidate' });
}


async function add(form) {
  if(!form){
    return;
  }

  await taskSchema.validateAsync(form, { abortEarly: false })
  const task = await new Task(form).save();
  return task;
}


async function update(id, form) {
  if(!id || !form){
    return;
  }


  form = await taskSchema.validateAsync(form, { abortEarly: false });
  let task = await findById(id);
  let result = null

  task.name = form.name;
  task.description = form.description;
  task.members = form.members;
  task.type = form.type;
  task.startDate = form.startDate;
  task.endDate = form.endDate;
  task.meta = form.meta;
  task.reminders = form.reminders;
  if (form.priority !== undefined && form.priority !== null) {
    task.priority = form.priority;
  }
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

async function markInComplete(id, memberId) {
  let data = null;

  if(!id || !memberId){
    return;
  }

  let task = await Task.updateOne({_id: id, $or: [{members: memberId}, {owner: memberId}]}, { $set: {status: statusEnum.ACTIVE, hasCompleted:false} });
  return task;

}



async function getTasksDueSoon(member) {
  let result = null;

  if(!member){
    return;
  }

  // Get the current time and end of the next day in the user's timezone
  const now = moment.tz(member.timezone);
  const endOfThreeDays = now.clone().add(3, 'day').endOf('day');

  // Convert the times to UTC for querying the database
  const todayUTC = now.toDate().getTime();
  const endOfThreeDaysUTC = endOfThreeDays.toDate().getTime();

  let tasks = await Task.aggregate([
    {$match: {members: member._id, status: {$ne: statusEnum.COMPLETED}, endDate: {$gt: todayUTC, $lt: endOfThreeDaysUTC }} },
    {$sort: {endDate: 1}},
    {$limit: 5}
  ]);

  return tasks;
}

async function getTaskStatsByTimeframe(memberId, timeframe, timezone){
  let startDate, endDate;

  if (timeframe === 'today') {
    startDate = moment.tz(timezone).startOf('day').valueOf();
    endDate = moment.tz(timezone).endOf('day').valueOf();
  } else if (timeframe === 'yesterday') {
      startDate = moment.tz(timezone).subtract(1, 'day').startOf('day').valueOf();
      endDate = moment.tz(timezone).subtract(1, 'day').endOf('day').valueOf();
  } else if (timeframe === 'tomorrow') {
      startDate = moment.tz(timezone).add(1, 'day').startOf('day').valueOf();
      endDate = moment.tz(timezone).add(1, 'day').endOf('day').valueOf();
  } else {
      throw new Error('Invalid timeframe');
  }
  
  const memberCondition = {
    $or: [
        { owner: memberId },
        { members: memberId }
    ]
  };

  const dueTasks = await Task.countDocuments({
    ...memberCondition,
    endDate: { $gte: startDate, $lte: endDate },
    hasCompleted: false,
    status: 'ACTIVE',
  });

  const completedTasks = await Task.countDocuments({
    ...memberCondition,
    endDate: { $gte: startDate, $lte: endDate },
    hasCompleted: true,
    status: 'COMPLETED',
  });

  const overdueTasks = await Task.countDocuments({
    ...memberCondition,
    endDate: { $lt: moment().startOf('day').valueOf() },
    hasCompleted: false,
    status: 'ACTIVE',
  });

  // Job Stats
  const openJobs = await JobRequisition.countDocuments({
    createdBy: memberId,
    status: statusEnum.ACTIVE,
    //publishedDate: { $gte: startDate, $lte: endDate }
  });

  const closedJobs = await JobRequisition.countDocuments({
    createdBy: memberId,
    status: statusEnum.CLOSED,
    updatedDate: { $gte: startDate, $lte: endDate }
  });

  return {
    dueTasks,
    completedTasks,
    overdueTasks,
    openJobs,
    closedJobs
  };
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
  let $match = new TaskSearchParam(filter);
  let aMatch = { $match: $match};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);
  aList.push(aSort);

  let aggregate = Task.aggregate(aList);
  let tasks = await Task.aggregatePaginate(aggregate, options);

  return tasks;
}


module.exports = {
  add,
  findById,
  markComplete,
  markInComplete,
  getTasksDueSoon,
  getTaskStatsByTimeframe,
  remove,
  search,
  update
}
