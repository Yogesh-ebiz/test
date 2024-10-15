const _ = require('lodash');
const Joi = require('joi');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');
const md5File = require('md5-file')
const {convertToCandidate, convertToCompany, buildCandidateUrl} = require('../utils/helper');

let CandidateParam = require('../const/candidateParam');
const statusEnum = require('../const/statusEnum');
const contactType = require('../const/contactType');
const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');
const Candidate = require('../models/candidate.model');
const User = require('../models/user.model');
const Experience = require('../models/experience.model');
const Education = require('../models/education.model');
const userService = require('../services/user.service');
const evaluationService = require('../services/evaluation.service');
const applicationService = require('../services/application.service');
const poolService = require('../services/pool.service');
const experienceService = require('../services/experience.service');
const educationService = require('../services/education.service');
const sourceService = require('../services/source.service');
const partySkillService = require('../services/partyskill.service');
const userSkillService = require('../services/userskill.service');
const referenceService = require('../services/reference.service');

const feedService = require('../services/api/feed.service.api');
const sovrenService = require('../services/api/sovren.service.api');
const awsService = require('../services/aws.service');
const messagingService = require('../services/api/messaging.service.api');
const { JobRequisition } = require('../models');



const skillSchema = Joi.object({
  id: Joi.number().required(),
  noOfMonths: Joi.number().optional(),
  rating: Joi.number().optional()
});

