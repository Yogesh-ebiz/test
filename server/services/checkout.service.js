const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const statusEnum = require('../const/statusEnum');
const Activity = require('../models/activity.model');
const paymentService = require('../services/payment.service');
const paymentProvider = require('../services/api/payment.service.api');

const adService = require('../services/ad.service');



async function payJob(member, form) {

  if(!member || !form){
    return;
  }

  let ads = [];
  let payment = await paymentService.charge(member, form);

  return ads;

}


module.exports = {
  payJob:payJob
}
