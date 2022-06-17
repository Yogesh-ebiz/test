const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const config = require('../config/config');

const statusEnum = require('../const/statusEnum');
const {buildCandidateUrl} = require('../utils/helper');
const Benefit = require('../models/benefit.model');
const Company = require('../models/company.model');



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
  let result;
  const company = await Company.findOne({companyId: companyId}).populate('benefits');
  if(company.benefits && !company.benefits.length){
    let list = [];
    let defaultBenefits = await Benefit.find({isDefault: true});
    for(b of defaultBenefits ){
      let benefit = await new Benefit({type: b.type, shortCode: b.shortCode, isDefault: false, companyId: companyId, available: benefits[b.shortCode]}).save();
      list.push(benefit._id);
    }
    company.benefits = list;
    company = await company.save();
  } else {
    for(b of company.benefits ){
      b.available = benefits[b.shortCode];
      b = await b.save();
    }
  }

  return company.benefits;
}



async function findByCompanyId(companyId) {
  if(!companyId){
    return;
  }

  let benefits = await Benefit.find({companyId: companyId});

  return benefits;
}

module.exports = {
  update:update,
  findByCompanyId:findByCompanyId

}