const candidateSchema = Joi.object({
  userId: Joi.number().optional(),
  company: Joi.object(),
  about: Joi.string().allow('').optional(),
  avatar: Joi.string().allow('').optional(),
  _avatar: Joi.string().allow('').optional(),
  firstName: Joi.string().allow(''),
  lastName: Joi.string().allow(''),
  middleName: Joi.string().allow('').optional(),
  primaryAddress: Joi.object().optional(),
  skills: Joi.array().optional(),
  jobTitle: Joi.string().allow('').optional(),
  phoneNumber: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  applications: Joi.array().optional(),
  url: Joi.string().allow('').optional(),
  hasApplied: Joi.boolean().optional(),
  gender: Joi.string().allow('').optional(),
  marital: Joi.string().allow('').optional(),
  links: Joi.array().optional(),
  resumes: Joi.array().optional(),
  skills: Joi.array().optional(),
  experiences: Joi.array().optional(),
  educations: Joi.array().optional(),
  languages: Joi.array().optional(),
  emails: Joi.array().optional(),
  phoneNumbers: Joi.array().optional(),
  sources: Joi.array().optional(),
  languages: Joi.array().optional()
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

async function create(user, company) {
  if (!user || !company){
    return;
  }

  await candidateSchema.validate({ ...user, company }, {abortEarly: false});

  const createdDate = new Date();
  let candidate = new Candidate({ createdDate, company: company?._id, companyId: company?.companyId, user: user._id, emails: [], phones: [], evaluations: [], applications: [], experiences: [], educations: [], sources: [], skills: [],  tags: [] });

  candidate.userId = user.userId;
  candidate.firstName = user.firstName;
  candidate.middleName = user.middleName;
  candidate.lastName = user.lastName;
  candidate.jobTitle = user.jobTitle;

  candidate.primaryAddress = user.primaryAddress;
  candidate.city = user.city;
  candidate.state = user.state;
  candidate.country = user.country;

  if(user.phoneNumber){
    candidate.phoneNumber = user.phoneNumber;
    candidate.phones.push({ isPrimary: true, contactType: contactType.MOBILE, value: user.phoneNumber } );
  }

  if(user.email){
    candidate.email = user.email
    candidate.emails.push({ isPrimary: true, contactType: contactType.PERSONAL, value: user.email });
  }


  candidate = await candidate.save();
  if(candidate){
    //Save as user in messaging_service.
    const messagingUser = await messagingService.createUser({firstName: candidate.firstName, lastName: candidate.lastName, email: user.email, userId: user.userId});
    if(messagingUser){
      candidate.messengerId = messagingUser._id;
      await candidate.save();
      let candidateConversation = {
        type: 'GROUP',
        members: [candidate.messengerId.toString()],
        meta: { candidateId: candidate._id },
      }
      let newCanConvRes = await messagingService.createConversation(candidateConversation);
      candidate.conversationId = newCanConvRes?.conversationId?newCanConvRes.conversationId:null;
      await candidate.save();
    }
  }
  return candidate;
}
async function addCandidate(currentUserId, form, isApplied, isImported) {
  if(!form || !form.company || !form.companyId){
    return;
  }


  let firstName = form.firstName ? form.firstName : '';
  let lastName = form.lastName ? form.lastName : '';
  let middleName = form.middleName ? form.middleName : '';
  let gender = form.gender ? form.gender :'';
  let about = form.about ? form.about : '';
  let email = form.email ? form.email : (form.primaryEmail && form.primaryEmail.value) ? form.primaryEmail.value :'';
  let phoneNumber = form.phoneNumber ? form.phoneNumber : (form.primaryPhone && form.primaryPhone.value) ? form.primaryPhone.value : '';
  let countryCode = form.countryCode ? form.countryCode : '';
  let emails = form.emails;
  let phones = form.phones;
  let primaryAddress = form.primaryAddress ? { address1: form.primaryAddress.address1, address2:form.primaryAddress.address2, district:form.primaryAddress.district, city :form.primaryAddress.city, state:form.primaryAddress.state, country: form.primaryAddress.country, postalCode: form.primaryAddress.postalCode} : null
  let links = form.links?form.links:[];
  let languages = form.languages || [];
  let maritalStatus = form.maritalStatus;
  let sources = form.sources;
  let jobTitle = form.jobTitle || '';
  let dob = form.dob;
  let level = form.level;

  let candidate = {firstName, middleName, lastName, email, phoneNumber, countryCode, emails, phones, primaryAddress, links, languages, about, gender, maritalStatus, sources: form.sources, jobTitle,
    company: form.company, companyId: form.companyId, createdBy: form.createdBy, dob, level
  }

  if(form.id){
    candidate.userId = form.id;
  }


  // if(form.avatar){
  //   let avatar = form.avatar.split('/');
  //   avatar = avatar[avatar.length-1];
  //   candidate._avatar = avatar;
  // }



  // if(user.skills){
  //   candidate.skills = user.skills;
  // }

  if(form.languages){
    candidate.languages = form.languages;
  }

  candidate.experiences = [];
  if(form.experiences){

    for(let [i, exp] of form.experiences.entries()){
      let experience = await experienceService.add(exp);
      if(experience){
        candidate.experiences.push(experience._id);
      }
    }
  }

  if(form.educations){
    candidate.educations = [];
    for(let [i, edu] of form.educations.entries()){
      let education = await educationService.add(edu);
      if(education){
        candidate.educations.push(education._id);
      }
    }
  }

  if(form.resumes){
    candidate.resumes = form.resumes;
  }

  await candidateSchema.validate(candidate, {abortEarly: false});
  candidate.hasImported = isImported?true:false;
  candidate.hasApplied = isApplied?true:false;

  const foundUser = await userService.findByUserId(form.id);
  if(!foundUser){
    const newUser = await userService.add({firstName:form.firstName, middleName: form.middleName, lastName: form.lastName, email:form.email, emails: emails, phones: form.phoneNumbers, userId: form.id, resumes: form.resumes, createdBy: currentUserId});
    candidate.user = newUser._id;
  } else {
    candidate.user = foundUser._id;
  }

  candidate = await new Candidate(candidate).save();
  if(candidate){
    //Save as user in messaging_service.
    const messagingUser = await messagingService.createUser({firstName: candidate.firstName, lastName: candidate.lastName, email: candidate.email, userId: form.id});
    if(messagingUser){
      candidate.messengerId = messagingUser._id;
      await candidate.save();
      let candidateConversation = {
        type: 'GROUP',
        members: [candidate.messengerId.toString()],
        meta: { candidateId: candidate._id },
      }
      let newCanConvRes = await messagingService.createConversation(candidateConversation);
      candidate.conversationId = newCanConvRes?.conversationId?newCanConvRes.conversationId:null;
      await candidate.save();
    }
  }

  return candidate;

}


async function addCandidateByResume(companyId, member, file) {
  if(!companyId || !member || !file){
    return null;
  }


  let result = null;
  let basePath = 'candidates/';
  try {


    const hash = md5File.sync(file.path)


    // let candidate = await candidateService.findByUserIdAndCompanyId(candidateId, companyId);
    // if (candidate) {
    //   let type, name;
    //   if(files.file) {
    //     let cv = files.file[0];
    //     let fileName = cv.originalname.split('.');
    //     let fileExt = fileName[fileName.length - 1];
    //     let timestamp = Date.now();
    //     name = candidate.firstName + '_' + candidate.lastName + '_' + candidate._id + '-' + timestamp + '.' + fileExt;
    //     let path = basePath + candidate._id + '/images/' + name;
    //     let response = await awsService.upload(path, cv);
    //     switch (fileExt) {
    //       case 'png':
    //         type = 'PNG';
    //         break;
    //       case 'jpeg':
    //         type = 'JPG';
    //         break;
    //       case 'jpg':
    //         type = 'JPG';
    //         break;
    //
    //     }
    //
    //     candidate.avatar = name;
    //     result = await candidate.save();
    //   }
    // }


  } catch (error) {
    console.log(error);
  }

  return result;

}


async function removeCandidate(id) {
  if(!id){
    return null;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const candidate = await Candidate.findOneAndUpdate({_id: id}, {status: statusEnum.DELETED}, { session });
    console.log(candidate)
    if (!candidate) {
      throw new Error('Candidate not found.');
    }
    await Application.updateMany(
      { user: id },
      { status: statusEnum.DELETED },
      { session }
    );

    await Promise.all([
      poolService.removeCandidate(id),
      sourceService.removeByCandidateId(id),
    ]);

    await session.commitTransaction();

  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    throw new Error(error);
  }finally{
    session.endSession();
  }
}

async function removeCandidates(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Invalid candidate IDs.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const candidates = await Candidate.updateMany({_id: { $in: ids }}, {status: statusEnum.DELETED}, { session });
    if (candidates.nModified === 0) {
      throw new Error('No candidates were found.');
    }
    await Application.updateMany(
      { user: { $in: ids } },
      { status: statusEnum.DELETED },
      { session }
    );
    await Promise.all([
      poolService.removeCandidates(ids),
      sourceService.removeByCandidateIds(ids)
    ]);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    throw new Error(error);
  } finally {
    session.endSession();
  }
}

function findById(id) {

  if(!id){
    return;
  }

  return Candidate.findById(id);
}


function findByIds(ids, fields=[]) {
  let data = null;

  if(ids==null){
    return;
  }

  let projection = {};
  if (fields.length > 0) {
    projection = fields.reduce((proj, field) => {
      proj[field] = 1;
      return proj;
    }, {});
  }

  return Candidate.find({_id: {$in: ids }}, projection);
}

async function findByMessengerIds(ids, fields=[]) {
  let data = null;

  if(ids==null){
    return;
  }

  let projection = {};
  if (fields.length > 0) {
    projection = fields.reduce((proj, field) => {
      proj[field] = 1;
      return proj;
    }, {});
  }

  projection.user = 1;

  const candidates = await Candidate.find({messengerId: {$in: ids }}, projection).populate({
    path: 'user'
  }).exec();

  return Array.isArray(candidates) ? candidates.map(candidate => {
    let candidateObj = candidate.toObject();
    if (candidate.user) {
      candidateObj.userId = candidate.user.userId;
    }
    candidateObj.avatar = buildCandidateUrl(candidateObj);
    return candidateObj;
  }) : [];
}


async function findByUserId(userId) {

  if(!userId){
    return;
  }

  return await Candidate.findOne({userId: userId});
}




async function findByCompany(company, filter) {

  if(!company || !filter){
    return;
  }

  let select = '';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  const aggregate = Candidate.aggregate([{
    $match: {company: company}
  },
    {
      $lookup: {
        from: 'applications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applications',
      },
    },
    {
      $lookup: {
        from: 'candidates',
        localField: 'application.currentProgress',
        foreignField: '_id',
        as: 'currentProgress',
      }
    },
  ]);
  return await Candidate.aggregatePaginate(aggregate, options);
}



function findByUserAndCompany(user, company) {


  if(!user || !company){
    return;
  }

  return Candidate.findOne({user, company});
}
function findByUserIdAndCompanyId(userId, company) {


  if(!userId || !company){
    return;
  }

  return Candidate.findOne({userId, company});
}

function findByEmailAndCompanyId(email, companyId) {


  if(!email || !companyId){
    return;
  }

  return Candidate.findOne({email: email, company: companyId});
}


function getListofCandidates(userIds, companyId) {


  if(!userIds || !companyId){
    return;
  }
  return Candidate.find({userId: {$in: userIds}, company: companyId});
}


function searchCandidates(company, query) {


  if(!company){
    return;
  }

  const words = query.trim().split(/\s+/); // Splitting the query into individual words
  const searchConditions = words.map(word => ({
    $or: [
      { firstName: { $regex: word, $options: 'i' } },
      { lastName: { $regex: word, $options: 'i' } },
      { email: { $regex: word, $options: 'i' } }
    ]
  }));

  let result = Candidate.find({company: company, $and: searchConditions});

  //let result = Candidate.find({company: company, $or: [{firstName: { $regex: query.toLowerCase(), $options: 'i' }}, {lastName: { $regex: query, $options: 'i' }}, {email: { $regex: query, $options: 'i' }}]});

  return result;
}



async function search(filter, sort, subscribedCandidateIds ) {
  if(!filter || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page)+1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  const options = {
    page: page,
    limit: limit,
  };

  const {stages, sources, employers} = filter;

  filter.status = filter.status?filter.status:[statusEnum.ACTIVE];
  let poolCandidateIds = [];

  if (filter.pool && filter.pool.length) {
    const poolIds = filter.pool.map(id => new ObjectId(id));
    const pools = await poolService.findByIds(poolIds);
    const candidateIdsSet = new Set();
    pools.forEach(pool => {
      pool.candidates.forEach(candidateId => {
        candidateIdsSet.add(candidateId.toString());
      });
    });
    poolCandidateIds = Array.from(candidateIdsSet).map(id => new ObjectId(id))
    // If no candidates are found in the selected pools, return an empty result set
    if (poolCandidateIds.length === 0) {
      return {
        docs: [],
        totalDocs: 0,
        limit,
        page,
        totalPages: 0,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null
      };
    }
  }

  let aLookup = [];
  let aMatch = { $match: new CandidateParam(filter)};
  let aSort = { $sort: {createdDate: direction} };
  let aList = [
    { $match: new CandidateParam(filter, subscribedCandidateIds, poolCandidateIds )},
    {$lookup:{
        from:"users",
        let:{user:"$user"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$user"]}}},
        ],
        as: 'user'
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "experiences",
        localField: "experiences",
        foreignField: "_id",
        as: "experiences"
      }
    },
    {
      $lookup: {
        from: "educations",
        localField: "educations",
        foreignField: "_id",
        as: "educations"
      }
    },
    {
      $lookup: {
        from: "applications",
        let: { applications: "$applications" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$applications"] } } },
          { $match: { status: { $ne: statusEnum.DELETED } } },
          {
            $lookup: {
              from: "applicationprogresses",
              let: { currentProgress: "$currentProgress" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$currentProgress"] } } },
              ],
              as: 'currentProgress'
            }
          },
          { $unwind: { path: '$currentProgress', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "jobrequisitions",
              let: { job: "$job" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$job"] } } },
                { $project: { _id: 1, jobTitle: 1, createdBy: 1, members: 1 } }
              ],
              as: 'job'
            }
          },
          { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
        ],
        as: 'applications'
      }
    },
    // { $unwind: { path: '$applications', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "partyskills",
        let: { skills: "$skills" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$skills"] } } },
        ],
        as: "skills"
      }
    },
    {
      $lookup: {
        from: "pools",
        let: { candidateId: "$_id" },
        pipeline: [
          { $match: { $expr: { $in: ["$$candidateId", "$candidates"] } } },
          { $project: { _id: 1, name: 1 } }
        ],
        as: "pools"
      }
    },
  ];

  if (filter.skills && filter.skills.length) {
    const skillIds = filter.skills.map(id => new ObjectId(id));
    aList.push(
      { $match: { 'skills.skill': { $in: skillIds } } }
    );
  }

  if(stages && stages.length){
    aList.push(
      { $match: {'applications.currentProgress.stage': {$in: stages}} }
    );
  }

  if (employers && employers.length) {
    aList.push(
      { $match: { 'experiences.employer.id': { $in: employers } } }
    );
  }

  // Group back by candidate
  // Commenting out.  @Neha why do we have this.  Candidate fields are missing when you're grouping
  // aList.push(
  //   {
  //     $group: {
  //         _id: '$_id',
  //         applications: { $push: '$applications' },
  //         user: { $first: '$user' },
  //         status: { $first: '$status' },
  //         company: { $first: '$company' },
  //         flag: { $first: '$flag' },
  //         createdDate: { $first: '$createdDate' }
  //     }
  //   }
  // );

  /*if(sources.length) {
    aList.push(
      {
        $lookup: {
          from: 'labels',
          localField: 'sources',
          foreignField: '_id',
          as: 'sources',
        },
      }
    );
    aList.push(
      { $match: {'sources._id': {$in: sources}} }
    );
  }*/


  //
  //   if(filter.job) {
  //     aList.push({$match: {'applications.job': ObjectID(filter.job)}})
  //   }
  //
  //   aList.push({$lookup: {from: 'evaluations', localField: 'userId', foreignField: 'partyId', as: 'evaluations' } })
  //   aList.push(
  //   { $addFields:
  //       {
  //         rating: {$round: [{$avg: "$evaluations.rating"}, 1]},
  //         evaluations: []
  //       }
  //   });
  //
  //
  // if(filter.stages.length){
  //   aList.push({ $match: {'applications.currentProgress.stage.type': {$in: filter.stages} } });
  // }
  //
  // if(filter.sources.length){
  //   filter.sources = _.reduce(filter.sources, function (res, source) {
  //     res.push(ObjectID(source));
  //     return res;
  //   }, []);
  //
  //   aList.push(
  //     {$lookup: {from: 'labels', localField: 'sources', foreignField: '_id', as: 'sources' } },
  //     // { $match: {'sources': {$in: filter.sources} } }
  //   );
  // }

  if(sort && sort.sortBy=='rating'){
    aSort = { $sort: { rating: direction} };
    aList.push(aSort);
  } else {
    aList.push(aSort);
  }

  const aggregate = Candidate.aggregate(aList);
  const result = await Candidate.aggregatePaginate(aggregate, options);

  result.docs = _.reduce(result.docs, function(res, c){
    const applications = _.reduce(c.applications, function(res, app){
      const application = new Application(app);
      application.currentProgress = new ApplicationProgress(app.currentProgress);
      application.job = new JobRequisition(app.job);
      res.push(application);
      return res;
    }, []);
    c.applications = applications;
    c.user = new User(c.user);
    c.skills = c.skills.map(skill => skill._id);
    res.push(c);
    return res;
  }, []);
  return result
}



