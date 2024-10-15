const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const querystring = require('querystring');
const ObjectID = require('mongodb').ObjectID;

const jobRequisitionCtl = require('../controllers/jobrequisition.controller');
let Response = require('../const/response');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const jobValidation = require("../validations/job.validation");
const requestMiddleware = require('../middlewares/requestMiddleware');
const companyValidation = require("../validations/company.validation");
const talentCtrl = require("../controllers/talent.controller");


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

// router.route('/').post(asyncHandler(insert));
router.route('/').post(asyncHandler(importJobs));

router.get('/landing', requestMiddleware, validate(jobValidation.getJobLanding), jobRequisitionCtl.getJobLanding);
router.post('/search', validate(jobValidation.searchJob), jobRequisitionCtl.searchJob);
// router.get('/search/suggestions', validate(jobValidation.searchSuggestions), jobRequisitionCtl.searchSuggestions);
router.get('/search/suggestions', validate(jobValidation.getTitleSuggestion), jobRequisitionCtl.getTitleSuggestion);

router.route('/latest').get(asyncHandler(getLatestJobs));
router.route('/company/top-five').get(asyncHandler(getTopFiveJobs));

router.get('/:id', validate(jobValidation.getJobById), jobRequisitionCtl.getJobById);
router.route('/:id').put(asyncHandler(updateJobById));
router.route('/:id/report').post(validate(jobValidation.reportJobById), jobRequisitionCtl.reportJobById);
router.get('/:id/capture', validate(jobValidation.captureJob), jobRequisitionCtl.captureJob);
router.get('/:id/insight', validate(jobValidation.getJobInsight), jobRequisitionCtl.getJobInsight);

router.route('/similar/list').get(asyncHandler(getSimilarJobsByTitle));
router.route('/:id/similar').get(asyncHandler(getSimilarJobs));
router.get('/:id/similar/list', jobRequisitionCtl.getSimilarJobList);
router.get('/:id/similar/company', validate(jobValidation.getSimilarCompany), jobRequisitionCtl.getSimilarCompany);

router.post('/:id/apply', requestMiddleware, validate(jobValidation.applyJobById), jobRequisitionCtl.applyJobById);

router.post('/:id/bookmark', validate(jobValidation.addBookmark), jobRequisitionCtl.addBookmark);
router.delete('/:id/bookmark', validate(jobValidation.removeBookmark), jobRequisitionCtl.removeBookmark);

router.route('/:id/alert').post(asyncHandler(addAlert));
router.route('/:id/alert').delete(asyncHandler(removeAlert));
router.route('/:id/candidates').get(asyncHandler(searchCandidates));

router.post('/:jobId/questionaires', validate(jobValidation.submitJobQuestionaires), jobRequisitionCtl.submitJobQuestionaires);
router.get('/:jobId/questionaires', validate(jobValidation.getJobQuestionaires), jobRequisitionCtl.getJobQuestionaires);

router.route('/:id/skills').get(asyncHandler(getJobSkills));

router.route('/category').get(asyncHandler(getCategories));
router.route('/sponsor').post(asyncHandler(getSponsorJobs));
router.get('/market/salary', validate(jobValidation.getMarketSalary), jobRequisitionCtl.getMarketSalary);

//
// async function insert(req, res) {
//   let currentUserId = parseInt(req.header('UserId'));
//   let map = {"message": "Created successfully", "status": 200, data: null };
//   let data = await jobRequisitionCtl.createJob(currentUserId, req.body);
//   res.json(new Response(data, data?'job_created_successful':'not_found', res));
// }

async function importJobs(req, res) {
  let data = await jobRequisitionCtl.importJobs(req.query.type, req.body);
  res.json(new Response(data, data?'jobs_imported_successful':'not_found', res));
}

async function getJobById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let isMinimal = (req.query.isMinimal=='true')?true:false;
  let data = await jobRequisitionCtl.getJobById(currentUserId, jobId, isMinimal, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function updateJobById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.updateJobById(jobId, currentUserId, req.body);

  res.json(new Response(data, data?'job_update_successful':'not_found', res));
}


async function reportJobById(req, res) {

  let currentUser = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let report = req.body;

  report.user = currentUser;
  report.jobId = jobId;
  let data = await jobRequisitionCtl.reportJobById(currentUser, jobId, report);

  res.json(new Response(data, data?'job_reported_successful':'not_found', res));
}


async function captureJob(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let capture = {type: req.query.type, token: req.query.token};
  let data = await jobRequisitionCtl.captureJob(currentUserId, jobId, capture);

  res.json(new Response(data, data?'job_captured_successful':'not_found', res));
}


