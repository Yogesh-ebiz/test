const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const paymentType = require('../const/paymentType');

const Invoice = require('../models/invoice.model');
const paymentApi = require('../services/api/payment.service.api');
const memberService = require("./member.service");
const subjectType = require("../const/subjectType");
const SearchParam = require("../const/searchParam");
const JobRequisition = require("../models/jobrequisition.model");
const feedService = require("./api/feed.service.api");
const bookmarkService = require("./bookmark.service");
const { convertToCompany, convertToAvatar } = require("../utils/helper");
const adPosition = require("../const/adPosition");



const invoiceSchema = Joi.object({
  chargeId: Joi.string(),
  amount: Joi.number(),
  currency: Joi.string(),
  description: Joi.string().allow(''),
  type: Joi.string(),
  isPaid: Joi.string(),
  receiptUrl: Joi.string(),
  userId: Joi.number(),
  member: Joi.object(),
  paymentType: Joi.string(),
  paymentMethod: Joi.object(),
  items: Joi.array(),
  amountDue: Joi.number(),
  amountPaid: Joi.number(),
  amountRemaining: Joi.number(),
  paid: Joi.boolean(),
  subtotal: Joi.number(),
  tax: Joi.number(),
  total: Joi.number(),
  meta: Joi.object().optional(),
});


const cartSchema = Joi.object({
  dailyBudget: Joi.number().optional(),
  cart: Joi.object(),
  card: Joi.object(),
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

async function search(filter, sort, locale) {
  if(!filter || !sort){
    return null;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };


  let aList = [];
  let match = {};
  let aSort;

  aSort = { $sort: {createdDate: direction} };


  filter.status=filter.status && filter.status.length? filter.status:[statusEnum.PAID];

  aList.push({ $match: new SearchParam(filter)});
  aList.push(
    {
      $lookup: {
        from: 'members',
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
        from: 'labels',
        localField: "tags",
        foreignField: "_id",
        as: "tags"
      }
    },

  );
  aList.push(aSort);

  const aggregate = Invoice.aggregate(aList);
  const result = await Invoice.aggregatePaginate(aggregate, options);
  return result;
}


module.exports = {
  log,
  charge,
  search
}
