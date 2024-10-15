const express = require('express');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const asyncHandler = require('express-async-handler');
const companyCtl = require('../controllers/company.controller');
const hr = require('../controllers/hr.controller');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const companyValidation = require("../validations/company.validation");

let Response = require('../const/response');
const talentCtrl = require("../controllers/talent.controller");

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.post('/register', validate(companyValidation.register), companyCtl.register);
router.get('/reviews/top', validate(companyValidation.getCompanyTopReviews), companyCtl.getCompanyTopReviews);

router.route('/:id').get(authorize('getUsers'), asyncHandler(companyCtl.getCompany));

router.route('/:id/sync').post(asyncHandler(sync));
router.route('/:id/leave').post(authorize('leave_company'), validate(companyValidation.leaveCompany), companyCtl.leaveCompany);

router.route('/:id/sync/avatar').post(asyncHandler(syncAvatar));

router.route('/:id/jobs/deactivate').post(asyncHandler(deactivateCompanyJobs));
router.get('/:id/jobs/latest', validate(companyValidation.getCompanyLatestJobs), companyCtl.getCompanyLatestJobs);
router.get('/:id/jobs/jobfunctions', validate(companyValidation.getCompanyJobsJobFunctions), companyCtl.getCompanyJobsJobFunctions);
router.post('/:id/jobs/search', validate(companyValidation.getCompanyJobs), companyCtl.getCompanyJobs);
router.post('/:id/salaries', validate(companyValidation.addNewSalary), companyCtl.addNewSalary);
router.get('/:id/salaries', validate(companyValidation.getCompanySalaries), companyCtl.getCompanySalaries);
router.get('/:id/salaries/latest', validate(companyValidation.getCompanyLatestSalaries), companyCtl.getCompanyLatestSalaries);
router.get('/:id/salaries/jobfunctions', validate(companyValidation.getCompanyLatestSalaries), companyCtl.getCompanySalariesGroupByJobFunctions);
router.route('/:id/salaries/locations').get(asyncHandler(getCompanySalariesGroupByLocations));
router.route('/:id/salaries/locations/top5').get(asyncHandler(getCompanySalariesTop5Locations));
router.get('/:id/salaries/title', validate(companyValidation.getCompanySalaryByEmploymentTitle), companyCtl.getCompanySalaryByEmploymentTitle);
router.get('/:id/salaries/filter/locations/search', validate(companyValidation.getCompanySalaryLocations), companyCtl.getCompanySalaryLocations);
router.get('/:id/salaries/filter/employmenttitles/search', validate(companyValidation.getCompanySalaryEmploymentTitles), companyCtl.getCompanySalaryEmploymentTitles);
router.get('/:id/salaries/filter/jobfunctions/search', validate(companyValidation.getCompanySalariesJobFunctions), companyCtl.getCompanySalariesJobFunctions);
router.post('/:id/salaries/:salaryId/reactions', validate(companyValidation.addSalaryReaction), companyCtl.addSalaryReaction);
router.get('/:id/salaries/:salaryId/gender', validate(companyValidation.getCompanySalaryGroupByGender), companyCtl.getCompanySalaryGroupByGender);

router.post('/:id/reviews/search', validate(companyValidation.getCompanyReviews), companyCtl.getCompanyReviews);
router.post('/:id/reviews', validate(companyValidation.addReview), companyCtl.addReview);
router.get('/:id/reviews/stats', validate(companyValidation.getCompanyReviewStats), companyCtl.getCompanyReviewStats);
router.route('/:id/reviews/:companyReviewId/report').post(validate(companyValidation.reportReviewById), companyCtl.reportCompanyReviewById);
router.route('/:id/reviews/filter/locations/search').get(asyncHandler(getCompanyReviewLocations));


router.post('/:id/reviews/:reviewId/reaction', validate(companyValidation.reactionToCompanyReviewById), companyCtl.reactionToCompanyReviewById);
router.delete('/:id/reviews/:reviewId/reaction', validate(companyValidation.removeReactionToCompanyReviewById), companyCtl.removeReactionToCompanyReviewById);
router.route('/:id/reviews/:reviewId').get(asyncHandler(getCompanyReviewById));

