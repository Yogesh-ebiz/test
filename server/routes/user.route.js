const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtl = require('../controllers/user.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/search/all').get(asyncHandler(searchUsers));
router.route('/:userId/sync').post(asyncHandler(sync));
router.route('/:userId/company/sync').post(asyncHandler(syncCompanies));

router.route('/:userId/detail').get(asyncHandler(getUserDetail));
router.route('/:userId/resumes/upload').post(asyncHandler(uploadResume));
router.route('/:userId/resumes').get(asyncHandler(getUserResumes));
router.route('/:userId/resumes/:resumeId/default').post(asyncHandler(setResumeDefault));

router.route('/:userId/experiences').get(asyncHandler(getPartyExperiences));
router.route('/:userId/experiences').post(asyncHandler(updatePartyExperiences));
router.route('/:userId/employers/jobs').get(asyncHandler(getEmployersJobs));


router.route('/:userId/educations').get(asyncHandler(getPartyEducations));
router.route('/:userId/educations').post(asyncHandler(updatePartyEducations));


router.route('/:userId/accomplishments').get(asyncHandler(getPartyAccomplishments));
router.route('/:userId/accomplishments').post(asyncHandler(updateSkillsAndAccomplishments));


router.route('/:userId/skills').get(asyncHandler(getPartySkillsByUserId));

router.route('/:userId/skills').post(asyncHandler(addPartySkill));
router.route('/:userId/skills').put(asyncHandler(updatePartySkills));
router.route('/:userId/skills/:partySkillId').delete(asyncHandler(removePartySkillById));


router.route('/:userId/languages').get(asyncHandler(getPartyLanguages));
router.route('/:userId/languages').post(asyncHandler(updatePartyLanguages));


router.route('/:userId/skills/:partySkillId/endorsements').get(asyncHandler(getEndorsementsByPartySkill));
router.route('/:userId/skills/:partySkillId/endorsements').post(asyncHandler(addEndorsement));
router.route('/:userId/skills/:partySkillId/endorsements').delete(asyncHandler(removeEndorsement));
router.route('/:userId/skills/:partySkillId/endorsements/:endorsementId').delete(asyncHandler(removeEndorsement));



router.route('/:userId/applications').get(asyncHandler(getApplicationsByUserId));
router.route('/:userId/bookmarks').get(asyncHandler(getBookmarksByUserId));

router.route('/:userId/alerts').get(asyncHandler(getAlertsByUserId));
router.route('/:userId/alerts').post(asyncHandler(addPartyAlert));
router.route('/:userId/alerts/:alertId').delete(asyncHandler(removePartyAlert));
router.route('/:userId/alerts/:alertId').put(asyncHandler(updatePartyAlert));

router.route('/:userId/jobviews').get(asyncHandler(getJobViewsByUserId));

router.route('/:userId/publications').get(asyncHandler(getPartyPublications));
router.route('/:userId/publications').post(asyncHandler(addPartyPublication));
router.route('/:userId/publications').put(asyncHandler(updatePartyPublications));


router.route('/:userId/certifications').get(asyncHandler(getPartyCertifications));
router.route('/:userId/certifications').post(asyncHandler(addPartyCertification));
router.route('/:userId/certifications').put(asyncHandler(updatePartyCertifications));

router.route('/:userId/job/preferences').get(asyncHandler(getJobPreferences));
router.route('/:userId/job/preferences').put(asyncHandler(updateJobPreferences));


async function sync(req, res) {
  let user = req.body;
  let data = await userCtl.sync(user);
  res.json(new Response(data, data?'user_synced_successful':'not_found', res));
}


async function syncCompanies(req, res) {
  let userId = parseInt(req.params.userId);
  let data = await userCtl.syncCompanies(userId);
  res.json(new Response(data, data?'user_synced_successful':'not_found', res));
}


async function getUserDetail(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let userId = parseInt(req.params.userId);
  let data = await userCtl.getUserDetail(currentUserId, userId, res.locale);
  res.json(new Response(data, data?'user_retrieved_successful':'not_found', res));
}


async function searchUsers(req, res) {
  let currentUserId = parseInt(req.params.userId);
  let filter = req.query;
  let data = await userCtl.searchUsers(currentUserId, filter, res.locale);
  res.json(new Response(data, data?'users_retrieved_successful':'not_found', res));
}

async function uploadResume(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await userCtl.uploadResume(currentUserId, req.files, req.body.name);
  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}

