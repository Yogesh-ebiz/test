const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartyCertification = require('../models/partycertification.model');
const Joi = require('joi');




function findPartyCertificationById(userId, partyCertificationId) {
  let data = null;

  if(userId==null || partyCertificationId==null){
    return;
  }

  return PartyCertification.findOne({partyId: userId, partyCertificationId: partyCertificationId});
}

function findCertificationByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartyCertification.find({partyId: userId}).sort({fromDate: -1});
}


function addCertificationByUserId(userId, certification) {
  let data = null;


  if(userId==null || certification==null){
    return;
  }

  return new PartyCertification(certification).save();
}


function updateCertificationByUserId(userId, certification) {
  let data = null;


  if(userId==null || certification==null){
    return;
  }

  return PartyCertification.findOneAndUpdate({partyId: userId, employmentId: employment.employmentId},
    {$set: {partyId: certification.partyId, company: certification.company, employmentTitle: certification.employmentTitle, description: certification.description,
        fromDate: certification.fromDate, thruDate: certification.thruDate, isCurrent: certification.isCurrent}},
    {upsert: true, new: true});
}


module.exports = {
  findPartyCertificationById: findPartyCertificationById,
  findCertificationByUserId: findCertificationByUserId,
  addCertificationByUserId: addCertificationByUserId,
  updateCertificationByUserId: updateCertificationByUserId
}