router.route('/:id/departments').post(asyncHandler(addCompanyDepartment));
router.route('/:id/departments/:departmentId').put(asyncHandler(updateCompanyDepartment));
router.route('/:id/departments/:departmentId').delete(asyncHandler(deleteCompanyDepartment));
router.route('/:id/departments').get(asyncHandler(getCompanyDepartments));


router.route('/:id/pipelines').post(asyncHandler(addCompanyPipeline));
router.route('/:id/pipelines/:pipelineId').put(asyncHandler(updateCompanyPipeline));
router.route('/:id/pipelines/:pipelineId').delete(asyncHandler(deleteCompanyPipeline));
router.route('/:id/pipelines').get(asyncHandler(getCompanyPipelines));

router.route('/:id/roles').post(asyncHandler(addCompanyRole));
router.route('/:id/roles/:roleId').put(asyncHandler(updateCompanyRole));
router.route('/:id/roles/:roleId').delete(asyncHandler(deleteCompanyRole));
router.route('/:id/roles').get(asyncHandler(getCompanyRoles));

router.route('/:id/labels').post(asyncHandler(addCompanyLabel));
router.route('/:id/labels/:labelId').put(asyncHandler(updateCompanyLabel));
router.route('/:id/labels/:labelId').delete(asyncHandler(deleteCompanyLabel));
router.route('/:id/labels').get(asyncHandler(getCompanyLabels));

router.route('/:id/interests').post(validate(companyValidation.addInterest), companyCtl.addInterest);

router.get('/:id/benefits', validate(companyValidation.getBenefits), companyCtl.getBenefits);
router.post('/:id/benefits', validate(companyValidation.updateBenefits), companyCtl.updateBenefits);

router.get('/:id/questions', validate(companyValidation.getQuestions), companyCtl.getQuestions);
router.post('/:id/questions', validate(companyValidation.addQuestion), companyCtl.addQuestion);
router.get('/:id/questions/default', validate(companyValidation.getDefaultQuestions), companyCtl.getDefaultQuestions);
router.get('/:id/questions/:questionId', validate(companyValidation.getQuestion), companyCtl.getQuestion);
router.route('/:id/questions/:questionId/responses').post(asyncHandler(addQuestionResponse));
router.route('/:id/questions/:questionId/responses').get(asyncHandler(getQuestionResponses));

async function getCompany(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await companyCtl.getCompany(currentUserId, companyId);
  res.json(data);
}

async function sync(req, res) {
  let company = req.body;
  let data = await companyCtl.sync(company);
  res.json(new Response(data, data?'company_synced_successful':'not_found', res));
}

async function leave(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let data = await companyCtl.leave(currentUserId, companyId);
  res.json(new Response(data, data?'company_removed_successful':'not_found', res));
}

async function syncAvatar(req, res) {
  let company = req.body;
  let data = await companyCtl.syncAvatar(company);
  res.json(new Response(data, data?'company_synced_successful':'not_found', res));
}


async function register(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = req.body;
  let data = await companyCtl.register(currentUserId, company);
  res.json(new Response(data, data?'company_registered_successful':'not_found', res));
}


async function adminCompanyJobs(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await hr.getCompanyJobs(currentUserId, companyId);
  res.json(new Response(data, data?'company_jobs_retrieved_successful':'not_found', res));
}

// async function getCompanyJobs(req, res) {
//   let currentUserId = parseInt(req.header('UserId'));
//   let company = parseInt(req.params.id);
//   let data = await companyCtl.getCompanyJobs(currentUserId, company, req.locale);
//   res.json(new Response(data, data?'company_jobs_retrieved_successful':'not_found', res));
// }


async function deactivateCompanyJobs(req, res) {
  let companyId = parseInt(req.params.id);
  let data = await companyCtl.deactivateCompanyJobs(companyId);
  res.json(new Response(data, data?'company_jobs_deactivated_successful':'not_found', res));
}

async function getCompanyLatestJobs(req, res) {
  let companyId = parseInt(req.params.id);
  let data = await companyCtl.getCompanyLatestJobs(companyId, res.locale);
  res.json(new Response(data, data?'company_jobs_retrieved_successful':'not_found', res));
}

async function getCompanyJobsJobFunctions(req, res) {
  let companyId = parseInt(req.params.id);
  let data = await companyCtl.getCompanyJobsJobFunctions(companyId, res.locale);
  res.json(new Response(data, data?'company_jobs_retrieved_successful':'not_found', res));
}

