const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const config = require('../config/config');
const statusEnum = require('../const/statusEnum');

const s3Service = require('../services/aws/s3/s3.service');



async function webscraperio(data) {

  // console.log(data);
  let result = [];
  s3Service.getFile();

  return result;

}

module.exports = {
  webscraperio:webscraperio

}
