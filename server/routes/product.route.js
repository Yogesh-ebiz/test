const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const productCtl = require('../controllers/product.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/').get(asyncHandler(getProducts));
router.route('/').post(asyncHandler(addProduct));
router.route('/:id').get(asyncHandler(getById));
router.route('/:id').put(asyncHandler(updateProduct));
router.route('/:id').delete(asyncHandler(deleteProduct));



async function getProducts(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await productCtl.getProducts(currentUserId, res.locale);

  res.json(new Response(data, data?'products_retrieved_successful':'not_found', res));
}


async function addProduct(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await productCtl.addProduct(currentUserId, req.body);
  res.json(new Response(data, data?'product_created_successful':'not_found', res));
}


async function getById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await productCtl.getById(currentUserId, id, res.locale);

  res.json(new Response(data, data?'product_retrieved_successful':'not_found', res));
}



async function deleteProduct(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await productCtl.deleteProduct(currentUserId, id);


  res.json(new Response(data, data?'product_removed_successful':'not_found', res));
}


async function updateProduct(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await productCtl.updateProduct(currentUserId, id, req.body);
  res.json(new Response(data, data?'product_updated_successful':'not_found', res));
}