async function getCompanyJobs(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let filter = req.body;
  let pagination = req.query;
  let companyId = parseInt(req.params.id);
  let data = await companyCtl.getCompanyJobs(currentUserId, companyId, filter, pagination, res.locale);
  res.json(new Response(data, data?'company_jobs_retrieved_successful':'not_found', res));
}

async function addNewSalary(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let salary = req.body;
  salary.partyId = currentUserId;
  salary.company = company;

  let data = await companyCtl.addNewSalary(currentUserId, salary);
  res.json(new Response(data, data?'salary_added_successful':'not_found', res));
}


async function getCompanySalaries(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let filter = req.query;
  filter.company = company;
  filter.size = req.query.size?parseInt(req.query.size):0;
  filter.page = req.query.page?parseInt(req.query.page):0;
  let data = await companyCtl.getCompanySalaries(currentUserId, filter, req.locale);
  res.json(new Response(data, data?'companysalaries_retrieved_successful':'not_found', res));
}


async function getCompanyLatestSalaries(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanyLatestSalaries(currentUserId, company, req.locale);
  res.json(new Response(data, data?'companysalaries_retrieved_successful':'not_found', res));
}

async function getCompanySalariesGroupByJobFunctions(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanySalariesGroupByJobFunctions(company, req.locale);
  res.json(new Response(data, data?'companysalarylanding_retrieved_successful':'not_found', res));
}


async function getCompanySalariesGroupByLocations(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanySalariesGroupByLocations(company, req.locale);
  res.json(new Response(data, data?'companysalarylanding_retrieved_successful':'not_found', res));
}



async function getCompanySalariesTop5Locations(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanySalaryTop5Locations(company, req.locale);
  res.json(new Response(data, data?'companysalarylanding_retrieved_successful':'not_found', res));
}



async function getCompanySalaryByEmploymentTitle(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let employmentTitle = req.query.employmentTitle;
  let country = req.query.country;
  let data = await companyCtl.getCompanySalaryByEmploymentTitle(currentUserId, company, employmentTitle, country, req.locale);
  res.json(new Response(data, data?'companysalary_employmentTitle_retrieved_successful':'not_found', res));
}

async function getCompanySalaryLocations(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanySalaryLocations(currentUserId, company, req.locale);
  res.json(new Response(data, data?'companysalary_locations_retrieved_successful':'not_found', res));
}

async function getCompanySalaryTop5Locations(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanySalaryLocations(currentUserId, company, req.locale);
  res.json(new Response(data, data?'companysalary_locations_retrieved_successful':'not_found', res));
}


async function getCompanySalaryEmploymentTitles(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanySalaryEmploymentTitles(currentUserId, company);
  res.json(new Response(data, data?'companysalary_employmentTitles_retrieved_successful':'not_found', res));
}

async function getCompanySalaryJobFunctions(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanySalaryJobFunctions(currentUserId, company, res.locale);
  res.json(new Response(data, data?'companysalary_jobfunctions_retrieved_successful':'not_found', res));
}



async function getCompanySalaryGroupByGender(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanySalaryGroupByGender(company, req.locale);
  res.json(new Response(data, data?'companysalarygroupgender_retrieved_successful':'not_found', res));
}


async function addSalaryReaction(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let salaryHistoryId = ObjectID(req.params.id);
  let reaction = req.body;
  let data = await companyCtl.addSalaryReaction(currentUserId, salaryHistoryId, reaction);
  res.json(new Response(data, data?'companysalary_reaction_added_successful':'not_found', res));
}



async function addCompanyReview(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let review = req.body;
  review.user = currentUserId;
  review.company = company;
  let data = await companyCtl.addNewReview(currentUserId, review, req.locale);
  res.json(new Response(data, data?'companyreview_added_successful':'not_found', res));
}



async function getCompanyReviewStats(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanyReviewStats(currentUserId, company, req.locale);
  res.json(new Response(data, data?'companyreviewstats_retrieved_successful':'not_found', res));
}

async function getCompanyReviews(req, res) {
  // let company = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  filter.company = req.params.id;
  let data = await companyCtl.getCompanyReviews(currentUserId, filter, req.locale);
  res.json(new Response(data, data?'companyreviews_retrieved_successful':'not_found', res));
}


