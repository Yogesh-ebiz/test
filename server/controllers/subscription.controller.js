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
  updateSubscription,
  getPlans
}



async function addSubscription(currentUserId, subscription) {

  if(!currentUserId || !subscription){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, subscription.company);

  if(!member){
    return null;
  }

  let result;
  try {
    result = await paymentService.addSubscription(subscription);
    if(result){
      let company = await companyService.findByCompanyId(parseInt(subscription.company));
      console.log(subscription.company)
    }
  } catch (error) {
    console.log(error);
  }

  return result;
}





async function updateSubscription(currentUserId, id, subscription) {
  console.log(currentUserId, id, subscription)
  if(!currentUserId || !id || !subscription){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, subscription.company);

  if(!member){
    return null;
  }

  let result;
  try {
    result = await paymentService.updateSubscription(id, subscription);
    if(result){
      let company = await companyService.findByCompanyId(parseInt(subscription.companyId));
      console.log(company)
    }
  } catch (error) {
    console.log(error);
  }

  return result;
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


