const bcrypt = require('bcrypt');
const Joi = require('joi');
//const pagination = require('../const/pagination');
const JobRequisition = require('../models/jobrequisition.model');
const Skilltype = require('../models/skilltype.model');

let PaginationModel = require('../const/pagination');
let SearchParam = require('../const/searchParam');

const jobRequisitionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.any(),
  experienceMonths: Joi.number(),
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
  getLatestJobs
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





async function getJobById(id) {

  id=(typeof id !== 'undefined') ? id : null;
  // let job = await JobRequisition.find({jobId: id}).then(function(result){
  //   Skilltype.find({skillTypeId: {$in: result.skills}}, function(err, skills){
  //     console.log(skills)
  //   });

  let job, skills=[];
  try {
    job = await JobRequisition.findOne({jobId: id});
    skills = await Skilltype.find({});

    job.skills = skills;
  } catch (error) {
    console.log(error);

  }




  return job;
}


async function searchJob(query) {

  let sortBy = {};
  sortBy[query.sortBy] = (query.direction && query.direction=="DESC") ? -1:1;


  let limit = (query.size && query.size>0) ? query.size:20;
  let page = (query.page && query.page>0) ? query.page:1;
  let jobFunction = query.jobFunction;

  var pattern = '#' + query.query + '#';
  //var query = (query.query && query.query!="") ? {title: { $regex: query.query, $options: 'i' } } :{};


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



async function getLatestJobs(query) {
  const pagination =  {
    totalDocs: 'totalElements',
    docs: 'content',
    limit: 'size',
    page: 'currentPage',
    nextPage: 'last',
    prevPage: 'first',
    totalPages: 'totalPages',
    pagingCounter: 'slNo'
  };

  let sortBy = {};
  sortBy[query.sortBy] = (query.direction && query.direction=="DESC") ? -1:1;


  let limit = (query.size && query.size>0) ? query.size:20;
  let page = (query.page && query.page>0) ? query.page:0;

  var pattern = '#' + query.query + '#';
  var query = (query.query && query.query!="") ? {title: { $regex: query.query, $options: 'i' } } :{};
  var options = {
    select:   '-description -qualifications -responsibilities -skills -connection -company -promotion',
    sort:     sortBy,
    lean:     true,
    offset:   0,
    limit:    limit,
    page: page,
    customLabels: pagination
  };

  let result = await JobRequisition.paginate(query, options, function(err, result) {
    // result.docs
    // result.totalDocs = 100
    // result.limit = 10
    // result.page = 1
    // result.totalPages = 10
    // result.hasNextPage = true
    // result.nextPage = 2
    // result.hasPrevPage = false
    // result.prevPage = null
    // result.pagingCounter = 1
    return result;
  });
  return result;

}
