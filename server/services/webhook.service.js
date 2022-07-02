const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const config = require('../config/config');

const statusEnum = require('../const/statusEnum');


async function webscraperio(data) {

  console.log(data);
  let result = [];


  return result;

}

module.exports = {
  webscraperio:webscraperio

}
