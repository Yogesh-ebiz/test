const _ = require('lodash');
const Joi = require('joi');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
const md5File = require('md5-file')

let CandidateParam = require('../const/candidateParam');
const statusEnum = require('../const/statusEnum');
const Candidate = require('../models/candidate.model');
const evaluationService = require('../services/evaluation.service');
const feedService = require('../services/api/feed.service.api');
const sovrenService = require('../services/api/sovren.service.api');

const awsService = require('../services/aws.service');

const {convertToCandidate} = require('../utils/helper');


const candidateSchema = Joi.object({
  userId: Joi.number().allow('', null).optional(),
  company: Joi.number(),
  about: Joi.string().allow('').optional(),
  avatar: Joi.string().allow('').optional(),
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
  links: Joi.array().optional()
});


async function addCandidate(companyId, user, hasImported) {
  if(!companyId || !user){
    return;
  }

  let gender = user.gender?user.gender:'';
  let about = user.about?user.about:'';
  let email = user.email?user.email:(user.primaryEmail && user.primaryEmail.value)?user.primaryEmail.value:'';
  let phone = user.phoneNumber?user.phoneNumber:(user.primaryPhone && user.primaryPhone.value)?user.primaryPhone.value:'';

  let candidate = {userId: user.id, avatar: user.avatar, company: companyId, firstName: user.firstName, middleName: user.middleName, lastName: user.lastName,
    jobTitle: user.jobTitle?user.jobTitle:'', email: email, phoneNumber: phone,
    primaryAddress: user.primaryAddress,
    skills: _.map(user.skills, 'id'), url: user.shareUrl, links: user.links,
    about: about, gender: gender, marital: user.marital
  }

  candidate = await Joi.validate(candidate, candidateSchema, {abortEarly: false});
  candidate.hasImported = hasImported?hasImported:false;
  candidate = await new Candidate(candidate).save();

  if(user.avatar){
    await awsService.copy("/user/" + user.id + "/images/" + user.avatar, "candidates/" + candidate._id + "/images", user.avatar)
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

  let aList = [];
  let aLookup = [];
  let aMatch = { $match: new CandidateParam(filter)};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);

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
    },
    {$lookup: {from: 'evaluations', localField: 'userId', foreignField: 'partyId', as: 'evaluations' } },
    { $addFields:
        {
          rating: {$round: [{$avg: "$evaluations.rating"}, 1]},
          evaluations: []
        }
    },
  );


  if(filter.stages.length){
    aList.push({ $match: {'applications.currentProgress.stage.type': {$in: filter.stages} } });
  }

  if(filter.sources.length){
    filter.sources = _.reduce(filter.sources, function (res, source) {
      res.push(ObjectID(source));
      return res;
    }, []);

    aList.push(
      {$lookup: {from: 'labels', localField: 'sources', foreignField: '_id', as: 'sources' } },
      // { $match: {'sources': {$in: filter.sources} } }
    );
  }

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
  // let filter = {
  //   "jobTitles": ["Sr. Manager"],
  //   "locations": ["US"],
  //   "skills": [],
  //   "companies": [""],
  //   "schools": [],
  //   "industries": [],
  //   "employmentTypes": []
  // }
  // let result = await feedService.searchPeople(filter, {});
  // list = _.reduce(result.content, function(res, p){
  //   res.push(p);
  //   return res;
  // }, []);


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
  checkEmail:checkEmail
}
