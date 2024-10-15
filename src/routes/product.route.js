const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const productCtl = require('../controllers/product.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

router.route('/').get(asyncHandler(getProducts));

async function getProducts(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await productCtl.getProducts(currentUserId, res.locale);

  res.json(new Response(data, data?'products_retrieved_successful':'not_found', res));
}