async function getAllCandidatesSkills(company) {

  if(!company){
    return;
  }

  let skills = await Candidate.find({company: company}).select({skills: 1});

  skills = _.reduce(skills, function(res, candidate){
    res = res.concat(candidate.skills);
    return res;findById
  }, []);
  return skills
}



async function getCandidatesSimilar(candidateId) {
  if(!candidateId){
    return;
  }
  let list = [];
  //
  let filter = {
    "jobTitles": ["Sr. Manager"],
    "locations": [{"district": "", "city": "San Jose", "state": "California", "country": "US"}],
    "skills": [],
    "companies": [""],
    "schools": [],
    "industries": [],
    "employmentTypes": []
  }

  const candidate = await Candidate.findById(candidateId);

  if(candidate){
    const { primaryAddress } = candidate;
    list = await Candidate.aggregate([
      { $match: { 'primaryAddress.country': primaryAddress?.country }},
      { $limit: 10 }
    ]);

  }


  // list = sovrenService.matchResume();
  return list;
}



async function getCompanyBlacklisted(companyId, sort) {

  if(!companyId || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;
  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  let aList = [];
  let aMatch = { $match: {companyId, flag: {$exists: true}}};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);

  if (sort.query) {
    const words = sort.query.split(' ').map(word => new RegExp(word, 'i'));
    const searchConditions = words.map(word => ({
      $or: [
        { firstName: { $regex: word } },
        { lastName: { $regex: word } }
      ]
    }));

    aList.push({
      $match: {
        $and: searchConditions
      }
    });
  }

  aList.push(
    {
      $lookup: {
        from: 'flags',
        localField: "flag",
        foreignField: "_id",
        as: "flag"
      }
    },
    { $unwind: '$flag'}
  );


  aList.push(aSort);

  const aggregate = Candidate.aggregate(aList);
  let candidates = await Candidate.aggregatePaginate(aggregate, options);
  return candidates;
}