async function getPartyExperiences(req, res) {
  let currentUserId = parseInt(req.params.userId);
  let data = await userCtl.getPartyExperiences(currentUserId, res.locale);
  res.json(new Response(data, data?'experiences_retrieved_successful':'not_found', res));
}

async function updatePartyExperiences(req, res) {
  let currentUserId = parseInt(req.params.userId);
  let body = req.body;

  let data = await userCtl.updatePartyExperiences(currentUserId, body);
  res.json(new Response(data, data?'experiences_updated_successful':'not_found', res));
}

async function getEmployersJobs(req, res) {
  let currentUserId = parseInt(req.params.userId);
  let data = await userCtl.getUserEmployersJobs(currentUserId, res.locale);
  res.json(new Response(data, data?'get_user_employers_jobs':'not_found', res));
}

async function getPartyEducations(req, res) {
  let currentUserId = parseInt(req.params.userId);
  let data = await userCtl.getPartyEducations(currentUserId);
  res.json(new Response(data, data?'educations_retrieved_successful':'not_found', res));
}


async function updatePartyEducations(req, res) {
  let currentUserId = parseInt(req.params.userId);
  let body = req.body;

  let data = await userCtl.updatePartyEducations(currentUserId, body);
  res.json(new Response(data, data?'educations_updated_successful':'not_found', res));
}


async function getPartyAccomplishments(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let userId = parseInt(req.params.userId);
  let data = await userCtl.getPartyAccomplishments(currentUserId, userId, res.locale);

  res.json(new Response(data, data?'accomplishments_retrieved_successful':'not_found', res));
}


async function updateSkillsAndAccomplishments(req, res) {
  let currentUserId = parseInt(req.params.userId);
  let body = req.body;

  let data = await userCtl.updateSkillsAndAccomplishments(currentUserId, body, res.locale);
  res.json(new Response(data, data?'accomplishments_updated_successful':'not_found', res));
}


async function getPartySkillsByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let userId = parseInt(req.params.userId);
  let filter = req.query;
  let data = await userCtl.getPartySkillsByUserId(currentUserId, userId, filter, res.locale);

  res.json(new Response(data, data?'partyskills_retrieved_successful':'not_found', res));
}


async function updatePartySkills(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let partySkills = req.body;
  let data = await userCtl.updatePartySkills(currentUserId, partySkills, res.locale);

  res.json(new Response(data, data?'partyskills_updated_successful':'not_found', res));
}

async function addPartySkill(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let partySkill = req.body;
  partySkill.partyId = currentUserId;
  let data = await userCtl.addPartySkill(currentUserId, partySkill, res.locale);

  res.json(new Response(data, data?'partyskill_added_successful':'not_found', res));
}

async function updatePartySkillById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let partySkill = req.body;
  partySkill.partySkillId = parseInt(req.params.partySkillId);
  let data = await userCtl.updatePartySkillById(currentUserId, partySkillId);

  res.json(new Response(data, data?'partyskill_updated_successful':'not_found', res));
}


async function removePartySkillById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let partySkillId = parseInt(req.params.partySkillId);
  let data = await userCtl.removePartySkillById(currentUserId, partySkillId);

  res.json(new Response(data, data?'partyskill_removed_successful':'not_found', res));
}



async function getPartyLanguages(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await userCtl.getPartyLanguages(currentUserId);

  res.json(new Response(data, data?'partylanguages_retrieved_successful':'not_found', res));
}


async function updatePartyLanguages(req, res) {
  let currentUserId = parseInt(req.params.userId);
  let body = req.body;

  let data = await userCtl.updatePartyLanguages(currentUserId, body);
  res.json(new Response(data, data?'partylanguages_updated_successful':'not_found', res));
}


async function getEndorsementsByPartySkill(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let partySkillId = parseInt(req.params.partySkillId);
  let filter = req.query;
  let data = await userCtl.getEndorsementsByPartySkill(currentUserId, partySkillId, filter);

  res.json(new Response(data, data?'partyskill_endorsements_retrieved_successful':'not_found', res));
}


async function addEndorsement(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let partySkillId = parseInt(req.params.partySkillId);
  let endorsement = req.body;
  endorsement.endorser = currentUserId;
  endorsement.partySkillId = partySkillId;
  let data = await userCtl.addEndorsement(currentUserId, endorsement);

  res.json(new Response(data, data?'endorsement_added_successful':'not_found', res));
}

