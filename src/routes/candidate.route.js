const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const candidatesCtl = require('../controllers/candidates.controller');
let Response = require('../const/response');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const candidateValidation = require("../validations/candidate.validation");
const candidateCtrl = require("../controllers/candidates.controller");
const jobValidation = require("../validations/job.validation");
const talentCtrl = require("../controllers/talent.controller");


const router = express.Router();
module.exports = router;

router.route('/resumes').post(asyncHandler(uploadResume));
router.route('/generate').post(asyncHandler(generate));
router.route('/lookup').post(validate(candidateValidation.lookupCandidatesByIds), candidateCtrl.lookupCandidatesByIds)
router.route('/:id/flag').post(authorize('update_candidate'), validate(candidateValidation.addCandidateToBlacklist), candidateCtrl.addToBlacklist);
router.route('/flag-multiple').post(authorize('update_candidate'), validate(candidateValidation.addCandidatesToBlacklist), candidateCtrl.addToBlacklistMultiple);
router.route('/:id/flag').delete(authorize('update_candidate'), validate(candidateValidation.removeCandidateFromBlacklist), candidateCtrl.removeFromBlacklist);
router.route('/:id/job/preferences').get(authorize('view_candidate'), validate(candidateValidation.getCandidateJobPreferences), candidateCtrl.getCandidateJobPreferences);
router.route('/:id/job/preferences').get(authorize('view_candidate'), validate(candidateValidation.getCandidateJobPreferences), candidateCtrl.getCandidateJobPreferences);


router.route('/:id/accomplishments').get(authorize('view_candidate'), validate(candidateValidation.getCandidateAccomplishments), candidateCtrl.getCandidateAccomplishments);

router.route('/:id/languages').post(authorize('update_candidate'), validate(candidateValidation.addCandidateLanguages), candidateCtrl.addCandidateLanguages);
router.route('/:id/languages/:language').put(authorize('update_candidate'), validate(candidateValidation.updateCandidateLanguage), candidateCtrl.updateCandidateLanguage);
router.route('/:id/languages/:language').delete(authorize('update_candidate'), validate(candidateValidation.removeCandidateLanguage), candidateCtrl.removeCandidateLanguage);
router.route('/:id/job/preferences').put(authorize('update_candidate'), validate(candidateValidation.updateCandidateJobPreferences), candidateCtrl.updateCandidateJobPreferences);

async function uploadResume(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await candidatesCtl.uploadResume(currentUserId, req.files);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}


async function generate(req, res) {
  const data = null;
  resumesCtl.generate();
  res.json(new Response(data, data?'resume_generated_successful':'not_found', res));
}
