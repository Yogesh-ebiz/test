const _ = require('lodash');
const {ObjectId} = require('mongodb');
const Joi = require('joi');
const config = require('../config/config');

const statusEnum = require('../const/statusEnum');
const {buildCandidateUrl} = require('../utils/helper');
const Benefit = require('../models/benefit.model');
const Company = require('../models/company.model');

const { getFromCache, saveToCache, deleteFromCache } = require('./cacheService');


const activitySchema = Joi.object({
  causer: Joi.any().optional(),
  causerType: Joi.string(),
  causerId: Joi.string(),
  action: Joi.string().required(),
  subject: Joi.object(),
  subjectType: Joi.string(),
  subjectId: Joi.string(),
  meta: Joi.object().optional(),
});


async function update(companyId, benefits) {

  if(!companyId || !benefits){
    return;
  }
  let result = [];
  let company = await Company.findOne({companyId: companyId}).populate('benefits');
  if(company.benefits && !company.benefits.length){
    let list = [];
    let defaultBenefits = await Benefit.find({isDefault: true});
    for(let b of defaultBenefits ){
      let benefit = await new Benefit({type: b.type, shortCode: b.shortCode, isDefault: false, companyId: companyId, available: benefits.includes(b.shortCode)}).save();
      list.push(benefit._id);
      result.push(benefit);
    }
    company.benefits = list;
    company = await company.save();
  } else {
    for(let b of company.benefits ){
      b.available = benefits.includes(b.shortCode);
      b = await b.save();
      result.push(b)
    }
    await deleteFromCache(`company:${companyId}`);
  }

  return result;
}



async function findByCompanyId(companyId) {
  if(!companyId){
    return;
  }

  let benefits = await Benefit.find({companyId: companyId});

  return benefits;
}

async function getDefaultBenefits() {

  let benefits = await Benefit.find({isDefault: true});

  return benefits;
}


module.exports = {
  update:update,
  findByCompanyId:findByCompanyId,
  getDefaultBenefits:getDefaultBenefits

}
