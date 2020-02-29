const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');

//const pagination = require('../const/pagination');
const JobRequisition = require('../models/jobrequisition.model');
const Skilltype = require('../models/skilltype.model');
const JobFunction = require('../models/jobfunctions.model');
const JobBookmark = require('../models/jobbookmark.model');



let Pagination = require('../utils/job.pagination');
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
  hasSaved: Joi.boolean(),
  company: Joi.object(),
  connection: Joi.object(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
  isExternal: Joi.boolean(),
  externalUrl: Joi.string(),
  hasApplied: Joi.boolean()
});



module.exports = {
  importJobs,
  insert,
  getJobById,
  searchJob,
  getLatestJobs,
  getSimilarCompanyJobs
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


    skills = _.reduce(skills, function(res, skill, key){
      let temp = {
        _id: skill._id,
        skillTypeId: skill.skillTypeId,
        name: skill.name,
        parent: skill.parent,
        sequence: 0,
        hasSkill: false
      }
      if(_.includes([1, 2, 3, 5, 6, 8, 10, 11], skill.skillTypeId)){
        temp.hasSkill=true;
      }

      res.push(temp);
      return res;
    }, []);

    job.skills = skills;
    job.jobFunction=jobFunction[0];

  } catch (error) {
    console.log(error);

  }




  return job;
}


async function addToUser(id, locale) {

  try {
    let localeStr = locale? locale : 'en';
    job = await JobRequisition.findOne({jobId: id});
    let skills = await Skilltype.find({skillTypeId: job.skills});
    //let jobFunction = await JobFunction.findOne({shortCode: job.jobFunction});


    //jobFunction.name=jobFunction[name][localeStr];


    job.skills = skills;
    job.jobFunction=jobFunction;

  } catch (error) {
    console.log(error);

  }




  return job;
}


async function searchJob(req) {

  let filter = req.query;
  let foundJob = null;
  let select = '-description -qualifications -responsibilities';
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
    console.log('ID', filter.id)
    //foundJob = await JobRequisition.findOne({jobId: filter.id});
    //
    // if(!foundJob){
    //   return new Pagination(null);
    // }

    //filter.query = foundJob.title;
    // filter.level = foundJob.level;
    // filter.jobFunction=foundJob.jobFunction;
    // filter.employmentType=foundJob.employmentType;
    // filter.employmentType=null;
  }



  // let select = 'title createdDate';

  // if(filter.id && !result.content.length)


  let result = await JobRequisition.paginate(new SearchParam(filter), options);
  let docs = [];

  let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
  let listOfSkills = await Skilltype.find({ skillTypeId: { $in: skills } });

  _.forEach(result.docs, function(job){
    var skills = _.reduce(job.skills, function(res, skill){
      let find = _.filter(listOfSkills, { 'skillTypeId': skill});
      if(find){
        res.push(find[0]);
      }
      return res;
    }, [])

    job.skills = skills;
  })




  // if(filter.id && !result.content.length){
  //   filter.employmentType=null;
  //
  //
  //   //Assuring similar Job always have data
  //   result = await JobRequisition.paginate(new SearchParam(filter), options, function(err, result) {
  //     console.log('result', result)
  //     return new PaginationModel(result);
  //   });
  // }


  return new Pagination(result, req.locale);

}



async function getLatestJobs(req) {

  let filter = req.query
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;


  var options = {
    select:   '-description -qualifications -responsibilities -skills ',
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };


  return await JobRequisition.paginate(new SearchParam(filter), options, function(result){
    new Pagination(result);
  });

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

