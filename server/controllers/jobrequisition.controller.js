const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const partyEnum = require('../const/partyEnum');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {getListofSkillTypes} = require('../services/skilltype.service');
const {findApplicationByUserIdAndJobId, findApplicationById, applyJob, findAppliedCountByJobId} = require('../services/application.service');
const {findBookById, addBookById, removeBookById, findBookByUserId} = require('../services/bookmark.service');
const {findAlertByUserIdAndJobId, addAlertById, removeAlertByUserIdAndJobId} = require('../services/jobalert.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getIndustry} = require('../services/industry.service');

const {getCountsGroupByCompany} = require('../services/jobrequisition.service');
const {addJobViewByUserId} = require('../services/jobview.service');




const filterService = require('../services/filter.service');



//const pagination = require('../const/pagination');
const JobRequisition = require('../models/jobrequisition.model');
const Skilltype = require('../models/skilltype.model');
const JobFunction = require('../models/jobfunctions.model');
const Bookmark = require('../models/bookmark.model');
const PartySkill = require('../models/partyskill.model');
const Application = require('../models/application.model');
const EmploymentType = require('../models/employmenttypes.model');
const ExperienceLevel = require('../models/experiencelevel.model');
const Industry = require('../models/industry.model');




let Pagination = require('../utils/job.pagination');
let SearchParam = require('../const/searchParam');

const jobRequisitionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.number().optional(),
  minMonthExperience: Joi.number().optional(),
  maxMonthExperience: Joi.number().optional(),
  lastCurrencyUom: Joi.string(),
  noOfResources: Joi.number(),
  type: Joi.string(),
  industry: Joi.array().optional(),
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
  industry: Joi.array().optional(),
  employmentType: Joi.string(),
  promotion: Joi.number().optional(),
  company: Joi.number(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
  externalUrl: Joi.string(),
  hasApplied: Joi.boolean(),
  workflowId: Joi.number().required()
});

const applicationSchema = Joi.object({
  jobId: Joi.number().required(),
  partyId: Joi.number().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().required(),
  availableDate: Joi.number().required(),
  attachment: Joi.string().allow('').optional(),
  follow: Joi.boolean().optional()
});


const jobAlertSchema = Joi.object({
  jobId: Joi.number().optional(),
  partyId: Joi.number().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  level: Joi.string().optional(),
  employmentType: Joi.string().optional(),
  distance: Joi.number().optional(),
  company: Joi.number().optional()
});



