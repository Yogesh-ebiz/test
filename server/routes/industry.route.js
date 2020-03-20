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
router.route('/:id').get(asyncHandler(getIndustryById));



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