async function getJobInsight(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let jobId = parseInt(req.params.id);

  let data = await jobRequisitionCtl.getJobInsight(currentUserId, jobId, res.locale);
  res.json(new Response(data, data?'insight_retrieved_successful':'not_found', res));
}



async function jobLanding(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data = await jobRequisitionCtl.getJobLanding(currentUserId, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}

async function getTopFiveJobs(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companies = req.query.id.split(',').map(x => parseInt(x));
  let data = await jobRequisitionCtl.getTopFiveJobs(companies, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}

async function searchJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let filter = req.body;
  let sort = req.query;

  let data = await jobRequisitionCtl.searchJob(currentUserId, req.query.query, filter, sort, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function getTitleSuggestion(req, res) {
  let data = await jobRequisitionCtl.getTitleSuggestion(req.query.query, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function getLatestJobs(req, res) {
  let data = await jobRequisitionCtl.searchJob(req);

  //res.json(map);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function getSimilarJobs(req, res) {
  if(!req.params.id){
    res.json(new Response(null, res));
  }

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let filter = req.body;
  let pagination = req.query;

  // let data = await jobRequisitionCtl.searchJob(currentUserId, jobId, filter, pagination, res.locale);
  let data = await jobRequisitionCtl.getSimilarJobs(currentUserId, jobId, filter, pagination, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function getSimilarJobList(req, res) {
  if(!req.params.id){
    res.json(new Response(null, res));
  }
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.getSimilarJobList(currentUserId, jobId, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function getSimilarJobsByTitle(req, res) {
  let title = req.query.title;
  let currentUserId = parseInt(req.header('UserId'));
  let data = await jobRequisitionCtl.getSimilarJobsByTitle(currentUserId, title, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}



async function getSimilarCompany(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);

  let filter = req.query;
  let data = await jobRequisitionCtl.getSimilarCompany(currentUserId, jobId, filter);

  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function  applyJobById(req, res) {
  // console.log('currentUserId: ', req.header('UserId'))
  // console.log('JobID: ', req.params.id)
  console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let application = req.body;
  application.job=jobId;
  let data = await jobRequisitionCtl.applyJobById(currentUserId, jobId, application, res.locale);

  res.json(new Response(data, data?'application_submit_successful':'not_found', res));
}

async function addBookmark(req, res) {

  // console.log('currentUserId: ', req.header('UserId'))
  // console.log('JobID: ', req.params.id)
  // console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = ObjectID(req.params.id);
  let token = req.query.token;
  let data = await jobRequisitionCtl.addBookmark(currentUserId, jobId, token);

  res.json(new Response(data, data?'bookmark_saved_successful':'not_found', res));
}


async function removeBookmark(req, res) {

  // console.log('currentUserId: ', req.header('UserId'))
  // console.log('JobID: ', req.params.id)
  // console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.id;
  let data = await jobRequisitionCtl.removeBookmark(currentUserId, jobId);

  res.json(new Response(data, data?'bookmark_removed_successful':'not_found', res));
}


async function addAlert(req, res) {

  // console.log('currentUserId: ', req.header('UserId'))
  // console.log('JobID: ', req.params.id)
  // console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.addAlert(currentUserId, jobId, req.body);

  res.json(new Response(data, data?'alert_added_successful':'not_found', res));
}


async function removeAlert(req, res) {

  // console.log('currentUserId: ', req.header('UserId'))
  // console.log('JobID: ', req.params.id)
  // console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.removeAlert(currentUserId, jobId);


  res.json(new Response(data, data?'alert_removed_successful':'not_found', res));
}


async function searchCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let filter = req.query;
  let data = await jobRequisitionCtl.searchCandidates(currentUserId, null, filter, res.locale);
  res.json(new Response(data, data?'job_candidates_retrieved_successful':'not_found', res));
}


async function submitJobQuestionaires(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let jobId = parseInt(req.params.id);
  let answers = req.query;
  let data = await jobRequisitionCtl.submitJobQuestionaires(currrentUserId, jobId, answers);
  res.json(new Response(data, data?'job_questions_submitted_successful':'not_found', res));
}


async function getJobQuestionaires(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.getJobQuestionaires(jobId);
  res.json(new Response(data, data?'job_questions_retrieved_successful':'not_found', res));
}


async function getJobSkills(req, res) {
  let data = await jobRequisitionCtl.getJobSkills(req.params.id);
  res.json(new Response(data, data?'job_questions_retrieved_successful':'not_found', res));
}


async function getCategories(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await jobRequisitionCtl.getCategories(res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function getSponsorJobs(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let form = req.query;
  let data = await jobRequisitionCtl.getSponsorJobs(currentUserId, form, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}
