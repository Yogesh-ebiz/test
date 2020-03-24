const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtl = require('../controllers/user.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))


router.route('/:userId/skills').get(asyncHandler(getPartySkillsByUserId));
router.route('/:userId/skills').post(asyncHandler(addPartySkill));
router.route('/:userId/skills/:partySkillId').delete(asyncHandler(removePartySkill));

router.route('/:userId/applications').get(asyncHandler(getApplicationsByUserId));
router.route('/:userId/bookmarks').get(asyncHandler(getBookmarksByUserId));
router.route('/:userId/alerts').get(asyncHandler(getAlertsByUserId));
router.route('/:userId/jobviews').get(asyncHandler(getJobViewsByUserId));



async function getPartySkillsByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await userCtl.getPartySkillsByUserId(currentUserId, filter);

  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}



async function addPartySkill(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let partySkill = req.body;
  partySkill.partyId = currentUserId;
  let data = await userCtl.addPartySkill(currentUserId, partySkill, res.locale);

  res.json(new Response(data, data?'skill_added_successful':'not_found', res));
}

async function removePartySkill(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let partySkillId = req.params.partySkillId;
  let data = await userCtl.removePartySkill(currentUserId, partySkillId);

  res.json(new Response(data, data?'skill_added_successful':'not_found', res));
}




async function getApplicationsByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await userCtl.getApplicationsByUserId(currentUserId, filter, res.locale);

  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}


async function getBookmarksByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await userCtl.getBookmarksByUserId(currentUserId, filter, res.locale);

  res.json(new Response(data, data?'bookmarks_retrieved_successful':'not_found', res));
}


async function getAlertsByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await userCtl.getAlertsByUserId(currentUserId, filter);

  res.json(new Response(data, data?'bookmarks_retrieved_successful':'not_found', res));
}


async function getJobViewsByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await userCtl.getJobViewsByUserId(currentUserId, filter, res.locale);

  res.json(new Response(data, data?'jobviews_retrieved_successful':'not_found', res));
}
