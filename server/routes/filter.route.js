const express = require('express');
const passport = require('passport');
const ISO6391 = require('iso-639-1')
const _ = require('lodash');
const asyncHandler = require('express-async-handler');
const industryCtl = require('../controllers/industry.controller')
const experienceLevelCtl = require('../controllers/experiencelevel.controller');
const employmentTypeCtl = require('../controllers/employmenttypes.controller');
const skillTypeCtl = require('../controllers/skilltype.controller');
const jobFunctionCtl = require('../controllers/jobfunction.controller');
const jobRequisitionCtl = require('../controllers/jobrequisition.controller');
const filterService = require('../services/filter.service');


let Response = require('../const/response');
let {capitalizeLocale} = require('../utils/helper');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));

router.use('/countries/search', getAllCountries);
router.use('/states/search', getAllStates);
router.use('/cities/search', getAllCities);


router.use('/languages/search', getLanguages);


router.route('/industries/search').get(asyncHandler(getAllIndustryies));
router.route('/industries/:id').get(asyncHandler(getIndustryById));

router.route('/experiencelevels/search').get(asyncHandler(getAllExperienceLevels));

router.route('/employmenttypes/search').get(asyncHandler(getAllEmploymentTypes));
router.route('/employmenttypes/:id').get(asyncHandler(getEmploymentTypeById));

router.route('/skilltypes/search').get(asyncHandler(getAllSkillTypes));

router.route('/jobfunctions/search', getAllJobFunctions);
router.route('/jobfunctions/:id').get(asyncHandler(getJobFunctionById));

router.route('/locations/search').get(asyncHandler(getAllJobLocations));

router.route('/fieldstudy/search').get(asyncHandler(getAllFieldStudy));



async function getAllCountries(req, res) {
  let filter = req.query;
  let data = await filterService.getAllCountries(filter, res.locale);

  res.json(new Response(data, data?'countries_retrieved_successful':'not_found', res));
}


async function getAllStates(req, res) {
  let filter = req.query;

  let data;
  if(filter.country_code){
    data = await filterService.getAllStates(filter, res.locale);

    statusMessage = 'states_retrieved_successful';
  } else {
    statusMessage = 'country_code_missing';
  }

  res.json(new Response(data, data?statusMessage:'not_found', res));
}


async function getAllCities(req, res) {
  let filter = req.query;

  let data;
  if(filter.state_code || filter.country_code){
    console.log(filter)
    data = await filterService.getAllCities(filter, res.locale);
    statusMessage = 'cities_retrieved_successful';
  } else {
    statusMessage = 'state_code_missing';
  }

  res.json(new Response(data, data?statusMessage:'not_found', res));
}

async function getLanguages(req, res) {
  let keyword = req.query.query;
  let data = null;

  let allCodes = ISO6391.getAllCodes();
  let allCodesAndLanguages = ISO6391.getLanguages(allCodes);

  // console.log(allCodesAndLanguages);
  if(keyword){

    // data = [];
    // for (var i = 0; i < allCodesAndLanguages.length; i++) {
    //   if (allCodesAndLanguages[i].name.match(keyword)) {
    //     data.push(allCodesAndLanguages[i]);
    //   }
    // }

    data = _.filter(allCodesAndLanguages, function(o) { return o.name.match(keyword); });
  } else {
    data = allCodesAndLanguages;
  }

  // data = _.reduce(data, function(res, item){
  //   res.push(item.toLocaleUpperCase());
  //   return res;
  // }, [])

  res.json(new Response(data.sort(), data?'languages_retrieved_successful':'not_found', res));

}

async function getAllJobLocations(req, res) {
  let data = await filterService.getAllJobLocations(req.query);
  data = _.reduce(data, function(res, item){
      let temp = item._id;
      temp.count = item.count;
      res.push(temp);
      return res;
  }, []);
  res.json(new Response(data, data?'locations_retrieved_successful':'not_found', res));

}


async function insert(req, res) {
  let data = await industryCtl.insert(req.body);
  res.json(new Response(data, data?'Industry_added_successful':'not_found', res));
}


async function getAllIndustryies(req, res) {
  let query = req.query;
  let data = await filterService.getAllFeedIndustries(query, res.locale);
  // let data = await industryCtl.getAllIndustries(req.query, req.locale);
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


async function getAllFieldStudy(req, res) {
  let filter = req.query;
  let data = await filterService.getAllFieldStudy(filter, res.locale);

  res.json(new Response(data, data?'fieldstudy_retrieved_successful':'not_found', res));
}
