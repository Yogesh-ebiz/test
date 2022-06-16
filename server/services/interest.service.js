const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const config = require('../config/config');

const statusEnum = require('../const/statusEnum');
const {buildCandidateUrl} = require('../utils/helper');
const Interest = require('../models/interest.model');
const User = require("../models/user.model");

const interestSchema = Joi.object({
  user: Joi.number(),
  company: Joi.number()
});


async function addInterest(interest) {

  if(!interest){
    return;
  }

  interest = await Joi.validate(interest, interestSchema, {abortEarly: false});
  // interest = await new Interest(interest).save();
  interest = await Interest.findOneAndUpdate(interest,
    {user: interest.user, company: interest.company, createdDate: Date.now()},
    {new: true,   upsert: true })
  return interest;

}



module.exports = {
  addInterest:addInterest

}
