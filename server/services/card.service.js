const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

let SearchParam = require('../const/searchParam');
const statusEnum = require('../const/statusEnum');
const Card = require('../models/card.model');
const feedService = require('../services/api/feed.service.api');
const paymentService = require('../services/api/payment.service.api');
const companyService = require('../services/company.service');

const {convertToCandidate, cardTest} = require('../utils/helper');


const cardSchema = Joi.object({
  number: Joi.string().required(),
  exp_month: Joi.number().required(),
  exp_year: Joi.number().required(),
  cvc: Joi.number().optional(),
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  phone: Joi.string().allow('').optional(),
  billingAddress: Joi.object(),
  currency: Joi.string().allow('').optional(),
  meta: Joi.object().optional(),
  companyId: Joi.number(),
  userId: Joi.number(),
  customer: Joi.object()
});


async function updatePaymentMethod(customerId, card) {
  if(!customerId || !card){
    return;
  }

  card = await Joi.validate(card, cardSchema, {abortEarly: false});


  // card.last4 = card.number.substring(card.number.length-4, card.number.length);
  // card.brand = cardTest(card.number)

  card = await paymentService.updatePaymentMethod(customerId, card);
  return card;

}

async function remove(cardId) {

  if(!cardId){
    return;
  }

  let result;
  let card = await Card.findById(cardId);
  if(card){
    result = await card.delete();
    if(result){
      result = {success: true}
    }
  }

  return result;

}

async function findById(id) {

  if(!id){
    return;
  }

  return await Card.findById(id);
}



async function findByCompany(companyId) {

  if(!companyId){
    return;
  }

  let list = [];
  let company = await companyService.findById(companyId);
  if(company.customerId){
    list = await paymentService.getDefaultCard(company.customerId);

    //temporary set to array for later multi-cards
    if(!_.isEmpty(list)) {
      list = [list];
    }
  }
  return list;

}



async function findByUserId(userId) {

  if(!userId){
    return;
  }

  // return await Card.find({userId: userId}).limit(5);
  return await paymentService.getUserCards(userId);
}


module.exports = {
  updatePaymentMethod:updatePaymentMethod,
  remove:remove,
  findById:findById,
  findByUserId:findByUserId,
  findByCompany:findByCompany,
}
