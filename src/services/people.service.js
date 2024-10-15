const _ = require('lodash');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const People = require('../models/people.model');
const People2 = require('../models/people2.model');
const JobPreference = require("../models/jobpreferences.model");
const SearchPeopleParam = require("../const/searchPeopleParam");

const peopleSchema = Joi.object({
  ref_id: Joi.string().optional(),
  full_name: Joi.string().allow(null).allow('').optional(),
  first_name: Joi.string().allow(null).allow('').optional(),
  middle_initial: Joi.string().allow(null).allow('').optional(),
  middle_name: Joi.string().allow(null).allow('').optional(),
  last_initial: Joi.string().allow(null).allow('').optional(),
  last_name: Joi.string().allow(null).allow('').optional(),
  gender: Joi.string().allow(null).allow('').optional(),
  birth_date: Joi.string().allow(null).allow('').optional(),
  birth_year: Joi.number().allow(null),
  mobile_phone: Joi.string().allow(null).allow(''),
  phone_numbers: Joi.array().allow(null),
  emails: Joi.array().optional(),
  personal_emails: Joi.array().optional(),
  work_email: Joi.string().allow(null).allow('').optional(),
  location_name: Joi.string().allow(null).allow('').optional(),
  location_locality: Joi.string().allow(null).allow('').optional(),
  location_region: Joi.string().allow(null).allow('').optional(),
  location_metro: Joi.string().allow(null).allow('').optional(),
  location_country: Joi.string().allow(null).allow('').optional(),
  location_continent: Joi.string().allow(null).allow('').optional(),
  location_street_address: Joi.string().allow(null).allow('').optional(),
  location_address_line_2: Joi.string().allow(null).allow('').optional(),
  location_postal_code: Joi.string().allow(null).allow('').optional(),
  location_geo: Joi.string().allow(null).allow('').optional(),
  location_names: Joi.array().optional(),
  regions: Joi.array().optional(),
  linkedin_url: Joi.string().allow(null).allow('').optional(),
  linkedin_username: Joi.string().allow(null).allow('').optional(),
  linkedin_id: Joi.string().allow(null).allow('').optional(),
  facebook_url: Joi.string().allow(null).allow('').optional(),
  facebook_username: Joi.string().allow(null).allow('').optional(),
  facebook_id: Joi.string().allow(null).allow('').optional(),
  twitter_url: Joi.string().allow(null).allow('').optional(),
  twitter_username: Joi.string().allow(null).allow('').optional(),
  github_url: Joi.string().allow(null).allow('').optional(),
  github_username: Joi.string().allow(null).allow('').optional(),
  profiles: Joi.array().optional(),
  job_title: Joi.string().allow(null).allow('').optional(),
  job_title_role: Joi.string().allow(null).allow('').optional(),
  job_title_sub_role: Joi.string().allow(null).allow('').optional(),
  job_title_levels: Joi.array().optional(),
  job_start_date: Joi.string().allow(null).allow('').optional(),
  job_company_id: Joi.string().allow(null).allow('').optional(),
  job_company_name: Joi.string().allow(null).allow('').optional(),
  job_company_website: Joi.string().allow(null).allow('').optional(),
  job_company_size: Joi.string().allow(null).allow('').optional(),
  job_company_founded: Joi.string().allow(null).allow('').optional(),
  job_company_industry: Joi.string().allow(null).allow('').optional(),
  job_company_linkedin_url: Joi.string().allow(null).allow('').optional(),
  job_company_linkedin_id: Joi.string().allow(null).allow('').optional(),
  job_company_location_name: Joi.string().allow(null).allow('').optional(),
  job_company_location_locality: Joi.string().allow(null).allow('').optional(),
  job_company_location_region: Joi.string().allow(null).allow('').optional(),
  job_company_location_metro: Joi.string().allow(null).allow('').optional(),
  job_company_location_country: Joi.string().allow(null).allow('').optional(),
  job_company_location_continent: Joi.string().allow(null).allow('').optional(),
  job_company_location_street_address: Joi.string().allow(null).allow('').allow(null).allow('').optional(),
  job_company_location_address_line_2: Joi.string().allow(null).allow('').optional(),
  job_company_location_postal_code: Joi.string().allow(null).allow('').optional(),
  job_company_location_geo: Joi.string().allow(null).allow('').optional(),
  industry: Joi.string().allow(null).allow('').optional(),
  interests: Joi.array().optional(),
  skills: Joi.array().optional(),
  experience: Joi.array().optional(),
  education: Joi.array().optional(),
  phones: Joi.array().optional(),
  user_id: Joi.number().allow(null).optional(),
  preferences: Joi.object().optional()
});

async function add(form) {
  if(!form){
    return;
  }

  await peopleSchema.validate(form, {abortEarly: false});
  const people = await new People(form).save();
  return people;
}
async function bulkAdd(list) {
  if(!list && list.length){
    return;
  }

  let result = [];
  list = _.reduce(list, function(res, p){
    var _id = mongoose.Types.ObjectId();
    p.ref_id = p.id;
    p._id = _id;
    console.log(_id)
    delete p.id;
    res.push(p);
    return res;
  }, []);
  await People2.insertMany(list).then(function(res){
    result = res;
  }).catch(function(error){
    throw new ApiError(httpStatus.INTERNAL_SERVER, error.message);
  });

  return result;
}
async function findById(id) {

  if(!id){
    return;
  }

  let people  = await People.findById(id);
  return people;
}
async function findByUserId(userId) {

  if(!userId){
    return;
  }

  let people  = await People.findOne({user_id: userId});
  return people;
}

async function findByRefId(refId) {

  if(!refId){
    return;
  }

  let people  = await People.findOne({ref_id: refId});
  return people;
}
async function search(filter, sort) {

  if(!filter || !sort){
    return;
  }

  let people  = await People.findOne({ref_id: refId});
  return people;
}
async function searchForExisting(filter) {

  if(!filter){
    return;
  }

  let people = [];
  let searchParams = new SearchPeopleParam(filter)
  if(!searchParams){
    return people;
  }



  people  = await People.aggregate([
    { $match: searchParams }
  ]);

  return people;
}

async function getPeopleContact(id, type) {

  if(!id || !type){
    return;
  }

  let people  = await findById(id);
  if(people){
    if(type==='emails'){
      return people.fullContact(type);
    } else if(type==='phones') {
      return people.fullContact(type);
    }
  }

  return null;
}

async function updateJobPreferences(userId, jobPreferences) {

  if(!userId || !jobPreferences){
    return;
  }

  let people  = await People.findOne({user_id: userId});
  people.preferences = jobPreferences;
  people = await people.save();

  return people.preferences;
}


async function getJobPreferences(userId) {
  if(!userId){
    return;
  }

  let people  = await User.findOne({userId: userId});
  return people?.preferences;
}


module.exports = {
  add,
  bulkAdd,
  findById,
  findByUserId,
  findByRefId,
  search,
  searchForExisting,
  getPeopleContact,
  updateJobPreferences,
  getJobPreferences
}
