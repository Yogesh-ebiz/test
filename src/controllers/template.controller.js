const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let statusEnum = require('../const/statusEnum');
const catchAsync = require("../utils/catchAsync");
const resumeTemplateService = require("../services/resumetemplate.service");




const getResumeTemplates = catchAsync(async (req, res) => {
  const { locale } = req;
  let currentUserId = parseInt(req.header('UserId'));

  let result;
  try {
    result = await resumeTemplateService.find({});
  } catch (error) {
    console.log(error);
  }

  res.json(result);

})

module.exports = {
  getResumeTemplates
}
