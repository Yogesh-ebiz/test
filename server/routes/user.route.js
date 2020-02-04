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
router.route('/:id/similar').get(asyncHandler(getSimilarJobs));
router.route('/:id/similar/company').get(asyncHandler(getSimilarCompanyJobs));
router.route('/:id/save').post(asyncHandler(saveJob));


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
  console.log('locale', res.locale);
  let map = {data: null , "message": "Retrieved successfully", "status": 200};
  let data = await jobRequisitionCtl.getJobById(req.params.id, res.locale);

  res.json(new Response(data, res));
}


async function searchJob(req, res) {
  let data = await jobRequisitionCtl.searchJob(req.query);
  res.json(new Response(data, res));
}


async function getLatestJobs(req, res) {
  let data = await jobRequisitionCtl.searchJob(req.query);

  //res.json(map);
  res.json(new Response(data, res));
}


async function getSimilarJobs(req, res) {
  if(!req.params.id){
    res.json(new Response(null, res));
  }

  let query = req.query;
  query.id=req.params.id;


  let data = await jobRequisitionCtl.searchJob(query);
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



async function saveJob(req, res) {
  if(!req.params.id){
    res.json(new Response(null, res));
  }

  let userId=1;


  let data = await jobRequisitionCtl.saveJob(userId, req.params.id);

  res.json(new Response(data, res));
}
