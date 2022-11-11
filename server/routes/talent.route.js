const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const companyCtrl = require('../controllers/company.controller');
const talentCtrl = require('../controllers/talent.controller');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

let Response = require('../const/response');
const {parse} = require("url");

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/session').get(asyncHandler(getUserSession));
router.route('/register').post(asyncHandler(registerNewUser));

router.route('/market/salary').get(asyncHandler(getMarketSalary));

router.route('/company/search').post(asyncHandler(searchCompany));
router.route('/company/:id').get(asyncHandler(getCompany));
router.route('/company/:id').put(asyncHandler(updateCompany));
router.route('/company/:id/upload/avatar').post(asyncHandler(uploadCompanyAvatar));

router.route('/company/:id/subscriptions').get(asyncHandler(getSubscriptions));
router.route('/company/:id/insights').get(asyncHandler(getInsights));
router.route('/company/:id/inmail/credits').get(asyncHandler(getInmailCredits));
router.route('/company/:id/taxandfee').get(asyncHandler(getTaxAndFee));

router.route('/company/:id/impression/insight/candidates').get(asyncHandler(getImpressionCandidates));
router.route('/company/:id/dashboard').get(asyncHandler(getDashboard));

router.route('/company/:id/paymentmethod').post(asyncHandler(addPaymentMethod));
router.route('/company/:id/payment/cards').get(asyncHandler(getCards));
router.route('/company/:id/payment/cards/:cardId').delete(asyncHandler(removeCard));
router.route('/company/:id/payment/cards/verify').post(asyncHandler(verifyCard));
router.route('/company/:id/subscription').post(asyncHandler(updateSubscription));


router.route('/company/:id/jobs').post(asyncHandler(createJob));
router.route('/company/:id/jobs/search').post(asyncHandler(searchJob));
router.route('/company/:id/jobs/:jobId').get(asyncHandler(getJobById));
router.route('/company/:id/jobs/:jobId').put(asyncHandler(updateJob));
router.route('/company/:id/jobs/:jobId/close').post(asyncHandler(closeJob));
router.route('/company/:id/jobs/:jobId/archive').post(asyncHandler(archiveJob));
router.route('/company/:id/jobs/:jobId/unarchive').post(asyncHandler(unarchiveJob));
router.route('/company/:id/jobs/:jobId').delete(asyncHandler(deleteJob));

router.route('/company/:id/jobs/:jobId/comments').get(asyncHandler(getJobComments));
router.route('/company/:id/jobs/:jobId/comments').post(asyncHandler(addJobComment));
router.route('/company/:id/jobs/:jobId/comments/:commentId').delete(asyncHandler(deleteJobComment));
router.route('/company/:id/jobs/:jobId/comments/:commentId').put(asyncHandler(updateJobComment));

router.route('/company/:id/jobs/:jobId/insights').get(asyncHandler(getJobInsights));
router.route('/company/:id/jobs/:jobId/activities').get(asyncHandler(getJobActivities));
router.route('/company/:id/jobs/:jobId/candidates/suggestions').post(asyncHandler(searchPeopleSuggestions));


router.route('/company/:id/jobs/:jobId/pipeline').post(asyncHandler(updateJobPipeline));
router.route('/company/:id/jobs/:jobId/pipeline').get(asyncHandler(getJobPipeline));
router.route('/company/:id/jobs/:jobId/members').get(asyncHandler(getJobMembers));
router.route('/company/:id/jobs/:jobId/members').post(asyncHandler(updateJobMembers));

router.route('/company/:id/jobs/:jobId/subscribe').post(asyncHandler(subscribeJob));
router.route('/company/:id/jobs/:jobId/subscribe').delete(asyncHandler(unsubscribeJob));
router.route('/company/:id/jobs/:jobId/applicationform').post(asyncHandler(updateJobApplicationForm));
router.route('/company/:id/jobs/:jobId/board').get(asyncHandler(getBoard));
router.route('/company/:id/jobs/:jobId/applications/:applicationId/reject').post(asyncHandler(rejectApplication));
router.route('/company/:id/jobs/:jobId/applications/:applicationId').post(asyncHandler(updateApplication));

router.route('/company/:id/jobs/:jobId/sources/:sourceId').post(asyncHandler(addSourceApplication));
router.route('/company/:id/jobs/:jobId/campaigns').post(asyncHandler(searchCampaigns));
router.route('/company/:id/jobs/:jobId/ads').get(asyncHandler(getJobAds));
router.route('/company/:id/jobs/:jobId/ads').get(asyncHandler(getJobAds));
router.route('/company/:id/jobs/:jobId/feed').get(asyncHandler(getJobAds));


router.route('/company/:id/jobs/:jobId/publish').post(asyncHandler(publishJob));
router.route('/company/:id/jobs/:jobId/pay').post(asyncHandler(payJob));

router.route('/company/:id/jobs/:jobId/applications').post(asyncHandler(searchApplications));
router.route('/company/:id/applications').post(asyncHandler(addApplication));
router.route('/company/:id/applications/endingsoon').get(asyncHandler(getAllApplicationsEndingSoon));
router.route('/company/:id/applications/:applicationId').get(asyncHandler(getApplicationById));
router.route('/company/:id/applications/:applicationId/progress').post(asyncHandler(updateApplicationProgress));
router.route('/company/:id/applications/:applicationId/progress/:progressId').get(asyncHandler(getApplicationProgress));

router.route('/company/:id/applications/:applicationId/questions').get(asyncHandler(getApplicationQuestions));
router.route('/company/:id/applications/:applicationId/evaluations').get(asyncHandler(getApplicationEvaluations));
router.route('/company/:id/applications/:applicationId/emails').get(asyncHandler(searchApplicationEmails));

router.route('/company/:id/applications/:applicationId/labels').get(asyncHandler(getApplicationLabels));
router.route('/company/:id/applications/:applicationId/labels').post(asyncHandler(addApplicationLabel));
router.route('/company/:id/applications/:applicationId/labels/:labelId').delete(asyncHandler(deleteApplicationLabel));

router.route('/company/:id/applications/:applicationId/comments').get(asyncHandler(getApplicationComments));
router.route('/company/:id/applications/:applicationId/comments').post(asyncHandler(addApplicationComment));
router.route('/company/:id/applications/:applicationId/comments/:commentId').delete(asyncHandler(deleteApplicationComment));
router.route('/company/:id/applications/:applicationId/comments/:commentId').put(asyncHandler(updateApplicationComment));

router.route('/company/:id/applications/:applicationId/progress/:progressId/evaluate').post(asyncHandler(addApplicationProgressEvaluation));
router.route('/company/:id/applications/:applicationId/progress/:progressId/evaluate').delete(asyncHandler(removeApplicationProgressEvaluation));

router.route('/company/:id/applications/:applicationId/progress/:progressId/event').post(asyncHandler(updateApplicationProgressEvent));
router.route('/company/:id/applications/:applicationId/progress/:progressId/event').delete(asyncHandler(removeApplicationProgressEvent));


router.route('/company/:id/applications/:applicationId/disqualify').post(asyncHandler(disqualifyApplication));
router.route('/company/:id/applications/:applicationId/revert').post(asyncHandler(revertApplication));
router.route('/company/:id/applications/:applicationId').delete(asyncHandler(deleteApplication));
router.route('/company/:id/applications/:applicationId/accept').post(asyncHandler(acceptApplication));
router.route('/company/:id/applications/:applicationId/reject').post(asyncHandler(rejectApplication));


router.route('/company/:id/applications/:applicationId/subscribe').post(asyncHandler(subscribeApplication));
router.route('/company/:id/applications/:applicationId/subscribe').delete(asyncHandler(unsubscribeApplication));

router.route('/company/:id/applications/:applicationId/activities').get(asyncHandler(getApplicationActivities));
router.route('/company/:id/applications/:applicationId/upload').post(asyncHandler(uploadApplication));
router.route('/company/:id/applications/:applicationId/files').get(asyncHandler(getFiles));


