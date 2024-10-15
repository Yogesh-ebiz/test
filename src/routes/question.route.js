const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const querystring = require('querystring');
const jobRequisitionCtl = require('../controllers/jobrequisition.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/').post(asyncHandler(importJobs));
router.route('/landing').get(asyncHandler(jobLanding));
router.route('/search').get(asyncHandler(searchJob));
router.route('/latest').get(asyncHandler(getLatestJobs));
router.route('/company/top-five').get(asyncHandler(getTopFiveJobs));

router.route('/:id').get(asyncHandler(getJobById));

router.route('/:id/similar').get(asyncHandler(getSimilarJobs));
router.route('/:id/similar/company').get(asyncHandler(getSimilarCompany));

router.route('/:id/apply').post(asyncHandler(applyJobById));

router.route('/:id/bookmark').post(asyncHandler(addBookmark));
router.route('/:id/bookmark').delete(asyncHandler(removeBookmark));

router.route('/:id/alert').post(asyncHandler(addAlert));
router.route('/:id/alert').delete(asyncHandler(removeAlert));

router.route('/:id/candidates').get(asyncHandler(searchCandidates));

router.route('/:id').post(asyncHandler(getQuestion));


async function insert(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let map = {"message": "Created successfully", "status": 200, data: null };
  let data = await jobRequisitionCtl.createJob(currentUserId, req.body);
  res.json(new Response(data, data?'job_created_successful':'not_found', res));
}

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
  let filter = req.query;
  let data = await jobRequisitionCtl.searchJob(currentUserId, null, filter, res.locale);
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
  let filter = req.query;

  let data = await jobRequisitionCtl.searchJob(currentUserId, jobId, filter);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function getSimilarCompany(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);

  let filter = req.query;
  let data = await jobRequisitionCtl.getSimilarCompany(currentUserId, jobId, filter);

  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function applyJobById(req, res) {
  // console.log('currentUserId: ', req.header('UserId'))
  // console.log('JobID: ', req.params.id)
  // console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let application = req.body;
  // application.job=jobId;
  application.partyId=currentUserId;
  let data = await jobRequisitionCtl.applyJobById(currentUserId, jobId, application);

  res.json(new Response(data, data?'application_submit_successful':'not_found', res));
}

async function addBookmark(req, res) {

  // console.log('currentUserId: ', req.header('UserId'))
  // console.log('JobID: ', req.params.id)
  // console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.addBookmark(currentUserId, jobId);

  res.json(new Response(data, data?'bookmark_saved_successful':'not_found', res));
}


async function removeBookmark(req, res) {

  // console.log('currentUserId: ', req.header('UserId'))
  // console.log('JobID: ', req.params.id)
  // console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
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
