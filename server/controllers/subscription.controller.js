const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const { SubscriptionExist } = require('../middleware/baseError');

let statusEnum = require('../const/statusEnum');
const paymentService = require('../services/api/payment.service.api');
const companyService = require('../services/company.service');
const memberService = require('../services/member.service');
const subscriptionService = require('../services/subscription.service');


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


async function getPlans(locale) {


  let result;
  try {
    result = await paymentService.getPlans();
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function addSubscription(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let member = await memberService.findByUserIdAndCompany(currentUserId, form.company);

  if(!member){
    return null;
  }

  let subscription = null;
  try {
    let company = await companyService.findByCompanyId(parseInt(form.company));

    form.defaultPaymentMethod = form.payment.paymentMethodId;
    form.createdBy = currentUserId;
    subscription = await paymentService.addSubscription(form);
    if(subscription){
      company.talentSubscription = subscription.id;
      company.subscriptions.push(subscription.id);

      if(subscription.plan.tier==1){
        company.credit = 30;
      } else if(subscription.plan.tier==2){
        company.credit = 150;
      }

      await company.save();
    }
  } catch (error) {
    console.log('throwing...................')
    console.log(error);
  }

  return subscription;
}


async function getSubscriptionById(currentUserId, id) {
  if(!currentUserId || !id){
    return null;
  }

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

  return subscription;
}

async function updateSubscription(currentUserId, id, form) {
  if(!currentUserId || !id || !form){
    return null;
  }

  let member = await memberService.findByUserIdAndCompany(currentUserId, form.company);

  if(!member){
    return null;
  }

  let subscription = null;
  try {
    form.updatedBy = currentUserId;
    subscription = await paymentService.updateSubscription(id, form);
    if(subscription){
      let company = await companyService.findByCompanyId(parseInt(subscription.company));
      company.talentSubscription = subscription.id;
      await company.save();
    }
  } catch (error) {
    console.log(error);
  }

    return subscription;
}

async function cancelSubscription(currentUserId, id, form) {
  if(!currentUserId || !id || !form){
    return null;
  }
  let member = await memberService.findByUserIdAndCompany(currentUserId, form.company);
  if(!member){
    return null;
  }


  let subscription = null;
  try {
    let company = await companyService.findByCompanyId(parseInt(form.company));
    if(company && company.talentSubscription==id) {
      subscription = await paymentService.cancelSubscription(id, form);
    }
  } catch (error) {
    console.log(error);
  }

  return subscription;
}


async function activateSubscription(currentUserId, id, form) {
  if(!currentUserId || !id || !form){
    return null;
  }
  let member = await memberService.findByUserIdAndCompany(currentUserId, form.company);
  if(!member){
    return null;
  }


  let subscription = null;
  try {
    let company = await companyService.findByCompanyId(parseInt(form.company));
    if(company && company.talentSubscription==id) {
      subscription = await paymentService.activateSubscription(id);
    }
  } catch (error) {
    console.log(error);
  }

  return subscription;
}


async function deleteSubscription(currentUserId, companyId, id) {
  if(!currentUserId || !companyId || !id){
    return null;
  }
  let member = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!member){
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
  let member = await memberService.findByUserIdAndCompany(currentUserId, form.company);
  if(!member){
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

  return subscription;
}
