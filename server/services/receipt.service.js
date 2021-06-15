const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const Receipt = require('../models/receipt.model');
const Joi = require('joi');


const receiptSchema = Joi.object({
  amount: Joi.number(),
  currency: Joi.string(),
  description: Joi.string().required(),
  chargeId: Joi.string(),
  metadata: Joi.object(),
  type: Joi.string(),
  isPaid: Joi.boolean(),
  paymentType: Joi.string(),
  receiptUrl: Joi.string(),
  member: Joi.object(),
  userId: Joi.number()
});


async function add(receipt) {

  if(!receipt){
    return;
  }

  receipt = await Joi.validate(receipt, receiptSchema, {abortEarly: false});
  receipt = new Receipt(receipt).save();

  return receipt;

}


async function findById(id) {
  if(!id){
    return;
  }

  return Receipt.findById(id);

}


module.exports = {
  add:add
}
