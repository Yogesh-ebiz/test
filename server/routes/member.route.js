const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const memberCtrl = require('../controllers/member.controller');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

let Response = require('../const/response');

const router = express.Router();
module.exports = router;
router.route('/:id').get(asyncHandler(getMember));

router.route('/:id').put(asyncHandler(updateMember));
router.route('/:id').delete(asyncHandler(removeMember));

router.route('/:id/tasks').post(asyncHandler(getMemberTasks));

// router.route('members/:id/role').put(asyncHandler(updateMemberRole));

// router.route('members/:id/jobs/subscribes').get(asyncHandler(getJobsSubscribed));
// router.route('members/:id/applications/subscribes').get(asyncHandler(getApplicationsSubscribed));

// router.route('members/:id/notifications/preference').get(asyncHandler(getNotificationPreference));
// router.route('members/:id/notifications/preference').put(asyncHandler(updateNotificationPreference));


async function getMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = ObjectID(req.params.id);

  let data = await memberCtrl.getMember(id, currentUserId);
  res.json(new Response(data, data?'member_retrieved_successful':'not_found', res));
}

async function updateMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = ObjectID(req.params.id);
  let form = req.body;
  form.createdBy = currentUserId;

  let data = await memberCtrl.updateMember(id, currentUserId, form);
  res.json(new Response(data, data?'member_updated_successful':'not_found', res));
}

async function removeMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = ObjectID(req.params.id);

  let data = await memberCtrl.removeMember(id, currentUserId);
  res.json(new Response(data, data?'member_deleted_successful':'not_found', res));
}


async function getMemberTasks(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = ObjectID(req.params.id);
  let filter = req.body;
  let sort = req.query;
  let query = req.query.query;
  let data = await memberCtrl.getMemberTasks(id, currentUserId, filter, sort, query);
  res.json(new Response(data, data?'tasks_retrieved_successful':'not_found', res));
}


//
// async function getJobsSubscribed(req, res) {
//   let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
//   let id = ObjectID(req.params.id);
//   let sort = req.query;
//   let data = await memberCtrl.getJobsSubscribed(id, currentUserId, sort);
//   res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
// }
//
// async function getApplicationsSubscribed(req, res) {
//   let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
//   let id = ObjectID(req.params.id);
//   let sort = req.query;
//   let data = await memberCtrl.getApplicationsSubscribed(id, currentUserId, sort);
//   res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
// }
//
//
// async function getNotificationPreference(req, res) {
//   let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
//   let id = ObjectID(req.params.id);
//   let data = await memberCtrl.getNotificationPreference(id, currentUserId);
//   res.json(new Response(data, data?'notification_preferene_retrieved_successful':'not_found', res));
// }
//
//
// async function updateNotificationPreference(req, res) {
//   let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
//   let id = ObjectID(req.params.id);
//   let data = await memberCtrl.updateNotificationPreference(id, currentUserId, req.body);
//   res.json(new Response(data, data?'notification_preferene_updated_successful':'not_found', res));
// }


