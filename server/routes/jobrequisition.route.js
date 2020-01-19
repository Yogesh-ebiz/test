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
router.route('/:id').get(asyncHandler(getJobById));
router.route('/latest').get(asyncHandler(getLatestJobs));


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
  console.log('JobID: ', req.params.id)
  let map = {data: null , "message": "Retrieved successfully", "status": 200};
  let data = await jobRequisitionCtl.getJobById(req.params.id);

  res.json(new Response(data, res));
}


async function searchJob(req, res) {
  //let map = {"message": "Retrieved successfully", "status": 200, data: null };
  let data = await jobRequisitionCtl.searchJob(req.query);
  //map.data = jobs;



  //res.json(map);
  res.json(new Response(data, res));
}



async function getLatestJobs(req, res) {
  let map = {"message": "Retrieved successfully", "status": 200, data: null };
  let jobs = await jobRequisitionCtl.getLatestJobs(req.query);
  map.data = jobs;

  res.json(map);
}


