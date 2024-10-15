const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const Article = require('../models/article.model');
const feedService = require("../services/api/feed.service.api");



const articleSchema = Joi.object({
  author: Joi.string().optional().allow(''),
  siteName: Joi.string().optional().allow(''),
  title: Joi.string(),
  description: Joi.string().optional().allow(''),
  content: Joi.string().optional().allow(''),
  category: Joi.string().optional().allow(''),
  url: Joi.string().optional().allow(''),
  image: Joi.string().optional().allow(''),
  partyId: Joi.number().optional().allow(null)
});

async function add(form) {
  console.log(form)
  if (!form) {
    return;
  }
  await articleSchema.validate(form, { abortEarly: false });
  const article = await feedService.createArticle(form.partyId, form);
  form.articleId = article?.id;
  return await new Article(form).save();
};

function findById(id) {
  if(!id){
    return;
  }

  return Article.findById(id);
}

async function getLanding() {
  const result = {featured: [], latest: [], trendings: []};
  result.featured = await Article
    .find({featured: true})
    .sort({createdDate: -1})
    .limit(1)

  result.latest = await Article
    .find({})
    .sort({createdDate: -1})
    .skip(0 * 3)
    .limit(3)
  return result;
}
async function getTrending(sort) {
  let select = '';
  let limit = (sort.size && sort.size > 0) ? sort.size : 20;
  let page = (sort.page && sort.page == 0) ? sort.page : 1;
  let sortBy = {};
  sort.sortBy = 'noOfViews';
  sort.direction = 'DESC';
  sortBy[sort.sortBy] = -1;

  let options = {
    select: select,
    sort: sortBy,
    lean: true,
    limit: limit,
    page: parseInt(sort.page) + 1
  };

  const aggregate = Article.aggregate([]);

  const result = await Article.aggregatePaginate(aggregate, options);


  return result;
}
function getLatest(page, size) {
  const articles = Article
    .find({})
    .sort({createdDate: -1})
    .skip((page) * size)
    .limit(size)

  return articles;
}

module.exports = {
  add,
  findById,
  getLanding,
  getTrending,
  getLatest,
};
