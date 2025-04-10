const express = require('express');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const asyncHandler = require('express-async-handler');
const applicationCtl = require('../controllers/application.controller');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const applicationValidation = require("../validations/application.validation");
let Response = require('../const/response');
const companyCtl = require("../controllers/company.controller");

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.get('/:id', validate(applicationValidation.getById), applicationCtl.getById);
router.route('/id/:id').get(asyncHandler(getByApplicationId));
router.post('/:id/upload', validate(applicationValidation.uploadCV), applicationCtl.uploadCV);
router.route('/:id/offer/upload').post(asyncHandler(uploadOffer));
router.route('/:id/progresses/:applicationProgressId/accept').post(asyncHandler(accept));
router.route('/:id/progresses/:applicationProgressId/decline').post(asyncHandler(decline));
router.route('/:id/progresses').post(asyncHandler(addProgress));
router.route('/:id/progress').put(asyncHandler(updateProgress));
router.route('/:id/questions').post(asyncHandler(submitApplicationQuestions));
router.get('/:id/tasks', validate(applicationValidation.getTasks), applicationCtl.getTasks);
router.post('/:id/tasks', validate(applicationValidation.addTask), applicationCtl.addTask);


async function getById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = ObjectID(req.params.id);
  let data = await applicationCtl.getById(currentUserId, id);

  res.json(new Response(data, data?'application_retrieved_successful':'not_found', res));
}



async function getByApplicationId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let data = await applicationCtl.getByApplicationId(currentUserId, applicationId);

  res.json(new Response(data, data?'application_retrieved_successful':'not_found', res));
}


async function uploadCV(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let data = await applicationCtl.uploadCV(currentUserId, applicationId, req.files, req.body.name);
  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}


async function uploadOffer(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);

  let data = await applicationCtl.uploadOffer(currentUserId, applicationId, req.files);
  res.json(new Response(data, data?'offer_uploaded_successful':'not_found', res));
}

async function accept(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let applicationProgressId = parseInt(req.params.applicationProgressId);
  let data = await applicationCtl.accept(currentUserId, applicationId, applicationProgressId);

  res.json(new Response(data, data?'application_accepted_successful':'not_found', res));
}


async function decline(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let applicationProgressId = parseInt(req.params.applicationProgressId);
  let form = req.body;
  let data = await applicationCtl.decline(currentUserId, applicationId, applicationProgressId, form);

  res.json(new Response(data, data?'application_decline_successful':'not_found', res));
}


async function addProgress(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let progess = req.body;
  let data = await applicationCtl.addProgress(currentUserId, applicationId, progess);

  res.json(new Response(data, data?'progress_added_successful':'not_found', res));
}


async function updateProgress(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let progess = req.body;
  let data = await applicationCtl.updateProgress(currentUserId, applicationId, progess);

  res.json(new Response(data, data?'progress_updated_successful':'not_found', res));
}



async function submitApplicationQuestions(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let answers = req.body;
  let data = await applicationCtl.submitApplicationQuestions(currentUserId, applicationId, answers);

  res.json(new Response(data, data?'answers_submitted_successful':'not_found', res));
}

