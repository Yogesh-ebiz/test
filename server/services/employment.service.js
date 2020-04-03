const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Employment = require('../models/employment.model');
const Joi = require('joi');




function findEmploymentById(userId, employmentId) {
  let data = null;

  if(userId==null || employmentId==null){
    return;
  }

  return Employment.findOne({partyId: userId, employmentId: employmentId});
}

function findEmploymentByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return Employment.find({partyId: userId}).sort({fromDate: -1});
}


function addEmploymentsByUserId(userId, employment) {
  let data = null;


  if(userId==null || employment==null){
    return;
  }

  return new Employment(employment).save();
}


function updateEmploymentByUserId(userId, employment) {
  let data = null;


  if(userId==null || employment==null){
    return;
  }

  return Employment.findOneAndUpdate({partyId: userId, employmentId: employment.employmentId},
    {$set: {partyId: employment.partyId, company: employment.company, employmentTitle: employment.employmentTitle, description: employment.description,
        fromDate: employment.fromDate, thruDate: employment.thruDate, isCurrent: employment.isCurrent, terminatinReason: employment.terminationReason,
        city: employment.city, state: employment.state, country: employment.country}},
    {upsert: true, new: true});
}


module.exports = {
  findEmploymentById: findEmploymentById,
  findEmploymentByUserId: findEmploymentByUserId,
  addEmploymentsByUserId: addEmploymentsByUserId,
  updateEmploymentByUserId: updateEmploymentByUserId
}
