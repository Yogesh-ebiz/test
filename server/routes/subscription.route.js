const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const subscriptionCtl = require('../controllers/subscription.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/plans').get(asyncHandler(getPlans));

async function getPlans(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await subscriptionCtl.getPlans(currentUserId, res.locale);

  res.json(new Response(data, data?'ads_retrieved_successful':'not_found', res));
}

