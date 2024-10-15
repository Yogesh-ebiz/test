const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

let statusEnum = require('../const/statusEnum');
const paymentService = require('../services/api/payment.service.api');
const catchAsync = require("../utils/catchAsync");


const getAds = catchAsync(async (req, res) => {

  let result;
  try {
    result = await paymentService.getAdProducts();
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});



module.exports = {
  getAds
}
