const bcrypt = require('bcrypt');
const Joi = require('joi');
//const pagination = require('../const/pagination');
const JobRequisition = require('../models/jobrequisition.model');
const Skilltype = require('../models/skilltype.model');
const JobFunction = require('../models/jobfunctions.model');
const _ = require('lodash');

let PaginationModel = require('../const/pagination');
let SearchParam = require('../const/searchParam');

const jobRequisitionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.any(),
  minMonthExperience: Joi.number(),
  maxMonthExperience: Joi.number(),
  lastCurrencyUom: Joi.string(),
  noOfResources: Joi.any(),
  type: Joi.string(),
  jobFunction: Joi.string(),
  expirationDate: Joi.number(),
  requiredOnDate: Joi.number(),
  salaryRangeLow: Joi.number(),
  salaryRangeHigh: Joi.number(),
  salaryFixed: Joi.any(),
  level: Joi.string(),
  responsibilities: Joi.array(),
  qualifications: Joi.array(),
  skills: Joi.array(),
  industry: Joi.string(),
  employmentType: Joi.string(),
  promotion: Joi.object(),
  isSaved: Joi.boolean(),
  company: Joi.object(),
  connection: Joi.object()
});



module.exports = {
  importJobs,
  insert,
  getJobById,
  searchJob,
  getLatestJobs,
  getSimilarCompanyJobs,
  saveJob
}

async function insert(job) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  if(job) {
    //job.skills = await Skilltype.find({id: {$in: job.skills}});
  }
  return await new JobRequisition(job).save();
}

async function importJobs(type, jobs) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  // if(job) {
  //   job.skills = await Skilltype.find({id: {$in: job.skills}});
  // }
  return await new JobRequisition(job).save();
}





async function getJobById(id, locale) {

  id=(typeof id !== 'undefined') ? id : null;
  // let job = await JobRequisition.find({jobId: id}).then(function(result){
  //   Skilltype.find({skillTypeId: {$in: result.skills}}, function(err, skills){
  //     console.log(skills)
  //   });

  let job, skills=[];
  try {
    let localeStr = locale? locale : 'en';
    job = await JobRequisition.findOne({jobId: id});
    let skills = await Skilltype.find({skillTypeId: job.skills});
    //let jobFunction = await JobFunction.findOne({shortCode: job.jobFunction});
    let jobFunction = await JobFunction.aggregate([{$match: {shortCode: job.jobFunction} }, {$project: {name: '$name.'+localeStr, shortCode:1}}]);


    //jobFunction.name=jobFunction[name][localeStr];


    job.skills = skills;
    job.jobFunction=jobFunction;

  } catch (error) {
    console.log(error);

  }




  return job;
}


async function searchJob(filter) {

  let foundJob = null;
  let select = '-description -qualifications -responsibilities -skills ';
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


  if(filter.id){
    foundJob = await JobRequisition.findOne({jobId: filter.id});

    if(!foundJob){
      return new PaginationModel(null);
    }

    //filter.query = foundJob.title;
    filter.level = foundJob.level;
    filter.jobFunction=foundJob.jobFunction;
    filter.employmentType=foundJob.employmentType;
  }



  // let select = 'title createdDate';


  let result = await JobRequisition.paginate(new SearchParam(filter), options, function(err, result) {
    // result.docs
    // result.totalDocs = 100
    // result.limit = 10
    // result.page = 1;
    // result.totalPages = 10
    // result.hasNextPage = true
    // result.nextPage = 2
    // result.hasPrevPage = false
    // result.prevPage = null
    // result.pagingCounter = 1

    console.log('result', result.page, result.limit);
    return new PaginationModel(result);
  });



  if(filter.id && !result.content.length){
    filter.employmentType=null;


    //Assuring similar Job always have data
    result = await JobRequisition.paginate(new SearchParam(filter), options, function(err, result) {
      return new PaginationModel(result);
    });
  }


  return result;

}



async function getLatestJobs(query) {
  let sortBy = {};
  sortBy[query.sortBy] = (query.direction && query.direction=="DESC") ? -1:1;


  var options = {
    select:   '-description -qualifications -responsibilities -skills ',
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };

  console.log('search', new SearchParam(query))

  let result = await JobRequisition.paginate(new SearchParam(query), options, function(err, result) {
    // result.docs
    // result.totalDocs = 100
    // result.limit = 10
    // result.page = 1;
    // result.totalPages = 10
    // result.hasNextPage = true
    // result.nextPage = 2
    // result.hasPrevPage = false
    // result.prevPage = null
    // result.pagingCounter = 1

    return new PaginationModel(result);
  });
  return result;

  //return await JobRequisition.find({}).select(['-description','-qualifications', '-responsibilities']);
}



async function getSimilarCompanyJobs(filter) {

  let foundJob = null;
  let select = '-description -qualifications -responsibilities -skills ';

  if(filter.id){
    foundJob = await JobRequisition.findOne({jobId: filter.id});

    if(!foundJob){
      return null;
    }

    filter.level = foundJob.level;
    filter.jobFunction=foundJob.jobFunction;
  }

  console.log('Job ID', foundJob.id)
  let companies = await JobRequisition.aggregate([{$match: {level: foundJob.level}}, { $group: {_id: '$company'} }  ]);

  companies = _.reduce(companies, function(result, value, key){
    let company = value._id;
    delete company.benefits;
    result.push(company);
    return result;
  }, [])


  return companies;

}


async function saveJob(filter) {

  let foundJob = null;
  let select = '-description -qualifications -responsibilities -skills ';

  if(filter.id){
    foundJob = await JobRequisition.findOne({jobId: filter.id});

    if(!foundJob){
      return null;
    }

    filter.level = foundJob.level;
    filter.jobFunction=foundJob.jobFunction;
  }

  console.log('Job ID', foundJob.id)
  let companies = await JobRequisition.aggregate([{$match: {level: foundJob.level}}, { $group: {_id: '$company'} }  ]);

  companies = _.reduce(companies, function(result, value, key){
    let company = value._id;
    delete company.benefits;
    result.push(company);
    return result;
  }, [])


  return companies;

}
