const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const adminCtl = require('../controllers/admin.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/plans').get(asyncHandler(getPlans));
router.route('/plans').post(asyncHandler(addPlan));
router.route('/plans/:id').get(asyncHandler(getPlanById));
router.route('/plans/:id').put(asyncHandler(updatePlan));
router.route('/plans/:id').delete(asyncHandler(deletePlan));

router.route('/products').get(asyncHandler(getProducts));
router.route('/products').post(asyncHandler(addProduct));
router.route('/products/:id').get(asyncHandler(getById));
router.route('/products/:id').put(asyncHandler(updateProduct));
router.route('/products/:id').delete(asyncHandler(deleteProduct));



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


async function getById(req, res) {

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
