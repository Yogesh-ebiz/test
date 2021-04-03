const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const companyCtl = require('../controllers/company.controller');
const talentCtrl = require('../controllers/talent.controller');

let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/jobs').get(asyncHandler(searchJob));
router.route('/jobs/:id').get(asyncHandler(getJobById));
router.route('/jobs/:id/applications').get(asyncHandler(searchApplications));
router.route('/jobs/:id/applications/:applicationId/reject').post(asyncHandler(rejectApplication));


async function searchJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;

  if(req.query.company==null){
    res.json(new Response(data, 'not_found', res));
  }
  let companyId = parseInt(req.query.company);

  let filter = req.body;
  let pagination = req.query;
  filter.query = req.query.query;
  filter.company = [companyId];

  let data = await talentCtrl.searchJobs(currentUserId, companyId, filter, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}

async function getJobById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await talentCtrl.getJobById(currentUserId, jobId, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function searchApplications(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;

  let filter = req.query;
  let jobId = parseInt(req.params.id);
  let data = await talentCtrl.searchApplications(currentUserId, jobId, filter, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function rejectApplication(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let applicationId = parseInt(req.params.applicationId);
  let data = await talentCtrl.getJobById(currentUserId, jobId, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}