router.route('/company/:id/candidates').post(asyncHandler(addCandidate));
router.route('/company/:id/candidates/resumes').post(asyncHandler(importResumes));
router.route('/company/:id/candidates/search').post(asyncHandler(searchCandidates));
router.route('/company/:id/candidates/:candidateId').get(asyncHandler(getCandidateById));
router.route('/company/:id/candidates/:candidateId').put(asyncHandler(updateCandidateById));
router.route('/company/:id/candidates/:candidateId').delete(asyncHandler(removeCandidateById));
router.route('/company/:id/candidates/:candidateId/notes').get(asyncHandler(getCandidateNotes));
router.route('/company/:id/candidates/:candidateId/notes').post(asyncHandler(addCandidateNote));
router.route('/company/:id/candidates/:candidateId/notes/:noteId').delete(asyncHandler(removeCandidateNote));

router.route('/company/:id/candidates/:candidateId/tags').post(asyncHandler(addCandidateTag));
router.route('/company/:id/candidates/:candidateId/tags/:tagId').delete(asyncHandler(removeCandidateTag));

router.route('/company/:id/candidates/:candidateId/sources').post(asyncHandler(addCandidateSources));
router.route('/company/:id/candidates/:candidateId/sources/add').post(asyncHandler(addCandidateSource));
router.route('/company/:id/candidates/:candidateId/sources/:sourceId').delete(asyncHandler(removeCandidateSource));
router.route('/company/:id/candidates/:candidateId/pools').post(asyncHandler(updateCandidatePool));

router.route('/company/:id/candidates/:candidateId/evaluations').post(asyncHandler(getCandidateEvaluations));
router.route('/company/:id/candidates/:candidateId/evaluations/stats').post(asyncHandler(getCandidateEvaluationsStats));
router.route('/company/:id/candidates/:candidateId/evaluations/:evaluationId').get(asyncHandler(getCandidateEvaluationById));

router.route('/company/:id/candidates/:candidateId/similar').get(asyncHandler(getCandidatesSimilar));
router.route('/company/:id/candidates/:candidateId/activities').get(asyncHandler(getCandidateActivities));

router.route('/company/:id/candidates/:candidateId/experiences').post(asyncHandler(addCandidateExperience));
router.route('/company/:id/candidates/:candidateId/experiences').get(asyncHandler(getCandidateExperiences));
router.route('/company/:id/candidates/:candidateId/experiences/:experienceId').delete(asyncHandler(removeCandidateExperience));

router.route('/company/:id/candidates/:candidateId/educations').post(asyncHandler(addCandidateEducation));
router.route('/company/:id/candidates/:candidateId/educations').get(asyncHandler(getCandidateEducations));
router.route('/company/:id/candidates/:candidateId/educations/:educationId').delete(asyncHandler(removeCandidateEducation));

router.route('/company/:id/candidates/:candidateId/skills').get(asyncHandler(getCandidateSkills));
router.route('/company/:id/candidates/:candidateId/skills').post(asyncHandler(addCandidateSkills));
router.route('/company/:id/candidates/:candidateId/skills/:skillId').post(asyncHandler(removeCandidateSkill));

router.route('/company/:id/candidates/:candidateId/accomplishments').get(asyncHandler(getCandidateAccomplishments));
router.route('/company/:id/candidates/:candidateId/languages').post(asyncHandler(addCandidateLanguages));



router.route('/company/:id/candidates/:candidateId/upload/avatar').post(asyncHandler(uploadAvatar));
router.route('/company/:id/candidates/:candidateId/resumes/upload').post(asyncHandler(uploadCandidateResume));
router.route('/company/:id/candidates/:candidateId/resumes').get(asyncHandler(getCandidateResumes));

router.route('/company/:id/candidates/assignjobs').post(asyncHandler(assignCandidatesJobs));
router.route('/company/:id/candidates/email/check').post(asyncHandler(checkCandidateEmail));


router.route('/company/:id/filter/skills').get(asyncHandler(getAllCandidatesSkills));


router.route('/company/:id/departments').post(asyncHandler(addCompanyDepartment));
router.route('/company/:id/departments/:departmentId').put(asyncHandler(updateCompanyDepartment));
router.route('/company/:id/departments/:departmentId').delete(asyncHandler(deleteCompanyDepartment));
router.route('/company/:id/departments').get(asyncHandler(getCompanyDepartments));


router.route('/company/:id/questions/templates').post(asyncHandler(addCompanyQuestionTemplate));
router.route('/company/:id/questions/templates/:questionTemplateId').get(asyncHandler(getCompanyQuestionTemplate));
router.route('/company/:id/questions/templates/:questionTemplateId').put(asyncHandler(updateCompanyQuestionTemplate));
router.route('/company/:id/questions/templates/:questionTemplateId').delete(asyncHandler(deleteCompanyQuestionTemplate));
router.route('/company/:id/questions/templates/:questionTemplateId/disable').post(asyncHandler(deactivateCompanyQuestionTemplate));
router.route('/company/:id/questions/templates/:questionTemplateId/enable').post(asyncHandler(activateCompanyQuestionTemplate));
router.route('/company/:id/questions/templates').get(asyncHandler(getCompanyQuestionTemplates));

router.route('/company/:id/pipelines').post(asyncHandler(addCompanyPipelineTemplate));
router.route('/company/:id/pipelines/:pipelineId').put(asyncHandler(updateCompanyPipelineTemplate));
router.route('/company/:id/pipelines/:pipelineId').delete(asyncHandler(deleteCompanyPipelineTemplate));
router.route('/company/:id/pipelines/:pipelineId').get(asyncHandler(getCompanyPipelineTemplate));
router.route('/company/:id/pipelines/:pipelineId/disable').post(asyncHandler(deactivateCompanyPipelineTemplate));
router.route('/company/:id/pipelines/:pipelineId/enable').post(asyncHandler(activateCompanyPipelineTemplate));
router.route('/company/:id/pipelines').get(asyncHandler(getCompanyPipelineTemplates));

router.route('/company/:id/roles').get(asyncHandler(getCompanyRoles));
router.route('/company/:id/roles').post(asyncHandler(addCompanyRole));
router.route('/company/:id/roles/:roleId').put(asyncHandler(updateCompanyRole));
router.route('/company/:id/roles/:roleId').delete(asyncHandler(deleteCompanyRole));
router.route('/company/:id/roles/:roleId/disable').post(asyncHandler(disableCompanyRole));
router.route('/company/:id/roles/:roleId/enable').post(asyncHandler(enableCompanyRole));

router.route('/company/:id/labels').get(asyncHandler(getCompanyLabels));
router.route('/company/:id/labels').post(asyncHandler(addCompanyLabel));
router.route('/company/:id/labels/:labelId').put(asyncHandler(updateCompanyLabel));
router.route('/company/:id/labels/:labelId').delete(asyncHandler(deleteCompanyLabel));

router.route('/company/:id/members/invites').post(asyncHandler(inviteMembers));
router.route('/company/:id/members/invites').get(asyncHandler(getCompanyMemberInvitations));
router.route('/company/:id/members/invites/:invitationId').delete(asyncHandler(cancelMemberInvitation));
router.route('/company/:id/members/invites/:invitationId/accept').post(asyncHandler(acceptMemberInvitation));


router.route('/company/:id/members').get(asyncHandler(getCompanyMembers));
// router.route('/company/:id/members').post(asyncHandler(addCompanyMember));
router.route('/company/:id/members/:memberId').get(asyncHandler(getCompanyMember));

router.route('/company/:id/members/:memberId').put(asyncHandler(updateCompanyMember));
router.route('/company/:id/members/:memberId').delete(asyncHandler(deleteCompanyMember));
router.route('/company/:id/members/:memberId/role').put(asyncHandler(updateCompanyMemberRole));

router.route('/company/:id/members/:memberId/jobs/subscribes').get(asyncHandler(getJobsSubscribed));
router.route('/company/:id/members/:memberId/applications/subscribes').get(asyncHandler(getApplicationsSubscribed));
router.route('/company/:id/members/:memberId/tasks').post(asyncHandler(searchTasks));
router.route('/company/:id/members/:memberId/notifications/preference').get(asyncHandler(getNotificationPreference));
router.route('/company/:id/members/:memberId/notifications/preference').put(asyncHandler(updateNotificationPreference));


