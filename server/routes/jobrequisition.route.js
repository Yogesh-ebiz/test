const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const jobRequisitionCtl = require('../controllers/jobrequisition.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/').post(asyncHandler(importJobs));
router.route('/search').get(asyncHandler(searchJob));
router.route('/latest').get(asyncHandler(getLatestJobs));
router.route('/:id').get(asyncHandler(getJobById));

router.route('/:id/similar').get(asyncHandler(getSimilarJobs));
router.route('/:id/similar/company').get(asyncHandler(getSimilarCompanyJobs));

router.route('/:id/apply').post(asyncHandler(applyJobById));
router.route('/:id/bookmark').post(asyncHandler(addBookmark));
router.route('/:id/bookmark').delete(asyncHandler(removeBookmark));



async function insert(req, res) {
  let map = {"message": "Created successfully", "status": 200, data: null };
  let job = await jobRequisitionCtl.insert(req.body);
  map.data = job;
  res.json(map);
}

async function importJobs(req, res) {
  let map = {"message": "Import successfully", "status": 200, data: null };
  let job = await jobRequisitionCtl.importJobs(req.query.type, req.body);
  map.data = job;
  res.json(map);
}

async function getJobById(req, res) {

  console.log('currentUserId: ', req.header('UserId'))
  console.log('JobID: ', req.params.id)
  console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.getJobById(currentUserId, jobId, res.locale);

  res.json(new Response(data, data?'event_retrieved_successful':'not_found', res));
}


async function searchJob(req, res) {
  let data = await jobRequisitionCtl.searchJob(req);
  res.json(new Response(data, res));
}


async function getLatestJobs(req, res) {
  let data = await jobRequisitionCtl.searchJob(req);

  //res.json(map);
  res.json(new Response(data, res));
}


async function getSimilarJobs(req, res) {
  if(!req.params.id){
    res.json(new Response(null, res));
  }

  let query = req.query;
  query.id=req.params.id;

  let data = await jobRequisitionCtl.searchJob(req);
  res.json(new Response(data, res));
}


async function getSimilarCompanyJobs(req, res) {
  if(!req.params.id){
    res.json(new Response(null, res));
  }

  let query = req.query;
  query.id=req.params.id;


  let data = await jobRequisitionCtl.getSimilarCompanyJobs(query);

  res.json(new Response(data, res));
}



async function addToJobBookmark(req, res) {
  if(!req.params.id){
    res.json(new Response(null, res));
  }

  let userId=1;


  let data = await jobRequisitionCtl.addToJobBookmark(userId, req.params.id);

  res.json(new Response(data, res));
}





async function applyJobById(req, res) {

  console.log('currentUserId: ', req.header('UserId'))
  console.log('JobID: ', req.params.id)
  console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.applyJobById(currentUserId, req.body);

  res.json(new Response(data, data?'application_submit_successful':'not_found', res));
}

async function addBookmark(req, res) {

  console.log('currentUserId: ', req.header('UserId'))
  console.log('JobID: ', req.params.id)
  console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.addBookmark(currentUserId, jobId);

  res.json(new Response(data, data?'bookmark_saved_successful':'not_found', res));
}


async function removeBookmark(req, res) {

  console.log('currentUserId: ', req.header('UserId'))
  console.log('JobID: ', req.params.id)
  console.log('locale', res.locale);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await jobRequisitionCtl.removeBookmark(currentUserId, jobId);

  res.json(new Response(data, data?'bookmark_removed_successful':'not_found', res));
}
