const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const skillCtl = require('../controllers/skill.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/search').get(asyncHandler(getSkills));
router.route('/:id').get(asyncHandler(getSkillById));



async function insert(req, res) {
  let data = await skillCtl.insert(req.body);
  res.json(new Response(data, data?'skill_retrieved_successful':'not_found', res));
}


async function getSkills(req, res) {
  let filter = req.query;
  let data = await skillCtl.getSkillTypes(filter, res.locale);

  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}



async function getSkillById(req, res) {
  let data = await skillTypeCtl.getSkillById(req.params.id);
  res.json(new Response(data, data?'skill_retrieved_successful':'not_found', res));
}