router.route('/company/:id/pools').get(asyncHandler(getCompanyPools));
router.route('/company/:id/pools').post(asyncHandler(addCompanyPool));
router.route('/company/:id/pools/:poolId').get(asyncHandler(getCompanyPoolById));
router.route('/company/:id/pools/:poolId').put(asyncHandler(updateCompanyPool));
router.route('/company/:id/pools/:poolId').delete(asyncHandler(deleteCompanyPool));
router.route('/company/:id/pools/:poolId/candidates').get(asyncHandler(getPoolCandidates));
router.route('/company/:id/pools/:poolId/candidates').post(asyncHandler(addPoolCandidates));
router.route('/company/:id/pools/:poolId/candidates/:candidateId').delete(asyncHandler(removePoolCandidate));
router.route('/company/:id/pools/:poolId/candidates').delete(asyncHandler(removePoolCandidates));

router.route('/company/:id/projects').get(asyncHandler(getCompanyProjects));
router.route('/company/:id/projects').post(asyncHandler(addCompanyProject));
router.route('/company/:id/projects/:projectId').put(asyncHandler(updateCompanyProject));
router.route('/company/:id/projects/:projectId').delete(asyncHandler(deleteCompanyProject));
router.route('/company/:id/projects/:projectId/candidates').get(asyncHandler(getProjectCandidates));
router.route('/company/:id/projects/:projectId/candidates').post(asyncHandler(addProjectCandidates));
router.route('/company/:id/projects/:projectId/candidates/:candidateId').delete(asyncHandler(removeProjectCandidate));
router.route('/company/:id/projects/:projectId/candidates').delete(asyncHandler(removeProjectCandidates));

router.route('/company/:id/people/:peopleId/projects').post(asyncHandler(updateCandidateProject));
router.route('/company/:id/people/:peopleId/pools').post(asyncHandler(updatePeoplePool));
router.route('/company/:id/people/flagged').get(asyncHandler(getPeopleFlagged));


router.route('/company/:id/impressions').get(asyncHandler(getImpressionCandidates));

router.route('/company/:id/evaluations/templates').get(asyncHandler(getCompanyEvaluationTemplates));
router.route('/company/:id/evaluations/templates').post(asyncHandler(addCompanyEvaluationTemplate));
router.route('/company/:id/evaluations/templates/:templateId').get(asyncHandler(getCompanyEvaluationTemplate));
router.route('/company/:id/evaluations/templates/:templateId').put(asyncHandler(updateCompanyEvaluationTemplate));
router.route('/company/:id/evaluations/templates/:templateId').delete(asyncHandler(deleteCompanyEvaluationTemplate));
router.route('/company/:id/evaluations/templates/:templateId/disable').post(asyncHandler(deactivateCompanyEvaluationTemplate));
router.route('/company/:id/evaluations/templates/:templateId/enable').post(asyncHandler(activateCompanyEvaluationTemplate));
router.route('/company/:id/evaluations/filters').get(asyncHandler(getEvaluationFilters));



router.route('/company/:id/emails/templates').get(asyncHandler(getCompanyEmailTemplates));
router.route('/company/:id/emails/templates').post(asyncHandler(addCompanyEmailTemplate));
router.route('/company/:id/emails/templates/:templateId').put(asyncHandler(updateCompanyEmailTemplate));
router.route('/company/:id/emails/templates/:templateId').delete(asyncHandler(deleteCompanyEmailTemplate));
router.route('/company/:id/emails/templates/:templateId/disable').post(asyncHandler(deactivateCompanyEmailTemplate));
router.route('/company/:id/emails/templates/:templateId/enable').post(asyncHandler(activateCompanyEmailTemplate));
router.route('/company/:id/contacts/search').get(asyncHandler(searchContacts));


router.route('/company/:id/sources').post(asyncHandler(searchSources));
router.route('/company/:id/sources/:sourceId').delete(asyncHandler(removeSources));
router.route('/company/:id/sources').delete(asyncHandler(removeSources));


async function getUserSession(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let preferredCompany = req.query.company?parseInt(req.query.company):null;

  let data = await talentCtrl.getUserSession(currentUserId, preferredCompany);
  res.json(new Response(data, data?'get_session_successful':'not_found', res));
}


async function registerNewUser(req, res) {
  const form = req.body;
  let data = await talentCtrl.registerNewUser(form);
  res.json(new Response(data, data?'get_session_successful':'not_found', res));
}


async function getCompany(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.getCompany(currentUserId, companyId);
  res.json(new Response(data, data?'company_retrieved_successful':'not_found', res));
}

async function updateCompany(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.updateCompany(companyId, currentUserId, req.body);
  res.json(new Response(data, data?'company_updated_successful':'not_found', res));
}


async function uploadCompanyAvatar(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.uploadCompanyAvatar(companyId, currentUserId, req);
  res.json(new Response(data, data?'company_updated_successful':'not_found', res));
}

async function getSubscriptions(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getSubscriptions(companyId, currentUserId);
  res.json(new Response(data, data?'get_subscriptions_successful':'not_found', res));
}


async function getMarketSalary(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let jobTitle = req.query.jobTitle?req.query.jobTitle:'';

  let data = await talentCtrl.getMarketSalary(jobTitle);
  res.json(new Response(data, data?'get_salary_successful':'not_found', res));
}


async function getInsights(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let timeframe = req.query.timeframe

  let data = await talentCtrl.getCompanyInsights(currentUserId, companyId, timeframe);
  res.json(new Response(data, data?'get_insights_successful':'not_found', res));
}


async function getInmailCredits(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getInmailCredits(companyId, currentUserId);
  res.json(new Response(data, data?'credits_retrieved_successful':'not_found', res));
}



async function getTaxAndFee(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getTaxAndFee(currentUserId, companyId);
  res.json(new Response(data, data?'taxandfees_retrieved_successful':'not_found', res));
}


async function getImpressionCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let type = req.query.type;
  let level = req.query.level;
  let jobId = req.query.jobId;
  let timeframe = req.query.timeframe;
  let sort = req.query;
  sort.page = parseInt(req.query.page)
  sort.size = parseInt(req.query.size)

  let data = await talentCtrl.getImpressionCandidates(companyId, currentUserId, timeframe, type, level, jobId, sort, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}



async function getDashboard(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getDashboard(currentUserId, companyId);
  res.json(new Response(data, data?'get_dashboard_successful':'not_found', res));
}


async function searchCompany(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let sort = req.query;
  let filter = req.body;
  let data = await talentCtrl.searchCompany(currentUserId, filter, sort);
  res.json(new Response(data, data?'companies_retrieved_successful':'not_found', res));
}

async function addPaymentMethod(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let card = req.body;
  let data = await talentCtrl.addPaymentMethod(companyId, currentUserId, card);
  res.json(new Response(data, data?'card_created_successful':'not_found', res));
}

async function getCards(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.getCards(companyId, currentUserId);
  res.json(new Response(data, data?'cards_retrieved_successful':'not_found', res));
}

async function removeCard(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let cardId = req.params.cardId;
  let data = await talentCtrl.removeCard(companyId, currentUserId, cardId);
  res.json(new Response(data, data?'card_removed_successful':'not_found', res));
}


async function verifyCard(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.query.id);
  let verification = req.body;
  let data = await talentCtrl.verifyCard(companyId, currentUserId, jobId, verification);
  res.json(new Response(data, data?'card_verified_successful':'not_found', res));
}



async function updateSubscription(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let subscription = req.body;
  let data = await talentCtrl.updateSubscription(companyId, currentUserId, subscription);
  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}


async function createJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let job = req.body;
  let data = await talentCtrl.createJob(companyId, currentUserId, job);
  res.json(new Response(data, data?'job_created_successful':'not_found', res));
}


async function updateJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = ObjectID(req.params.jobId);
  let companyId = parseInt(req.params.id);
  let job = req.body;
  job.department = job.department?ObjectID(job.department):null;

  let data = await talentCtrl.updateJob(companyId, currentUserId, jobId, job);
  res.json(new Response(data, data?'job_updated_successful':'not_found', res));
}



async function closeJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.closeJob(companyId, currentUserId, jobId);
  res.json(new Response(data, data?'job_closed_successful':'not_found', res));
}



