const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const candidatesCtl = require('../controllers/candidates.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

router.route('/resumes').post(asyncHandler(uploadResume));
router.route('/generate').post(asyncHandler(generate));


async function uploadResume(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await candidatesCtl.uploadResume(currentUserId, req.files);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}


async function generate(req, res) {
  const data = null;
  resumesCtl.generate();
  res.json(new Response(data, data?'resume_generated_successful':'not_found', res));
}
