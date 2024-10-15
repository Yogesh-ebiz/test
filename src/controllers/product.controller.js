const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let Pagination = require('../utils/pagination');

let statusEnum = require('../const/statusEnum');
const productService = require('../services/product.service');

module.exports = {
  getProducts
}




async function getProducts(currentUserId, locale) {

  if(!currentUserId){
    return null;
  }

  let result;
  try {
    result = await productService.getAvailableProducts();
  } catch (error) {
    console.log(error);
  }

  return result;
}

