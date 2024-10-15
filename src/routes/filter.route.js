const express = require('express');
const passport = require('passport');
const _ = require('lodash');
const asyncHandler = require('express-async-handler');
const industryCtl = require('../controllers/industry.controller')
const experienceLevelCtl = require('../controllers/experiencelevel.controller');
const employmentTypeCtl = require('../controllers/employmenttypes.controller');
const skillCtl = require('../controllers/skill.controller');
const filterCtl = require('../controllers/filter.controller');
const jobRequisitionCtl = require('../controllers/jobrequisition.controller');
const filterService = require('../services/filter.service');


let Response = require('../const/response');
let {capitalizeLocale} = require('../utils/helper');
const catchAsync = require("../utils/catchAsync");

const router = express.Router();
module.exports = router;
// router.get('/locations/search', filterCtl.getAllJobLocations);
router.get('/locations/search', filterCtl.searchLocations);
router.use('/countries/search', filterCtl.getAllCountries);
router.use('/states/search', filterCtl.getAllStates);
router.use('/cities/search', filterCtl.getAllCities);
router.use('/languages/search', filterCtl.getLanguages);
router.get('/industries/search', filterCtl.searchIndustries);
router.get('/industries/:id', filterCtl.getIndustryById);
router.get('/experiencelevels/search', filterCtl.getAllExperienceLevels);
router.get('/employmenttypes/search', filterCtl.getAllEmploymentTypes);
router.get('/employmenttypes/:id', filterCtl.getEmploymentTypeById);
router.get('/jobfunctions/search', filterCtl.searchJobFunctions);
router.get('/jobfunctions/:id', filterCtl.getJobFunctionById);

router.get('/fieldstudy/search', filterCtl.searchFieldStudy);
router.get('/jobtitles/search', filterCtl.searchJobTitles);
router.get('/company/search', filterCtl.searchCompany);
router.get('/school/search', filterCtl.searchSchool);
router.get('/degree/search', filterCtl.searchDegree);
router.get('/sources/search', filterCtl.searchSources);

// router.get('/skills/search', filterCtl.getAllSkills);
router.get('/skills/search', filterCtl.searchSkills);
