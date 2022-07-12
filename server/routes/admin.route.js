const express = require('express');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;

const asyncHandler = require('express-async-handler');
const adminCtl = require('../controllers/admin.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/pipelinetemplates').post(asyncHandler(addPipelineTemplate));

router.route('/pipelines').post(asyncHandler(addPipeline));
router.route('/pipelines/:id').get(asyncHandler(getPipeline));
router.route('/pipelines/:id').delete(asyncHandler(removePipeline));


router.route('/plans').get(asyncHandler(getPlans));
router.route('/plans').post(asyncHandler(addPlan));
router.route('/plans/:id').get(asyncHandler(getPlanById));
router.route('/plans/:id').put(asyncHandler(updatePlan));
router.route('/plans/:id').delete(asyncHandler(deletePlan));

router.route('/products').get(asyncHandler(getProducts));
router.route('/products').post(asyncHandler(addProduct));
router.route('/products/:id').get(asyncHandler(getProductById));
router.route('/products/:id').put(asyncHandler(updateProduct));
router.route('/products/:id').delete(asyncHandler(deleteProduct));

router.route('/questions').get(asyncHandler(getQuestions));
router.route('/questions').post(asyncHandler(addQuestion));
router.route('/questions/:id').get(asyncHandler(getQuestionById));
router.route('/questions/:id').put(asyncHandler(updateQuestion));
router.route('/questions/:id').delete(asyncHandler(deleteQuestion));


router.route('/jobfunctions').get(asyncHandler(getJobfunctions));
router.route('/jobfunctions').post(asyncHandler(addJobfunction));
router.route('/jobfunctions/:id').get(asyncHandler(getJobfunctionById));
router.route('/jobfunctions/:id').put(asyncHandler(updateJobfunction));
router.route('/jobfunctions/:id').delete(asyncHandler(deleteJobFunction));

async function addPipelineTemplate(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let template = req.body;
  let data = await adminCtl.addPipelineTemplate(currentUserId, template);

  res.json(new Response(data, data?'template_added_successful':'not_found', res));
}


async function addPipeline(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let template = req.body;
  let data = await adminCtl.addPipeline(currentUserId, template);

  res.json(new Response(data, data?'template_added_successful':'not_found', res));
}

async function getPipeline(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = ObjectID(req.params.id);
  let data = await adminCtl.getPipeline(id);

  res.json(new Response(data, data?'template_added_successful':'not_found', res));
}



async function removePipeline(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = ObjectID(req.params.id);
  let data = await adminCtl.removePipeline(id);

  res.json(new Response(data, data?'template_removed_successful':'not_found', res));
}

async function removePipeline(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = ObjectID(req.params.id);
  let data = await adminCtl.removePipeline(id);

  res.json(new Response(data, data?'template_removed_successful':'not_found', res));
}


async function getPlans(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await adminCtl.getPlans(currentUserId, res.locale);

  res.json(new Response(data, data?'plans_retrieved_successful':'not_found', res));
}


async function addPlan(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await adminCtl.addPlan(currentUserId, req.body);
  res.json(new Response(data, data?'plan_created_successful':'not_found', res));
}


async function getPlanById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.getPlanById(currentUserId, id, res.locale);

  res.json(new Response(data, data?'plan_retrieved_successful':'not_found', res));
}



async function deletePlan(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.deletePlan(currentUserId, id);


  res.json(new Response(data, data?'plan_removed_successful':'not_found', res));
}


async function updatePlan(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.updatePlan(currentUserId, id, req.body);
  res.json(new Response(data, data?'plan_updated_successful':'not_found', res));
}


async function getProducts(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let sort = req.query;
  let filter = req.body;
  let data = await adminCtl.getProducts(currentUserId, filter, sort, res.locale);

  res.json(new Response(data, data?'products_retrieved_successful':'not_found', res));
}


async function addProduct(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await adminCtl.addProduct(currentUserId, req.body);
  res.json(new Response(data, data?'product_created_successful':'not_found', res));
}


async function getProductById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.getProductById(currentUserId, id, res.locale);

  res.json(new Response(data, data?'product_retrieved_successful':'not_found', res));
}



async function deleteProduct(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.deleteProduct(currentUserId, id);


  res.json(new Response(data, data?'product_removed_successful':'not_found', res));
}


async function updateProduct(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.updateProduct(currentUserId, id, req.body);
  res.json(new Response(data, data?'product_updated_successful':'not_found', res));
}


//******************* Questions ****************************

async function getQuestions(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let sort = req.query;
  let filter = req.body;
  let data = await adminCtl.getQuestions(currentUserId, filter, sort, res.locale);

  res.json(new Response(data, data?'questions_retrieved_successful':'not_found', res));
}


async function addQuestion(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await adminCtl.addQuestion(currentUserId, req.body);
  res.json(new Response(data, data?'question_created_successful':'not_found', res));
}


async function getQuestionById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.getQuestionById(currentUserId, id, res.locale);

  res.json(new Response(data, data?'question_retrieved_successful':'not_found', res));
}



async function deleteQuestion(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.deleteQuestion(currentUserId, id);


  res.json(new Response(data, data?'question_removed_successful':'not_found', res));
}


async function updateQuestion(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.updateQuestion(currentUserId, id, req.body);
  res.json(new Response(data, data?'question_updated_successful':'not_found', res));
}




//******************* Jobfunctions ****************************

async function getJobfunctions(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await adminCtl.getJobfunctions(currentUserId, res.locale);

  res.json(new Response(data, data?'jobfunctions_retrieved_successful':'not_found', res));
}


async function addJobfunction(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await adminCtl.addJobfunction(currentUserId, req.body);
  res.json(new Response(data, data?'jobfunction_created_successful':'not_found', res));
}


async function getJobfunctionById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.getJobfunctionById(currentUserId, id, res.locale);

  res.json(new Response(data, data?'jobfunction_retrieved_successful':'not_found', res));
}



async function deleteJobFunction(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.deleteJobFunction(currentUserId, id);


  res.json(new Response(data, data?'jobfunction_removed_successful':'not_found', res));
}


async function updateJobfunction(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await adminCtl.updateJobfunction(currentUserId, id, req.body);
  res.json(new Response(data, data?'jobfunction_updated_successful':'not_found', res));
}
