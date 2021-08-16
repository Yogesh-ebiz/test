const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const subscriptionCtl = require('../controllers/subscription.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('').post(asyncHandler(addSubscription));
router.route('/plans').get(asyncHandler(getPlans));

router.route('/:id').get(asyncHandler(getSubscriptionById));
router.route('/:id').put(asyncHandler(updateSubscription));
router.route('/:id/cancel').post(asyncHandler(cancelSubscription));
router.route('/:id/activate').post(asyncHandler(activateSubscription));
router.route('/:id').delete(asyncHandler(deleteSubscription));
router.route('/:id/payment').put(asyncHandler(updateSubscriptionPaymentMethod));



async function getPlans(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await subscriptionCtl.getPlans(currentUserId, res.locale);

  res.json(new Response(data, data?'ads_retrieved_successful':'not_found', res));
}


async function addSubscription(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let subscription = req.body;
  subscription.customer.partyId = parseInt(subscription.customer.partyId);
  let data = await subscriptionCtl.addSubscription(currentUserId, subscription);

  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}


async function getSubscriptionById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await subscriptionCtl.getSubscriptionById(currentUserId, id);

  res.json(new Response(data, data?'subscription_retrieved_successful':'not_found', res));
}


async function updateSubscription(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let subscription = req.body;
  let data = await subscriptionCtl.updateSubscription(currentUserId, id, subscription);

  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}

async function cancelSubscription(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let subscription = req.body;
  let data = await subscriptionCtl.cancelSubscription(currentUserId, id, subscription);

  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}



async function activateSubscription(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let subscription = req.body;
  let data = await subscriptionCtl.activateSubscription(currentUserId, id, subscription);

  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}

async function deleteSubscription(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let companyId = parseInt(req.query.company);
  let data = await subscriptionCtl.deleteSubscription(currentUserId, companyId, id);

  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}


async function updateSubscriptionPaymentMethod(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let subscription = req.body;
  let data = await subscriptionCtl.updateSubscriptionPaymentMethod(currentUserId, id, subscription);

  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}
