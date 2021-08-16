const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const parserCtl = require('../controllers/parser.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/jobs').post(asyncHandler(uploadJob));

router.route('/skills').post(asyncHandler(addSkills));
router.route('/skills').get(asyncHandler(getAllSkillLists));



async function uploadJob(req, res) {

  let data = await parserCtl.uploadJob(req.body);

  res.json(new Response(data, data?'job_uploaded_successful':'not_found', res));
}


async function addSkills(req, res) {

  let data = await parserCtl.addSkills(req.body);

  res.json(new Response(data, data?'skills_added_successful':'not_found', res));
}



async function getAllSkillLists(req, res) {

  let data = await parserCtl.getAllSkillLists();

  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}