async function archiveJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.archiveJob(companyId, currentUserId, jobId);
  res.json(new Response(data, data?'job_archived_successful':'not_found', res));
}



async function unarchiveJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.unarchiveJob(companyId, currentUserId, jobId);
  res.json(new Response(data, data?'job_unarchived_successful':'not_found', res));
}


async function deleteJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.deleteJob(companyId, currentUserId, jobId);
  res.json(new Response(data, data?'job_deleted_successful':'not_found', res));
}



async function getJobComments(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let filter = req.query;

  let data = await talentCtrl.getJobComments(companyId, currentUserId, jobId, filter);

  res.json(new Response(data, data?'comment_retrieved_successful':'not_found', res));
}


async function addJobComment(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let comment = req.body;

  let data = await talentCtrl.addJobComment(companyId, currentUserId, jobId, comment);

  res.json(new Response(data, data?'comment_added_successful':'not_found', res));
}



async function deleteJobComment(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let commentId = req.params.commentId;

  let data = await talentCtrl.deleteJobComment(companyId, currentUserId, jobId, commentId);

  res.json(new Response(data, data?'comment_deleted_successful':'not_found', res));
}


async function updateJobComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let commentId = req.params.commentId;
  let comment = req.body;

  let data = await talentCtrl.updateJobComment(currentUserId, jobId, commentId, comment);

  res.json(new Response(data, data?'comment_updated_successful':'not_found', res));
}




async function searchJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let sort = req.query;
  let filter = req.body;
  filter.createdBy = _.reduce(filter.createdBy, function(res, id){res.push(ObjectID(id)); return res;}, []);
  filter.tags = _.reduce(filter.tags, function(res, id){res.push(ObjectID(id)); return res;}, []);
  filter.department = _.reduce(filter.department, function(res, id){res.push(ObjectID(id)); return res;}, []);
  let data = await talentCtrl.searchJobs(currentUserId, companyId, req.query.query, filter, sort, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}

async function getJobById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let data = await talentCtrl.getJobById(currentUserId, companyId, jobId, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}


async function publishJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let type = req.body.type;

  let data = await talentCtrl.publishJob(companyId, currentUserId, jobId, type);
  res.json(new Response(data, data?'job_paid_successful':'not_found', res));
}


async function payJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let payment = req.body;

  let data = await talentCtrl.payJob(companyId, currentUserId, jobId, payment);
  res.json(new Response(data, data?'job_paid_successful':'not_found', res));
}



async function getJobInsights(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);

  let data = await talentCtrl.getJobInsights(currentUserId, companyId, jobId);
  res.json(new Response(data, data?'get_insights_successful':'not_found', res));
}


async function getJobActivities(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = ObjectID(req.params.jobId);
  let sort = req.query;
  let data = await talentCtrl.getJobActivities(companyId, currentUserId, jobId, sort);

  res.json(new Response(data, data?'application_reverted_successful':'not_found', res));
}


async function searchPeopleSuggestions(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let sort = req.query;
  let filter = req.body;
  let data = await talentCtrl.searchPeopleSuggestions(companyId, currentUserId, jobId, filter, sort);
  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}




async function searchApplications(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let filter = req.body;
  let sort = req.query;
  let jobId = ObjectID(req.params.jobId);
  let data = await talentCtrl.searchApplications(companyId, currentUserId, jobId, filter, sort, res.locale);
  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}
//
// async function searchAllApplications(req, res) {
//   let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
//   let companyId = parseInt(req.params.id);
//   let filter = req.query;
//   let data = await talentCtrl.searchAllApplications(currentUserId, companyId, filter, res.locale);
//   res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
// }


async function rejectApplication(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let applicationId = parseInt(req.params.applicationId);
  let data = await talentCtrl.getJobById(companyId, currentUserId, jobId, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function updateApplication(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let applicationId = parseInt(req.params.applicationId);
  let requestBody = req.query.status;
  let data = await talentCtrl.updateApplication(companyId, currentUserId, jobId, applicationId, requestBody);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function searchSources(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let companyId = parseInt(req.params.id);
  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;

  filter.jobs = _.reduce(filter.jobs, function(res, job){res.push(ObjectID(job)); return res;}, []);

  data = await talentCtrl.searchSources(companyId, currentUserId, filter, sort, res.locale);

  res.json(new Response(data, data?'sources_retrieved_successful':'not_found', res));
}



async function removeSource(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let companyId = parseInt(req.params.id);
  let source = ObjectID(req.param.sourceId);
  data = await talentCtrl.removeSources(companyId, currentUserId, [source]);
  res.json(new Response(data, data?'sources_removed_successful':'not_found', res));
}


async function removeSources(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let companyId = parseInt(req.params.id);
  let sources = _.reduce(req.body.sources, function(res, id){res.push(ObjectID(id)); return res;}, []);
  data = await talentCtrl.removeSources(companyId, currentUserId, sources);
  res.json(new Response(data, data?'sources_removed_successful':'not_found', res));
}


async function addSourceApplication(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);
  let sourceId = ObjectID(req.params.sourceId);

  let application = req.body;
  application.stage = ObjectID(application.stage);

  let data = await talentCtrl.addSourceApplication(company, currentUserId, jobId, sourceId, application);
  res.json(new Response(data, data?'source_added_successful':'not_found', res));
}


async function searchCampaigns(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);

  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;


  let data = await talentCtrl.searchCampaigns(company, currentUserId, jobId, filter, sort, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}


async function getJobAds(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);

  let data = await talentCtrl.getJobAds(company, currentUserId, jobId, res.locale);
  res.json(new Response(data, data?'ads_retrieved_successful':'not_found', res));
}


async function addApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let form = req.body;
  form.jobId = ObjectID(form.jobId);
  form.user = ObjectID(form.user);
  let data = await talentCtrl.addApplication(companyId, currentUserId, form);

  res.json(new Response(data, data?'application_retrieved_successful':'not_found', res));
}


async function getAllApplicationsEndingSoon(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let sort = req.query;

  let data = await talentCtrl.getAllApplicationsEndingSoon(companyId, currentUserId, sort);

  res.json(new Response(data, data?'applicagion_retrieved_successful':'not_found', res));
}


async function getApplicationById(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.getApplicationById(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_retrieved_successful':'not_found', res));
}


async function updateApplicationProgress(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = ObjectID(req.params.applicationId);
  let newStage = req.body.newStage;

  let data = await talentCtrl.updateApplicationProgress(companyId, currentUserId, applicationId, newStage);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function getApplicationProgress(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = ObjectID(req.params.applicationId);
  let progressId = ObjectID(req.params.progressId);


  let data = await talentCtrl.getApplicationProgress(companyId, currentUserId, applicationId, progressId);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function getApplicationQuestions(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.getApplicationQuestions(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'questions_retrieved_successful':'not_found', res));
}



async function getApplicationLabels(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.getApplicationLabels(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'label_retrieved_successful':'not_found', res));
}


async function addApplicationLabel(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;
  let label = req.body;

  let data = await talentCtrl.addApplicationLabel(companyId, currentUserId, applicationId, label);

  res.json(new Response(data, data?'label_added_successful':'not_found', res));
}



async function deleteApplicationLabel(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;
  let labelId = req.params.labelId;

  let data = await talentCtrl.deleteApplicationLabel(companyId, currentUserId, applicationId, labelId);

  res.json(new Response(data, data?'label_deleted_successful':'not_found', res));
}



async function getApplicationComments(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;
  let filter = req.query;
  let data = await talentCtrl.getApplicationComments(companyId, currentUserId, applicationId, filter);

  res.json(new Response(data, data?'comment_retrieved_successful':'not_found', res));
}


async function addApplicationComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = ObjectID(req.params.applicationId);
  let comment = req.body;

  let data = await talentCtrl.addApplicationComment(companyId, currentUserId, applicationId, comment);

  res.json(new Response(data, data?'comment_added_successful':'not_found', res));
}



async function deleteApplicationComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;
  let commentId = req.params.commentId;

  let data = await talentCtrl.deleteApplicationComment(companyId, currentUserId, applicationId, commentId);

  res.json(new Response(data, data?'comment_deleted_successful':'not_found', res));
}


