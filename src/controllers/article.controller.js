const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const articleService = require('../services/article.service');
const feedService = require('../services/api/feed.service.api');
const catchAsync = require("../utils/catchAsync");
const Pagination = require("../utils/pagination");



const createArticle = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  let currentUserId = parseInt(req.header('UserId'));

  let article = null;
  try {
    body.partyId = currentUserId;
   article = await articleService.add(body);


  } catch (error) {
    console.log(error);
  }

  res.json(article);
});


const getArticles = catchAsync(async (req, res) => {
  const { query, locale } = req;
  const { page, size } = query;

  let result;
  try {
    result = await articleService.search(query);
  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});

const getArticle = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const { id } = params;

  let article = null;
  try {
    article = await articleService.findById(ObjectID(id));
    article.noOfViews = article.noOfViews + 1;
    await article.save();

  } catch (error) {
    console.log(error);
  }

  res.json(article);
});

const updateArticleFeatured = catchAsync(async (req, res) => {
  const { params, body } = req;
  const { id } = params;

  let article = null;
  try {
    article = await articleService.findById(ObjectID(id));
    article.featured = body.featured? true:false;
    article = await article.save();
  } catch (error) {
    console.log(error);
  }

  res.json(article);
});


const getLanding = catchAsync(async (req, res) => {
  const { query, locale } = req;

  let result = [];
  try {
    result = await articleService.getLanding();
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const getTrending = catchAsync(async (req, res) => {
  const { query, locale } = req;
  const { page, size } = query;

  let result;
  try {
    result = await articleService.getTrending(query);
  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});


const getLatest = catchAsync(async (req, res) => {
  const { query, locale } = req;
  const { page, size } = query;

  let result = [];
  try {
    result = await articleService.getLatest(page, size);
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});




module.exports = {
  createArticle,
  getArticles,
  getArticle,
  updateArticleFeatured,
  getLanding,
  getTrending,
  getLatest,
}
