const express = require('express');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;

const asyncHandler = require('express-async-handler');
const taskCtl = require('../controllers/task.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('').post(asyncHandler(addTask));
router.route('/:id').get(asyncHandler(getTask));
router.route('/:id').put(asyncHandler(updateTask));
router.route('/:id').delete(asyncHandler(removeTask));
router.route('/:id/complete').post(asyncHandler(markComplete));



async function addTask(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.query.companyId);
  let task = req.body;

  let data = await taskCtl.addTask(companyId, currentUserId, task, res.locale);
  res.json(new Response(data, data?'task_added_successful':'not_found', res));
}

async function getTask(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.query.companyId);
  let taskId = ObjectID(req.params.id);

  let data = await taskCtl.getTask(companyId, currentUserId, taskId, res.locale);
  res.json(new Response(data, data?'task_retrieved_successful':'not_found', res));
}

async function updateTask(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.query.companyId);
  let taskId = ObjectID(req.params.id);
  let task = req.body;
  let data = await taskCtl.updateTask(companyId, currentUserId, taskId, task);
  res.json(new Response(data, data?'task_updated_successful':'not_found', res));
}

async function markComplete(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.query.companyId);
  let taskId = ObjectID(req.params.id);
  let data = await taskCtl.markComplete(companyId, currentUserId, taskId, res.locale);
  res.json(new Response(data, data?'task_retrieved_successful':'not_found', res));
}


async function removeTask(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.query.companyId);
  let taskId = ObjectID(req.params.id);
  let data = await taskCtl.removeTask(companyId, currentUserId, taskId);
  res.json(new Response(data, data?'task_retrieved_successful':'not_found', res));
}