async function updateApplicationComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let commentId = req.params.commentId;
  let comment = req.body;

  let data = await talentCtrl.updateApplicationComment(currentUserId, applicationId, commentId, comment);

  res.json(new Response(data, data?'comment_updated_successful':'not_found', res));
}



//NOT DONE
async function getApplicationEvaluations(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let pagination = req.query;
  let data = await talentCtrl.getApplicationEvaluations(companyId, currentUserId, applicationId, pagination);

  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
}


async function searchApplicationEmails(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let applicationId = ObjectID(req.params.applicationId);
  let sort = req.query;


  let data = await talentCtrl.searchApplicationEmails(currentUserId, companyId, applicationId, sort, res.locale);
  res.json(new Response(data, data?'emails_retrieved_successful':'not_found', res));
}

async function addApplicationProgressEvaluation(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let progressId = req.params.progressId;
  let evaluation = req.body;

  let data = await talentCtrl.addApplicationProgressEvaluation(companyId, currentUserId, applicationId, progressId, evaluation);

  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
}

async function removeApplicationProgressEvaluation(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let progressId = ObjectID(req.params.progressId);

  let data = await talentCtrl.removeApplicationProgressEvaluation(companyId, currentUserId, applicationId, progressId);

  res.json(new Response(data, data?'evaluation_removed_successful':'not_found', res));
}


async function updateApplicationProgressEvent(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let progressId = ObjectID(req.params.progressId);
  let form = req.body;

  let data = await talentCtrl.updateApplicationProgressEvent(companyId, currentUserId, applicationId, progressId, form);

  res.json(new Response(data, data?'application_event_updated_successful':'not_found', res));
}


async function removeApplicationProgressEvent(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let progressId = ObjectID(req.params.progressId);

  let data = await talentCtrl.removeApplicationProgressEvent(companyId, applicationId, progressId);

  res.json(new Response(data, data?'application_event_updated_successful':'not_found', res));
}


async function disqualifyApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let disqualification = req.body;

  let data = await talentCtrl.disqualifyApplication(companyId, currentUserId, applicationId, disqualification);

  res.json(new Response(data, data?'application_disqualified_successful':'not_found', res));
}


async function revertApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);

  let data = await talentCtrl.revertApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_reverted_successful':'not_found', res));
}


async function deleteApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);

  let data = await talentCtrl.deleteApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_deleted_successful':'not_found', res));
}


async function acceptApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);

  let data = await talentCtrl.acceptApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_accepted_successful':'not_found', res));
}

async function rejectApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);

  let data = await talentCtrl.rejectApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_rejected_successful':'not_found', res));
}

async function subscribeApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.subscribeApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_subscribed_successful':'not_found', res));
}


async function unsubscribeApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.unsubscribeApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_unsubscribeed_successful':'not_found', res));
}




async function getApplicationActivities(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let sort = req.query;
  let data = await talentCtrl.getApplicationActivities(companyId, currentUserId, applicationId, sort);

  res.json(new Response(data, data?'activities_retrieved_successful':'not_found', res));
}



async function updateJobPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);
  let form = req.body;
  form._id = ObjectID(form._id);

  if(form.pipelineTemplateId){
    form.pipelineTemplateId = ObjectID(form.pipelineTemplateId);
  }



  let data = await talentCtrl.updateJobPipeline(companyId, jobId, currentUserId, form);
  res.json(new Response(data, data?'job_pipeline_updated_successful':'not_found', res));
}


async function getJobPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);

  let data = await talentCtrl.getJobPipeline(companyId, jobId, currentUserId);
  res.json(new Response(data, data?'job_pipeline_retreived_successful':'not_found', res));
}


async function getJobMembers(req, res) {
  let jobId = ObjectID(req.params.jobId);

  let data = await talentCtrl.getJobMembers(jobId);
  res.json(new Response(data, data?'job_member_retrieved_successful':'not_found', res));
}

async function updateJobMembers(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);
  let members = _.reduce(req.body.members, function(res, item){ res.push(ObjectID(item)); return res;},  []);
  console.log(members)
  let data = await talentCtrl.updateJobMembers(companyId, currentUserId, jobId, members);
  res.json(new Response(data, data?'job_member_updated_successful':'not_found', res));
}



async function subscribeJob(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let memberId = req.header('memberId');
  let jobId = req.params.jobId;

  let data = await talentCtrl.subscribeJob(currentUserId, companyId, jobId);

  res.json(new Response(data, data?'job_subsribed_successful':'not_found', res));
}


async function unsubscribeJob(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let memberId = req.header('memberId');
  let jobId = req.params.jobId;

  let data = await talentCtrl.unsubscribeJob(currentUserId, companyId, jobId);

  res.json(new Response(data, data?'job_unsubscribed_successful':'not_found', res));
}


async function updateJobApplicationForm(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);
  let form = req.body;

  if(form.questionTemplateId){
    form.questionTemplateId = ObjectID(form.questionTemplateId);
  }

  let data = await talentCtrl.updateJobApplicationForm(companyId, currentUserId, jobId, form);
  res.json(new Response(data, data?'job_applicationform_updated_successful':'not_found', res));
}




async function getBoard(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let filter = req.query;
  let jobId = ObjectID(req.params.jobId);
  let data = await talentCtrl.getBoard(currentUserId, companyId, jobId, filter, res.locale);
  res.json(new Response(data, data?'board_retrieved_successful':'not_found', res));
}


async function addCandidate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let form = req.body;


  let data = await talentCtrl.addCandidate(currentUserId, company, form);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}



async function importResumes(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.importResumes(companyId, currentUserId, req.files);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}

async function searchCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let filter = {...req.body, company: [company]};
  let sort = req.query;
  filter.query = req.query.query;
  filter.tags = _.reduce(filter.tags, function(res, item){res.push(ObjectID(item)); return res;}, []);
  filter.sources = _.reduce(filter.sources, function(res, item){res.push(ObjectID(item)); return res;}, []);
  let data = await talentCtrl.searchCandidates(currentUserId, company, filter, sort, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}


async function getCandidateById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let company = parseInt(req.params.id);
  let candidateId = isNaN(req.params.candidateId)?ObjectID(req.params.candidateId):parseInt(req.params.candidateId);

  data = await talentCtrl.getCandidateById(currentUserId, company, candidateId, res.locale);
  res.json(new Response(data, data?'candidate_retrieved_successful':'not_found', res));
}


async function updateCandidateById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;

  data = await talentCtrl.updateCandidateById(currentUserId, company, candidateId, form);
  res.json(new Response(data, data?'candidate_retrieved_successful':'not_found', res));
}


async function removeCandidateById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  data = await talentCtrl.removeCandidateById(currentUserId, company, candidateId);
  res.json(new Response(data, data ? 'candidate_removed_successful' : 'not_found', res));

}

async function getCandidateNotes(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = req.params.candidateId;
  let sort = req.query;

  let data = await talentCtrl.getCandidateNotes(companyId, currentUserId, candidateId, sort);

  res.json(new Response(data, data?'notes_retrieved_successful':'not_found', res));
}

async function addCandidateNote(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let note = req.body;

  let data = await talentCtrl.addCandidateNote(companyId, currentUserId, candidateId, note);

  res.json(new Response(data, data?'note_added_successful':'not_found', res));
}



async function removeCandidateNote(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let noteId = req.params.noteId;

  let data = await talentCtrl.removeCandidateNote(companyId, currentUserId, candidateId, noteId);

  res.json(new Response(data, data?'note_removed_successful':'not_found', res));
}


