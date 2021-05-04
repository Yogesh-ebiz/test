const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const statusEnum = require('../const/statusEnum');
const Task = require('../models/task.model');



const taskSchema = Joi.object({
  _id: Joi.object(),
  required: Joi.boolean().required(),
  allowChange: Joi.boolean().required(),
  type: Joi.string().required(),
  options: Joi.object()
});

function getTask(id) {
  let data = null;

  if(!id){
    return;
  }

  return Task.findOne(id);
}


async function addTask(task) {
  let data = null;

  if(task==null){
    return;
  }

  task = await Joi.validate(task, taskSchema, { abortEarly: false });

  task = await new Task(task).save();
  return task;

}



module.exports = {
  getTask:getTask,
  addTask:addTask
}
