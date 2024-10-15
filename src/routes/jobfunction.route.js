const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const jobFunctionCtl = require('../controllers/jobfunction.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/search').get(asyncHandler(getAllJobFunctions));
router.route('/:id').get(asyncHandler(getJobFunctionById));




async function getAllJobFunctions(req, res) {
  const query = req.query?req.query:'';
  const locale = res.locale? res.locale : 'en';
  let data = await jobFunctionCtl.getAllJobFunctions(query, locale);

  res.json(new Response(data, data?'jobfunction_retrieved_successful':'not_found', res));
}



async function getJobFunctionById(req, res) {
  const locale = res.locale? res.locale : 'en';
  let data = await jobFunctionCtl.getJobFunctionById(req.params.id, locale);
  res.json(new Response(data, data?'jobfunction_retrieved_successful':'not_found', res));
}

