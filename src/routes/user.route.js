const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtl = require('../controllers/user.controller');
let Response = require('../const/response');
const validate = require("../middlewares/validate");
const userValidation = require("../validations/user.validation");
const { authorize } = require("../middlewares/authMiddleware");
const companyValidation = require("../validations/company.validation");
const talentCtrl = require("../controllers/talent.controller");
const jobValidation = require("../validations/job.validation");

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/search/all').get(asyncHandler(searchUsers));
router.post('/:userId/sync', validate(userValidation.sync), userCtl.sync);
router.post('/:userId/company/sync', validate(userValidation.syncCompanies), userCtl.syncCompanies);

router.get('/:userId/subscriptions', validate(userValidation.getSubscription), userCtl.getSubscription);
router.post('/:userId/subscriptions', validate(userValidation.addSubscription), userCtl.addSubscription);
router.put('/:userId/subscriptions/:subscriptionId', validate(userValidation.updateSubscription), userCtl.updateSubscription);

router.get('/:userId/detail', validate(userValidation.getUserDetail), userCtl.getUserDetail);
router.route('/:userId/resumes/upload').post(validate(userValidation.uploadResume), userCtl.uploadResume);
router.get('/:userId/resumes/download', validate(userValidation.downloadResume), userCtl.downloadResume);
router.get('/:userId/resumes/files', validate(userValidation.getUserResumesFiles), userCtl.getUserResumesFiles);
router.post('/:userId/resumes/:resumeId/default', validate(userValidation.setResumeDefault), userCtl.setResumeDefault);

router.post('/:userId/resumes', validate(userValidation.addUserResume), userCtl.addUserResume);
router.get('/:userId/resumes', validate(userValidation.getUserResumes), userCtl.getUserResumes);
router.get('/:userId/resumes/:resumeId', validate(userValidation.getUserResume), userCtl.getUserResume);
router.put('/:userId/resumes/:resumeId', validate(userValidation.updateUserResume), userCtl.updateUserResume);
router.delete('/:userId/resumes/:resumeId', validate(userValidation.deleteUserResume), userCtl.deleteUserResume);
router.put('/:userId/resumes/:resumeId/name', validate(userValidation.updateUserResumeName), userCtl.updateUserResumeName);
// router.get('/:userId/resumes/template', validate(userValidation.getUserResumeTemplates), userCtl.getUserResumeTemplates);
router.put('/:userId/resumes/:resumeId/template/:templateId', validate(userValidation.updateUserResumeTemplate), userCtl.updateUserResumeTemplate);

router.get('/:userId/experiences', validate(userValidation.getUserExperiences), userCtl.getUserExperiences);
router.post('/:userId/experiences', validate(userValidation.addUserExperience), userCtl.addUserExperience);
router.put('/:userId/experiences/:experienceId', validate(userValidation.updateUserExperience), userCtl.updateUserExperience);
router.delete('/:userId/experiences/:experienceId', validate(userValidation.removeUserExperience), userCtl.removeUserExperience);

router.route('/:userId/employers/jobs').get(asyncHandler(getEmployersJobs));


router.get('/:userId/educations', validate(userValidation.getUserEducations), userCtl.getUserEducations);
router.post('/:userId/educations', validate(userValidation.addUserEducation), userCtl.addUserEducation);
router.put('/:userId/educations/:educationId', validate(userValidation.updateUserEducation), userCtl.updateUserEducation);
router.delete('/:userId/educations/:educationId', validate(userValidation.removeUserEducation), userCtl.removeUserEducation);


router.get('/:userId/accomplishments', validate(userValidation.getUserAccomplishments), userCtl.getUserAccomplishments);
router.post('/:userId/accomplishments', validate(userValidation.updateUserAccomplishments), userCtl.updateUserAccomplishments);


router.get('/:userId/skills', validate(userValidation.getUserSkills), userCtl.getUserSkills);
router.get('/:userId/skills/top', validate(userValidation.getUserTopSkills), userCtl.getUserTopSkills);
router.get('/:userId/skills/list', validate(userValidation.getUserSkillList), userCtl.getUserSkillList);

