const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const parserCtl = require('../controllers/parser.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/v10/index').post(asyncHandler(createIndex));
router.route('/v10/index/:index').delete(asyncHandler(deleteIndex));

router.route('/v10/index/:index/resume/:documentId').get(asyncHandler(getResume));
router.route('/v10/index/:index/resume/:documentId/upload').post(asyncHandler(uploadResume));
router.route('/v10/index/:index/resume/:documentId').post(asyncHandler(addResume));
router.route('/v10/index/:index/resume/:documentId/match').post(asyncHandler(matchResumeByDocument));

router.route('/v10/index/:index/job/:documentId').post(asyncHandler(uploadJob));
// router.route('/v10/index/:index/job/:documentId/match').post(asyncHandler(matchResumeByDocument));

router.route('/v10/matcher/resume').post(asyncHandler(matchResume));


router.route('/jobs').post(asyncHandler(uploadJob));

router.route('/skills').post(asyncHandler(addSkills));
router.route('/skills').get(asyncHandler(getAllSkillLists));


async function createIndex(req, res) {
  let form = req.body;
  let data = await parserCtl.createIndex(form);

  res.json(new Response(data, data?'index_created_successful':'not_found', res));
}


async function deleteIndex(req, res) {
  let index = req.params.index;
  let data = await parserCtl.deleteIndex(index);

  res.json(new Response(data, data?'index_deleted_successful':'not_found', res));
}

async function getResume(req, res) {
  let index = req.params.index;
  let documentId = req.params.documentId;

  let data = await parserCtl.getResume(index, documentId);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}


async function uploadResume(req, res) {
  let index = req.params.index;
  let documentId = req.params.documentId;
  let data = await parserCtl.uploadResume(index, documentId, req.files.file[0]);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}


async function addResume(req, res) {
  let index = req.params.index;
  let documentId = req.params.documentId;
  let data = await parserCtl.addResume(index, documentId, req.body);

  res.json(new Response(data, data?'resume_added_successful':'not_found', res));
}



async function matchResume(req, res) {
  let form = req.body;
  let data = await parserCtl.matchResume(form);

  res.json(new Response(data, data?'resume_matched_successful':'not_found', res));
}


async function matchResumeByDocument(req, res) {
  let index = req.params.index;
  let documentId = req.params.documentId;
  let form = req.body;

  let data = await parserCtl.matchResumeByDocument(index, documentId, form);

  res.json(new Response(data, data?'resume_matched_successful':'not_found', res));
}


async function uploadJob(req, res) {
  let index = req.params.index;
  let documentId = req.params.documentId;
  let data = await parserCtl.uploadJob(index, documentId, req.files.file[0]);

  res.json(new Response(data, data?'job_uploaded_successful':'not_found', res));
}


async function addSkills(req, res) {

  let data = await parserCtl.addSkills(req.body);

  res.json(new Response(data, data?'skills_added_successful':'not_found', res));
}



async function getAllSkillLists(req, res) {
  let data = await parserCtl.getAllSkillLists();

  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}

