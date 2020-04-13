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
router.route('/:id/reviews/stats').get(asyncHandler(getCompanyReviewStats));
router.route('/:id/reviews').get(asyncHandler(getCompanyReviews));
router.route('/:id/reviews/:companyReviewId/report').post(asyncHandler(reportReviewById));

router.route('/:id/reviews/:companyReviewId/reaction').post(asyncHandler(reactionToCompanyReviewById));
router.route('/:id/reviews/:companyReviewId/reaction').delete(asyncHandler(removeReactionToCompanyReviewById));

router.route('/:id/reviews/:companyReviewId').get(asyncHandler(getCompanyReviewById));





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
  let data = await companyCtl.getCompanySalaryByEmploymentTitle(currentUserId, company, employmentTitle, country, req.locale);
  res.json(new Response(data, data?'companysalary_employmenttitle_retrieved_successful':'not_found', res));
}


async function addCompanyReview(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let review = req.body;
  review.partyId = currentUserId;
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
  let companyReviewId = parseInt(req.params.companyReviewId);
  let reaction = req.body;
  reaction.partyId = currentUser;
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
