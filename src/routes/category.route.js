const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const categoryCtl = require('../controllers/category.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/search').get(asyncHandler(getAllCategories));


async function getAllCategories(req, res) {
  let data = await categoryCtl.getAllCategories(req.query, req.locale);
  res.json(new Response(data, data?'categories_retrieved_successful':'not_found', res));

}

