const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const skillTypeCtl = require('../controllers/skilltype.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/search').get(asyncHandler(getSkillTypes));
router.route('/:id').get(asyncHandler(getSkillTypeById));



async function insert(req, res) {
  let data = await skillTypeCtl.insert(req.body);
  res.json(new Response(data, data?'event_retrieved_successful':'not_found', res));
}


async function getSkillTypes(req, res) {
  let filter = req.query;
  let data = await skillTypeCtl.getSkillTypes(filter, res.locale);

  res.json(new Response(data, data?'skilltypes_retrieved_successful':'not_found', res));
}



async function getSkillTypeById(req, res) {
  let data = await skillTypeCtl.getSkillTypeById(req.params.id);
  res.json(new Response(data, data?'event_retrieved_successful':'not_found', res));
}

