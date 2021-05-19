const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const companyCtrl = require('../controllers/company.controller');
const talentCtrl = require('../controllers/talent.controller');

let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/session').get(asyncHandler(getUserSession));
router.route('/company').get(asyncHandler(getCompanies));
router.route('/company/:id/insights').get(asyncHandler(getInsights));
router.route('/company/:id/stats').get(asyncHandler(getStats));

router.route('/company/:id/jobs').post(asyncHandler(createJob));
router.route('/company/:id/jobs').get(asyncHandler(searchJob));
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

router.route('/company/:id/jobs/:jobId/pay').post(asyncHandler(payJob));
router.route('/company/:id/jobs/:jobId/activities').get(asyncHandler(getJobActivities));
router.route('/company/:id/jobs/:jobId/applications').get(asyncHandler(searchJobApplications));

router.route('/company/:id/jobs/:jobId/pipeline').post(asyncHandler(updateJobPipeline));
router.route('/company/:id/jobs/:jobId/pipeline').get(asyncHandler(getJobPipeline));
router.route('/company/:id/jobs/:jobId/members').post(asyncHandler(updateJobMembers));

router.route('/company/:id/jobs/:jobId/subscribe').post(asyncHandler(subscribeJob));
router.route('/company/:id/jobs/:jobId/subscribe').delete(asyncHandler(unsubscribeJob));
router.route('/company/:id/jobs/:jobId/applicationform').post(asyncHandler(updateJobApplicationForm));
router.route('/company/:id/jobs/:id/board').get(asyncHandler(getBoard));
router.route('/company/:id/jobs/:jobId/applications/:applicationId/reject').post(asyncHandler(rejectApplication));
router.route('/company/:id/jobs/:jobId/applications/:applicationId').post(asyncHandler(updateApplication));


// router.route('/company/:id/applications').get(asyncHandler(searchAllApplications));
router.route('/company/:id/applications/:applicationId/progress').post(asyncHandler(updateApplicationProgress));
router.route('/company/:id/applications/:applicationId/questions').get(asyncHandler(getApplicationQuestions));

router.route('/company/:id/applications/:applicationId/labels').get(asyncHandler(getApplicationLabels));
router.route('/company/:id/applications/:applicationId/labels').post(asyncHandler(addApplicationLabel));
router.route('/company/:id/applications/:applicationId/labels/:labelId').delete(asyncHandler(deleteApplicationLabel));

router.route('/company/:id/applications/:applicationId/comments').get(asyncHandler(getApplicationComments));
router.route('/company/:id/applications/:applicationId/comments').post(asyncHandler(addApplicationComment));
router.route('/company/:id/applications/:applicationId/comments/:commentId').delete(asyncHandler(deleteApplicationComment));
router.route('/company/:id/applications/:applicationId/comments/:commentId').put(asyncHandler(updateApplicationComment));

router.route('/company/:id/applications/:applicationId/progress/:progressId/evaluate').post(asyncHandler(addApplicationProgressEvaluation));
router.route('/company/:id/applications/:applicationId/progress/:progressId/evaluate').delete(asyncHandler(removeApplicationProgressEvaluation));


router.route('/company/:id/applications/:applicationId/disqualify').post(asyncHandler(disqualifyApplication));
router.route('/company/:id/applications/:applicationId/revert').post(asyncHandler(revertApplication));


router.route('/company/:id/applications/:applicationId/subscribe').post(asyncHandler(subscribeApplication));
router.route('/company/:id/applications/:applicationId/subscribe').delete(asyncHandler(unsubscribeApplication));

router.route('/company/:id/applications/:applicationId/activities').get(asyncHandler(getApplicationActivities));



router.route('/company/:id/candidates').post(asyncHandler(searchCandidates));
router.route('/company/:id/candidates/:candidateId/evaluations').get(asyncHandler(getApplicationEvaluations));


router.route('/company/:id/departments').post(asyncHandler(addCompanyDepartment));
router.route('/company/:id/departments/:departmentId').put(asyncHandler(updateCompanyDepartment));
router.route('/company/:id/departments/:departmentId').delete(asyncHandler(deleteCompanyDepartment));
router.route('/company/:id/departments').get(asyncHandler(getCompanyDepartments));