async function addCandidateTag(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let tags = req.body.tags;

  let data = await talentCtrl.addCandidateTag(companyId, currentUserId, candidateId, tags);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function removeCandidateTag(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let tagId = req.params.tagId;

  let data = await talentCtrl.removeCandidateTag(companyId, currentUserId, candidateId, tagId);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function addCandidateSources(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let sources = req.body.sources;

  let data = await talentCtrl.addCandidateSources(companyId, currentUserId, candidateId, sources);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}


async function addCandidateSource(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let source = ObjectID(req.body.source);

  let data = await talentCtrl.addCandidateSource(companyId, currentUserId, candidateId, source);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function removeCandidateSource(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let sourceId = req.params.sourceId;

  let data = await talentCtrl.removeCandidateSource(companyId, currentUserId, candidateId, sourceId);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function updateCandidatePool(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = req.params.candidateId;
  let poolIds = req.body.pools;

  let data = await talentCtrl.updateCandidatePool(companyId, currentUserId, candidateId, poolIds);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}


async function getCandidateEvaluations(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = isNaN(req.params.candidateId)?ObjectID(req.params.candidateId):parseInt(req.params.candidateId);
  let filter = req.body;
  let sort = req.query;
  console.log(req.params.candidateId)

  let data = await talentCtrl.getCandidateEvaluations(companyId, currentUserId, candidateId, filter, sort);

  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
}

async function getCandidateEvaluationById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let evaluationId = ObjectID(req.params.evaluationId);


  let data = await talentCtrl.getCandidateEvaluationById(company, currentUserId, evaluationId, res.locale);
  res.json(new Response(data, data?'evaluation_retrieved_successful':'not_found', res));
}


async function getCandidatesSimilar(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = req.params.candidateId;


  let data = await talentCtrl.getCandidatesSimilar(company, currentUserId, candidateId, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}

async function getCandidateActivities(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let sort = req.query;

  let data = await talentCtrl.getCandidateActivities(company, currentUserId, candidateId, sort);
  res.json(new Response(data, data?'activities_retrieved_successful':'not_found', res));
}


async function addCandidateExperience(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;

  let data = await talentCtrl.addCandidateExperience(company, currentUserId, candidateId, form);
  res.json(new Response(data, data?'experiences_added_successful':'not_found', res));
}


async function getCandidateExperiences(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateExperiences(company, currentUserId, candidateId);
  res.json(new Response(data, data?'experiences_retrieved_successful':'not_found', res));
}


async function removeCandidateExperience(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let experienceId = ObjectID(req.params.experienceId);

  let data = await talentCtrl.removeCandidateExperience(company, currentUserId, candidateId, experienceId);
  res.json(new Response(data, data?'experience_deleted_successful':'not_found', res));
}

async function addCandidateEducation(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;

  let data = await talentCtrl.addCandidateEducation(company, currentUserId, candidateId, form);
  res.json(new Response(data, data?'educations_added_successful':'not_found', res));
}


async function getCandidateEducations(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateEducations(company, currentUserId, candidateId);
  res.json(new Response(data, data?'educations_retrieved_successful':'not_found', res));
}

async function removeCandidateEducation(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let educationId = ObjectID(req.params.educationId);

  let data = await talentCtrl.removeCandidateEducation(company, currentUserId, candidateId, educationId);
  res.json(new Response(data, data?'educations_deleted_successful':'not_found', res));
}


async function getCandidateSkills(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateSkills(company, currentUserId, candidateId);
  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}

async function addCandidateSkills(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;
  form = _.reduce(form, function(res, skill){
    if(skill._id){
      skill._id=ObjectID(skill._id);
    }
    res.push(skill);
    return res;
  }, []);

  let data = await talentCtrl.addCandidateSkills(company, currentUserId, candidateId, form);
  res.json(new Response(data, data?'skills_added_successful':'not_found', res));
}

async function removeCandidateSkill(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let skillId = req.params.skillId;

  let data = await talentCtrl.removeCandidateSkill(companyId, currentUserId, candidateId, sourceId);

  res.json(new Response(data, data?'skill_removed_successful':'not_found', res));
}

async function getCandidateAccomplishments(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateAccomplishments(company, currentUserId, candidateId);
  res.json(new Response(data, data?'accomplishments_retrieved_successful':'not_found', res));
}



async function getCandidateAccomplishments(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateAccomplishments(company, currentUserId, candidateId);
  res.json(new Response(data, data?'accomplishments_retrieved_successful':'not_found', res));
}

async function addCandidateLanguages(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;

  let data = await talentCtrl.addCandidateLanguages(company, currentUserId, candidateId, form);
  res.json(new Response(data, data?'languages_added_successful':'not_found', res));
}



async function uploadAvatar(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId)  ;
  let data = await talentCtrl.uploadAvatar(companyId, currentUserId, candidateId, req.files);

  res.json(new Response(data, data?'avatar_uploaded_successful':'not_found', res));
}


async function uploadCandidateResume(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId)  ;
  let data = await talentCtrl.uploadCandidateResume(companyId, currentUserId, candidateId, req.files);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}



async function getCandidateResumes(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId)  ;
  let data = await talentCtrl.getCandidateResumes(companyId, currentUserId, candidateId);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}


async function assignCandidatesJobs(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidates = _.reduce(req.body.candidates, function(res, i){ res.push(ObjectID(i)); return res;}, []);
  let jobs = _.reduce(req.body.jobs, function(res, i){ res.push(ObjectID(i)); return res;}, []);

  let data = await talentCtrl.assignCandidatesJobs(company, currentUserId, candidates, jobs);
  res.json(new Response(data, data?'activities_retrieved_successful':'not_found', res));
}


async function checkCandidateEmail(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let email = req.query.email;

  let data = await talentCtrl.checkCandidateEmail(company, currentUserId, email);
  res.json(new Response(data, data?'email_retrieved_successful':'not_found', res));
}


async function getCandidateEvaluationsStats(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = isNaN(req.params.candidateId)?ObjectID(req.params.candidateId):parseInt(req.params.candidateId);
  let filter = req.body;

  let data = await talentCtrl.getCandidateEvaluationsStats(companyId, currentUserId, candidateId, filter);

  res.json(new Response(data, data?'evaluationstats_retrieved_successful':'not_found', res));
}



async function getAllCandidatesSkills(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let evaluationId = req.params.evaluationId;


  let data = await talentCtrl.getAllCandidatesSkills(company, currentUserId, res.locale);
  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}

/************************** DEPARTMENT *****************************/

async function addCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let department = req.body;
  department.company = company;
  department.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyDepartment(company, currentUserId, department);
  res.json(new Response(data, data?'department_added_successful':'not_found', res));
}

async function updateCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let departmentId = ObjectID(req.params.departmentId);
  let department = req.body;
  department.company = company;
  department.updatedBy = currentUserId;
  department._id = departmentId;
  let data = await talentCtrl.updateCompanyDepartment(company, departmentId, currentUserId, department);
  res.json(new Response(data, data?'department_updated_successful':'not_found', res));
}

async function deleteCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let departmentId = req.params.departmentId;

  let data = await talentCtrl.deleteCompanyDepartment(company, departmentId, currentUserId);
  res.json(new Response(data, data?'department_updated_successful':'not_found', res));
}

async function getCompanyDepartments(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query?req.query.query:'';

  let data = await talentCtrl.getCompanyDepartments(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'departments_retrieved_successful':'not_found', res));
}


async function addCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let question = req.body;
  question.company = company;
  question.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyQuestionTemplate(company, currentUserId, question);
  res.json(new Response(data, data?'question_added_successful':'not_found', res));
}

async function addCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let question = req.body;
  question.company = company;
  question.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyQuestionTemplate(company, currentUserId, question);
  res.json(new Response(data, data?'question_added_successful':'not_found', res));
}

async function getCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = ObjectID(req.params.questionTemplateId);

  let data = await talentCtrl.getCompanyQuestionTemplate(company, questionTemplateId, currentUserId);
  res.json(new Response(data, data?'question_retrieved_successful':'not_found', res));
}

async function updateCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = req.params.questionTemplateId;
  let question = req.body;
  question.company = company;
  question.updatedBy = currentUserId;

  let data = await talentCtrl.updateCompanyQuestionTemplate(company, questionTemplateId, currentUserId, question);
  res.json(new Response(data, data?'question_updated_successful':'not_found', res));
}

async function deleteCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = req.params.questionTemplateId;

  let data = await talentCtrl.deleteCompanyQuestionTemplate(company, questionTemplateId, currentUserId);
  res.json(new Response(data, data?'question_deleted_successful':'not_found', res));
}


