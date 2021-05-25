const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let Pagination = require('../utils/pagination');

let statusEnum = require('../const/statusEnum');
const planService = require('../services/plan.service');
const productService = require('../services/product.service');

module.exports = {
  getPlans,
  getPlanById,
  addPlan,
  deletePlan,
  updatePlan,
  getProducts,
  getProductById,
  addProduct,
  deleteProduct,
  updateProduct
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



async function getProducts(currentUserId, filter, sort, locale) {

  if(!currentUserId || !filter || !sort){
    return null;
  }

  let result;
  try {
    result = await productService.getProducts(filter, sort);
  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);
}


async function getProductById(currentUserId, productId) {

  if(!currentUserId || productId){
    return null;
  }

  let result;
  try {
    result = await productService.findById(productId);
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addProduct(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let result;
  try {
    result = await productService.addProduct(currentUserId, form);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function deleteProduct(currentUserId, productId) {

  if(!currentUserId || !productId){
    return null;
  }

  let result;
  try {
    let product = await productService.findById(productId);

    if(product) {
      result = await product.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function updateProduct(currentUserId, productId, form) {

  if(!currentUserId || !productId || !form){
    return null;
  }

  let result;
  try {
    result = await productService.updateProduct(productId, form)
  } catch (error) {
    console.log(error);
  }

  return result;
}


