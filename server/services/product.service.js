const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const productType = require('../const/productType');

const Product = require('../models/product.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const paymentService = require('../services/api/payment.service.api');


const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  type: Joi.string().allow(''),
  category: Joi.string().allow(''),
  currency: Joi.string(),
  price: Joi.object(),
  isRecommended: Joi.boolean(),
  recurring: Joi.object().optional()
});


async function add(currentUserId, form) {
  if(!currentUserId || !form){
    return;
  }


  let result;
  form = await Joi.validate(form, productSchema, {abortEarly: false});
  form.createdBy = currentUserId

  let product = await paymentService.addProduct(currentUserId, form);
  if(product){
    form.productId = product.id;
    result = new Product(form).save();
  }



  return result;

}

async function update(id, form) {
  if(!id || !form){
    return;
  }

  form = await Joi.validate(form, productSchema, {abortEarly: false});

  let product = await findById(id);

  if(product){
    product.lastUpdatedDate = Date.now();
    product.name = form.name;
    product.description = form.description;
    product.price.listPrice = form.price.listPrice;

    result = await product.save();
  }
  return result;

}


async function getProducts(filter, sort) {
  let data = null;

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };


  let products = Product.paginate({}, options);
  return products
}


async function getAvailableProducts() {
  let data = null;

  let products = await Product.find();
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


module.exports = {
  add:add,
  update:update,
  getProducts:getProducts,
  getAvailableProducts:getAvailableProducts,
  findById:findById

}
