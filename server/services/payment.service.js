const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const paymentType = require('../const/paymentType');

const Payment = require('../models/payment.model');
const paymentApi = require('../services/api/payment.service.api');



const paymentSchema = Joi.object({
  chargeId: Joi.string(),
  amount: Joi.number(),
  currency: Joi.string(),
  description: Joi.string().allow(''),
  type: Joi.string(),
  isPaid: Joi.string(),
  receiptUrl: Joi.string(),
  userId: Joi.number(),
  member: Joi.object(),
  isPaid: Joi.boolean(),
  paymentType: Joi.string(),
  paymentMethod: Joi.object(),
  meta: Joi.object().optional(),
});

const cartSchema = Joi.object({
  dailyBudget: Joi.number().optional(),
  cart: Joi.object(),
  payment: Joi.object(),
});


async function charge(member, cart) {

  if(!member || !cart){
    return;
  }

  cart = await Joi.validate(cart, cartSchema, {abortEarly: false});

  let paid = await paymentApi.charge(member.userId, cart);
  let payment;
  if(paid){

    let paymentMethod;

    if(paid.payment_method_details.card){
      paymentMethod = {
        last4: paid.payment_method_details.card.last4,
        brand: paid.payment_method_details.card.brand,
        expMonth: paid.payment_method_details.card.exp_month,
        expYear: paid.payment_method_details.card.exp_year,
      }
    }

    payment = {
      amount: paid.amount,
      currency: paid.currency,
      description: paid.description?paid.description:'',
      chargeId: paid.id,
      meta: paid.metadata,
      type: 'PROMOTEJOB',
      isPaid: paid.paid,
      receiptUrl: paid.receipt_url,
      userId: member.userId,
      member: member._id,
      paymentType: paid.payment_method_details.type,
      paymentMethod: paymentMethod
    };

    payment = await log(payment);

  }
  return payment;

}

async function log(payment) {

  if(!payment){
    return;
  }

  payment = await Joi.validate(payment, paymentSchema, {abortEarly: false});
  payment = new Payment(payment).save();

  return payment;

}


module.exports = {
  log:log,
  charge:charge
}
