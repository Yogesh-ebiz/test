const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const sourceCtl = require('../controllers/source.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/sync').get(asyncHandler(sync));
router.route('/:source').get(asyncHandler(getArticlesBySource));
router.route('/getTrendingBySource/:source').get(asyncHandler(getArticlesBySource));




async function sync(req, res) {
  let data = await sourceCtl.sync();
  res.json(new Response(data, res));
}



async function getArticlesBySource(req, res) {
  let map = {data: null , "message": "Retrieved successfully", "status": 200};
  let data = await sourceCtl.getArticlesBySource(req.params.source, res.locale);

  res.json(new Response(data, res));
}


async function getArticlesBySource(req, res) {
  let map = {data: null , "message": "Retrieved successfully", "status": 200};
  let data = await sourceCtl.getTrendingBySource(req.params.source, res.locale);

  res.json(new Response(data, res));
}
