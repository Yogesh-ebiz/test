const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartyLanguage = require('../models/partylanguage.model');
const Joi = require('joi');




function findPartyLanguageById(userId, partyLanguageId) {
  let data = null;

  if(userId==null || partyLanguageId==null){
    return;
  }

  return PartyLanguage.findOne({partyId: userId, partyLanguageId: partyLanguageId});
}

function findPartyLanguageByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartyLanguage.find({partyId: userId}).sort({fromDate: -1});
}


function addLanguagesByUserId(userId, languages) {
  let data = null;


  if(userId==null || languages==null){
    return;
  }

  return new PartyLanguage(languages).save();
}


function updateLanguageByUserId(userId, language) {
  let data = null;


  if(userId==null || language==null){
    return;
  }

  return PartyLanguage.findOneAndUpdate({partyId: userId, employmentId: employment.employmentId},
    {$set: {partyId: language.partyId, company: language.company, employmentTitle: language.employmentTitle, description: language.description,
        fromDate: language.fromDate, thruDate: language.thruDate, isCurrent: language.isCurrent}},
    {upsert: true, new: true});
}


module.exports = {
  findPartyLanguageById: findPartyLanguageById,
  findPartyLanguageByUserId: findPartyLanguageByUserId,
  addLanguagesByUserId: addLanguagesByUserId,
  updateLanguageByUserId: updateLanguageByUserId
}
