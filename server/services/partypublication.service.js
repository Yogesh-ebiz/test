const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartyPublication = require('../models/partypublication.model');
const Joi = require('joi');


function findPartyPublicationById(partyPublicationId) {
  let data = null;

  if(partyPublicationId==null){
    return;
  }

  return PartyPublication.findOne({partyPublicationId: partyPublicationId});
}

function findPartyPublicationByIdAndUserId(userId, partyPublicationId) {
  let data = null;

  if(userId==null || partyPublicationId==null){
    return;
  }

  return PartyPublication.findOne({partyId: userId, partyPublicationId: partyPublicationId});
}

function findPartyPublicationByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartyPublication.find({partyId: userId}).sort({fromDate: -1});
}


function addPartyPublicationByUserId(userId, publication) {
  let data = null;


  if(publication==null){
    return;
  }

  return new PartyPublication(publication).save();
}


function updatePartyPublicationByUserId(userId, publication) {
  let data = null;


  if(userId==null || publication==null){
    return;
  }

  return PartyPublication.findOneAndUpdate({partyId: userId, partyPublicationId: publication.partyPublicationId},
    {$set: {partyId: publication.partyId, title: publication.title, author: publication.author, date: publication.date,
        publisher: publication.publisher, publishedDate: publication.publishedDate, url: publication.url, description: publication.description, isbn: publication.isbn}},
    {upsert: true, new: true});
}


module.exports = {
  findPartyPublicationById: findPartyPublicationById,
  findPartyPublicationByIdAndUserId:findPartyPublicationByIdAndUserId,
  findPartyPublicationByUserId: findPartyPublicationByUserId,
  addPartyPublicationByUserId: addPartyPublicationByUserId,
  updatePartyPublicationByUserId: updatePartyPublicationByUserId
}