router.route('/company/:id/questions/templates').post(asyncHandler(addCompanyQuestionTemplate));
router.route('/company/:id/questions/templates/:questionTemplateId').put(asyncHandler(updateCompanyQuestionTemplate));
router.route('/company/:id/questions/templates/:questionTemplateId').delete(asyncHandler(deleteCompanyQuestionTemplate));
router.route('/company/:id/questions/templates').get(asyncHandler(getCompanyQuestionTemplates));

router.route('/company/:id/pipelines').post(asyncHandler(addCompanyPipelineTemplate));
router.route('/company/:id/pipelines/:pipelineId').put(asyncHandler(updateCompanyPipelineTemplate));
router.route('/company/:id/pipelines/:pipelineId').delete(asyncHandler(deleteCompanyPipelineTemplate));
router.route('/company/:id/pipelines/:pipelineId').get(asyncHandler(getCompanyPipelineTemplate));
router.route('/company/:id/pipelines').get(asyncHandler(getCompanyPipelineTemplates));

router.route('/company/:id/roles').post(asyncHandler(addCompanyRole));
router.route('/company/:id/roles/:roleId').put(asyncHandler(updateCompanyRole));
router.route('/company/:id/roles/:roleId').delete(asyncHandler(deleteCompanyRole));
router.route('/company/:id/roles').get(asyncHandler(getCompanyRoles));

router.route('/company/:id/labels').post(asyncHandler(addCompanyLabel));
router.route('/company/:id/labels/:labelId').put(asyncHandler(updateCompanyLabel));
router.route('/company/:id/labels/:labelId').delete(asyncHandler(deleteCompanyLabel));
router.route('/company/:id/labels').get(asyncHandler(getCompanyLabels));

router.route('/company/:id/members/invites').post(asyncHandler(inviteMembers));
router.route('/company/:id/members/invites').get(asyncHandler(getCompanyMemberInvitations));

router.route('/company/:id/members').get(asyncHandler(getCompanyMembers));
router.route('/company/:id/members').post(asyncHandler(addCompanyMember));
router.route('/company/:id/members/:memberId').put(asyncHandler(updateCompanyMember));
router.route('/company/:id/members/:memberId/role').put(asyncHandler(updateCompanyMemberRole));
router.route('/company/:id/members/:memberId').delete(asyncHandler(deleteCompanyMember));

router.route('/company/:id/pools').get(asyncHandler(getCompanyPools));
router.route('/company/:id/pools').post(asyncHandler(addCompanyPool));
router.route('/company/:id/pools/:poolId').put(asyncHandler(updateCompanyPool));
router.route('/company/:id/pools/:poolId').delete(asyncHandler(deleteCompanyPool));

async function getInsights(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let timeframe = req.query.timeframe

  let data = await talentCtrl.getInsights(currentUserId, companyId, timeframe);
  res.json(new Response(data, data?'get_insights_successful':'not_found', res));
}

async function getStats(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getStats(currentUserId, companyId);
  res.json(new Response(data, data?'get_stats_successful':'not_found', res));
}



async function getUserSession(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let preferredCompany = req.query.company?req.query.company:null;

  let data = await talentCtrl.getUserSession(currentUserId, preferredCompany);
  res.json(new Response(data, data?'get_session_successful':'not_found', res));
}



async function getCompanies(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;

  let data = await talentCtrl.getCompanies(currentUserId);
  res.json(new Response(data, data?'companies_retrieved_successful':'not_found', res));
}


async function createJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let job = req.body;
  job.company = companyId;
  let data = await talentCtrl.createJob(companyId, currentUserId, job);
  res.json(new Response(data, data?'job_created_successful':'not_found', res));
}


async function updateJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.updateJob(companyId, currentUserId, jobId, req.body);
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

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let filter = req.query;

  let data = await talentCtrl.getJobComments(currentUserId, jobId, filter);

  res.json(new Response(data, data?'comment_retrieved_successful':'not_found', res));
}


async function addJobComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let comment = req.body;

  let data = await talentCtrl.addJobComment(currentUserId, jobId, comment);

  res.json(new Response(data, data?'comment_added_successful':'not_found', res));
}



