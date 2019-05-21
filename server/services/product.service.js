const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Product = require('../models/product.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  type: Joi.string().allow(''),
  category: Joi.string().allow(''),
  listPrice: Joi.number()
});


async function getProducts() {
  let data = null;


  let products = Product.find();
  return products
}

function findById(productId) {
  let data = null;

  if(productId==null){
    return;
  }

  let product = Product.findById(productId);
  return product
}

async function addProduct(currentUserId, form) {
  if(!currentUserId || !form){
    return;
  }


  let result;
  form = await Joi.validate(form, productSchema, {abortEarly: false});
  form.createdBy = currentUserId
  result = new Product(form).save();

  return result;

}

async function updateProduct(productId, form) {
  if(!productId || !form){
    return;
  }

  form = await Joi.validate(form, productSchema, {abortEarly: false});

  let product = await findById(productId);

  if(product){
    product.lastUpdatedDate = Date.now();
    product.name = form.name;
    product.description = form.description;
    product.listPrice = form.listPrice;
    result = await product.save();
  }
  return result;

}


module.exports = {
  getProducts:getProducts,
  addProduct:addProduct,
  findById:findById,
  updateProduct:updateProduct
}
