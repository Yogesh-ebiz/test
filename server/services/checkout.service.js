const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const statusEnum = require('../const/statusEnum');
const Activity = require('../models/activity.model');
const paymentService = require('../services/payment.service');



async function pay(member, form) {

  if(!member || !form){
    return;
  }


  let oneOrZero = (Math.random()>=0.5)? 1 : 0;
  let payment;
  if(oneOrZero) {
    payment = await paymentService.charge(member, form);
  }



  return payment;

}


module.exports = {
  pay:pay
}