async function removeEndorsement(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let partySkillId = parseInt(req.params.partySkillId);
  let data = await userCtl.removeEndorsement(currentUserId, partySkillId);

  res.json(new Response(data, data?'endorsement_remove_successful':'not_found', res));
}



async function getUserResumes(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await userCtl.getUserResumes(currentUserId);

  res.json(new Response(data, data?'user_resumes_retrieved_successful':'not_found', res));
}



async function setResumeDefault(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let resumeId = parseInt(req.params.resumeId);
  let data = await userCtl.setResumeDefault(currentUserId, resumeId);

  res.json(new Response(data, data?'user_resumes_retrieved_successful':'not_found', res));
}



async function getApplicationsByUserId(req, res) {

  let currentUserId = parseInt(req.params.userId);

  let filter = req.query;
  let data = await userCtl.getApplicationsByUserId(currentUserId, filter, res.locale);

  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}


async function getBookmarksByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await userCtl.getBookmarksByUserId(currentUserId, filter, res.locale);

  res.json(new Response(data, data?'bookmarks_retrieved_successful':'not_found', res));
}


async function getAlertsByUserId(req, res) {

  let currentUserId = parseInt(req.params.userId);
  let filter = req.query;
  let data = await userCtl.getAlertsByUserId(currentUserId, filter);

  res.json(new Response(data, data?'alerts_retrieved_successful':'not_found', res));
}

async function removePartyAlert(req, res) {

  let currentUserId = parseInt(req.params.userId);
  let alertId = req.params.alertId;
  let data = await userCtl.removePartyAlert(currentUserId, alertId);

  res.json(new Response(data, data?'alert_removed_successful':'not_found', res));
}

async function addPartyAlert(req, res) {

  let currentUserId = parseInt(req.params.userId);
  let alert = req.body;
  let data = await userCtl.addPartyAlert(currentUserId, alert);

  res.json(new Response(data, data?'alert_added_successful':'not_found', res));
}


async function updatePartyAlert(req, res) {

  let currentUserId = parseInt(req.params.userId);
  let alertId = req.params.alertId;
  let alert = req.body;
  let data = await userCtl.updatePartyAlert(currentUserId, alertId, alert);

  res.json(new Response(data, data?'alert_updated_successful':'not_found', res));
}


async function getJobViewsByUserId(req, res) {

  let currentUserId = parseInt(req.params.userId);
  let filter = req.query;
  let data = await userCtl.getJobViewsByUserId(currentUserId, filter, res.locale);

  res.json(new Response(data, data?'jobviews_retrieved_successful':'not_found', res));
}




async function getPartyPublications(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await userCtl.getPartyPublications(currentUserId);

  res.json(new Response(data, data?'partypublications_retrieved_successful':'not_found', res));
}


async function addPartyPublication(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let publication = req.body;
  publication.partyId = currentUserId;
  let data = await userCtl.addPartyPublication(currentUserId, publication);

  res.json(new Response(data, data?'publication_added_successful':'not_found', res));
}


async function updatePartyPublications(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let publications = req.body;
  let data = await userCtl.updatePartyPublications(currentUserId, publications);

  res.json(new Response(data, data?'publications_updated_successful':'not_found', res));
}


async function getPartyCertifications(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await userCtl.getPartyCertifications(currentUserId);

  res.json(new Response(data, data?'partycertifications_retrieved_successful':'not_found', res));
}


async function addPartyCertification(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let certification = req.body;
  certification.partyId = currentUserId;
  let data = await userCtl.addPartyCertification(currentUserId, certification);

  res.json(new Response(data, data?'certification_added_successful':'not_found', res));
}


async function updatePartyCertifications(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let certifications = req.body;
  let data = await userCtl.updatePartyCertifications(currentUserId, certifications);

  res.json(new Response(data, data?'certifications_updated_successful':'not_found', res));
}



async function getJobPreferences(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let userId = parseInt(req.params.userId);
  let data = await userCtl.getJobPreferences(currentUserId, userId, res.locale);
  res.json(new Response(data, data?'jobPreferences_retrieved_successful':'not_found', res));
}



async function updateJobPreferences(req, res) {

  let currentUserId = parseInt(req.params.userId);
  let data = await userCtl.updateJobPreferences(currentUserId, req.body, res.locale);
  res.json(new Response(data, data?'jobPreferences_updated_successful':'not_found', res));
}
