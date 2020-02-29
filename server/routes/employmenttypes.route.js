const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const employmentTypeCtl = require('../controllers/employmenttypes.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/search').get(asyncHandler(getExperienceLevels));
router.route('/:id').get(asyncHandler(getExperienceLevelById));



async function insert(req, res) {
  let data = await employmentTypeCtl.insert(req.body);
  res.json(new Response(data, res));
}


async function getExperienceLevels(req, res) {
  let data = await employmentTypeCtl.getEmploymentTypes(req.query, req.locale);
  res.json(new Response(data, res));
}


async function getExperienceLevelById(req, res) {
  let data = await employmentTypeCtl.getEmploymentTypeById(req.params.id, res.locale);
  res.json(new Response(data, res));
}

