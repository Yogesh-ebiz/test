const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const companyCtrl = require('../controllers/company.controller');
const peopleCtrl = require('../controllers/people.controller');
const ObjectID = require('mongodb').ObjectID;

let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/:id').get(asyncHandler(getPeopleById));

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
  let data;
  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;


  data = await peopleCtrl.searchPeople(filter, sort, res.locale);

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

