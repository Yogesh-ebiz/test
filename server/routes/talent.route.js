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
router.route('/company/:id/invite').get(asyncHandler(inviteMember));

router.route('/jobs').get(asyncHandler(searchJob));
router.route('/jobs/:id').get(asyncHandler(getJobById));
router.route('/jobs/:id/applications').get(asyncHandler(searchApplications));
router.route('/jobs/:id/applications/:applicationId/reject').post(asyncHandler(rejectApplication));
router.route('/jobs/:id/applications/:applicationId').post(asyncHandler(updateApplication));


router.route('/candidates').post(asyncHandler(searchCandidates));


router.route('/company/:id/departments').post(asyncHandler(addCompanyDepartment));
router.route('/company/:id/departments/:departmentId').put(asyncHandler(updateCompanyDepartment));
router.route('/company/:id/departments/:departmentId').delete(asyncHandler(deleteCompanyDepartment));
router.route('/company/:id/departments').get(asyncHandler(getCompanyDepartments));


router.route('/company/:id/pipelines').post(asyncHandler(addCompanyPipeline));
router.route('/company/:id/pipelines/:pipelineId').put(asyncHandler(updateCompanyPipeline));
router.route('/company/:id/pipelines/:pipelineId').delete(asyncHandler(deleteCompanyPipeline));
router.route('/company/:id/pipelines').get(asyncHandler(getCompanyPipelines));

router.route('/company/:id/roles').post(asyncHandler(addCompanyRole));
router.route('/company/:id/roles/:roleId').put(asyncHandler(updateCompanyRole));
router.route('/company/:id/roles/:roleId').delete(asyncHandler(deleteCompanyRole));
router.route('/company/:id/roles').get(asyncHandler(getCompanyRoles));

router.route('/company/:id/labels').post(asyncHandler(addCompanyLabel));
router.route('/company/:id/labels/:labelId').put(asyncHandler(updateCompanyLabel));
router.route('/company/:id/labels/:labelId').delete(asyncHandler(deleteCompanyLabel));
router.route('/company/:id/labels').get(asyncHandler(getCompanyLabels));

async function inviteMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let invitation = req.body;
  invitation.createdBy = currentUserId;

  let data = await talentCtl.inviteMember(currentUserId, invitation);
  res.json(new Response(data, data?'member_invited_successful':'not_found', res));
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

async function updateApplication(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let applicationId = parseInt(req.params.applicationId);
  let requestBody = req.query.status;
  let data = await talentCtrl.updateApplication(currentUserId, jobId, applicationId, requestBody);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
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

  let data = await talentCtrl.getCompanyDepartments(company, currentUserId, res.locale);
  res.json(new Response(data, data?'departments_retrieved_successful':'not_found', res));
}



async function addCompanyPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipeline = req.body;
  pipeline.company = company;
  pipeline.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyPipeline(company, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_added_successful':'not_found', res));
}

async function updateCompanyPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = parseInt(req.params.pipelineId);
  let pipeline = req.body;
  pipeline.company = company;
  pipeline.createdBy = currentUserId;

  let data = await talentCtrl.updateCompanyPipeline(company, pipelineId, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}

async function deleteCompanyPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = parseInt(req.params.pipelineId);

  let data = await talentCtrl.deleteCompanyPipeline(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_deleted_successful':'not_found', res));
}

async function getCompanyPipelines(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await talentCtrl.getCompanyPipelines(company, currentUserId, res.locale);
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
  label.createdBy = currentUserId;

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
  let type = req.query.type

  let data = await talentCtrl.getCompanyLabels(company, type, currentUserId, res.locale);
  res.json(new Response(data, data?'labels_retrieved_successful':'not_found', res));
}
