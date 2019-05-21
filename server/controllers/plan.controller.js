const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let Pagination = require('../utils/pagination');

let statusEnum = require('../const/statusEnum');
const planService = require('../services/plan.service');

module.exports = {
  getPlans,
  getPlanById,
  addPlan,
  deletePlan,
  updatePlan
}



async function getPlans(currentUserId, locale) {

  if(!currentUserId){
    return null;
  }

  let result;
  try {
    result = await planService.getPlans();
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getPlanById(currentUserId, planId) {

  if(!currentUserId || planId){
    return null;
  }

  let result;
  try {
    result = await planService.findById(planId);
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addPlan(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let result;
  try {
      result = await planService.addPlan(currentUserId, form);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function deletePlan(currentUserId, planId) {

  if(!currentUserId || !planId){
    return null;
  }

  let result;
  try {
    let plan = await planService.findById(planId);

    if(plan) {
      result = await plan.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function updatePlan(currentUserId, planId, form) {

  if(!currentUserId || !planId || !form){
    return null;
  }

  let result;
  try {
    result = await planService.updatePlan(planId, form)
  } catch (error) {
    console.log(error);
  }

  return result;
}