function calculateMonthsForExperience(experience) {
  if (!experience.fromDate || isNaN(Date.parse(experience.fromDate))) {
    console.error("Invalid fromDate");
    return 0;
  }
  const fromDate = new Date(experience.fromDate);
  const thruDate = experience.isCurrent ? new Date() : new Date(experience.thruDate);

  if (isNaN(fromDate.getTime()) || isNaN(thruDate.getTime())) {
    console.error("Invalid dates: ", { fromDate, thruDate });
    return 0;
  }
  const diffInMilliseconds = thruDate.getTime() - fromDate.getTime();
  // Convert the difference from milliseconds to months
  const months = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24 * 30.44)); // Approximate month length=30.44
  return Math.max(0, months);
}

async function addExperience(id, form) {

  if(!id || !form){
    return;
  }

  let candidate = await Candidate.findById(id);
  let experience = await experienceService.add(form);
  if(experience) {
    let found = _.find(candidate.experiences, {_id: experience._id});
    if(!found){
      candidate.experiences.push(experience._id);
      candidate.noOfMonthExperiences += calculateMonthsForExperience(experience);
    }

  }

  candidate = await candidate.save();
  return experience;
}

async function updateExperience(id, experienceId, form){

  if(!id || !experienceId || !form){
    return;
  }

  let candidate = await Candidate.findById(id).populate('experiences');

  let experience = _.find(candidate.experiences, {_id: experienceId});
  if(experience){
    // Subtract the current experience months from candidate's total
    candidate.noOfMonthExperiences -= calculateMonthsForExperience(experience);

    experience.district = form.district;
    experience.city = form.city;
    experience.state = form.state;
    experience.country = form.country;
    experience.fromDate = form.fromDate;
    experience.thruDate = form.thruDate;
    experience.isCurrent = form.isCurrent;
    experience.employmentTitle = form.employmentTitle;
    experience.employmentType = form.employmentType;
    experience.description = form.description;
    experience.terminationReason = form.terminationReason;
    experience.terminationType = form.terminationType;
    experience.employer = form.employer;
    experience.jobFunction = form.jobFunction;
    experience.jobType = form.jobType;
    experience.website = form.website;
    experience.salary = form.salary;
    experience.tasks = form.tasks;
    experience = await experience.save();

    // Add the new experience months to candidate's total
    candidate.noOfMonthExperiences += calculateMonthsForExperience(experience);
    await candidate.save();
  }
  return experience;
}