async function deactivateCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = ObjectID(req.params.questionTemplateId);

  let data = await talentCtrl.deactivateCompanyQuestionTemplate(company, questionTemplateId, currentUserId);
  res.json(new Response(data, data?'question_deactivated_successful':'not_found', res));
}


async function activateCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = ObjectID(req.params.questionTemplateId);

  let data = await talentCtrl.activateCompanyQuestionTemplate(company, questionTemplateId, currentUserId);
  res.json(new Response(data, data?'question_activated_successful':'not_found', res));
}

async function getCompanyQuestionTemplates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query?req.query.query:'';

  let data = await talentCtrl.getCompanyQuestionTemplates(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'questions_retrieved_successful':'not_found', res));
}



async function addCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipeline = req.body;
  pipeline.company = company;
  pipeline.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyPipelineTemplate(company, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_added_successful':'not_found', res));
}

async function updateCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);
  let pipeline = req.body;

  let data = await talentCtrl.updateCompanyPipelineTemplate(company, pipelineId, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}

async function deleteCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);

  let data = await talentCtrl.deleteCompanyPipelineTemplate(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_deleted_successful':'not_found', res));
}


async function getCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);

  let data = await talentCtrl.getCompanyPipelineTemplate(company, pipelineId, currentUserId, res.locale);
  res.json(new Response(data, data?'pipeline_retrieved_successful':'not_found', res));
}


async function deactivateCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);

  let data = await talentCtrl.deactivateCompanyPipelineTemplate(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}


async function activateCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);

  let data = await talentCtrl.activateCompanyPipelineTemplate(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}

async function getCompanyPipelineTemplates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await talentCtrl.getCompanyPipelineTemplates(company, currentUserId, res.locale);
  res.json(new Response(data, data?'pipelines_retrieved_successful':'not_found', res));
}


async function addCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let role = req.body;
  role.company = company;
  role.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyRole(company, currentUserId, role);
  res.json(new Response(data, data?'role_added_successful':'not_found', res));
}

async function updateCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;
  let role = req.body;

  let data = await talentCtrl.updateCompanyRole(company, currentUserId, roleId, role);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}

async function deleteCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;

  let data = await talentCtrl.deleteCompanyRole(company, currentUserId, roleId);
  res.json(new Response(data, data?'role_deleted_successful':'not_found', res));
}


async function disableCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = ObjectID(req.params.roleId);

  let data = await talentCtrl.disableCompanyRole(company, currentUserId, roleId);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}

async function enableCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;

  let data = await talentCtrl.enableCompanyRole(company, currentUserId, roleId);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}
async function getCompanyRoles(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let filter = req.query;
  filter.all = filter.all=='true'?true:false;

  let data = await talentCtrl.getCompanyRoles(company, currentUserId, filter, res.locale);
  res.json(new Response(data, data?'roles_retrieved_successful':'not_found', res));
}



async function addCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let role = req.body;
  role.company = company;
  role.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyRole(company, currentUserId, role);
  res.json(new Response(data, data?'role_added_successful':'not_found', res));
}

async function updateCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;
  let role = req.body;
  role.company = company;
  role.createdBy = currentUserId;

  let data = await talentCtrl.updateCompanyRole(company, roleId, currentUserId, role);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}

async function deleteCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;

  let data = await talentCtrl.deleteCompanyMember(company, roleId, currentUserId);
  res.json(new Response(data, data?'role_deleted_successful':'not_found', res));
}

async function getCompanyMembers(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await talentCtrl.getCompanyRoles(company, currentUserId, res.locale);
  res.json(new Response(data, data?'roles_retrieved_successful':'not_found', res));
}

/************************** LABELS *****************************/
async function getCompanyLabels(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;
  let types = req.query.type.split(',');

  let data = await talentCtrl.getCompanyLabels(company, query, types, res.locale);
  res.json(new Response(data, data?'labels_retrieved_successful':'not_found', res));
}

async function addCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let label = req.body;
  label.company = company;
  // label.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyLabel(company, currentUserId, label);
  res.json(new Response(data, data?'label_added_successful':'not_found', res));
}

async function updateCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let labelId = req.params.labelId;
  let label = req.body;
  label.company = company;
  label.createdBy = currentUserId;

  let data = await talentCtrl.updateCompanyLabel(company, labelId, currentUserId, label);
  res.json(new Response(data, data?'label_updated_successful':'not_found', res));
}

async function deleteCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let labelId = req.params.labelId;

  let data = await talentCtrl.deleteCompanyLabel(company, labelId, currentUserId);
  res.json(new Response(data, data?'label_deleted_successful':'not_found', res));
}




async function inviteMembers(req, res) {
  let company = parseInt(req.params.id);
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let form = req.body;

  let data = await talentCtrl.inviteMembers(company, currentUserId, form);
  res.json(new Response(data, data?'members_invited_successful':'not_found', res));
}


async function getCompanyMemberInvitations(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;

  let data = await talentCtrl.getCompanyMemberInvitations(company, currentUserId, query, res.locale);
  res.json(new Response(data, data?'members_retrieved_successful':'not_found', res));
}


async function cancelMemberInvitation(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let invitationId = ObjectID(req.params.invitationId);

  let data = await talentCtrl.cancelMemberInvitation(company, currentUserId, invitationId);
  res.json(new Response(data, data?'members_retrieved_successful':'not_found', res));
}


async function acceptMemberInvitation(req, res) {
  let company = parseInt(req.params.id);
  let member = req.body;
  let invitationId = req.query.invitationId;
  member.company = company;


  let data = await talentCtrl.acceptMemberInvitation(company, member, invitationId);
  res.json(new Response(data, data?'member_accepted_successful':'not_found', res));
}


async function getCompanyMembers(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;

  let data = await talentCtrl.getCompanyMembers(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'members_retrieved_successful':'not_found', res));
}


async function addCompanyMember(req, res) {
  let company = parseInt(req.params.id);
  let member = req.body;
  let invitationId = req.query.invitationId;
  member.company = company;


  let data = await talentCtrl.addCompanyMember(company, member, invitationId);
  res.json(new Response(data, data?'member_added_successful':'not_found', res));
}


async function getCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let memberId = req.params.memberId;

  let data = await talentCtrl.getCompanyMember(company, memberId, currentUserId);
  res.json(new Response(data, data?'member_retrieved_successful':'not_found', res));
}




async function updateCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let memberId = req.params.memberId;
  let member = req.body;
  member.company = company;
  member.createdBy = currentUserId;

  let data = await talentCtrl.updateCompanyMember(company, memberId, currentUserId, member);
  res.json(new Response(data, data?'member_updated_successful':'not_found', res));
}

async function updateCompanyMemberRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let memberId = req.params.memberId;
  let role = req.body.role;

  let data = await talentCtrl.updateCompanyMemberRole(company, memberId, currentUserId, role);
  res.json(new Response(data, data?'member_updated_successful':'not_found', res));
}

async function deleteCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let memberId = ObjectID(req.params.memberId);
  console.log(memberId)
  let data = await talentCtrl.deleteCompanyMember(company, currentUserId, memberId);
  res.json(new Response(data, data?'member_deleted_successful':'not_found', res));
}



async function getJobsSubscribed(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let sort = req.query;
  let data = await talentCtrl.getJobsSubscribed(company, currentUserId, sort);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function getApplicationsSubscribed(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let sort = req.query;
  let data = await talentCtrl.getApplicationsSubscribed(company, currentUserId, sort);
  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}


async function getNotificationPreference(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let data = await talentCtrl.getNotificationPreference(company, currentUserId);
  res.json(new Response(data, data?'notification_preferene_retrieved_successful':'not_found', res));
}


async function updateNotificationPreference(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let data = await talentCtrl.updateNotificationPreference(company, currentUserId, req.body);
  res.json(new Response(data, data?'notification_preferene_updated_successful':'not_found', res));
}

async function searchTasks(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let filter = req.body;
  let sort = req.query;
  let query = req.query.query;
  let data = await talentCtrl.searchTasks(company, currentUserId, filter, sort, query);
  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}



async function getCompanyPools(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;
  let candidateId = req.query.candidateId?ObjectID(req.query.candidateId):null;
  let id = req.query.id?parseInt(req.query.id):null;

  let data = await talentCtrl.getCompanyPools(company, currentUserId, query, candidateId, id, res.locale);
  res.json(new Response(data, data?'pools_retrieved_successful':'not_found', res));
}


async function getCompanyPoolById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = ObjectID(req.params.poolId);

  let data = await talentCtrl.getCompanyPoolById(company, currentUserId, poolId, res.locale);
  res.json(new Response(data, data?'pool_retrieved_successful':'not_found', res));
}

