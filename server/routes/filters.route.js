const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const filtersCtl = require('../controllers/filters.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').get(asyncHandler(getAllFilters));
router.route('/experiencelevels').get(asyncHandler(getExperienceLevels));
router.route('/experiencelevels/:id').get(asyncHandler(getExperienceLevelById));

router.route('/jobfunctions').get(asyncHandler(getJobFunctions));
router.route('/jobfunctions/:id').get(asyncHandler(getJobFunctionById));

router.route('/employmenttypes').get(asyncHandler(getEmploymentTypes));
router.route('/employmenttypes/:id').get(asyncHandler(getEmploymentTypeById));


router.route('/industries').get(asyncHandler(getIndustries));
router.route('/industries/:id').get(asyncHandler(getIndustryById));


async function getAllFilters(req, res) {
  let data = await filtersCtl.getAllFilters(req.locale);
  res.json(new Response(data, res));
}



async function getExperienceLevels(req, res) {
  let data = await filtersCtl.getExperienceLevels(req.locale);
  res.json(new Response(data, res));
}


async function getExperienceLevelById(req, res) {
  let data = await filtersCtl.getExperienceLevelById(req.params.id, res.locale);
  res.json(new Response(data, res));
}


async function getJobFunctions(req, res) {
  let data = await filtersCtl.getJobFunctions(res.locale);
  res.json(new Response(data, res));
}



async function getJobFunctionById(req, res) {
  let data = await filtersCtl.getJobFunctionById(req.params.id, res.locale);
  res.json(new Response(data, res));
}


async function getEmploymentTypes(req, res) {
  let data = await filtersCtl.getJobFunctions(res.locale);
  res.json(new Response(data, res));
}



async function getEmploymentTypeById(req, res) {
  let data = await filtersCtl.getJobFunctionById(req.params.id, res.locale);
  res.json(new Response(data, res));
}



async function getIndustries(req, res) {
  let data = await filtersCtl.getIndustries(res.locale);
  res.json(new Response(data, res));
}



async function getIndustryById(req, res) {
  let data = await filtersCtl.getIndustryById(req.params.id, res.locale);
  res.json(new Response(data, res));
}

