const _ = require('lodash');
const Joi = require('joi');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
const md5File = require('md5-file')
const {convertToCandidate, convertToCompany} = require('../utils/helper');

let CandidateParam = require('../const/candidateParam');
const statusEnum = require('../const/statusEnum');
const Candidate = require('../models/candidate.model');
const User = require('../models/user.model');

const userService = require('../services/user.service');
const evaluationService = require('../services/evaluation.service');
const applicationService = require('../services/application.service');
const poolService = require('../services/pool.service');
const experienceService = require('../services/experience.service');
const educationService = require('../services/education.service');
const sourceService = require('../services/source.service');

const feedService = require('../services/api/feed.service.api');
const sovrenService = require('../services/api/sovren.service.api');
const awsService = require('../services/aws.service');



const skillSchema = Joi.object({
  id: Joi.number().required(),
  noOfMonths: Joi.number().optional(),
  rating: Joi.number().optional()
});

const candidateSchema = Joi.object({
  userId: Joi.number().optional(),
  company: Joi.number(),
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


async function addCandidate(currentUserId, companyId, user, isApplied, isImported) {
  if(!companyId || !user){
    return;
  }

  let firstName = user.firstName?user.firstName:'';
  let lastName = user.lastName?user.lastName:'';
  let middleName = user.middleName?user.middleName:'';
  let gender = user.gender?user.gender:'';
  let about = user.about?user.about:'';
  let email = user.email?user.email:(user.primaryEmail && user.primaryEmail.value)?user.primaryEmail.value:'';
  let phoneNumber = user.phoneNumber?user.phoneNumber:(user.primaryPhone && user.primaryPhone.value)?user.primaryPhone.value:'';
  let emails = user.emails;
  let phoneNumbers = user.phoneNumbers;
  let primaryAddress = user.primaryAddress?{address1: user.primaryAddress.address1, address2: user.primaryAddress.address2, district: user.primaryAddress.district, city: user.primaryAddress.city, state: user.primaryAddress.state, country: user.primaryAddress.country}:null
  let links = user.links?user.links:[];
  let languages = user.languages || [];
  let marital = user.marital;
  let sources = user.sources;
  let jobTitle = user.jobTitle || '';

  let candidate = {firstName, middleName, lastName, email, phoneNumber, emails, phoneNumbers, primaryAddress, links, languages, about, gender, marital, sources: user.sources, jobTitle,
    company: companyId
  }

  if(user.id){
    candidate.userId = user.id;
  }

  if(user.shareUrl && user.shareUrl.indexOf('/user')>-1){
    candidate.url = user.shareUrl;
  }

  if(user.avatar){
    let avatar = user.avatar.split('/');
    avatar = avatar[avatar.length-1];
    candidate._avatar = avatar;
  }

  if(user.experiences){
    candidate.experiences = [];
    for(let [i, exp] of user.experiences.entries()){
      let experience = await experienceService.add(exp);
      if(experience){
        candidate.experiences.push(experience._id);
      }
    }
  }

  if(user.skills){
    candidate.skills = user.skills;
  }

  if(user.languages){
    candidate.languages = user.languages;
  }

  if(user.educations){
    candidate.educations = [];
    for(let [i, edu] of user.educations.entries()){
      let education = await educationService.add(edu);
      if(education){
        candidate.educations.push(education._id);
      }
    }
  }

  if(user.resumes){
    candidate.resumes = user.resumes;
  }


  candidate = await Joi.validate(candidate, candidateSchema, {abortEarly: false});
  candidate.hasImported = isImported?true:false;
  candidate.hasApplied = isApplied?true:false;
  candidate = await new Candidate(candidate).save();
  let newUser = await userService.findByUserId(user.id);
  if(!newUser){
    newUser = {firstName:user.firstName, lastName: user.lastName, emails: emails, phoneNumbers: user.phoneNumbers, userId: user.id, resumes: user.resumes, createdBy: currentUserId};
    newUser = await userService.add(newUser);
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

  try {
    let candidate = await Candidate.findById(id);

    await applicationService.deleteByList(candidate.applications);
    candidate.tags = [];
    candidate.sources = [];
    candidate.status = statusEnum.DELETED;
    await poolService.removeCandidate(id);
    await sourceService.removeByCandidateId(candidate._id);
    await candidate.save();


  } catch (error) {
    console.log(error);
  }
}

function findById(id) {

  if(!id){
    return;
  }

  return Candidate.findById(id);
}


async function findByIds(ids) {
  let data = null;

  if(ids==null){
    return;
  }


  return Candidate.find({_id: {$in: ids }});
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



function findByUserIdAndCompanyId(userId, companyId) {


  if(!userId || !companyId){
    return;
  }

  return Candidate.findOne({userId: userId, company: companyId});
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
  let result = Candidate.find({company: company, $or: [{firstName: { $regex: query.toLowerCase(), $options: 'i' }}, {lastName: { $regex: query, $options: 'i' }}, {email: { $regex: query, $options: 'i' }}]});

  return result;
}



async function search(filter, sort) {
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

  const {stages, sources} = filter;

  filter.status = filter.status?filter.status:[statusEnum.ACTIVE];
  let aList = [];
  let aLookup = [];
  let aMatch = { $match: new CandidateParam(filter)};
  let aSort = { $sort: {createdDate: direction} };
  aList.push(aMatch);
  console.log(aMatch)

  // aList.push({$match: {status: statusEnum.ACTIVE}});
  aList.push(
    {$lookup:{
        from:"applications",
        let:{user:"$_id"},
        pipeline:[
          {$match:{$expr:{$eq:["$user","$$user"]}}},
          {$lookup:{
              from:"applicationprogresses",
              let:{currentProgress:"$currentProgress"},
              pipeline:[
                {$match:{$expr:{$eq:["$_id","$$currentProgress"]}}},
                {$lookup:{
                    from:"stages",
                    let:{stage:"$stage"},
                    pipeline:[
                      {$match:{$expr:{$eq:["$_id","$$stage"]}}},

                    ],
                    as: 'stage'
                  }},
                { $unwind: '$stage'}
              ],
              as: 'currentProgress'
            }
          },
          { $unwind: '$currentProgress'}
        ],
        as: 'applications'
      },
    }
  );

  if(stages.length){
    aList.push(
      { $match: {'applications.currentProgress.stage.type': {$in: stages}} }
    );
  }

  if(sources.length) {
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
    console.log(sources)
  }


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

  return await Candidate.aggregatePaginate(aggregate, options);
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



async function getCandidatesSimilar(userId) {


  if(!userId){
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
  let result = await feedService.searchPeople(filter, {});
  list = _.reduce(result.content, function(res, p){
    res.push(p);
    return res;
  }, []);

  // list = sovrenService.matchResume();
  return list;
}



async function getCompanyBlacklisted(company, sort) {

  if(!company){
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
  let aMatch = { $match: {company: company, flag: {$exists: true}}};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);
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
    }

  }

  candidate = await candidate.save();
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

  if(!id){
    return;
  }
  let candidate = await Candidate.findById(id).populate('experiences').select('experiences');
  for(let [i ,exp] of candidate.experiences.entries()){

    if(exp._id.equals(experienceId)){
      candidate.experiences.splice(i, 1);
      await exp.delete();
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
    let found = _.find(candidate.educations, {_id: education._id});
    if(!found){
      candidate.educations.push(education._id);
    }
  }

  candidate = await candidate.save();
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

  if(!id){
    return;
  }
  let candidate = await Candidate.findById(id).populate('educations').select('educations');
  for(let [i ,edu] of candidate.educations.entries()){

    if(edu._id.equals(educationId)){
      candidate.educations.splice(i, 1);
      await edu.delete();
    }
  }

}


async function addSkills(id, form) {

  if(!id || !form){
    return;
  }

  let candidate = await Candidate.findById(id);
  for(let [i, skill] of form.entries()){
      skill = await Joi.validate(skill, skillSchema, {abortEarly: false});
  }


  candidate.skills = form;
  candidate = await candidate.save();
  return candidate;
}


async function checkEmail(company, email) {

  if(!company || !email){
    return;
  }

  let candidate = await Candidate.findOne({company: company, email: email});
  return candidate;
}





module.exports = {
  addCandidate:addCandidate,
  addCandidateByResume:addCandidateByResume,
  removeCandidate:removeCandidate,
  findById:findById,
  findByIds:findByIds,
  findByUserId:findByUserId,
  findByCompany:findByCompany,
  findByUserIdAndCompanyId:findByUserIdAndCompanyId,
  findByEmailAndCompanyId:findByEmailAndCompanyId,
  getListofCandidates:getListofCandidates,
  searchCandidates:searchCandidates,
  search:search,
  getAllCandidatesSkills:getAllCandidatesSkills,
  getCandidatesSimilar:getCandidatesSimilar,
  getCompanyBlacklisted:getCompanyBlacklisted,
  addExperience:addExperience,
  getExperiences:getExperiences,
  removeExperience:removeExperience,
  addEducation:addEducation,
  getEducations:getEducations,
  removeEducation:removeEducation,
  addSkills:addSkills,
  checkEmail:checkEmail
}
