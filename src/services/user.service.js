const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const User = require('../models/user.model');
const JobPreference = require("../models/jobpreferences.model");
const PartySkill = require("../models/partyskill.model");
const contactType = require("../const/contactType");
const JobRequisition = require("../models/jobrequisition.model");

const userSchema = Joi.object({
  userId: Joi.number().allow(null).optional(),
  firstName: Joi.string().allow('').optional(),
  middleName: Joi.string().allow('').optional(),
  lastName: Joi.string().allow('').optional(),
  emails: Joi.array(),
  phones: Joi.array().allow(null).optional(),
  resumes: Joi.array().optional(),
  preferences: Joi.object().optional(),
  createdBy: Joi.number().allow(null).optional()
});

const form = Joi.object({
  name: Joi.string(),
  lifetimeBudget: Joi.number(),
  startTime: Joi.number(),
  endTime: Joi.number(),
  bidAmount: Joi.number(),
  billingEvent: Joi.string(),
  optimizationGoal: Joi.string().allow('').optional(),
  targeting: Joi.object(),
  productId: Joi.string().allow('').optional()
});

const jobPreferenceSchema = Joi.object({
  jobTitles: Joi.array().optional(),
  jobTypes: Joi.array().optional(),
  jobLocations: Joi.array().required().optional(),
  openToRelocate: Joi.boolean().optional(),
  openToJob: Joi.boolean().optional(),
  openToRemote: Joi.boolean().optional(),
  startDate: Joi.string().allow(''),
});


async function register(form) {

  if(!form){
    return;
  }

  form = await Joi.validate(form, form, {abortEarly: false});
  //
  // let targeting = await targetService.add(ad.targeting);
  // ad.targeting = targeting;
  // ad = await new Ad(ad).save();
  //
  // return user;

}

async function add(form) {

  if(!form){
    return;
  }

  await userSchema.validate(form, {abortEarly: false});
  const user = await new User(form).save();
  return user;

}
async function create(party) {
  if (!party){
    return;
  }

  await userSchema.validate(party, {abortEarly: false});

  const date = new Date();
  let user = new User({ createdDate: date, emails: [], phones: [], applications: [], experiences: [], educations: [], sources: [], skills: [], tags: [] });
  user.userId = party.id;
  user.firstName = party.firstName;
  user.middleName = party.middleName;
  user.lastName = party.lastName;
  user.jobTitle = party.jobTitle;
  user.city = party.city;
  user.state = party.state;
  user.country = party.country;
  user.timezone = party.timezone;

  if(party.primaryAddress){
    user.primaryAddress = party.primaryAddress;
    user.city = party.city;
    user.state = party.state;
    user.country = party.country;
  }

  if(party.primaryPhone && party.primaryPhone?.value){
    user.phoneNumber = party.primaryPhone.value;
    user.phones.push({ isPrimary: true, contactType: contactType.MOBILE, value: party.primaryPhone.value } );
  }

  if(party.primaryEmail && party.primaryEmail?.value){
    user.email = party.primaryEmail.value;
    user.emails.push({ isPrimary: true, contactType: contactType.PERSONAL, value: party.primaryEmail.value });
  }



  console.log('saving', user)
  user = await user.save();
  return user;
};

function findByUserId(userId) {

  if(!userId){
    return;
  }

  return User.findOne({userId});
}

function findbyId(id){
  if(!id){
    return;
  }
  return User.findById(id);
}

function findByEmail(email) {

  if(!email){
    return;
  }

  return User.findOne({'emails.value': email});
}

function findByEmailOrPhone(email='', phoneNumber='') {


  return User.findOne({$or: [{'emails.value': email}, {email: email}, {phoneNumber: phoneNumber}, {'phones.value': phoneNumber}] });
}


function getUserTopSkills(userId, viewerId) {
  if (!userId){
    return;
  }

  const result = User.aggregate([
    { $match: {userId: userId }},
    {
      $lookup: {
        from: "partyskill",
        let: { skills: "$skills" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$skills"] } } },

        ],
        as: 'skills'
      }
    },

    {$unwind: '$skill'},
  ]);

  return result;
}

async function getUserLast5Resumes(userId) {

  if(!userId){
    return;
  }

  let user  = await User.findOne({userId: userId}).populate('resumes').sort({createdDate: -1}).limit(5);
  const resumes = user? _.orderBy(user.resumes, ['createdDate'], ['desc']) : [];
  return resumes;

}

async function updateJobPreferences(userId, jobPreferences) {

  if(!userId || !jobPreferences){
    return;
  }

  jobPreferences = await Joi.validate(jobPreferences, jobPreferenceSchema, {abortEarly: false});
  let user  = await User.findOne({userId: userId});
  user.preferences = jobPreferences;
  user = await user.save();

  return user.preferences;

}


async function getJobPreferences(userId) {
  if(!userId){
    return;
  }

  let user  = await User.findOne({userId: userId});
  return user?.preferences;
}

async function search(query, filter, sort) {
  if(!filter || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;
  const match = {};
  let result;
  let aSort;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };


  const aList = [
    {$lookup:{
        from:"partyskills",
        let:{id:"$skills"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$id"]}}},
          {
            $lookup: {
              from: 'skills',
              localField: 'skill',
              foreignField: '_id',
              as: 'skill',
            },
          },
          { $unwind: {path: '$skill', preserveNullAndEmptyArrays: true} },
        ],
        as: 'skills'
      }},
    { $unwind: {path: '$skills', preserveNullAndEmptyArrays: true} },
    {
      $lookup: {
        from: 'experiences',
        localField: 'experiences',
        foreignField: '_id',
        as: 'experiences',
      },
    },
    { $unwind: {path: '$experiences', preserveNullAndEmptyArrays: true} },
    {
      $lookup: {
        from: 'educations',
        localField: 'educations',
        foreignField: '_id',
        as: 'educations',
      },
    },
    { $unwind: {path: '$educations', preserveNullAndEmptyArrays: true} }
  ];

  if(sort && sort.sortBy=='popular'){

  } else {
    aSort = { $sort: {firstName: direction} };
  }


  aList.push(aSort);

  const aggregate = User.aggregate(aList);
  result = await User.aggregatePaginate(aggregate, options);
  return result;
}


module.exports = {
  add,
  create,
  register,
  findByUserId,
  findbyId,
  findByEmail,
  findByEmailOrPhone,
  getUserTopSkills,
  getUserLast5Resumes,
  updateJobPreferences,
  getJobPreferences,
  search
}
