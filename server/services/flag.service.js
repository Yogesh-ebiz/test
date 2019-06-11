const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Flag = require('../models/flag.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const feedService = require('../services/api/feed.service.api');
const candidateService = require('../services/candidate.service');


const flagSchema = Joi.object({
  createdBy: Joi.number(),
  companyId: Joi.number(),
  userId: Joi.number(),
  type: Joi.string()
});


async function add(flag) {
  if(!flag){
    return;
  }


  let result;
  flag = await Joi.validate(flag, flagSchema, {abortEarly: false});
  result = new Flag(flag).save();
  return result;

}

async function remove(company, userId) {
  if(!company || !userId){
    return;
  }

  let result;
  let candidate = await candidateService.findByUserIdAndCompanyId(userId, company);

  if(candidate){

    await candidate.flag.delete();
    candidate.flag=null;
    await candidate.save();
  }

  return result;
}


module.exports = {
  add:add,
  remove:remove
}
