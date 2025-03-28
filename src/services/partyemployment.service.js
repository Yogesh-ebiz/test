const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartyEmployment = require('../models/partyemployment.model');
const Joi = require('joi');




function findPartyEmploymentById(userId, partyEmploymentId) {
  let data = null;

  if(userId==null || partyEmploymentId==null){
    return;
  }

  return PartyEmployment.findOne({partyId: userId, partyEmploymentId: partyEmploymentId});
}

function findListOfPartyEmploymentTitle(list) {
  let data = null;

  if(list==null){
    return;
  }

  return PartyEmployment.aggregate([
    {$match: {partyId: {$in: list}}},
    {$group: {_id: '$partyId', lastDate: {$last: '$fromDate'}, partyTitle: {'$last': '$employmentTitle'}}},
    {$project: {_id: 0, id: '$_id', partyTitle: '$partyTitle'}}
    ]);
}

function findPartyEmploymentByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartyEmployment.find({partyId: userId}).sort({fromDate: -1}).limit(5);
}


function addPartyEmploymentByUserId(userId, employment) {
  let data = null;


  if(userId==null || employment==null){
    return;
  }

  return new PartyEmployment(employment).save();
}


function updateEmploymentByUserId(userId, employment) {
  let data = null;


  if(userId==null || employment==null){
    return;
  }

  return PartyEmployment.findOneAndUpdate({partyId: userId, partyEmploymentId: employment.partyEmploymentId},
    {$set: {partyId: employment.partyId, company: employment.company, employmentTitle: employment.employmentTitle, employmentType: employment.employmentType, jobFunction: employment.jobFunction, description: employment.description,
        fromDate: employment.fromDate, thruDate: employment.thruDate, isCurrent: employment.isCurrent, terminatinReason: employment.terminationReason,
        city: employment.city, state: employment.state, country: employment.country}},
    {upsert: true, new: true});
}


module.exports = {
  findPartyEmploymentById: findPartyEmploymentById,
  findPartyEmploymentByUserId: findPartyEmploymentByUserId,
  addPartyEmploymentByUserId: addPartyEmploymentByUserId,
  updateEmploymentByUserId: updateEmploymentByUserId,
  findListOfPartyEmploymentTitle:findListOfPartyEmploymentTitle
}