async function addCompanyPool(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pool = req.body;
  pool.company = company;


  let data = await talentCtrl.addCompanyPool(company, pool, currentUserId);
  res.json(new Response(data, data?'pool_added_successful':'not_found', res));
}

async function updateCompanyPool(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;
  let pool = req.body;
  pool.company = company;

  let data = await talentCtrl.updateCompanyPool(company, poolId, currentUserId, pool);
  res.json(new Response(data, data?'pool_updated_successful':'not_found', res));
}

async function deleteCompanyPool(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;

  let data = await talentCtrl.deleteCompanyPool(company, poolId, currentUserId);
  res.json(new Response(data, data?'pool_deleted_successful':'not_found', res));
}


async function getPoolCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = ObjectID(req.params.poolId);
  let sort = req.query;
  let query = req.query.query?req.query.query:'';

  let data = await talentCtrl.getPoolCandidates(company, currentUserId, poolId, query, sort);
  res.json(new Response(data, data?'candidate_retrieved_successful':'not_found', res));
}

async function addPoolCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;
  let candidates = _.reduce(req.body.candidates, function(res, item){res.push(ObjectID(item)); return res;}, []);

  let data = await talentCtrl.addPoolCandidates(company, currentUserId, poolId, candidates);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}


async function removePoolCandidate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;
  let candidateId = req.params.candidateId;

  let data = await talentCtrl.removePoolCandidate(company, poolId, candidateId, currentUserId);
  res.json(new Response(data, data?'candidate_removed_successful':'not_found', res));
}


async function removePoolCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;
  let candidates = req.body.candidates;

  let data = await talentCtrl.removePoolCandidates(company, poolId, candidates, currentUserId);
  res.json(new Response(data, data?'candidates_removed_successful':'not_found', res));
}



async function getCompanyProjects(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;

  let data = await talentCtrl.getCompanyProjects(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'projects_retrieved_successful':'not_found', res));
}


async function addCompanyProject(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let project = req.body;
  project.company = company;


  let data = await talentCtrl.addCompanyProject(company, project, currentUserId);
  res.json(new Response(data, data?'project_added_successful':'not_found', res));
}

async function updateCompanyProject(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let project = req.body;
  project.company = company;

  let data = await talentCtrl.updateCompanyProject(company, projectId, currentUserId, project);
  res.json(new Response(data, data?'project_updated_successful':'not_found', res));
}

async function deleteCompanyProject(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;

  let data = await talentCtrl.deleteCompanyProject(company, projectId, currentUserId);
  res.json(new Response(data, data?'project_deleted_successful':'not_found', res));
}


async function getProjectCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let sort = req.query;

  let data = await talentCtrl.getProjectCandidates(company, projectId, currentUserId, sort);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}

async function addProjectCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let candidates = req.body.candidates;

  candidates.forEach(function(id){ id = parseInt(id); });
  let data = await talentCtrl.addProjectCandidates(company, projectId, candidates, currentUserId);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}


async function removeProjectCandidate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let candidateId = req.params.candidateId;

  let data = await talentCtrl.removeProjectCandidate(company, projectId, candidateId, currentUserId);
  res.json(new Response(data, data?'candidate_removed_successful':'not_found', res));
}


async function removeProjectCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let candidates = req.body.candidates;

  let data = await talentCtrl.removeProjectCandidates(company, projectId, candidates, currentUserId);
  res.json(new Response(data, data?'candidates_removed_successful':'not_found', res));
}


async function updateCandidateProject(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let peopleId = req.params.peopleId;
  let projectIdss = req.body.projects;

  let data = await talentCtrl.updateCandidateProject(companyId, currentUserId, peopleId, projectIdss);

  res.json(new Response(data, data?'projects_added_successful':'not_found', res));
}


async function updatePeoplePool(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let peopleId = parseInt(req.params.peopleId);
  let poolIds = req.body.pools;

  let data = await talentCtrl.updatePeoplePool(companyId, currentUserId, peopleId, poolIds);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function getPeopleFlagged(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let sort = req.query;
  let data = await talentCtrl.getPeopleFlagged(companyId, currentUserId, sort);

  res.json(new Response(data, data?'blacklist_retrieved_successful':'not_found', res));
}


async function uploadApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let data = await talentCtrl.uploadApplication(companyId, currentUserId, applicationId, req.files);

  res.json(new Response(data, data?'files_retrieved_successful':'not_found', res));
}

async function getFiles(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let data = await talentCtrl.getFiles(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'files_retrieved_successful':'not_found', res));
}




async function getCompanyEvaluationTemplates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let filter = req.query;
  filter.all = filter.all=='true'?true:false;

  let data = await talentCtrl.getCompanyEvaluationTemplates(companyId, filter, currentUserId, res.locale);
  res.json(new Response(data, data?'evaluations_retrieved_successful':'not_found', res));
}


async function addCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let evlaluation = req.body;
  evlaluation.company = company;


  let data = await talentCtrl.addCompanyEvaluationTemplate(company, evlaluation, currentUserId);
  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
}



async function getCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = req.params.templateId;

  let data = await talentCtrl.getCompanyEvaluationTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'evaluation_retrieved_successful':'not_found', res));
}

async function updateCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let templateId = req.params.templateId;
  let template = req.body;
  template.company = ObjectID(template.company);
  let data = await talentCtrl.updateCompanyEvaluationTemplate(company, templateId, currentUserId, template);
  res.json(new Response(data, data?'evaluation_updated_successful':'not_found', res));
}

async function deleteCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = req.params.templateId;

  let data = await talentCtrl.deleteCompanyEvaluationTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'evlaluation_deleted_successful':'not_found', res));
}


async function deactivateCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = ObjectID(req.params.templateId);

  let data = await talentCtrl.deactivateCompanyEvaluationTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}


async function activateCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = ObjectID(req.params.templateId);

  let data = await talentCtrl.activateCompanyEvaluationTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}

async function getEvaluationFilters(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getEvaluationFilters(companyId, currentUserId);
  res.json(new Response(data, data?'filters_retrieved_successful':'not_found', res));
}


async function getEvaluationFilters(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getEvaluationFilters(companyId, currentUserId);
  res.json(new Response(data, data?'filters_retrieved_successful':'not_found', res));
}


async function getCompanyEmailTemplates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let filter = req.query;
  filter.all = filter.all=='true'?true:false;
  let data = await talentCtrl.getCompanyEmailTemplates(companyId, currentUserId,  filter, res.locale);
  res.json(new Response(data, data?'emails_retrieved_successful':'not_found', res));
}


async function addCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let email = req.body;
  email.company = companyId;


  let data = await talentCtrl.addCompanyEmailTemplate(companyId, email, currentUserId);
  res.json(new Response(data, data?'email_added_successful':'not_found', res));
}

async function updateCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = req.params.templateId;
  let template = req.body;

  let data = await talentCtrl.updateCompanyEmailTemplate(companyId, templateId, currentUserId, template);
  res.json(new Response(data, data?'email_updated_successful':'not_found', res));
}

async function deleteCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let templateId = req.params.templateId;

  let data = await talentCtrl.deleteCompanyEmailTemplate(company, templateId, currentUserId);
  res.json(new Response(data, data?'email_deleted_successful':'not_found', res));
}


async function deactivateCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = ObjectID(req.params.templateId);

  let data = await talentCtrl.deactivateCompanyEmailTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}


async function activateCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = ObjectID(req.params.templateId);

  let data = await talentCtrl.activateCompanyEmailTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}

async function searchContacts(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let query = req.query.query?req.query.query:'';
  let data = await talentCtrl.searchContacts(companyId, currentUserId, query);
  res.json(new Response(data, data?'contacts_retrieved_successful':'not_found', res));
}


