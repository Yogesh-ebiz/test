const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const skillTypeCtl = require('../controllers/skilltype.controller');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/').get(asyncHandler(getSkillTypes));
router.route('/:id').get(asyncHandler(getSkillTypeById));



async function insert(req, res) {
  let skilltype = await skillTypeCtl.insert(req.body);
  res.json(skilltype);
}


async function getSkillTypes(req, res) {
  let skilltype = await skillTypeCtl.getSkillTypes();
  res.json(skilltype);
}



async function getSkillTypeById(req, res) {
  let skilltype = await skillTypeCtl.getSkillTypeById(req.params.id);
  res.json(skilltype);
}

