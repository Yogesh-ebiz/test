const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let Pagination = require('../utils/pagination');

let statusEnum = require('../const/statusEnum');
const productService = require('../services/product.service');

module.exports = {
  getProducts,
  getById,
  addProduct,
  deleteProduct,
  updateProduct
}



async function getProducts(currentUserId, locale) {

  if(!currentUserId){
    return null;
  }

  let result;
  try {
    result = await productService.getProducts();
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getById(currentUserId, productId) {

  if(!currentUserId || productId){
    return null;
  }

  let result;
  try {
    result = await productService.findById(productId);
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addProduct(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let result;
  try {
      result = await productService.addProduct(currentUserId, form);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function deleteProduct(currentUserId, productId) {

  if(!currentUserId || !productId){
    return null;
  }

  let result;
  try {
    let product = await productService.findById(productId);

    if(product) {
      result = await product.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function updateProduct(currentUserId, productId, form) {

  if(!currentUserId || !productId || !form){
    return null;
  }

  let result;
  try {
    result = await productService.updateProduct(productId, form)
  } catch (error) {
    console.log(error);
  }

  return result;
}


