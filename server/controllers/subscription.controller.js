const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

let statusEnum = require('../const/statusEnum');
const paymentService = require('../services/api/payment.service.api');

module.exports = {
  getPlans
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