async function getExperiences(id) {

  if(!id){
    return;
  }

  let candidate = await Candidate.findById(id).populate('experiences').select('experiences');
  let companies = await feedService.lookupCompaniesIds(_.map(candidate.experiences, 'employer.id'))
  candidate.experiences = _.reduce(candidate.experiences, function(res, exp){
    let employer = _.find(companies, {id: exp.employer.id});
    exp.employer = convertToCompany(employer);
    res.push(exp);
    return res;
  }, []);
  return candidate.experiences;
}
async function removeExperience(id, experienceId) {
  if(!id || !experienceId){
    return;
  }
  let candidate = await Candidate.findById(id).populate('experiences');
  for(let [i ,exp] of candidate.experiences.entries()){
    if(exp._id.equals(experienceId)){
      candidate.noOfMonthExperiences -= calculateMonthsForExperience(exp);
      candidate.experiences.splice(i, 1);
      await Experience.deleteOne({_id: exp});
      await candidate.save();
      break;
    }
  }
}
async function addEducation(id, form) {

  if(!id || !form){
    return;
  }

  let candidate = await Candidate.findById(id);
  let education = await educationService.add(form);
  if(education) {
    candidate.educations.push(education._id);
  }

  candidate = await candidate.save();
  return education;
}

async function updateEducation(id, educationId, form) {
  if(!id || !educationId || !form){
    return;
  }

  let candidate = await Candidate.findById(id).populate('educations');

  let education = _.find(candidate.educations, {_id: educationId});
  if(education){
    education.district = form.district;
    education.city = form.city;
    education.state = form.state;
    education.country = form.country;
    education.institute = form.institute;
    education.degree = form.degree;
    education.fieldOfStudy = new ObjectId(form.fieldOfStudy);
    education.fromDate = form.fromDate;
    education.thruDate = form.thruDate;
    education.isCurrent = form.isCurrent;
    education.hasGraduated = form.hasGraduated;
    education.gpa = form.gpa;
    education = await education.save();
  }

  return education;
}

