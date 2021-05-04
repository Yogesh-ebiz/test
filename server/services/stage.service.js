const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Stage = require('../models/stage.model');
const {addTask} = require('../services/task.service');



const stageSchema = Joi.object({
  _id: Joi.object().required(),
  custom: Joi.boolean().required(),
  default: Joi.boolean().required(),
  name: Joi.string().required(),
  type: Joi.string().required(),
  timeLimit: Joi.string().required(),
  tasks: Joi.array().optional(),
  members: Joi.array().optional()
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

  for (let task of stage.tasks) {
    task._id = new ObjectID();
    task = await addTask(task)
  }

  stage = new Stage(stage).save();
  return stage;

}



module.exports = {
  getStage:getStage,
  addStage:addStage
}