module.exports = {
  importJobs,
  insert,
  getJobById,
  searchJob,
  getSimilarJobs,
  getLatestJobs,
  getSimilarCompany,
  applyJobById,
  addBookmark,
  removeBookmark,
  addAlert,
  removeAlert
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


async function getJobById(currentUserId, jobId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {

      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', response.data)

      response = await getCompanyById(job.company);
      job.company = response.data.data;

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        await addJobViewByUserId(currentParty.id, jobId);

        let partySkills = await PartySkill.find({partyId: currentParty.id});
        partySkills = _.map(partySkills, "skillTypeId");
        // console.log('partyskills', partySkills)

        let jobSkills = await getListofSkillTypes(job.skills);
        // console.log('jobSkils', jobSkills)

        let hasSaved = await findBookById(currentParty.id, job.jobId);
        job.hasSaved = (hasSaved)?true:false;

        let hasApplied = await findApplicationByUserIdAndJobId(currentParty.id, job.jobId);
        job.hasApplied = (hasApplied)?true:false;


        let noApplied = await findAppliedCountByJobId(job.jobId);
        job.noApplied = noApplied;

        let employmentType = await getEmploymentTypes(_.map(job, 'employmentType'), locale);
        job.employmentType = employmentType[0];

        let experienceLevel = await getExperienceLevels(_.map(job, 'level'), locale);
        job.level = experienceLevel[0];

        //let jobFunction = await JobFunction.findOne({shortCode: job.jobFunction});
        let jobFunction = await JobFunction.aggregate([{$match: {shortCode: job.jobFunction} }, {$project: {name: '$name.'+localeStr, shortCode:1}}]);

        let industry = await getIndustry(job.industry, locale);
        job.industry = industry;


        skills = _.reduce(jobSkills, function(res, skill, key){
          let temp = _.clone(skill);

          if(_.includes(partySkills, skill.skillTypeId)){
            temp.hasSkill=true;
          } else {
            temp.hasSkill=false;
          }

          res.push(temp);
          return res;
        }, []);

        job.skills = skills;
        job.jobFunction=jobFunction[0];

      }
    }

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


async function searchJob(currentUserId, jobId, filter, locale) {

  if(currentUserId==null || filter==null){
    return null;
  }

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


  if(jobId){
    console.log('ID', jobId)
    foundJob = await JobRequisition.findOne({jobId:jobId});
    //
    // if(!foundJob){
    //   return new Pagination(null);
    // }



    filter.similarId = foundJob.jobId;
    //filter.query = foundJob.title;
    filter.level = foundJob.level;
    filter.jobFunction=foundJob.jobFunction;
    filter.employmentType=foundJob.employmentType;
    filter.employmentType=null;
  }



  // let select = 'title createdDate';

  // if(filter.id && !result.content.length)


  let result = await JobRequisition.paginate(new SearchParam(filter), options);
  let docs = [];


  let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
  let listOfSkills = await Skilltype.find({ skillTypeId: { $in: skills } });
  let employmentTypes = await getEmploymentTypes(_.uniq(_.map(result.docs, 'employmentType')), locale);
  let experienceLevels = await getExperienceLevels(_.uniq(_.map(result.docs, 'level')), locale);
  let industries = await getIndustry(_.uniq(_.flatten(_.map(result.docs, 'industry'))), locale);

  console.log(industries)

  let listOfCompanyIds = _.uniq(_.flatten(_.map(result.docs, 'company')));

  let res = await searchParties(listOfCompanyIds, partyEnum.COMPANY);
  let foundCompanies = res.data.data.content;



  let hasSaves = await findBookByUserId(currentUserId);


  _.forEach(result.docs, function(job){
    job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
    job.company = _.find(foundCompanies, {id: job.company});
    job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
    job.level = _.find(experienceLevels, {shortCode: job.level});

    let industry = _.reduce(industries, function(res, item){
      if(_.includes(job.industry, item.shortCode)){
        res.push(item);
      }
      return res;
    }, []);

    job.industry = industry;

    var skills = _.reduce(job.skills, function(res, skill){
      let find = _.filter(listOfSkills, { 'skillTypeId': skill});
      if(find){
        res.push(find[0]);
      }
      return res;
    }, [])

    job.skills = skills;
  })



  return new Pagination(result);

}



async function getSimilarJobs(currentUserId, filter) {

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
    foundJob = await JobRequisition.findOne({jobId: filter.id});
    //
    // if(!foundJob){
    //   return new Pagination(null);
    // }



    //filter.query = foundJob.title;
    filter.level = foundJob.level;
    filter.jobFunction=foundJob.jobFunction;
    filter.employmentType=foundJob.employmentType;
    filter.employmentType=null;
  }



  // let select = 'title createdDate';

  // if(filter.id && !result.content.length)


  let result = await JobRequisition.paginate(new SearchParam(filter), options);
  let docs = [];

  let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
  let listOfSkills = await Skilltype.find({ skillTypeId: { $in: skills } });

  let listOfCompanyIds = _.uniq(_.flatten(_.map(result.docs, 'company')));

  let res = await searchParties(listOfCompanyIds, partyEnum.COMPANY);
  let foundCompanies = res.data.data.content;


  let hasSaves = await findBookByUserId(currentUserId);


  _.forEach(result.docs, function(job){

    job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
    job.company = _.find(foundCompanies, {id: job.company});
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


  return new Pagination(result);

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


async function getSimilarCompany(currentUserId, jobId, filter) {

  if(currentUserId==null || jobId==null || filter==null){
    return null;
  }

  let result = null;

  try {

    let foundJob = await JobRequisition.findOne({jobId: jobId});
    if(foundJob && foundJob.status==statusEnum.ACTIVE){

      let match = {level: foundJob.level, jobFunction: foundJob.jobFunction};
      // let match = {level: foundJob.level};

      let group = await getCountsGroupByCompany(match);
      group = _.reduce(group, function(res, item){
        console.log('item', item)
        res.push(item._id.company);
        return res;
      }, []);

      let companies = await searchParties(group, partyEnum.COMPANY, 20, filter.page);
      result = (companies.data)? companies.data.data : null;

      _.forEach(result.content, function(res){
        res.hasFollowed = false;
        console.log(res);
      })

    }
  } catch (error) {
    console.log(error);
  }

  return result;

}




async function applyJobById(currentUserId, application) {


  application = await Joi.validate(application, applicationSchema, { abortEarly: false });


  if(currentUserId==null || application==null){
    return null;
  }

  let result;
  try {
    let job = await JobRequisition.findOne({jobId: application.jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {
      console.debug('job', job.jobId);
      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', currentParty)

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        result = await findApplicationByUserIdAndJobId(currentParty.id, application.jobId);
        if(!result){
          application.attachment = application.jobId.toString().concat("_").concat(application.partyId).concat(".pdf");
          result = await applyJob(application);
        }
      }
    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function addBookmark(currentUserId, jobId) {

  console.log('saveJobById')
  if(currentUserId==null || jobId==null){
    return null;
  }


  let result;
  try {
    job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {
      console.log('job', job)
      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', currentParty)

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        result = await findBookById(currentParty.id, jobId);

        if(!result) {
          result = await addBookById(currentParty.id, jobId);
        }

      }
    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function removeBookmark(currentUserId, jobId) {

  if(currentUserId==null || jobId==null){
    return null;
  }


  let result;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    //Security Check if user is part of meeting attendees that is ACTIVE.
    if (isPartyActive(currentParty)) {
      result = await findBookById(currentParty.id, jobId);

      if(result){
        let deleted = await removeBookById(currentParty.id, jobId);

        if(deleted && deleted.deletedCount>0){
          result.status=statusEnum.DELETED;
        } else {
          result = null;
        }
      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function addAlert(currentUserId, jobId, alert) {
  alert = await Joi.validate(alert, jobAlertSchema, { abortEarly: false });

  if(currentUserId==null || jobId==null){
    return null;
  }


  let result;
  try {
    job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {
      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', currentParty)

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        result = await findAlertByUserIdAndJobId(currentParty.id, jobId);

        if(!result) {
          alert.partyId = currentParty.id;
          alert.jobId = job.jobId;
          alert.company = job.company;

          console.log('alert', alert);
          result = await addAlertById(currentParty.id, alert);
        }

      }
    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function removeAlert(currentUserId, jobId) {

  if(currentUserId==null || jobId==null){
    return null;
  }


  let found;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    //Security Check if user is part of meeting attendees that is ACTIVE.
    if (isPartyActive(currentParty)) {
      found = await findAlertByUserIdAndJobId(currentParty.id, jobId);
      if(found){
        let deleted = await removeAlertByUserIdAndJobId(currentParty.id, jobId);
        if(deleted && deleted.deletedCount>0){
          found.status=statusEnum.DELETED;
        } else {
          found = null;
        }
      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return found;
}
