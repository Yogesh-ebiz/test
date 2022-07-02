const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

let statusEnum = require('../const/statusEnum');
const webhookService = require('../services/webhook.service');

module.exports = {
  webscraperio
}



async function webscraperio(data) {


  let result;
  try {
    result = await webhookService.webscraperio(data);
  } catch (error) {
    console.log(error);
  }

  return result;
}


