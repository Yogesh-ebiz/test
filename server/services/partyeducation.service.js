const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartyEducation = require('../models/partyeducation.model');




function findPartyEducationById(userId, partyEducationId) {
  let data = null;

  if(userId==null || partyEducationId==null){
    return;
  }

  return PartyEducation.findOne({partyId: userId, partyEducationId: partyEducationId});
}

function findPartyEducationByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartyEducation.find({partyId: userId}).sort({fromDate: -1});
}


function addPartyEducationsByUserId(userId, education) {
  let data = null;

  if(userId==null || education==null){
    return;
  }

  return new PartyEducation(education).save();
}


function updateEducationByUserId(userId, education) {
  let data = null;


  if(userId==null || education==null){
    return;
  }

  return PartyEducation.findOneAndUpdate({partyId: userId, partyEducationId: education.partyEducationId},
    {$set: {partyId: education.partyId, institute: education.institute, degree: education.degree, major: education.major, gpa: education.gpa,
        fromDate: education.fromDate, thruDate: education.thruDate, isCurrent: education.isCurrent, hasGraduated: education.hasGraduated,
        city: education.city, state: education.state, country: education.country}},
    {upsert: true, new: true});
}


module.exports = {
  findPartyEducationById: findPartyEducationById,
  findPartyEducationByUserId: findPartyEducationByUserId,
  addPartyEducationsByUserId: addPartyEducationsByUserId,
  updateEducationByUserId: updateEducationByUserId
}
