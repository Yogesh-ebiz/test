const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const productType = require('../const/productType');

const Plan = require('../models/plan.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const paymentService = require('../services/api/payment.service.api');


const planSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  type: Joi.string().allow(''),
  category: Joi.string().allow(''),
  currency: Joi.string(),
  price: Joi.object(),
  isRecommended: Joi.boolean(),
  recurring: Joi.object().optional()
});


async function add(currentUserId, form) {
  if(!currentUserId || !form){
    return;
  }


  let result;
  form = await Joi.validate(form, planSchema, {abortEarly: false});
  form.createdBy = currentUserId

  let plan = await paymentService.addProduct(currentUserId, form);
  if(plan){
    form.productId = plan.id;
    result = new Plan(form).save();
  }

  return result;

}

async function update(id, form) {
  if(!id || !form){
    return;
  }

  form = await Joi.validate(form, planSchema, {abortEarly: false});

  let plan = await findById(id);

  if(plan){
    plan.lastUpdatedDate = Date.now();
    plan.name = form.name;
    plan.description = form.description;
    plan.price.listPrice = form.price.listPrice;

    result = await plan.save();
  }
  return result;

}


async function getPlans(filter, sort) {
  let data = null;

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };


  let plans = Plan.paginate({}, options);
  return plans
}


function findById(id) {
  let data = null;

  if(id==null){
    return;
  }

  let plan = Plan.findById(id);
  return plan
}


module.exports = {
  add:add,
  update:update,
  getPlans:getPlans,
  findById:findById

}
