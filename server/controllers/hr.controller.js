const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/job.pagination');
let JobSearchParam = require('../const/jobSearchParam');
const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
let employmentTypeEnum = require('../const/employmentTypeEnum');

const {convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const {lookupUserIds, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findCompanyById, searchUsers, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');
const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populatePerson} = require('../services/party.service');
const {findJobId} = require('../services/jobrequisition.service');
const {findApplicationsByJobId, findApplicationByUserIdAndJobId, findApplicationById, applyJob, findAppliedCountByJobId} = require('../services/application.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');


const {findCurrencyRate} = require('../services/currency.service');

const {} = require('../services/company.service');

const JobRequisition = require('../models/jobrequisition.model');


module.exports = {
  searchJobs,
  getJobById,
  searchApplications,
  rejectApplication
}

async function searchJobs(currentUserId, companyId, filter, locale) {

  if(currentUserId==null || companyId==null){
    return null;
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

  filter.company = companyId;

  let result = await JobRequisition.paginate(new JobSearchParam(filter), options);
  return new Pagination(result);

}


async function getJobById(currentUserId, jobId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await findJobId(jobId, locale);

    if(job) {;

      let jobSkills = await findSkillsById(job.skills);
      // console.log('jobSkils', jobSkills)

      let noApplied = await findAppliedCountByJobId(job.jobId);
      job.noApplied = noApplied;

      let employmentType = await getEmploymentTypes(_.map(job, 'employmentType'), locale);
      job.employmentType = employmentType[0];

      let experienceLevel = await getExperienceLevels(_.map(job, 'level'), locale);
      job.level = experienceLevel[0];

      let industry = await findIndustry('', job.industry, locale);
      job.industry = industry;

      let jobFunction = await findJobfunction('', job.jobFunction, locale);
      job.jobFunction = jobFunction;

      if(job.promotion){
        let promotion = await findPromotionById(job.promotion);
        job.promotion = promotion[0];
      }

      let users  = await lookupUserIds(job.panelist.concat(job.createdBy));
      job.createdBy = _.find(users, {id: job.createdBy});
      job.panelist = _.reject(users, {id: job.createdBy});;

      let currentParty, partySkills=[];

      job.skills = jobSkills;
      job.jobFunction=jobFunction[0];


    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


async function searchApplications(currentUserId, jobId, filter, locale) {

  if(currentUserId==null || jobId==null){
    return null;
  }

  let applications = await findApplicationsByJobId(jobId, filter);

  let userIds = _.map(applications, 'partyId');
  let users = await lookupUserIds(userIds);

  applications.forEach(function(app){
    let user = _.find(users, {id: app.partyId});
    if(user){
      app.user = user;
    }
  })

  return applications;


}


async function rejectApplication(currentUserId, jobId, applicationId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await findApplicationById(applicationId, locale);

    if(job) {;




    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