router.post('/:userId/skills', validate(userValidation.addUserSkill), userCtl.addUserSkill);
router.put('/:userId/skills', validate(userValidation.updateUserSkills), userCtl.updateUserSkills);
router.put('/:userId/skills/:partySkillId', validate(userValidation.updateUserSkillById), userCtl.updateUserSkillById);
router.delete('/:userId/skills/:partySkillId', validate(userValidation.removeUserSkillById), userCtl.removeUserSkillById);


router.get('/:userId/languages', validate(userValidation.getUserLanguages), userCtl.getUserLanguages);
router.post('/:userId/languages', validate(userValidation.addUserLanguage), userCtl.addUserLanguage);
router.delete('/:userId/languages/:language', validate(userValidation.removeUserLanguage), userCtl.removeUserLanguage);


router.get('/:userId/skills/:partySkillId/endorsements', validate(userValidation.getEndorsementsByPartySkill), userCtl.getEndorsementsByPartySkill);
router.post('/:userId/skills/:partySkillId/endorsements', validate(userValidation.addEndorsement), userCtl.addEndorsement);
router.delete('/:userId/skills/:partySkillId/endorsements', validate(userValidation.removeEndorsement), userCtl.removeEndorsement);
router.delete('/:userId/skills/:partySkillId/endorsements/:endorsementId', validate(userValidation.removeEndorsement), userCtl.removeEndorsement);


router.get('/:userId/applications', validate(userValidation.getApplications), userCtl.getApplications);
router.get('/:userId/applications/list', validate(userValidation.getApplicationList), userCtl.getApplicationList);
router.get('/:userId/bookmarks', validate(userValidation.getBookmarks), userCtl.getBookmarks);

router.get('/:userId/alerts', validate(userValidation.getAlerts), userCtl.getAlerts);
router.post('/:userId/alerts', validate(userValidation.addUserAlert), userCtl.addUserAlert);
router.delete('/:userId/alerts/:alertId', validate(userValidation.removeUserAlert), userCtl.removeUserAlert);
router.put('/:userId/alerts/:alertId', validate(userValidation.updateUserAlert), userCtl.updateUserAlert);

router.post('/:id/evaluations', validate(userValidation.getUserEvaluations), userCtl.getUserEvaluations);
router.post('/:id/evaluations/stats', validate(userValidation.getUserEvaluationsStats), userCtl.getUserEvaluationsStats);
router.get('/:id/evaluations/:evaluationId', validate(userValidation.getCandidateEvaluationById), userCtl.getUserEvaluationById);


router.route('/:userId/jobviews').get(validate(userValidation.getJobViews), userCtl.getJobViews);

router.get('/:userId/publications', validate(userValidation.getUserPublications), userCtl.getUserPublications);
router.post('/:userId/publications', validate(userValidation.addUserPublication), userCtl.addUserPublication);
router.delete('/:userId/publications/:publicationId', validate(userValidation.removeUserPublication), userCtl.removeUserPublication);


router.route('/:userId/certifications').get(asyncHandler(getPartyCertifications));
router.route('/:userId/certifications').post(asyncHandler(addPartyCertification));
router.route('/:userId/certifications').put(asyncHandler(updatePartyCertifications));

router.get('/:userId/job/preferences', validate(userValidation.getJobPreferences), userCtl.getJobPreferences);
router.put('/:userId/job/preferences', validate(userValidation.updateJobPreferences), userCtl.updateJobPreferences);


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


async function getUserSkills(req, res) {

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



async function getApplicationListByUserId(req, res) {

  let currentUserId = parseInt(req.params.userId);

  let data = await userCtl.getApplicationListByUserId(currentUserId, res.locale);
  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}

async function getBookmarks(req, res) {

  let currentUserId = parseInt(req.params.userId);
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
  console.log(alert)
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

  let currentUserId = parseInt(req.params.userId);
  let userId = parseInt(req.params.userId);
  let data = await userCtl.getJobPreferences(currentUserId, userId, res.locale);
  res.json(new Response(data, data?'jobPreferences_retrieved_successful':'not_found', res));
}



async function updateJobPreferences(req, res) {

  let currentUserId = parseInt(req.params.userId);
  let data = await userCtl.updateJobPreferences(currentUserId, req.body, res.locale);
  res.json(new Response(data, data?'jobPreferences_updated_successful':'not_found', res));
}