async function getEducations(id) {

  if(!id){
    return;
  }

  let candidate = await Candidate.findById(id).populate('educations').select('educations');
  let institutes = await feedService.lookupInstituteIds(_.map(candidate.educations, 'institute.id'));
  candidate.educations = _.reduce(candidate.educations, function(res, edu){
    let institute = _.find(institutes, {id: edu.institute.id});
    edu.institute = convertToCompany(institute);
    res.push(edu);
    return res;
  }, []);
  return candidate.educations;
}


async function removeEducation(id, educationId) {
  if(!id || !educationId){
    return;
  }
  let candidate = await Candidate.findById(id);
  for(let [i ,edu] of candidate.educations.entries()){
    if(edu.equals(educationId)){
      candidate.educations.splice(i, 1);
      await Education.deleteOne({_id: edu});
    }
  }
  await candidate.save();
}


async function updateSkills(id, skills) {

  if(!id || !skills){
    return;
  }

  let candidate = await Candidate.findById(id);
  for(let [i, skill] of skills.entries()){
      skill = await Joi.validate(skill, {abortEarly: false});
  }


  candidate.skills = skills;
  candidate = await candidate.save();
  return candidate?.skills || [];
}

async function removeSkill(id, skill) {
  if(!id || !skill){
    return;
  }

  let candidate = await Candidate.findById(id);
  if(candidate){
    candidate.skills = _.reject(candidate.skills, skill);
    candidate = await candidate.save();
  }

  return candidate?.skills || [];
}
async function addReference(id, form) {
  if(!id || !form){
    return;
  }
  let reference = null;
  let candidate = await Candidate.findById(id);
  if(candidate){
    reference = await referenceService.add(form);
    if(reference){
      candidate.references.push(reference._id);
      candidate = await candidate.save();
    }

  }

  return reference;
}
async function updateReference(id, referenceId, form) {
  if(!id || !referenceId || !form){
    return;
  }

  let candidate = await Candidate.findById(id).populate('references');
  let reference = _.find(candidate.references, {_id: referenceId});
  if(reference){
    reference.name = form.name;
    reference.email = form.email;
    reference.phone = form.phone;
    reference.title = form.title;
    reference.relationship = form.relationship;
    reference.company = form.company;
    reference = await reference.save();
  }

  return reference;
}
async function removeReference(id, referenceId) {
  if(!id || !referenceId){
    return;
  }

  let candidate = await Candidate.findById(id);
  if(candidate){
    candidate.references = _.reject(candidate.references, function(o){ return o.equals(referenceId)});
    candidate = await candidate.save();
  }

  return candidate?.references || [];
}
async function checkEmail(company, email) {

  if(!company || !email){
    return;
  }

  let candidate = await Candidate.findOne({company: company, $or: [ { email: email }, { 'emails.value': email } ] });
  return candidate;
}

async function updateCandidateJobPreferences(candidateId, candidatePreferences) {

  if(!candidateId || !candidatePreferences){
    return;
  }

  let result;
  candidatePreferences = await jobPreferenceSchema.validateAsync(candidatePreferences, { abortEarly: false });
  let candidate = await findById(candidateId);
  if(candidate){
    candidate.preferences = candidatePreferences;
    candidate = await candidate.save();
    result = candidate.preferences;
  }

  return result;
}





module.exports = {
  create,
  addCandidate,
  addCandidateByResume,
  removeCandidate,
  removeCandidates,
  findById,
  findByIds,
  findByMessengerIds,
  findByUserId,
  findByCompany,
  findByUserAndCompany,
  findByUserIdAndCompanyId,
  findByEmailAndCompanyId,
  getListofCandidates,
  searchCandidates,
  search,
  getAllCandidatesSkills,
  getCandidatesSimilar,
  getCompanyBlacklisted,
  addExperience,
  updateExperience,
  getExperiences,
  removeExperience,
  addEducation,
  updateEducation,
  getEducations,
  removeEducation,
  updateSkills,
  removeSkill,
  addReference,
  updateReference,
  removeReference,
  checkEmail,
  updateCandidateJobPreferences
}