async function deleteJobComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let commentId = req.params.commentId;

  let data = await talentCtrl.deleteJobComment(currentUserId, jobId, commentId);

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
  let filter = req.body;
  let pagination = req.query;
  filter.query = req.query.query;
  filter.company = [companyId];
  filter.department = req.query.department;


  let data = await talentCtrl.searchJobs(currentUserId, companyId, filter, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}

async function getJobById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let data = await talentCtrl.getJobById(currentUserId, companyId, jobId, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}


async function payJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;

  let jobId = req.params.jobId;
  let payment = req.body;

  let data = await talentCtrl.payJob(currentUserId, jobId, payment);
  res.json(new Response(data, data?'job_paid_successful':'not_found', res));
}



async function getJobActivities(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let filter = req.query;
  let data = await talentCtrl.getJobActivities(companyId, currentUserId, jobId, filter);

  res.json(new Response(data, data?'application_reverted_successful':'not_found', res));
}



async function searchJobApplications(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let filter = req.query;
  let jobId = req.params.jobId;
  let data = await talentCtrl.searchJobApplications(currentUserId, jobId, filter, res.locale);
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
  let jobId = req.params.jobId;
  let applicationId = parseInt(req.params.applicationId);
  let data = await talentCtrl.getJobById(currentUserId, jobId, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function updateApplication(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let applicationId = parseInt(req.params.applicationId);
  let requestBody = req.query.status;
  let data = await talentCtrl.updateApplication(currentUserId, jobId, applicationId, requestBody);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}

async function updateApplicationProgress(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let newStage = req.body.newStage;

  let data = await talentCtrl.updateApplicationProgress(currentUserId, applicationId, newStage);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function getApplicationQuestions(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.getApplicationQuestions(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'questions_retrieved_successful':'not_found', res));
}



async function getApplicationLabels(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.getApplicationLabels(currentUserId, applicationId);

  res.json(new Response(data, data?'label_retrieved_successful':'not_found', res));
}


async function addApplicationLabel(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let label = req.body;

  let data = await talentCtrl.addApplicationLabel(currentUserId, applicationId, label);

  res.json(new Response(data, data?'label_added_successful':'not_found', res));
}



async function deleteApplicationLabel(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let labelId = req.params.labelId;

  let data = await talentCtrl.deleteApplicationLabel(currentUserId, applicationId, labelId);

  res.json(new Response(data, data?'label_deleted_successful':'not_found', res));
}



async function getApplicationComments(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let filter = req.query;
  let data = await talentCtrl.getApplicationComments(currentUserId, applicationId, filter);

  res.json(new Response(data, data?'comment_retrieved_successful':'not_found', res));
}


async function addApplicationComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let comment = req.body;

  let data = await talentCtrl.addApplicationComment(currentUserId, applicationId, comment);

  res.json(new Response(data, data?'comment_added_successful':'not_found', res));
}



async function deleteApplicationComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let commentId = req.params.commentId;

  let data = await talentCtrl.deleteApplicationComment(currentUserId, applicationId, commentId);

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



async function getApplicationEvaluations(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = parseInt(req.params.candidateId);
  let applicationId = req.query.applicationId;
  let progressId = req.query.progressId;
  let filter = req.body;

  let data = await talentCtrl.getApplicationEvaluations(companyId, currentUserId, candidateId, applicationId, progressId, filter);

  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
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
  let applicationId = req.params.applicationId;
  let progressId = req.params.progressId;
  let evaluation = req.body;

  let data = await talentCtrl.removeApplicationProgressEvaluation(companyId, currentUserId, applicationId, progressId, evaluation);

  res.json(new Response(data, data?'evaluation_removed_successful':'not_found', res));
}


async function disqualifyApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let disqualification = req.body;

  let data = await talentCtrl.disqualifyApplication(companyId, currentUserId, applicationId, disqualification);

  res.json(new Response(data, data?'application_disqualified_successful':'not_found', res));
}


