const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartyCertification = require('../models/partycertification.model');
const Joi = require('joi');




function findPartyCertificationById(partyCertificationId) {
  let data = null;

  if(partyCertificationId==null){
    return;
  }

  return PartyCertification.findOne({partyCertificationId: partyCertificationId});
}

function findPartyCertificationByIdAndUserId(userId, partyCertificationId) {
  let data = null;

  if(userId==null || partyCertificationId==null){
    return;
  }

  return PartyCertification.findOne({partyId: userId, partyCertificationId: partyCertificationId});
}

function findPartyCertificationByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartyCertification.find({partyId: userId}).sort({fromDate: -1});
}


function addPartyCertificationByUserId(userId, certification) {
  let data = null;


  if(certification==null){
    return;
  }

  return new PartyCertification(certification).save();
}


function updatePartyCertificationByUserId(userId, certification) {
  let data = null;


  if(userId==null || certification==null){
    return;
  }

  return PartyCertification.findOneAndUpdate({partyId: userId, partyCertificationId: certification.partyCertificationId},
    {$set: {partyId: certification.partyId, company: certification.company, title: certification.title,
        issuedDate: certification.issuedDate, expirationDate: certification.expirationDate, url: certification.url, description:certification.description,
      city: certification.city, state: certification.state, country: certification.country}},
    {new: true});
}


module.exports = {
  findPartyCertificationById: findPartyCertificationById,
  findPartyCertificationByIdAndUserId:findPartyCertificationByIdAndUserId,
  findPartyCertificationByUserId: findPartyCertificationByUserId,
  addPartyCertificationByUserId: addPartyCertificationByUserId,
  updatePartyCertificationByUserId: updatePartyCertificationByUserId
}
