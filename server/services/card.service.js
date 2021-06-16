const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

let SearchParam = require('../const/searchParam');
const statusEnum = require('../const/statusEnum');
const Card = require('../models/card.model');
const feedService = require('../services/api/feed.service.api');

const {convertToCandidate, cardTest} = require('../utils/helper');


const cardSchema = Joi.object({
  number: Joi.string().required(),
  exp_month: Joi.number().required(),
  exp_year: Joi.number().required(),
  cvc: Joi.number().optional(),
  name: Joi.string().optional(),
  address_line1: Joi.string(),
  address_line2: Joi.string().allow('').optional(),
  address_city: Joi.string().allow('').optional(),
  address_country: Joi.string(),
  address_state: Joi.string().allow('').optional(),
  address_zip: Joi.string().allow('').optional(),
  currency: Joi.string().allow('').optional(),
  meta: Joi.object().optional(),
  customer: Joi.number()
});


async function add(card) {

  if(!card){
    return;
  }

  card = await Joi.validate(card, cardSchema, {abortEarly: false});
  card.last4 = card.number.substring(card.number.length-4, card.number.length);
  card.brand = cardTest(card.number)
  console.log(card.brand)
  card = new Card(card).save();

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

async function findByUserId(userId) {

  if(!userId){
    return;
  }

  return await Card.findOne({userId: userId});
}


async function findByCompany(company) {

  if(!company){
    return;
  }
  // return await Card.find({customer: ''+company});
  return [
    {brand: 'Visa', last4: 4543, isDefault: false},
    {brand: 'MasterCard', last4: 7544, isDefault: true},
    {brand: 'Discover', last4: 6434, isDefault: false}
  ];
}



module.exports = {
  add:add,
  remove:remove,
  findById:findById,
  findByUserId:findByUserId,
  findByCompany:findByCompany
}
