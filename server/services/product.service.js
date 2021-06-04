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
  listPrice: Joi.number(),
  isRecommended: Joi.boolean()
});


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
  getAvailableProducts:getAvailableProducts,
  addProduct:addProduct,
  findById:findById,
  updateProduct:updateProduct
}
