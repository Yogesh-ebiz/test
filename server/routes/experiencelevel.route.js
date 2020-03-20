const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const experienceLevelCtl = require('../controllers/experiencelevel.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/search').get(asyncHandler(getExperienceLevels));





async function getExperienceLevels(req, res) {
  let data = await experienceLevelCtl.getExperienceLevels(req.query, req.locale);
  res.json(new Response(data, data?'experiencelevels_retrieved_successful':'not_found', res));
}

