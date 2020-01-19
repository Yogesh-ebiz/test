const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const jobFunctionCtl = require('../controllers/jobfunction.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/').get(asyncHandler(getAllJobFunctions));
router.route('/:id').get(asyncHandler(getJobFunctionById));



async function insert(req, res) {
  let jobfunction = await jobFunctionCtl.insert(req.body);

  res.json(new Response(data, res));
  res.json(jobfunction);
}



async function getAllJobFunctions(req, res) {
  let data = await jobFunctionCtl.getAllJobFunctions();
  res.json(new Response(data, res));
}



async function getJobFunctionById(req, res) {
  let data = await jobFunctionCtl.getJobFunctionById(req.params.id);
  res.json(new Response(data, res));
}

