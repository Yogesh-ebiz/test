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
  getSubscription,
  updateSubscription,
  cancelSubscription
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

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, form.company);

  if(!member){
    return null;
  }

  let subscription = null;
  try {
    let company = await companyService.findByCompanyId(parseInt(form.company));
    if(company.subscription){
      throw new SubscriptionExist(400, "Subscription Exists ");
    }

    form.createdBy = currentUserId;
    subscription = await paymentService.addSubscription(form);
    if(subscription){
      let newSubscription = {subscriptionId: subscription.id, type: subscription.type, createdDate: subscription.createdDate, startDate: subscription.startDate, status: subscription.status, plan: {id: subscription.plan.id, name: subscription.plan.name, price: subscription.price.id, tier: subscription.plan.tier}}
      subscription = await subscriptionService.add(newSubscription);
      company.subscription = subscription;

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



async function getSubscription(currentUserId, id) {
  if(!currentUserId || !id){
    return null;
  }

  let subscription = null;
  try {
    subscription = await paymentService.getSubscription(id);
    if(subscription){
      let company = await companyService.findByCompanyId(parseInt(subscription.company));
      company.subscription.status = subscription.status;
      company.subscription.cancelAt = subscription.cancelAt;
      company.subscription.canceledAt = subscription.canceledAt;
      company.subscription.cancelAtPeriodEnd = subscription.cancelAtPeriodEnd;
      company.subscription.plan.id = subscription.plan.id;
      company.subscription.plan.name = subscription.plan.name;
      company.subscription.plan.price = subscription.price;
      await company.subscription.save();
      subscription.plan.price = subscription.price;
      subscription.customer = null;
      subscription.plan.prices  = [];
      subscription.plan.features = [];
      subscription.price = null;
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

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, form.company);

  if(!member){
    return null;
  }

  let subscription = null;
  try {
    form.updatedBy = currentUserId;
    subscription = await paymentService.updateSubscription(id, form);
    if(subscription){
      let company = await companyService.findByCompanyId(parseInt(subscription.company));


      if(company.subscription.plan.id!=subscription.plan.id) {
        if (subscription.plan.tier == 1) {
          company.credit = 30;
        } else if (subscription.plan.tier == 2) {
          company.credit = 150;
        }
      }

      company.subscription.status = subscription.status;
      company.subscription.cancelAt = subscription.cancelAt;
      company.subscription.canceledAt = subscription.canceledAt;
      company.subscription.cancelAtPeriodEnd = subscription.cancelAtPeriodEnd;
      company.subscription.plan = {id: subscription.plan.id, name: subscription.plan.name, tier: subscription.plan.tier, price: subscription.price.id};
      subscription = await company.subscription.save();
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

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, form.company);

  if(!member){
    return null;
  }

  let subscription = null;
  try {
    form.updatedBy = currentUserId;
    subscription = await paymentService.cancelSubscription(id, form);
    if(subscription){
      let company = await companyService.findByCompanyId(parseInt(subscription.company));
      company.subscription.status = subscription.status;
      company.subscription.cancelAt = subscription.cancelAt;
      company.subscription.canceledAt = subscription.canceledAt;
      company.subscription.cancelAtPeriodEnd = subscription.cancelAtPeriodEnd;
      company.subscription.plan.priceId = subscription.plan.priceId;
      subscription = await company.subscription.save();
    }
  } catch (error) {
    console.log(error);
  }

  return subscription;
}


