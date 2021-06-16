const express = require('express');
const passport = require('passport');
const _ = require('lodash');
const asyncHandler = require('express-async-handler');
const companyCtrl = require('../controllers/company.controller');
const peopleCtrl = require('../controllers/people.controller');
const ObjectID = require('mongodb').ObjectID;

let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/:id').get(asyncHandler(getPeopleById));
router.route('/:id/flag').post(asyncHandler(addPeopleToBlacklist));
router.route('/:id/flag').delete(asyncHandler(removePeopleFromBlacklist));
router.route('/:id/jobs/assign').post(asyncHandler(assignPeopleJobs));
router.route('/search').post(asyncHandler(searchPeople));
router.route('/suggestions').post(asyncHandler(getPeopleSuggestions));



async function getPeopleById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let peopleId = parseInt(req.params.id);


  data = await peopleCtrl.getPeopleById(peopleId, res.locale);
  res.json(new Response(data, data?'people_retrieved_successful':'not_found', res));
}


async function searchPeople(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.query.companyId);
  let data;
  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;


  data = await peopleCtrl.searchPeople(companyId, filter, sort, res.locale);

  res.json(new Response(data, data?'people_retrieved_successful':'not_found', res));
}


async function getPeopleSuggestions(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;


  data = await peopleCtrl.getPeopleSuggestions(filter, sort, res.locale);
  res.json(new Response(data, data?'people_retrieved_successful':'not_found', res));
}



async function addPeopleToBlacklist(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let peopleId = parseInt(req.params.id);
  let flag = req.body;
  flag.userId = peopleId;
  flag.createdBy = currentUserId;
  let data = await peopleCtrl.addPeopleToBlacklist(currentUserId, flag);

  res.json(new Response(data, data?'people_added_successful':'not_found', res));
}



async function removePeopleFromBlacklist(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let peopleId = parseInt(req.params.id);
  let flag = req.body;
  let companyId = req.query.companyId;
  let data = await peopleCtrl.removePeopleFromBlacklist(currentUserId, companyId, peopleId);

  res.json(new Response(data, data?'people _removed_successful':'not_found', res));
}



async function assignPeopleJobs(req, res) {
  let companyId = parseInt(req.query.companyId);
  let currentUserId = parseInt(req.header('UserId'));
  let peopleId = parseInt(req.params.id);
  let jobs = req.body.jobs;
  jobs = _.reduce(jobs, function(res, id){res.push(ObjectID(id)); return res;}, []);
  let data = await peopleCtrl.assignPeopleJobs(companyId, currentUserId, peopleId, jobs);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



