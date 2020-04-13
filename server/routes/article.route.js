const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const articleCtl = require('../controllers/article.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/trending').get(asyncHandler(getTrending));
router.route('/trending/:topic').get(asyncHandler(getTrendingByTopic));
router.route('/search').get(asyncHandler(searchArticles));
router.route('/:id').get(asyncHandler(getArticleById));
router.route('/topic/:topic').get(asyncHandler(getArticlesByTopic));




async function getArticleById(req, res) {

  let map = {data: null , "message": "Retrieved successfully", "status": 200};
  let data = await articleCtl.getArticleById(req.params.id, res.locale);

  res.json(new Response(data, res));
}


async function searchArticles(req, res) {
  let data = await articleCtl.searchArticles(req);
  res.json(new Response(data, res));
}


async function getArticlesByTopic(req, res) {
  let data = await articleCtl.getArticlesByTopic(req, res.locale);

  //res.json(map);
  res.json(new Response(data, res));
}

async function getTrending(req, res) {
  let data = await articleCtl.getTrending(req, res.locale);

  //res.json(map);
  res.json(new Response(data, res));
}




async function getTrendingByTopic(req, res) {
  let data = await articleCtl.getTrendingByTopic(req, res.locale);

  //res.json(map);
  res.json(new Response(data, res));
}

