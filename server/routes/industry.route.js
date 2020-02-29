const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const industryCtl = require('../controllers/industry.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/search').get(asyncHandler(getAllIndustryies));
router.route('/:id').get(asyncHandler(getExperienceLevelById));



async function insert(req, res) {
  let data = await industryCtl.insert(req.body);
  res.json(new Response(data, res));
}


async function getAllIndustryies(req, res) {
  let data = await industryCtl.getAllIndustries(req.query, req.locale);
  res.json(new Response(data, res));
}


async function getExperienceLevelById(req, res) {
  let data = await industryCtl.getIndustryById(req.params.id, res.locale);
  res.json(new Response(data, res));
}

