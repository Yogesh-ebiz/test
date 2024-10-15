const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createArticle = {
  body: Joi.object().keys({
    author: Joi.string().optional().allow(''),
    siteName: Joi.string().optional().allow(''),
    title: Joi.string(),
    description: Joi.string().optional().allow(''),
    content: Joi.string().optional().allow(''),
    category: Joi.string().optional().allow(''),
    url: Joi.string().optional().allow(''),
    image: Joi.string().optional().allow(''),
  }),
};

const getArticles = {
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};


const getArticle = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
};
const updateArticleFeatured = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    featured:Joi.boolean(),
  }),
};


const getLanding = {
};

const getTrending = {
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLatest = {
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createArticle,
  getArticles,
  getArticle,
  updateArticleFeatured,
  getLanding,
  getTrending,
  getLatest,
};
