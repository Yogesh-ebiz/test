const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const experienceLevelCtl = require('../controllers/e.controller');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/').get(asyncHandler(getIndustry));
router.route('/:id').get(asyncHandler(getIndustry));



async function insert(req, res) {
  let industry = await industryCtl.insert(req.body);
  res.json(industry);
}


async function getIndustry(req, res) {
  let industry = await industryCtl.getIndustry(req.params.id);
  res.json(industry);
}

