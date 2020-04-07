const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const companyCtl = require('../controllers/company.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/:id/salaries').post(asyncHandler(addNewSalary));
router.route('/:id/salaries').get(asyncHandler(getCompanySalaries));
router.route('/:id/salaries/title').get(asyncHandler(getCompanySalaryByEmploymentTitle));

router.route('/:id/reviews').post(asyncHandler(addCompanyReview));
router.route('/:id/reviews').get(asyncHandler(getCompanyReviews));
router.route('/:id/reviews/:salaryId').get(asyncHandler(getCompanyReviewById));



async function addNewSalary(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let body = req.body;
  body.partyId = currentUserId;
  let data = await companyCtl.addNewSalary(currentUserId, body);
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

async function getCompanySalaryByEmploymentTitle(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let employmentTitle = req.query.employmentTitle;
  let data = await companyCtl.getCompanySalaryByEmploymentTitle(currentUserId, company, employmentTitle, req.locale);
  res.json(new Response(data, data?'companyreview_retrieved_successful':'not_found', res));
}


async function addCompanyReview(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let body = req.body;
  body.partyId = currentUserId;
  let data = await companyCtl.addNewReview(body, req.locale);
  res.json(new Response(data, data?'companyreview_added_successful':'not_found', res));
}

async function getCompanyReviews(req, res) {
  let company = parseInt(req.params.id);
  let filter = req.query;
  filter.company = company;
  let data = await companyCtl.getCompanyReviews(filter, req.locale);
  res.json(new Response(data, data?'companyreviews_retrieved_successful':'not_found', res));
}


async function getCompanyReviewById(req, res) {
  let id = req.params.id;
  let company = parseInt(req.params.id);
  let filter = req.query;
  filter.company = company;
  let data = await companyCtl.getCompanyReviews(filter, req.locale);
  res.json(new Response(data, data?'companyreviews_retrieved_successful':'not_found', res));
}
