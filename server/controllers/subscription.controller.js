const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

let statusEnum = require('../const/statusEnum');
const paymentService = require('../services/api/payment.service.api');
const companyService = require('../services/company.service');
const memberService = require('../services/member.service');


module.exports = {
  addSubscription,
  getSubscription,
  updateSubscription,
  getPlans
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
    form.createdBy = currentUserId;
    subscription = await paymentService.addSubscription(form);
    if(subscription){

      let company = await companyService.findByCompanyId(parseInt(subscription.company));

      subscription = {id: subscription.id, createdDate: subscription.createdDate, startDate: subscription.startDate, status: subscription.status, plan: {id: subscription.plan.id, name: subscription.plan.name, price: subscription.price.id}}
      company.subscription = subscription;
      await company.save();
    }
  } catch (error) {
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
      subscription = {id: subscription.id, createdDate: subscription.createdDate, startDate: subscription.startDate, status: subscription.status, plan: {id: subscription.plan.id, name: subscription.plan.name, price: subscription.price.id}}
      company.subscription = subscription;
      await company.save();
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

  console.log(form)
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
      subscription = {id: subscription.id, createdDate: subscription.createdDate, startDate: subscription.startDate, status: subscription.status, plan: {id: subscription.plan.id, name: subscription.plan.name, price: subscription.price.id}}
      company.subscription = subscription;
      await company.save();
    }
  } catch (error) {
    console.log(error);
  }

  return subscription;
}



async function getPlans(locale) {


  let result;
  try {
    console.log('getPlans')
    result = await paymentService.getPlans();
  } catch (error) {
    console.log(error);
  }

  return result;
}


