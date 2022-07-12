const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const jobFunctionCtl = require('../controllers/jobfunction.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

// router.route('/').post(asyncHandler(add));
router.route('/search').get(asyncHandler(getAllJobFunctions));
router.route('/:id').get(asyncHandler(getJobFunctionById));



// async function add(req, res) {
//   let data = await jobFunctionCtl.add(req.body);
//
//   res.json(new Response(data, data?'jobfunction_retrieved_successful':'not_found', res));
// }



async function getAllJobFunctions(req, res) {
  let data = await jobFunctionCtl.getAllJobFunctions(req.query, res.locale);

  res.json(new Response(data, data?'jobfunction_retrieved_successful':'not_found', res));
}



async function getJobFunctionById(req, res) {
  let data = await jobFunctionCtl.getJobFunctionById(req.params.id, res.locale);
  res.json(new Response(data, data?'jobfunction_retrieved_successful':'not_found', res));
}

