const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Plan = require('../models/plan.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const planSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('')
});


async function getPlans() {
  let data = null;


  let plans = Plan.find();
  return plans
}

function findById(planId) {
  let data = null;

  if(planId==null){
    return;
  }

  let plan = Plan.findById(planId);
  return plan
}

async function addPlan(currentUserId, form) {
  if(!currentUserId || !form){
    return;
  }


  let result;
  form = await Joi.validate(form, planSchema, {abortEarly: false});
  form.createdBy = currentUserId
  result = new Plan(form).save();

  return result;

}

async function updatePlan(planId, form) {
  if(!planId || !form){
    return;
  }

  form = await Joi.validate(form, planSchema, {abortEarly: false});

  let plan = await findById(planId);

  if(plan){
    plan.lastUpdatedDate = Date.now();
    plan.name = form.name;
    plan.description = form.description;
    result = await plan.save();
  }
  return result;

}


module.exports = {
  getPlans:getPlans,
  addPlan:addPlan,
  findById:findById,
  updatePlan:updatePlan
}
