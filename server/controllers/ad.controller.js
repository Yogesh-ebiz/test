const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

let statusEnum = require('../const/statusEnum');
const paymentService = require('../services/api/payment.service.api');

module.exports = {
  getAds
}



async function getAds(currentUserId, locale) {

  if(!currentUserId){
    return null;
  }

  let result;
  try {
    result = await paymentService.getAdroducts();
  } catch (error) {
    console.log(error);
  }

  return result;
}


