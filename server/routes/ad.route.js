const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const adCtl = require('../controllers/ad.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('').get(asyncHandler(getAds));

async function getAds(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await adCtl.getAds(currentUserId, res.locale);

  res.json(new Response(data, data?'ads_retrieved_successful':'not_found', res));
}

