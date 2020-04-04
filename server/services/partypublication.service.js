const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartyPublication = require('../models/partypublication.model');
const Joi = require('joi');




function findPartyPublicationById(userId, partyPublicationId) {
  let data = null;

  if(userId==null || partyPublicationId==null){
    return;
  }

  return PartyPublication.findOne({partyId: userId, partyPublicationId: partyPublicationId});
}

function findPublicationByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartyPublication.find({partyId: userId}).sort({fromDate: -1});
}


function addPublicationByUserId(userId, publication) {
  let data = null;


  if(userId==null || publication==null){
    return;
  }

  return new PartyPublication(publication).save();
}


function updatePublicationByUserId(userId, publication) {
  let data = null;


  if(userId==null || publication==null){
    return;
  }

  return PartyPublication.findOneAndUpdate({partyId: userId, employmentId: employment.employmentId},
    {$set: {partyId: publication.partyId, company: publication.company, employmentTitle: publication.employmentTitle, description: publication.description,
        fromDate: publication.fromDate, thruDate: publication.thruDate, isCurrent: publication.isCurrent}},
    {upsert: true, new: true});
}


module.exports = {
  findPartyPublicationById: findPartyPublicationById,
  findPublicationByUserId: findPublicationByUserId,
  addPublicationByUserId: addPublicationByUserId,
  updatePublicationByUserId: updatePublicationByUserId
}
