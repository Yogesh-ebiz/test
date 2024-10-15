const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const UserLanguage = require('../models/userlanguage.model');
const Joi = require('joi');



const languageSchema = Joi.object({
  language: Joi.string(),
  level: Joi.string(),
  usrId: Joi.string(),
});


function findPartyLanguageById(userId, partyLanguageId) {
  let data = null;

  if(userId==null || partyLanguageId==null){
    return;
  }

  return UserLanguage.findOne({userId: userId, partyLanguageId: partyLanguageId});
}

function findByUserId(userId) {

  if(userId==null){
    return;
  }

  return UserLanguage.find({userId: userId}).sort({fromDate: -1});
}


async function add(language) {
  let data = null;


  if(!language){
    return;
  }

  await languageSchema.validate(language, {abortEarly: false});
  return new UserLanguage(language).save();
}


function updateLanguageByUserId(userId, language) {
  let data = null;


  if(userId==null || language==null){
    return;
  }

  return UserLanguage.findOneAndUpdate({partyId: userId, employmentId: employment.employmentId},
    {$set: {partyId: language.partyId, company: language.company, employmentTitle: language.employmentTitle, description: language.description,
        fromDate: language.fromDate, thruDate: language.thruDate, isCurrent: language.isCurrent}},
    {upsert: true, new: true});
}


function removeByUserIdAndLanguage(userId, language) {
  if(!userId || !language){
    return;
  }

  return UserLanguage.deleteMany({userId, language});
}

module.exports = {
  findPartyLanguageById,
  findByUserId,
  add,
  removeByUserIdAndLanguage
}
