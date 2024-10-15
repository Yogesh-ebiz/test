const express = require('express');
const passport = require('passport');
const _ = require('lodash');
const asyncHandler = require('express-async-handler');
const companyCtrl = require('../controllers/company.controller');
const projectCtrl = require('../controllers/project.controller');
const ObjectID = require('mongodb').ObjectID;

let Response = require('../const/response');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const projectValidation = require("../validations/project.validation");

const router = express.Router();
module.exports = router;
router.route('/search').post(authorize('view_project'), validate(projectValidation.getProjects), projectCtrl.searchProject);
router.route('/:id').get(asyncHandler(getProjectById));
router.route('/:id/flag').post(asyncHandler(addProjectToBlacklist));
router.route('/:id/flag').delete(asyncHandler(removeProjectFromBlacklist));
router.route('/:id/jobs/assign').post(asyncHandler(assignProjectJobs));
router.route('/suggestions').post(asyncHandler(getProjectSuggestions));



async function getProjectById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let projectId = parseInt(req.params.id);


  data = await projectCtrl.getProjectById(projectId, res.locale);
  res.json(new Response(data, data?'project_retrieved_successful':'not_found', res));
}


async function searchProject(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.query.companyId);
  let data;
  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;


  data = await projectCtrl.searchProject(companyId, filter, sort, res.locale);

  res.json(new Response(data, data?'project_retrieved_successful':'not_found', res));
}


async function getProjectSuggestions(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;

  data = await projectCtrl.getProjectSuggestions(filter, sort, res.locale);
  res.json(new Response(data, data?'project_retrieved_successful':'not_found', res));
}



async function addProjectToBlacklist(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let projectId = parseInt(req.params.id);
  let flag = req.body;
  flag.userId = projectId;
  flag.createdBy = currentUserId;
  let data = await projectCtrl.addProjectToBlacklist(currentUserId, flag);

  res.json(new Response(data, data?'project_added_successful':'not_found', res));
}



async function removeProjectFromBlacklist(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let projectId = parseInt(req.params.id);
  let flag = req.body;
  let companyId = req.query.companyId;
  let data = await projectCtrl.removeProjectFromBlacklist(currentUserId, companyId, projectId);

  res.json(new Response(data, data?'project _removed_successful':'not_found', res));
}



async function assignProjectJobs(req, res) {
  let companyId = parseInt(req.query.companyId);
  let currentUserId = parseInt(req.header('UserId'));
  let projectId = parseInt(req.params.id);
  let jobs = req.body.jobs;
  jobs = _.reduce(jobs, function(res, id){res.push(ObjectID(id)); return res;}, []);
  let data = await projectCtrl.assignProjectJobs(companyId, currentUserId, projectId, jobs);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



