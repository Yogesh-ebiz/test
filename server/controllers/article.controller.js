const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const axiosInstance = require('../services/api.service');
const topic = require('../const/topic');

const country = require('../const/country');


//const pagination = require('../const/pagination');
const Topic = require('../models/topic.model');
const Article = require('../models/article.model');
const Source = require('../models/source.model');



let Pagination = require('../utils/pagination');
let SearchParam = require('../const/searchParam');

const articleSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.any(),
  minMonthExperience: Joi.number(),
  maxMonthExperience: Joi.number(),
  lastCurrencyUom: Joi.string()
});



module.exports = {
  insert,
  getArticleById,
  getTrending,
  getTrendingByTopic,
  getArticlesByTopic
}

async function insert(article) {
  article = await Joi.validate(article, articleSchema, { abortEarly: false });
  if(article) {

  }
  return await new Article(article).save();
}


async function getArticleById(id, locale) {

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

async function getArticlesByTopic(req, locale) {

  let topic=(typeof req.params.topic !== 'undefined') ? req.params.topic : topic.WORLD;

  let articles;
  try {
    let localeStr = locale? locale : 'en';
    var sources = await Source.aggregate([
      { $match: { category: topic, language: locale } }
    ]);

    sources = _.reduce(sources, function(res, item, value){
      res+=item.source+',';
      return res;
    }, '')

    articles = await axiosInstance.get('/top-headlines' + '?sources=' + sources + '&pageSize=20');


  } catch (error) {
    console.log(error);
  }

  return articles.data;
}

async function getTrending(req, locale) {

  let availableTopics=await Topic.find({ status: true });


  let topics = _.reduce(availableTopics, function(res, item, value){

    res.push({name: item.name.en.toLowerCase(), articles: []});
    return res;
  }, [])


  _.forEach(topics, function(v, k){
    console.log(v.name);


  })

  try {
    let localeStr = locale? locale : 'en';

    let topic = await Source.aggregate([
      { $match: { category: topics[0].name, language: locale } }
    ]);

    let topic1 = await Source.aggregate([
      { $match: { category: topics[1].name, language: locale } }
    ]);

    let topic2 = await Source.aggregate([
      { $match: { category: topics[2].name, language: locale } }
    ]);

    let topic3 = await Source.aggregate([
      { $match: { category: topics[3].name, language: locale } }
    ]);


    let sources = _.reduce(topic, function(res, item, value){
      res+=item.source+',';
      return res;
    }, '')

    let sources1 = _.reduce(topic1, function(res, item, value){
      res+=item.source+',';
      return res;
    }, '')

    let sources2 = _.reduce(topic2, function(res, item, value){
      res+=item.source+',';
      return res;
    }, '')

    let sources3 = _.reduce(topic3, function(res, item, value){
      res+=item.source+',';
      return res;
    }, '')




    let data = await axiosInstance.get('/top-headlines' + '?sources=' + sources + '&page=1&pageSize=3');
    topics[0].articles = data.data;

    let data1 = await axiosInstance.get('/top-headlines' + '?sources=' + sources1 + '&page=1&pageSize=3');
    topics[1].articles = data1.data;

    let data2 = await axiosInstance.get('/top-headlines' + '?sources=' + sources2 + '&page=1&pageSize=3');
    topics[2].articles = data2.data;

    let data3 = await axiosInstance.get('/top-headlines' + '?sources=' + sources3 + '&page=1&pageSize=3');
    topics[3].articles = data3.data;





  } catch (error) {
    console.log(error);
  }

  return topics;

  /*
    let topic = _.reduce(topics, function(res, item, value){
      res.push(item.name.en.toLowerCase());
      return res;
    }, [])

    let articles;

    try {
      let localeStr = locale? locale : 'en';
      var sources = await Source.aggregate([
        { $match: { category: {$in: topic}, language: locale } }
      ]);
      console.log('sources', sources)

      sources = _.reduce(sources, function(res, item, value){
        res+=item.source+',';
        return res;
      }, '')

      articles = await axiosInstance.get('/top-headlines' + '?sources=' + sources + '&page=1&pageSize=100');


    } catch (error) {
      console.log(error);
    }

    return articles.data;
    */
}


async function getTrendingByTopic(req, locale) {

  let topic=(typeof req.params.topic !== 'undefined') ? req.params.topic : topic.WORLD;

  let articles;
  try {
    let localeStr = locale? locale : 'en';
    var sources = await Source.aggregate([
      { $match: { category: topic, language: locale } }
    ]);

    sources = _.reduce(sources, function(res, item, value){
      res+=item.source+',';
      return res;
    }, '')

    articles = await axiosInstance.get('/top-headlines' + '?sources=' + sources + '&page=1&pageSize=3');


  } catch (error) {
    console.log(error);
  }

  return articles.data;
}