async function getCompanyReviewById(req, res) {
  let id = req.params.id;
  // let company = parseInt(req.params.id);
  let filter = req.query;
  // filter.company = company;
  let data = await companyCtl.getCompanyReviews(filter, req.locale);
  res.json(new Response(data, data?'companyreviews_retrieved_successful':'not_found', res));
}


async function getCompanyReviewLocations(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let data = await companyCtl.getCompanyReviewLocations(currentUserId, company, req.locale);
  res.json(new Response(data, data?'companyreview_locations_retrieved_successful':'not_found', res));
}



async function reportReviewById(req, res) {

  let currentUser = parseInt(req.header('UserId'));
  let companyReviewId = parseInt(req.params.companyReviewId);
  let report = req.body;

  report.partyId = currentUser;
  report.companyReviewId = companyReviewId;
  let data = await companyCtl.reportCompanyReviewById(currentUser, companyReviewId, report);

  res.json(new Response(data, data?'review_reported_successful':'not_found', res));
}


async function reactionToCompanyReviewById(req, res) {

  let currentUser = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let companyReviewId = parseInt(req.params.companyReviewId);
  let reaction = req.body;
  reaction.partyId = currentUser;
  reaction.company = company;
  reaction.companyReviewId = companyReviewId;
  let data = await companyCtl.reactionToCompanyReviewById(currentUser, companyReviewId, reaction);

  res.json(new Response(data, data?'reaction_added_successful':'not_found', res));
}


async function removeReactionToCompanyReviewById(req, res) {

  let currentUser = parseInt(req.header('UserId'));
  let companyReviewId = parseInt(req.params.companyReviewId);
  let reaction = req.body;

  reaction.partyId = currentUser;
  reaction.companyReviewId = companyReviewId;
  let data = await companyCtl.removeReactionToCompanyReviewById(currentUser, companyReviewId, reaction);

  res.json(new Response(data, data?'reaction_removed_successful':'not_found', res));
}


async function addCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let department = req.body;
  department.company = company;
  department.createdBy = currentUserId;

  let data = await companyCtl.addCompanyDepartment(company, currentUserId, department);
  res.json(new Response(data, data?'department_added_successful':'not_found', res));
}

async function updateCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let departmentId = ObjectID(req.params.departmentId);
  let department = req.body;
  department.company = company;
  department._id = departmentId;
  department.updatedBy = currentUserId;

  let data = await companyCtl.updateCompanyDepartment(company, departmentId, currentUserId, department);
  res.json(new Response(data, data?'department_updated_successful':'not_found', res));
}

async function deleteCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let departmentId = req.params.departmentId;

  let data = await companyCtl.deleteCompanyDepartment(company, departmentId, currentUserId);
  res.json(new Response(data, data?'department_updated_successful':'not_found', res));
}

async function getCompanyDepartments(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await companyCtl.getCompanyDepartments(company, currentUserId, res.locale);
  res.json(new Response(data, data?'departments_retrieved_successful':'not_found', res));
}



async function addCompanyPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipeline = req.body;
  pipeline.company = company;
  pipeline.createdBy = currentUserId;

  let data = await companyCtl.addCompanyPipeline(company, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_added_successful':'not_found', res));
}

async function updateCompanyPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = parseInt(req.params.pipelineId);
  let pipeline = req.body;
  pipeline.company = company;
  pipeline.createdBy = currentUserId;

  let data = await companyCtl.updateCompanyPipeline(company, pipelineId, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}

async function deleteCompanyPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = parseInt(req.params.pipelineId);

  let data = await companyCtl.deleteCompanyPipeline(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_deleted_successful':'not_found', res));
}

async function getCompanyPipelines(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await companyCtl.getCompanyPipelines(company, currentUserId, res.locale);
  res.json(new Response(data, data?'pipelines_retrieved_successful':'not_found', res));
}


async function addCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let role = req.body;
  role.company = company;
  role.createdBy = currentUserId;

  let data = await companyCtl.addCompanyRole(company, currentUserId, role);
  res.json(new Response(data, data?'role_added_successful':'not_found', res));
}

async function updateCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;
  let role = req.body;
  role.company = company;
  role.createdBy = currentUserId;

  let data = await companyCtl.updateCompanyRole(company, roleId, currentUserId, role);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}

