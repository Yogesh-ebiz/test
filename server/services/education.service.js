const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Education = require('../models/education.model');




function findEducationById(userId, educationId) {
  let data = null;

  if(userId==null || educationId==null){
    return;
  }

  return Education.findOne({partyId: userId, educationId: educationId});
}

function findEducationByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return Education.find({partyId: userId}).sort({fromDate: -1});
}


function addEducationsByUserId(userId, education) {
  let data = null;

  if(userId==null || education==null){
    return;
  }

  return new Education(education).save();
}


function updateEducationByUserId(userId, education) {
  let data = null;


  if(userId==null || education==null){
    return;
  }

  return Education.findOneAndUpdate({partyId: userId, educationId: education.educationId},
    {$set: {partyId: education.partyId, institute: education.institute, degree: education.degree, major: education.major, grade: education.grade,
        fromDate: education.fromDate, thruDate: education.thruDate, isCurrent: education.isCurrent, hasGraduated: education.hasGraduated,
        city: education.city, state: education.state, country: education.country}},
    {upsert: true, new: true});
}


module.exports = {
  findEducationById: findEducationById,
  findEducationByUserId: findEducationByUserId,
  addEducationsByUserId: addEducationsByUserId,
  updateEducationByUserId: updateEducationByUserId
}
