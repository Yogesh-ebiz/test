const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const resumeCtl = require('../controllers/resume.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/generate').post(asyncHandler(generate));



async function generate(req, res) {
  const data = null;
  resumeCtl.generate();
  res.json(new Response(data, data?'role_added_successful':'not_found', res));
}
