const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const fs = require('fs/promises');
const path = require('path');

let Pagination = require('../utils/pagination');

let statusEnum = require('../const/statusEnum');
const planService = require('../services/plan.service');
const productService = require('../services/product.service');
const pipelineTemplateService = require('../services/pipelineTemplate.service');
const pipelineService = require('../services/jobpipeline.service');
const questionService = require('../services/question.service');
const jobfunctionService = require('../services/jobfunction.service');
const resumeTemplateService = require('../services/resumetemplate.service');
const catchAsync = require("../utils/catchAsync");
const feedService = require("../services/api/feed.service.api");
const candidateService = require("../services/candidate.service");
const awsService = require("../services/aws.service");



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


//******************* Jobfunctions ****************************
const getJobfunctions = catchAsync(async (req, res) => {
  const { query, locale } = req;
  const keyword = query.query || '';

  let result;
  try {
    result = await jobfunctionService.search(keyword);
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const getJobfunctionById = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id} = params;

  let result;
  try {
    result = await jobfunctionService.findById(id);
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});



const addJobfunction = catchAsync(async (req, res) => {
  const { body, locale } = req;

  let result;
  try {
    result = await jobfunctionService.add(body);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const deleteJobfunction = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;

  let result;
  try {
    let jobFunction = await jobfunctionService.findById(id);

    if(jobFunction) {
      result = await jobFunction.delete();

    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const updateJobfunction = catchAsync(async (req, res) => {
  const { body, params, locale } = req;
  const {id} = params;

  let result;
  try {
    result = await jobfunctionService.update(id, body)
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const addResumeTemplate = catchAsync(async (req, res) => {
  const { body, locale } = req;

  let result;
  try {
    const data = await fs.readFile(path.join(__dirname, '../quixote.txt'), { encoding: 'utf8' });
    body.content = data;
    result = await resumeTemplateService.add(body);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const getResumeTemplateById = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const { id } = params;

  let result;
  try {
    result = await resumeTemplateService.findById(ObjectID(id));

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const uploadResumeTemplateImage = catchAsync(async (req, res) => {
  const {params, files} = req;
  const {id} = params;

  let result = null;
  let basePath = 'templates/resumes/';
  try {

    let template = await resumeTemplateService.findById(ObjectID(id));

    if (template) {
      console.log(template)
      let type, name;
      if(files.file) {
        let file = files.file[0];
        let fileName = file.originalname.split('.');
        let fileExt = fileName[fileName.length - 1];
        let timestamp = Date.now();
        name = template._id + '_' + timestamp + '.' + fileExt;
        let path = basePath + name;
        let response = await awsService.upload(path, file.path);
        switch (fileExt) {
          case 'png':
            type = 'PNG';
            break;
          case 'jpeg':
            type = 'JPG';
            break;
          case 'jpg':
            type = 'JPG';
            break;

        }

        template.image = name;
        result = await template.save();
      }
    }


  } catch (error) {
    console.log(error);
  }

  res.json(result?.image);

});


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
  updateJobfunction,
  addResumeTemplate,
  getResumeTemplateById,
  uploadResumeTemplateImage
}


