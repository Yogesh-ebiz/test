const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const axiosInstance = require('../services/api.service');
const topic = require('../const/topic');
const country = require('../const/country');


//const pagination = require('../const/pagination');
const Source = require('../models/source.model');



let Pagination = require('../utils/pagination');
let SearchParam = require('../const/searchParam');

const sourceSchema = Joi.object({
  source: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  url: Joi.string().required(),
  category: Joi.number().required(),
  language: Joi.number().required(),
  country: Joi.string().required(),
  active: Joi.boolean()
});



module.exports = {
  sync,
  insert,
  getArticlesBySource,
  getTrendingBySource
}

async function sync() {

  let sources;
  try {
    results = await axiosInstance.get('/sources');

    sources = _.reduce(results.data.sources, function(res, item, value){

      let source = {};
      source.source = item.id;
      source.name=item.name;
      source.description=item.description;
      source.url=item.url;
      source.category=item.category;
      source.language=item.language;
      source.country=item.country;
      source.active=true;

      res.push(source);
      return res;
    }, []);
    console.log(sources);
    sources = await Source.insertMany(sources);

  } catch (error) {
    console.log(error);
  }

  return sources;
}


async function insert(article) {
  article = await Joi.validate(article, articleSchema, { abortEarly: false });
  if(article) {

  }
  return await new Article(article).save();
}


async function getArticlesBySource(id, locale) {

  id=(typeof id !== 'undefined') ? id : null;

  let article;
  try {
    let localeStr = locale? locale : 'en';
    article = await Article.findOne({id: id});

  } catch (error) {
    console.log(error);
  }

  return article;
}

async function getTrendingBySource(name, locale) {

  name=(typeof name !== 'undefined') ? name : topic.WORLD;

  let articles;
  try {
    let localeStr = locale? locale : 'en';
    articles = await axiosInstance.get('/topics/' + name + '?lang=' + locale);


  } catch (error) {
    console.log(error);
  }

  return articles.data;
}
