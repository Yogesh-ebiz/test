const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Stage = require('../models/stage.model');
const {add} = require('../services/task.service');



const stageSchema = Joi.object({
  _id: Joi.object().required(),
  custom: Joi.boolean().optional(),
  default: Joi.boolean().optional(),
  name: Joi.string().required(),
  type: Joi.string().required(),
  timeLimit: Joi.number().required(),
  tasks: Joi.array().optional()
});

function getStage(id) {
  let data = null;

  if(!id){
    return;
  }

  return Stage.findOne(id);
}


async function addStage(stage) {
  let data = null;

  if(stage==null){
    return;
  }

  stage = await Joi.validate(stage, stageSchema, { abortEarly: false });

  // for (let task of stage.tasks) {
  //   task._id = new ObjectID();
  //   task = await addTask(task)
  // }

  stage = new Stage(stage).save();
  return stage;

}


async function createTasksForStage(stage, jobTitle, meta) {
  let data = null;

  if(!stage){
    return;
  }
  for (let task of stage.tasks) {
    task.tasks = [];
    for(let member of task.members){
      let newTask = {};
      newTask.members = [ObjectID(member)];
      newTask.required = task.required;
      newTask.type = task.type;
      newTask.meta = meta;
      let startDate = new Date();
      let endDate = new Date();
      endDate.setDate(endDate.getDate()+stage.timeLimit);
      endDate.setMinutes(59);
      endDate.setHours(23)
      newTask.startDate = startDate.getTime();
      newTask.endDate = endDate.getTime();
      newTask.reminders = ['D1'];

      switch(task.type){
        case 'EMAIL':
          newTask.name = '['+stage.name+'] ' + 'Send Email';
          break;
        case 'EVALUATION':
          newTask.name = '['+stage.name+'] ' + 'Give Evaluation';
          break;
        case 'EVENT':
          newTask.name = '['+stage.name+'] ' + 'Set-up Event';
          break;
      }

      // await add(newTask)
      newTask = await add(newTask);
    }

  }

  // stage = new Stage(stage).save();
  return stage;

}



module.exports = {
  getStage:getStage,
  addStage:addStage,
  createTasksForStage:createTasksForStage
}
