const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose')

let statusEnum = require('../const/statusEnum');

const {findByUserId} = require('../services/api/feed.service.api');
const {isPartyActive} = require('../services/party.service');

const policyService = require('../services/policy.service');
const Policy = require('../models/policy.model');


const policySchema = Joi.object({
  category: Joi.string().required(),
  policy: Joi.string().required(),
  description: Joi.object().required(),
  createdBy: Joi.number(),

});


module.exports = {
  addPolicy,
  getAllPolicies,
  updatePolicy,
  deletePolicy,
  getAllPoliciesByCategory
}




async function addPolicy(currentUserId, form) {
  form = await Joi.validate(form, policySchema, { abortEarly: false });
  if(!currentUserId || !form){
    return null;
  }

  let result = null;

  try {
    result = await policyService.addPolicy(form);

  } catch(e){
    console.log('addPolicy: Error', e);
  }


  return result
}

async function getAllPolicies(locale) {

  if(!locale){
    return null;
  }

  let obj = {};
  obj['description.'+locale] = { $exists: true, $ne: null };
  let defaultEn = {};
  defaultEn['description.'+'en'] = { $exists: true, $ne: null };

  console.log(obj, defaultEn)
  let result = await Policy.aggregate([
    {$match: {$or: [obj, defaultEn]}},
    {$project: {id: 1, policy: 1, category: 1, description: { $cond: { if: { $gte: [ "$qty", 250 ] }, then: '', else: '$description.en' }}}}
    ]);

  return result;

}



async function updatePolicy(policyId, currentUserId, form) {
  form = await Joi.validate(form, policySchema, { abortEarly: false });
  if(!currentUserId || !policyId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      console.log( policyId)
      let policy = await Policy.findById(policyId);
      console.log( policy)
      if(policy){
        policy.category = form.category;
        policy.updatedBy = currentUserId;
        policy.description=form.description;
        policy.policy=form.policy;
        result = await policy.save();
      }

    }
  } catch(e){
    console.log('updatePolicy: Error', e);
  }


  return result
}


async function deletePolicy(policyId, currentUserId) {
  if(!currentUserId || !policyId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let policy = await Policy.findById(policyId);
      if(policy){
        result = await policy.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deletePolicy: Error', e);
  }


  return result
}

async function getAllPoliciesByCategory(category, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await policyService.getPoliciesByCategory(category, locale);

  return result;

}

