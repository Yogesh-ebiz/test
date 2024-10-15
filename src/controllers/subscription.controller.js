const bcrypt = require('bcrypt');
const Joi = require('joi');
const httpStatus = require('http-status');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const ApiError = require('../utils/ApiError');

let statusEnum = require('../const/statusEnum');
const paymentService = require('../services/api/payment.service.api');
const companyService = require('../services/company.service');
const memberService = require('../services/member.service');
const subscriptionService = require('../services/subscription.service');
const catchAsync = require("../utils/catchAsync");





const getPlans = catchAsync(async (req, res) => {
  const {user, body} = req

  let result;
  try {
    result = await paymentService.getPlans();
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const addSubscription = catchAsync(async (req, res) => {
  const {user, body} = req

  let subscription = null;
  try {
    let company = await companyService.findByCompanyId(body.customer.partyId).populate('subscription');

    body.defaultPaymentMethod = body.payment.paymentMethodId;
    body.createdBy = user.userId;
    body.trialDays = body.trialDays>0?body.trialDays:company.talentSubscription?0:14;
    subscription = await paymentService.addSubscription(body);
    if(subscription){
      company.talentSubscription = subscription.id;
      // company.subscriptions.push(subscription.id);

      if(subscription.plan.tier==1){
        company.credit = 30;
      } else if(subscription.plan.tier==2){
        company.credit = 150;
      }

      await company.save();
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Server Error');
  }

  res.json(subscription);
});

const getSubscriptionById = catchAsync(async (req, res) => {
  const {params} = req
  const {id} = params;

  let subscription = null;
  try {
    subscription = await paymentService.getSubscriptionById(id);
    if(subscription){
      subscription.customer = null;
      subscription.plan.prices  = [];
      subscription.plan.features = [];
      subscription.defaultSource = null;
      subscription.invoice = null;
    }
  } catch (error) {
    console.log(error);
  }

  res.json(subscription);
});
const updateSubscription = catchAsync(async (req, res) => {
  const {params, body} = req
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let subscription = null;
  try {
    body.updatedBy = currentUserId;
    subscription = await paymentService.updateSubscriptionPlan(id, body);
    if(subscription){
      // let company = await companyService.findByCompanyId(parseInt(form.customer.partyId)).populate('subscription');
      // company.talentSubscription = subscription.id;
      // await company.save();
    }
  } catch (error) {
    console.log(error);
  }

  res.json(subscription);
});

const cancelSubscription = catchAsync(async (req, res) => {
  const {params, body} = req
  const {id} = params;

  let subscription = null;
  try {
    subscription = await paymentService.cancelSubscription(id, body);
  } catch (error) {
    // console.log(error);
  }

  res.json(subscription);
});


const activateSubscription = catchAsync(async (req, res) => {
  const {params, body} = req
  const {id} = params;

  let subscription = null;
  try {
    subscription = await paymentService.activateSubscription(id);
  } catch (error) {
    console.log(error);
  }

  res.json(subscription);
});


async function deleteSubscription(currentUserId, companyId, id) {
  if(!currentUserId || !companyId || !id){
    return null;
  }
  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }


  let subscription = null;
  try {
    subscription = await paymentService.deleteSubscription(id);
    let company = await companyService.findByCompanyId(companyId);
    let index = _.findIndex(company.subscriptions, function(o) { return o == id; });
    company.subscriptions.splice(index, 1);
    await company.save();

  } catch (error) {
    console.log(error);
  }

  return subscription;
}



async function updateSubscriptionPaymentMethod(currentUserId, id, form) {
  if(!currentUserId || !id || !form){
    return null;
  }
  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, form.company);
  if(!memberRole){
    return null;
  }

  let subscription = null;
  try {
    let company = await companyService.findByCompanyId(parseInt(form.company));
    if(company && company.talentSubscription==id) {
      await paymentService.updateSubscriptionPaymentMethod(id, form);
    }
  } catch (error) {
    console.log(error);
  }

  return {success: true};
}

module.exports = {
  getPlans,
  addSubscription,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  activateSubscription,
  updateSubscriptionPaymentMethod,
  deleteSubscription
}
