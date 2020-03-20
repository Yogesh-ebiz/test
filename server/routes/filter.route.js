const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const industryCtl = require('../controllers/industry.controller')
const experienceLevelCtl = require('../controllers/experiencelevel.controller');
const employmentTypeCtl = require('../controllers/employmenttypes.controller');
const skillTypeCtl = require('../controllers/skilltype.controller');
const jobFunctionCtl = require('../controllers/jobfunction.controller');
const jobRequisitionCtl = require('../controllers/jobrequisition.controller');


let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));


router.use('/locations/search', getAllJobLocations);

router.route('/industries/search').get(asyncHandler(getAllIndustryies));
router.route('/industries/:id').get(asyncHandler(getIndustryById));

router.route('/experiencelevels/search').get(asyncHandler(getAllExperienceLevels));

router.route('/employmenttypes/search').get(asyncHandler(getAllEmploymentTypes));
router.route('/employmenttypes/:id').get(asyncHandler(getEmploymentTypeById));

router.route('/skilltypes/search').get(asyncHandler(getAllSkillTypes));

router.use('/jobfunctions/search', getAllJobFunctions);
router.route('/jobfunctions/:id').get(asyncHandler(getJobFunctionById));




async function getAllJobLocations(req, res) {
  let filter = req.query;
  let data = await jobRequisitionCtl.getAllJobLocations(filter);
  console.log('data', data)
  res.json(new Response(data, data?'locations_retrieved_successful':'not_found', res));

}


async function insert(req, res) {
  let data = await industryCtl.insert(req.body);
  res.json(new Response(data, data?'Industry_added_successful':'not_found', res));
}


async function getAllIndustryies(req, res) {
  let data = await industryCtl.getAllIndustries(req.query, req.locale);
  console.log('data', data)
  res.json(new Response(data, data?'Industries_retrieved_successful':'not_found', res));

}


async function getIndustryById(req, res) {
  let data = await industryCtl.getIndustryById(req.params.id, res.locale);
  res.json(new Response(data, data?'industry_retrieved_successful':'not_found', res));

}


async function getAllExperienceLevels(req, res) {
  let data = await experienceLevelCtl.getExperienceLevels(req.query, req.locale);
  res.json(new Response(data, data?'experiencelevels_retrieved_successful':'not_found', res));
}


async function getAllEmploymentTypes(req, res) {
  let data = await employmentTypeCtl.getEmploymentTypes(req.query, req.locale);
  res.json(new Response(data, data?'employmenttypes_retrieved_successful':'not_found', res));
}


async function getEmploymentTypeById(req, res) {
  let data = await employmentTypeCtl.getEmploymentTypeById(req.params.id, res.locale);
  res.json(new Response(data, data?'employmenttype_retrieved_successful':'not_found', res));
}


async function getAllSkillTypes(req, res) {
  let filter = req.query;
  let data = await skillTypeCtl.getSkillTypes(filter, res.locale);

  res.json(new Response(data, data?'skilltypes_retrieved_successful':'not_found', res));
}


async function getAllJobFunctions(req, res) {
  let data = await jobFunctionCtl.getAllJobFunctions(req.query, res.locale);

  res.json(new Response(data, data?'jobfunctions_retrieved_successful':'not_found', res));
}

async function getJobFunctionById(req, res) {
  let data = await jobFunctionCtl.getJobFunctionById(req.params.id, res.locale);
  res.json(new Response(data, data?'jobfunction_retrieved_successful':'not_found', res));
}

