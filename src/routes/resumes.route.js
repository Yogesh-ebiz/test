const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require('../middlewares/validate');
const resumeValidation = require('../validations/resume.validation');

const resumesCtl = require('../controllers/resumes.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

// router.post('', validate(resumeValidation.uploadResume), resumesCtl.uploadResume);
router.post('', validate(resumeValidation.uploadResume), resumesCtl.parseResume);
router.post('/generate', validate(resumeValidation.generate), resumesCtl.generate);

// router.route('/generate').post(asyncHandler(generate));


async function uploadResume(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await resumesCtl.uploadResume(currentUserId, req.files);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}


async function generate(req, res) {
  const data = null;
  resumesCtl.generate();
  res.json(new Response(data, data?'resume_generated_successful':'not_found', res));
}
