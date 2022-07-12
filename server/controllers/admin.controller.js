const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let Pagination = require('../utils/pagination');

let statusEnum = require('../const/statusEnum');
const planService = require('../services/plan.service');
const productService = require('../services/product.service');
const pipelineTemplateService = require('../services/pipelineTemplate.service');
const pipelineService = require('../services/pipeline.service');
const questionService = require('../services/question.service');
const jobfunctionService = require('../services/jobfunction.service');

module.exports = {
  addPipelineTemplate,
  addPipeline,
  getPipeline,
  removePipeline,
  getPlans,
  getPlanById,
  addPlan,
  deletePlan,
  updatePlan,
  getProducts,
  getProductById,
  addProduct,
  deleteProduct,
  updateProduct,
  getQuestions,
  getQuestionById,
  addQuestion,
  deleteQuestion,
  updateQuestion,
  getJobfunctions,
  getJobfunctionById,
  addJobfunction,
  deleteJobfunction,
  updateJobfunction
}





async function addPipelineTemplate(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let result;
  try {
    form.createdBy = currentUserId;
    result = await pipelineTemplateService.add(form);
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function addPipeline(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let result;
  try {
    let template = await pipelineTemplateService.findById(form.pipelineTemplateId);
    if(template) {
      let pipeline = {createdBy: currentUserId, custom: false, default: true, pipelineTemplateId: form.pipelineTemplateId, stages: template.stages, name: form.name};
      result = await pipelineService.add(pipeline)
    }


  } catch (error) {
    console.log(error);
  }

  return result;
}



async function getPipeline(id) {

  if(!id){
    return null;
  }

  let result;
  try {
    result = await pipelineService.findById(id);


  } catch (error) {
    console.log(error);
  }

  return result;
}



async function removePipeline(id) {

  if(!id){
    return null;
  }

  let result;
  try {
    result = await pipelineService.remove(id);


  } catch (error) {
    console.log(error);
  }

  return {success: true};
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
      result = await planService.add(currentUserId, form);

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
    result = await productService.add(currentUserId, form);

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



async function getQuestions(currentUserId, filter, sort, locale) {

  if(!currentUserId || !filter || !sort){
    return null;
  }

  let result;
  try {
    result = await questionService.getQuestions(filter, sort);
  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);
}


async function getQuestionById(currentUserId, id) {

  if(!currentUserId || id){
    return null;
  }

  let result;
  try {
    result = await questionService.findById(id);
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addQuestion(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let result;
  try {
    result = await questionService.add(form);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function deleteQuestion(currentUserId, id) {

  if(!currentUserId || !id){
    return null;
  }

  let result;
  try {
    let product = await questionService.findById(id);

    if(product) {
      result = await product.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function updateQuestion(currentUserId, id, form) {

  if(!currentUserId || !id || !form){
    return null;
  }

  let result;
  try {
    result = await questionService.update(id, form)
  } catch (error) {
    console.log(error);
  }

  return result;
}



async function getJobfunctions(locale) {


  let result;
  try {
    result = await jobfunctionService.getJobfunctions();
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getJobfunctionById(currentUserId, id) {

  if(!currentUserId || id){
    return null;
  }

  let result;
  try {
    result = await jobfunctionService.findById(id);
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addJobfunction(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let result;
  try {
    result = await jobfunctionService.add(form);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function deleteJobfunction(currentUserId, id) {

  if(!currentUserId || !id){
    return null;
  }

  let result;
  try {
    let product = await jobfunctionService.findById(id);

    if(product) {
      result = await product.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function updateJobfunction(currentUserId, id, form) {

  if(!currentUserId || !id || !form){
    return null;
  }

  let result;
  try {
    result = await jobfunctionService.update(id, form)
  } catch (error) {
    console.log(error);
  }

  return result;
}

