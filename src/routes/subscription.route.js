const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const subscriptionCtl = require('../controllers/subscription.controller');
let Response = require('../const/response');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const subscriptionValidation = require("../validations/subscription.validation");


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('').post(authorize('manage_subscription'), validate(subscriptionValidation.addSubscription), subscriptionCtl.addSubscription);
router.get('/plans', subscriptionCtl.getPlans);

router.get('/:id', validate(subscriptionValidation.getSubscriptionById), subscriptionCtl.getSubscriptionById);
router.put('/:id/plan', validate(subscriptionValidation.updateSubscriptionPlan), subscriptionCtl.updateSubscription);
router.post('/:id/activate', validate(subscriptionValidation.activateSubscription), subscriptionCtl.activateSubscription);
router.post('/:id/cancel', validate(subscriptionValidation.cancelSubscription), subscriptionCtl.cancelSubscription);
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


async function updateSubscription(req, res, next) {

  try{
    let currentUserId = parseInt(req.header('UserId'));
    let id = req.params.id;
    let subscription = req.body;
    let data = await subscriptionCtl.updateSubscription(currentUserId, id, subscription);
    res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
  } catch(error){
    console.log('next................')
    next(error);
  }


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
