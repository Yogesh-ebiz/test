const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const companyCtl = require('../controllers/company.controller');
const talentCtrl = require('../controllers/talent.controller');

let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/profile').get(asyncHandler(getUserProfile));
router.route('/company').get(asyncHandler(getCompanies));
router.route('/company/:id/invite').get(asyncHandler(inviteMember));

router.route('/jobs').get(asyncHandler(searchJob));
router.route('/jobs/:id').get(asyncHandler(getJobById));
router.route('/jobs/:id/applications').get(asyncHandler(searchApplications));
router.route('/jobs/:id/applications/:applicationId/reject').post(asyncHandler(rejectApplication));

router.route('/candidates').post(asyncHandler(searchCandidates));



async function inviteMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let invitation = req.body;
  invitation.createdBy = currentUserId;

  let data = await talentCtl.inviteMember(currentUserId, invitation);
  res.json(new Response(data, data?'member_invited_successful':'not_found', res));
}


async function getUserProfile(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;

  let data = await talentCtrl.getUserProfile(currentUserId);
  res.json(new Response(data, data?'get_profile_successful':'not_found', res));
}



async function getCompanies(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;

  let data = await talentCtrl.getCompanies(currentUserId);
  res.json(new Response(data, data?'companies_retrieved_successful':'not_found', res));
}



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


async function searchCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;

  let filter = req.body;
  let pagination = req.query;
  filter.query = req.query.query;
  filter.company = [802]
  data = await talentCtrl.searchCandidates(currentUserId, filter, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}
