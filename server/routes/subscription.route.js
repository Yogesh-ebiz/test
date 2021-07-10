const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const subscriptionCtl = require('../controllers/subscription.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('').post(asyncHandler(addSubscription));
router.route('/:id').get(asyncHandler(getSubscription));
router.route('/:id').put(asyncHandler(updateSubscription));
router.route('/plans').get(asyncHandler(getPlans));


async function addSubscription(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let subscription = req.body;
  let data = await subscriptionCtl.addSubscription(currentUserId, subscription);

  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}


async function getSubscription(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await subscriptionCtl.getSubscription(currentUserId, id);

  res.json(new Response(data, data?'subscription_retrieved_successful':'not_found', res));
}


async function updateSubscription(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let subscription = req.body;
  let data = await subscriptionCtl.updateSubscription(currentUserId, id, subscription);

  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}



async function getPlans(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await subscriptionCtl.getPlans(currentUserId, res.locale);

  res.json(new Response(data, data?'ads_retrieved_successful':'not_found', res));
}

