const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const statusEnum = require('../const/statusEnum');
const Task = require('../models/task.model');
const Application = require('../models/application.model');

const applicationService = require('../services/application.service');


const taskSchema = Joi.object({
  _id: Joi.object(),
  required: Joi.boolean().required(),
  type: Joi.string().required(),
  name: Joi.string().required(),
  member: Joi.object().required(),
  startDate: Joi.number(),
  endDate: Joi.number(),
  meta: Joi.object()
});

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return Task.findById(id);
}


async function addTask(task) {
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


  console.log(id, memberId)
  let task = await Task.updateOne({_id: id, member: memberId}, { $set: {hasCompleted:true} });
  return task;

}



async function getTasksDueSoon(company, member) {
  let result = null;

  if(!company || !member){
    return;
  }


  let applications = await Application.aggregate([
    { $match: {company: company} },
    { $lookup:{
        from:"applicationprogresses",
        let:{currentProgress: '$currentProgress'},
        pipeline:[
          {$match:{$expr:{$eq:["$$currentProgress","$_id"]}}},
          {
            $lookup: {
              from: "stages",
              let: {stage: '$stage'},
              pipeline: [
                {$match: {$expr: {$eq: ["$$stage", "$_id"]}}},
                // {
                //   $lookup: {
                //     from: "tasks",
                //     let: {tasks: '$tasks'},
                //     pipeline: [
                //       {$match: {$expr: {$eq: ["$$tasks", "$_id"]}}}
                //     ],
                //     as: 'tasks'
                //   }
                // }
                {
                  $lookup: {
                    from: 'members',
                    localField: "members",
                    foreignField: "_id",
                    as: "members"
                  }
                },
                {
                  $lookup: {
                    from: 'tasks',
                    localField: "tasks",
                    foreignField: "_id",
                    as: "tasks"
                  }
                },
              ],
              as: 'stage'
            }
          },
          // {
          //   $lookup: {
          //     from: 'stages',
          //     localField: "stage",
          //     foreignField: "_id",
          //     as: "stage"
          //   }
          // },
          { $unwind: '$stage' },
          { $addFields:
              {
                timeLeft: {$round: [ {$divide : [{$subtract: [{ $add:[ {$toDate: "$createdDate"}, {$multiply: ['$stage.timeLimit', 1*24*60*60000] } ] }, "$$NOW"]}, 86400000]}, 0 ] }
              }
          },
        ],
        as: 'currentProgress'
      }},
    { $unwind: '$currentProgress'},
    {
      $match: {'currentProgress.timeLeft': {$lte: 1}, 'currentProgress.stage.members': { $elemMatch: { _id: member._id }} }
    }
  ]);

  let tasks = _.reduce(applications, function(res, app){
    let tasks = _.reduce(app.currentProgress.stage.tasks, function(res2, task){
      task.name = app.jobTitle;
      task.timeLeft = app.currentProgress.timeLeft
      res2.push(task);
      return res2;
    }, []);

    res = res.concat(tasks);
    return tasks
  }, []);


  return tasks;
}


module.exports = {
  findById:findById,
  addTask:addTask,
  remove:remove,
  markComplete:markComplete,
  getTasksDueSoon:getTasksDueSoon
}