async function deleteCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;

  let data = await companyCtl.deleteCompanyRole(company, roleId, currentUserId);
  res.json(new Response(data, data?'role_deleted_successful':'not_found', res));
}

async function getCompanyRoles(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await companyCtl.getCompanyRoles(company, currentUserId, res.locale);
  res.json(new Response(data, data?'roles_retrieved_successful':'not_found', res));
}



async function addCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let role = req.body;
  role.company = company;
  role.createdBy = currentUserId;

  let data = await companyCtl.addCompanyRole(company, currentUserId, role);
  res.json(new Response(data, data?'role_added_successful':'not_found', res));
}

async function updateCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;
  let role = req.body;
  role.company = company;
  role.createdBy = currentUserId;

  let data = await companyCtl.updateCompanyRole(company, roleId, currentUserId, role);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}

async function deleteCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;

  let data = await companyCtl.deleteCompanyRole(company, roleId, currentUserId);
  res.json(new Response(data, data?'role_deleted_successful':'not_found', res));
}

async function getCompanyMembers(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await companyCtl.getCompanyRoles(company, currentUserId, res.locale);
  res.json(new Response(data, data?'roles_retrieved_successful':'not_found', res));
}



async function addCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let label = req.body;
  label.company = company;
  label.createdBy = currentUserId;

  let data = await companyCtl.addCompanyLabel(company, currentUserId, label);
  res.json(new Response(data, data?'label_added_successful':'not_found', res));
}

async function updateCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let labelId = req.params.labelId;
  let label = req.body;
  label.company = company;
  label.createdBy = currentUserId;

  let data = await companyCtl.updateCompanyLabel(company, labelId, currentUserId, label);
  res.json(new Response(data, data?'label_updated_successful':'not_found', res));
}

async function deleteCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let labelId = req.params.labelId;

  let data = await companyCtl.deleteCompanyLabel(company, labelId, currentUserId);
  res.json(new Response(data, data?'label_deleted_successful':'not_found', res));
}

async function getCompanyLabels(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let type = req.query.type

  let data = await companyCtl.getCompanyLabels(company, type, currentUserId, res.locale);
  res.json(new Response(data, data?'labels_retrieved_successful':'not_found', res));
}
async function addInterest(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await companyCtl.addInterest(company, currentUserId);
  res.json(new Response(data, data?'add_interest_successful':'not_found', res));
}


async function getBenefits(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await companyCtl.getBenefits(company);
  res.json(new Response(data, data?'benefits_retrieved_successful':'not_found', res));
}

async function updateBenefits(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  const {benefits} = req.body;

  let data = await companyCtl.updateBenefits(company, benefits, currentUserId);
  res.json(new Response(data, data?'benefits_updated_successful':'not_found', res));
}

async function getDefaultQuestions(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data = await companyCtl.getDefaultQuestions();
  res.json(new Response(data, data?'questions_retrieved_successful':'not_found', res));
}


async function getQuestions(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pagination = req.query;
  let data = await companyCtl.getQuestions(company, pagination);
  res.json(new Response(data, data?'questions_retrieved_successful':'not_found', res));
}

async function addQuestion(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let question = req.body;

  let data = await companyCtl.addQuestion(company, question, currentUserId);
  res.json(new Response(data, data?'question_added_successful':'not_found', res));
}

async function getDefaultQuestion(req, res) {
  let data = await companyCtl.getDefaultQuestion();
  res.json(new Response(data, data?'question_retrieved_successful':'not_found', res));
}


async function getQuestion(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionId = ObjectID(req.params.questionId);
  let data = await companyCtl.getQuestion(company, questionId);
  res.json(new Response(data, data?'question_retrieved_successful':'not_found', res));
}

async function getQuestionResponses(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionId = ObjectID(req.params.questionId);
  let pagination = req.query;
  let data = await companyCtl.getQuestionResponses(company, questionId, pagination);
  res.json(new Response(data, data?'question_retrieved_successful':'not_found', res));
}

async function addQuestionResponse(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let question = ObjectID(req.params.questionId);
  let questionResponse = req.body;
  questionResponse.question = question;

  let data = await companyCtl.addQuestionResponse(company, questionResponse);
  res.json(new Response(data, data?'answer_added_successful':'not_found', res));
}