async function revertApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.revertApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_reverted_successful':'not_found', res));
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
  let applicationId = req.params.applicationId;
  let filter = req.query;
  let data = await talentCtrl.getApplicationActivities(companyId, currentUserId, applicationId, filter);

  res.json(new Response(data, data?'application_reverted_successful':'not_found', res));
}



async function updateJobPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let pipeline = req.body;

  let data = await talentCtrl.updateJobPipeline(companyId, jobId, currentUserId, pipeline);
  res.json(new Response(data, data?'job_pipeline_updated_successful':'not_found', res));
}


async function getJobPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.getJobPipeline(companyId, jobId, currentUserId);
  res.json(new Response(data, data?'job_pipeline_retreived_successful':'not_found', res));
}



async function updateJobMembers(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let jobId = req.params.jobId;
  let members = req.body.members;

  let data = await talentCtrl.updateJobMembers(jobId, currentUserId, members);
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
  let jobId = req.params.jobId;
  let form = req.body;

  let data = await talentCtrl.updateJobApplicationForm(jobId, currentUserId, form);
  res.json(new Response(data, data?'job_applicationform_updated_successful':'not_found', res));
}




async function getBoard(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;

  let filter = req.query;
  let jobId = parseInt(req.params.id);
  let data = await talentCtrl.getBoard(currentUserId, jobId, filter, res.locale);
  res.json(new Response(data, data?'board_retrieved_successful':'not_found', res));
}


async function searchCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let company = parseInt(req.params.id);
  let filter = req.body;
  let pagination = req.query;
  filter.query = req.query.query;


  data = await talentCtrl.searchCandidates(currentUserId, company, filter, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}



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
  let departmentId = req.params.departmentId;
  let department = req.body;
  department.company = company;
  department.createdBy = currentUserId;

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
  let pipelineId = parseInt(req.params.pipelineId);
  let pipeline = req.body;
  pipeline.company = company;
  pipeline.createdBy = currentUserId;

  let data = await talentCtrl.updateCompanyPipelineTemplate(company, pipelineId, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}

async function deleteCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = parseInt(req.params.pipelineId);

  let data = await talentCtrl.deleteCompanyPipelineTemplate(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_deleted_successful':'not_found', res));
}


async function getCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = req.params.pipelineId;

  let data = await talentCtrl.getCompanyPipelineTemplate(company, pipelineId, currentUserId, res.locale);
  res.json(new Response(data, data?'pipeline_retrieved_successful':'not_found', res));
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
  role.company = company;
  role.createdBy = currentUserId;

  let data = await talentCtrl.updateCompanyRole(company, roleId, currentUserId, role);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}

async function deleteCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;

  let data = await talentCtrl.deleteCompanyRole(company, roleId, currentUserId);
  res.json(new Response(data, data?'role_deleted_successful':'not_found', res));
}

async function getCompanyRoles(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await talentCtrl.getCompanyRoles(company, currentUserId, res.locale);
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

  let data = await talentCtrl.deleteCompanyRole(company, roleId, currentUserId);
  res.json(new Response(data, data?'role_deleted_successful':'not_found', res));
}

async function getCompanyMembers(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await talentCtrl.getCompanyRoles(company, currentUserId, res.locale);
  res.json(new Response(data, data?'roles_retrieved_successful':'not_found', res));
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

async function getCompanyLabels(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;
  let type = req.query.type;

  let data = await talentCtrl.getCompanyLabels(company, query, type, currentUserId, res.locale);
  res.json(new Response(data, data?'labels_retrieved_successful':'not_found', res));
}



async function inviteMembers(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let form = req.body;

  let data = await talentCtrl.inviteMembers(company, currentUserId, form);
  res.json(new Response(data, data?'members_invited_successful':'not_found', res));
}


async function getCompanyMemberInvitations(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;

  let data = await talentCtrl.getCompanyMemberInvitations(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'members_retrieved_successful':'not_found', res));
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
  let memberId = req.params.memberId;

  let data = await talentCtrl.deleteCompanyMember(company, memberId, currentUserId);
  res.json(new Response(data, data?'member_deleted_successful':'not_found', res));
}





async function getCompanyPools(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;

  let data = await talentCtrl.getCompanyPools(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'pools_retrieved_successful':'not_found', res));
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
