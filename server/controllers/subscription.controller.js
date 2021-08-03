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

    form.createdBy = currentUserId;
    subscription = await paymentService.addSubscription(form);
    if(subscription){
      // let newSubscription = {subscriptionId: subscription.id, category: subscription.category, createdDate: subscription.createdDate, startDate: subscription.startDate, status: subscription.status, plan: {id: subscription.plan.id, name: subscription.plan.name, price: subscription.price.id, tier: subscription.plan.tier}}
      // subscription = await subscriptionService.add(newSubscription);
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
      company.subscription.currentPeriodEnd = subscription.currentPeriodEnd;
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
    let company = await companyService.findByCompanyId(parseInt(form.company));
    if(company.subscription.subscriptionId===id) {
      form.updatedBy = currentUserId;
      subscription = await paymentService.cancelSubscription(id, form);
      if (subscription) {
        company.subscription.status = subscription.status;
        company.subscription.cancelAt = subscription.cancelAt;
        company.subscription.canceledAt = subscription.canceledAt;
        company.subscription.cancelAtPeriodEnd = subscription.cancelAtPeriodEnd;
        company.subscription.currentPeriodEnd = subscription.currentPeriodEnd;
        company.subscription.plan.price = subscription.plan.priceId;
        subscription = await company.subscription.save();
      }
    }
  } catch (error) {
    console.log(error);
  }

  return subscription;
}


