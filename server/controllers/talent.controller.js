const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/pagination');

let JobSearchParam = require('../const/jobSearchParam');
let SearchParam = require('../const/searchParam');

const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
let employmentTypeEnum = require('../const/employmentTypeEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');

const {categoryMinimal, roleMinimal, convertToCandidate, convertToTalentUser, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const {getUserLinks, lookupPeopleIds, lookupUserIds, createJobFeed, followCompany, findCategoryByShortCode, findSkillsById, findIndustry, findJobfunction, findByUserId, findCompanyById, searchUsers, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');
const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populatePerson} = require('../services/party.service');
const jobService = require('../services/jobrequisition.service');
const applicationService = require('../services/application.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getDepartments, addDepartment} = require('../services/department.service');
const {getQuestionTemplates, addQuestionTemplate, updateQuestionTemplate, deleteQuestionTemplate} = require('../services/questiontemplate.service');
const {getPipelineByJobId, getPipelineById, getPipelines, addPipeline} = require('../services/pipeline.service');
const {getPipelineTemplateById, getPipelineTemplates, addPipelineTemplate} = require('../services/pipelineTemplate.service');
const applicationProgressService = require('../services/applicationprogress.service');
const roleService = require('../services/role.service');
const labelService = require('../services/label.service');
const memberService = require('../services/member.service');
const poolService = require('../services/pool.service');
const projectService = require('../services/project.service');
const activityService = require('../services/activity.service');
const commentService = require('../services/comment.service');
const evaluationService = require('../services/evaluation.service');
const candidateService = require('../services/candidate.service');
const jobViewService = require('../services/jobview.service');
const bookmarkService = require('../services/bookmark.service');
const departmentService = require('../services/department.service');


const {findCurrencyRate} = require('../services/currency.service');

const {} = require('../services/company.service');
const JobRequisition = require('../models/jobrequisition.model');
const Application = require('../models/application.model');
const Role = require('../models/role.model');
const Department = require('../models/department.model');


const invitationSchema = Joi.object({
  createdBy: Joi.number().required(),
  userId: Joi.number().required(),
  email: Joi.string().required(),
  role: Joi.string().required()
});


const departmentSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.number().required(),
  createdBy: Joi.number().required()
});

const pipelineSchema = Joi.object({
  pipelineTemplateId: Joi.string().required(),
  stages: Joi.array().required()
});

const roleSchema = Joi.object({
  name: Joi.string().required(),
  createdBy: Joi.number().required(),
  company: Joi.number().required(),
  description: Joi.object().required(),
  privileges: Joi.array().required(),
  default: Joi.boolean()
});

const labelSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  company: Joi.number().required()
});


module.exports = {
  getCompanyInsights,
  getImpressionCandidates,
  getStats,
  getUserSession,
  createJob,
  updateJob,
  closeJob,
  archiveJob,
  unarchiveJob,
  deleteJob,
  getJobComments,
  addJobComment,
  deleteJobComment,
  updateJobComment,
  searchJobs,
  getJobById,
  updateJobPipeline,
  getJobPipeline,
  updateJobMembers,
  updateJobApplicationForm,
  getBoard,
  payJob,
  getJobInsights,
  getJobActivities,
  searchJobApplications,
  getApplicationById,
  rejectApplication,
  updateApplicationProgress,
  getApplicationQuestions,
  getApplicationLabels,
  addApplicationLabel,
  deleteApplicationLabel,
  getApplicationComments,
  addApplicationComment,
  deleteApplicationComment,
  updateApplicationComment,
  getApplicationEvaluations,
  addApplicationProgressEvaluation,
  removeApplicationProgressEvaluation,
  disqualifyApplication,
  revertApplication,
  subscribeApplication,
  unsubscribeApplication,
  getApplicationActivities,
  searchCandidates,
  getCandidateById,
  addCandidateTag,
  removeCandidateTag,
  addCandidateSource,
  removeCandidateSource,
  updateCandidatePool,
  addCompanyDepartment,
  updateCompanyDepartment,
  deleteCompanyDepartment,
  getCompanyDepartments,
  addCompanyQuestionTemplate,
  updateCompanyQuestionTemplate,
  deleteCompanyQuestionTemplate,
  getCompanyQuestionTemplates,
  addCompanyPipelineTemplate,
  updateCompanyPipelineTemplate,
  deleteCompanyPipelineTemplate,
  getCompanyPipelineTemplate,
  getCompanyPipelineTemplates,
  addCompanyRole,
  getCompanyRoles,
  updateCompanyRole,
  deleteCompanyRole,
  addCompanyLabel,
  getCompanyLabels,
  updateCompanyLabel,
  deleteCompanyLabel,
  inviteMembers,
  getCompanyMemberInvitations,
  getCompanyMembers,
  addCompanyMember,
  updateCompanyMember,
  updateCompanyMemberRole,
  deleteCompanyMember,
  getCompanyPools,
  addCompanyPool,
  updateCompanyPool,
  deleteCompanyPool,
  getPoolCandidates,
  addPoolCandidates,
  removePoolCandidate,
  removePoolCandidates,
  getCompanyProjects,
  addCompanyProject,
  updateCompanyProject,
  deleteCompanyProject,
  addProjectCandidates,
  removeProjectCandidate,
  removeProjectCandidates,
  updateCandidateProject,
  subscribeJob,
  unsubscribeJob,
  getFiles
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function getUserSession(currentUserId, preferredCompany) {

  if(!currentUserId){
    return null;
  }


  let result;
  let user = await findByUserId(currentUserId);
  let allAccounts = await memberService.findMemberByUserId(currentUserId);

  let companies = await searchCompany('', _.map(allAccounts, 'company'), currentUserId);


  companies = _.reduce(companies.content, function(res, item){
    let found = _.find(allAccounts, {company: item.id});
    item = convertToCompany(item);
    item.role = roleMinimal(found.role);
    item.memberId = found._id
    res.push(item)

    return res;
  }, [])
  user = convertToTalentUser(user);
  user.company = companies;
  user.currentCompanyId = preferredCompany? _.some(companies, {id: preferredCompany})?preferredCompany:companies.length?companies[0].id:null:companies.length?companies[0].id:null;



  return user;

}


async function getCompanies(currentUserId) {

  if(currentUserId==null){
    return null;
  }

  let company = await findCompanyById(companyId, currentUserId);


  const loadPromises = result.docs.map(job => {

    job.company = convertToCompany(company);
    return job;
  });
  // result = await Promise.all(loadPromises);

  return new Pagination(result);

}


async function getCompanyInsights(currentUserId, companyId, timeframe) {


  if(!currentUserId || !companyId){
    return null;
  }


  let data = [];
  let min = 10, max = 100;
  let numOfItems = timeframe=='3M'?12:timeframe=='6M'?24:timeframe=='1Y'?52:30;

    for(var i=0; i<4; i++){
      let sample = [];
      for(var j=0; j<numOfItems; j++){
        let random = getRandomInt(min, max);
        min = random - 10;
        max = random + 10;
        sample.push(random);
      }
      data.push(sample);
    }

  let result = {
    impressions: [
      {
        type: 'VIEWED',
        data: data[0],
        total: getRandomInt(1, 2000),
        changes: getRandomInt(1,100)
      },
      {
        type: 'APPLIED',
        data: data[1],
        total: getRandomInt(1, 2000),
        changes: getRandomInt(1,100)
      },
      {
        type: 'LIKED',
        data: data[2],
        total: getRandomInt(1, 2000),
        changes: getRandomInt(1,100)
      },
      {
        type: 'SHARED',
        data: data[3],
        total: getRandomInt(1, 2000),
        changes: getRandomInt(1,100)
      }
    ],
    impressionByRoles: [
      {
        name: 'Senior',
        value: 85.7
      },
      {
        name: 'Entry',
        value: 14.9
      },
      {
        name: 'Director',
        value: 12.3
      },{
        name: 'Owner',
        value: 11.9
      },
      {
        name: 'Other',
        value: 11.9
      },
      {
        name: 'Manager',
        value: 9
      },
      {
        name: 'VP',
        value: 7.9
      },
      {
        name: 'CXO',
        value: 5.6
      }
    ],
    sources: {}
  }


  let viewedData = await jobViewService.getCompanyInsight(companyId, timeframe);
  let savedData = await bookmarkService.getCompanyInsight(companyId, timeframe);
  let appliedDate = await applicationService.getCompanyInsight(companyId, timeframe);

  let sharedData = {...viewedData}
  sharedData.type="SHARED"
  let likedData = {...savedData}
  likedData.type="LIKED"

  result.impressions=[];
  result.impressions.push(viewedData);
  result.impressions.push(savedData);
  result.impressions.push(appliedDate);
  result.impressions.push(sharedData);
  result.impressions.push(likedData);


  let sources = await applicationService.getCandidatesSourceByCompanyId(companyId, timeframe);
  result.sources = sources;

  return result;

}


async function getImpressionCandidates(company, currentUserId, type, timeframe, jobId, sort, locale) {
  if(!currentUserId || !company || !type || !sort){
    return null;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };

  let result;
  let from, to;

  if(jobId){
    jobId = ObjectID(jobId);
    let job = await jobService.findJob_Id(jobId);
    if(job){
      from = new Date(job.createdDate);
      to = new Date();
    }
  }

  if(timeframe){
    if(timeframe=='1M'){
      date = new Date();
      date.setDate(date.getDate()-30);
      date.setMinutes(0);
      date.setHours(0)
      from = date;
      to = new Date();
    } else if(timeframe=='3M'){
      date = new Date();
      date.setMonth(date.getMonth()-3);
      date.setDate(1);
      from = date;
      to = new Date();
    } else if(timeframe=='6M'){
      date = new Date();
      date.setMonth(date.getMonth()-6);
      date.setDate(1);
      from = date;
      to = new Date();
    }
  }

  if(type=='viewed') {
    result = await jobViewService.getInsightCandidates(from, to, company, jobId, options);
  } else if(type=='saved') {
    result = await bookmarkService.getInsightCandidates(from, to, company, jobId, options);
  } else if(type=='applied') {
    result = await applicationService.getInsightCandidates(from, to, company, jobId, options);
  }

  if(result){
    let userIds = _.map(result.docs, 'partyId');
    let users = await lookupPeopleIds(userIds);

    for(i in result.docs){

      let found = _.find(users, {id: result.docs[i].partyId});
      if(found){
        result.docs[i] = found;
      }
    }
  }


  // if(result.docs.length) {
  //   let currentProgressIds = _.reduce(result.docs, function (res, candidate) {
  //     let currentProgresses = _.reduce(candidate.applications, function(res, app) {
  //       res.push(ObjectID(app.currentProgress));
  //       return res;
  //     }, []);
  //
  //     res = res.concat(currentProgresses);
  //     return res;
  //   }, [])
  //
  //   let progresses = await applicationProgressService.findApplicationProgresssByIds(currentProgressIds);
  //   for (i in result.docs) {
  //     result.docs[i].source = [];
  //     result.docs[i].tags = [];
  //
  //     for(j in result.docs[i].applications){
  //       result.docs[i].applications[j].currentProgress = _.find(progresses, function(progress){
  //         return progress._id.equals(result.docs[i].applications[j].currentProgress)
  //       });
  //     }
  //     result.docs[i] = convertToCandidate(result.docs[i]);
  //
  //   }
  // }
  return new Pagination(result);

}

async function getStats(currentUserId, companyId) {


  if(!currentUserId || !companyId){
    return null;
  }


  let data = [];

  let newApplications = await applicationService.getLatestCandidates(companyId);
  let userIds = _.reduce(newApplications, function(res, app){ res.push(app.user.userId); return res;}, []);
  let users = await lookupUserIds(userIds);


  newApplications.forEach(function(app){
    // let found = _.find(users, {id: app.user});
    // if(found){
    //   app.user = convertToCandidate(found);
    // }

    app.progress=[];

  });

  let jobs = await jobViewService.findMostViewed();

  let result = {
    newApplications: newApplications,
    mostViewedJobs: jobs
  }



  return result;

}

async function searchJobs(currentUserId, companyId, filter, locale) {

  if(!currentUserId || !companyId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  let jobSubscribed = await memberService.findMemberSubscribedToSubjectType(currentUserId, subjectType.JOB);

  if(!member){
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


  filter.members = [member._id];

  let company = await findCompanyById(companyId, currentUserId);

  console.log( new SearchParam(filter))
  const aggregate = JobRequisition.aggregate([{
    $match: new SearchParam(filter)
  }
  ]);


  let result = await JobRequisition.aggregatePaginate(aggregate, options);
  let userIds = _.uniq(_.flatten(_.map(result.docs, 'createdBy')));
  let users = await lookupUserIds(userIds);

  let departmentIds = _.map(result.docs, 'department');
  let departments = await departmentService.getDepartmentsByList(departmentIds);

  const loadPromises = result.docs.map(job => {
    job.isHot = false;
    job.isNew = false;
    job.company = convertToCompany(company);
    job.hasSaved = _.some(jobSubscribed, {subjectId: job._id});
    job.department = _.find(departments, {_id: job.department});
    let createdBy = _.find(users, {id: job.createdBy});
    if(createdBy){
      job.createdBy = convertToAvatar(createdBy);
    }
    return job;
  });
  // result = await Promise.all(loadPromises);

  return new Pagination(result);

}

async function createJob(companyId, currentUserId, job) {

  if(!companyId || !currentUserId || !job){
    return null;
  }


  let result;
  // let currentParty = await findByUserId(currentUserId);

  // if (isPartyActive(currentParty)) {
  result = await jobService.addJob(companyId, currentUserId, job);

  // }

  return result;
}

async function updateJob(companyId, currentUserId, jobId, form) {

  if(!companyId || !currentUserId || !jobId || !form){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  let currentParty = await findByUserId(currentUserId);

  if (isPartyActive(currentParty)) {
    result = await jobService.updateJob(jobId, currentUserId, form);
  }

  return result;
}


async function closeJob(companyId, currentUserId, jobId) {

  if(!companyId || !currentUserId || !jobId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result = await jobService.closeJob(jobId, currentUserId);

  return result;
}



async function archiveJob(companyId, currentUserId, jobId) {

  if(!companyId || !currentUserId || !jobId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result = await jobService.archiveJob(jobId, currentUserId);

  return result;
}



async function unarchiveJob(companyId, currentUserId, jobId) {

  if(!companyId || !currentUserId || !jobId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result = await jobService.unarchiveJob(jobId, currentUserId);

  return result;
}


async function deleteJob(companyId, currentUserId, jobId) {

  if(!companyId || !currentUserId || !jobId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let job = await jobService.findJob_Id(jobId);
  if(job){
    result = await job.delete();
  }


  return result;
}


async function getJobComments(currentUserId, jobId, filter) {

  if(!currentUserId || !jobId || !filter){
    return null;
  }

  let result;
  try {


    result = await commentService.getComments(subjectType.JOB, jobId, filter);

    let userIds = _.map(result.docs, 'createdBy');
    let users = await lookupUserIds(userIds);
    result.docs.forEach(function(comment){
      let found = _.find(users, {id: comment.createdBy});
      if(found){
        comment.createdBy = convertToTalentUser(found);
      }
    });

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);
}

async function addJobComment(currentUserId, jobId, comment) {

  if(!currentUserId || !jobId || !comment){
    return null;
  }

  let result;
  try {


    let job = await jobService.findJob_Id(jobId);


    if(job) {
      comment.subjectType = subjectType.JOB;
      comment.subjectId = job._id;
      comment.createdBy = currentUserId;
      result = await commentService.addComment(comment);

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function deleteJobComment(currentUserId, jobId, commentId) {

  if(!currentUserId || !jobId || !commentId){
    return null;
  }

  let result;
  try {
    let comment = await commentService.findBy_Id(commentId);

    if(comment) {
      result = await comment.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function updateJobComment(currentUserId, jobId, commentId, comment) {

  if(!currentUserId || !jobId || !commentId || !comment){
    return null;
  }

  let result;
  try {


    let found = await commentService.findBy_Id(commentId);


    if(found) {
      found.message = comment.message;
      found.lastUpdatedDate = Date.now();
      result = await found.save()

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function getJobById(currentUserId, companyId, jobId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result, job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await jobService.findJob_Id(jobId, locale);


    if(job && _.find(job.members, {_id: ObjectID(member._id)})) {


      let noApplied = await applicationService.findAppliedCountByJobId(job._id);
      job.noApplied = noApplied;


      let experienceLevel = await getExperienceLevels(_.map(job, 'level'), locale);
      job.level = experienceLevel[0];

      let industry = await findIndustry('', job.industry, locale);
      job.industry = industry;

      let jobFunction = await findJobfunction('', job.jobFunction, locale);
      if(jobFunction.length){
        job.jobFunction = jobFunction[0];
      }

      if(job.category){
        let cateogry = await findCategoryByShortCode(job.category, locale);
        job.category = categoryMinimal(cateogry);
      }

      if(job.skills.length) {
        let jobSkills = await findSkillsById(job.skills);
        job.skills = jobSkills;
      }


      let userIds = _.map(job.members, 'userId');
      userIds.push(job.createdBy)
      let users  = await lookupUserIds(userIds);


      job.createdBy = _.find(users, {id: job.createdBy});
      job.members.forEach(function(member){
        let found = _.find(users, {id: member.userId});

        if(found){
          member.avatar = found.avatar?found.avatar:'';
        }
      });

      job.hasSaved = _.some(member.followedJobs, job._id);


      result = job;

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function updateJobPipeline(companyId, jobId, currentUserId, form) {

  if(!companyId || !jobId || !currentUserId || !form){
    return null;
  }

  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  let result = null;

  try {
      result = await jobService.updateJobPipeline(jobId, form, currentUserId);

  } catch(e){
    console.log('updateJobPipeline: Error', e);
  }


  return result
}


async function getJobPipeline(companyId, jobId, currentUserId) {
  if(!companyId || !jobId || !currentUserId){
    return null;
  }

  let result = null;

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  try {
    result = await jobService.getJobPipeline(jobId);

  } catch(e){
    console.log('getJobPipeline: Error', e);
  }


  return result
}

async function updateJobMembers(jobId, currentUserId, members) {
  if(!jobId || !currentUserId || !members){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  try {
    if (isPartyActive(currentParty)) {
      result = await jobService.updateJobMembers(jobId, members, currentUserId);
    }
  } catch(e){
    console.log('updateJobMember: Error', e);
  }


  return result
}


async function updateJobApplicationForm(jobId, currentUserId, form) {
  if(!jobId || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  try {
    if (isPartyActive(currentParty)) {
      result = await jobService.updateJobApplicationForm(jobId, form, currentUserId);
    }
  } catch(e){
    console.log('updateJobApplicationForm: Error', e);
  }


  return result
}



async function payJob(currentUserId, jobId, payment) {

  if(!currentUserId || !jobId || !payment){
    return null;
  }

  let job = await jobService.findJob_Id(jobId);

  if(job){
    job.status = statusEnum.ACTIVE;
    await job.save();
  }

  return job;


}



async function getJobInsights(currentUserId, companyId, jobId) {


  if(!currentUserId || !companyId){
    return null;
  }

  let data = [];
  let min = 10, max = 100;

  let result = {

  }


  let viewedData = await jobViewService.getJobInsight(jobId);
  let savedData = await bookmarkService.getJobInsight(jobId);
  let appliedDate = await applicationService.getJobInsight(jobId);
  //
  let sharedData = {...viewedData}
  sharedData.type="SHARED"
  let likedData = {...savedData}
  likedData.type="LIKED"

  result.impressions=[];
  result.impressions.push(viewedData);
  result.impressions.push(savedData);
  result.impressions.push(appliedDate);
  result.impressions.push(sharedData);
  result.impressions.push(likedData);

  result.impressionByRoles= [
    {
      name: 'Senior',
      value: 85.7
    },
    {
      name: 'Entry',
      value: 14.9
    },
    {
      name: 'Director',
      value: 12.3
    },{
      name: 'Owner',
      value: 11.9
    },
    {
      name: 'Other',
      value: 11.9
    },
    {
      name: 'Manager',
      value: 9
    },
    {
      name: 'VP',
      value: 7.9
    },
    {
      name: 'CXO',
      value: 5.6
    }
  ];

  let sources = await applicationService.getCandidatesSourceByJobId(jobId);
  result.sources = sources;

  return result;

}


async function getJobActivities(companyId, currentUserId, jobId, filter) {
  if(!companyId || !currentUserId || !jobId || !filter){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {

    result = await activityService.findByJobId(jobId, filter);
    let userIds = _.map(result.docs, 'causerId');
    let users = await lookupUserIds(userIds);
    result.docs.forEach(function(activity){
      let found = _.find(users, {id: parseInt(activity.causerId)});
      if(found){
        activity.causer = convertToTalentUser(found);
      }
    });
    return new Pagination(result);

  } catch (error) {
    console.log(error);
  }

  return result;

}



async function searchJobApplications(currentUserId, jobId, filter, locale) {

  if(!currentUserId || !jobId || !filter){
    return null;
  }

  let result = await applicationService.findApplicationsByJobId(jobId, filter);
    // let userIds = _.map(result.docs, 'user');
    // let users = await lookupUserIds(userIds);

  let subscriptions = await memberService.findMemberSubscribedToSubjectType(currentUserId, subjectType.APPLICATION);

  result.docs.forEach(function(app){
    app.labels = [];
    app.note = [];
    app.comments = [];
    if(_.some(subscriptions, {subjectId: ObjectID(app._id)})){
      app.hasFollowed = true;
    }
  })

  return new Pagination(result);


}


async function searchCompanyApplications(currentUserId, companyId, filter, locale) {

  if(!currentUserId || !companyId || !filter){
    return null;
  }

  let results = await applicationService.findApplicationsByCompany(companyId, filter);

  let userIds = _.map(results.content, 'user');
  let users = await lookupUserIds(userIds);

  results.content.forEach(function(app){
    let user = _.find(users, {id: app.user});
    if(user){
      app.user = user;
    }
  })

  return results;

}



async function getApplicationById(companyId, currentUserId, applicationId) {

  if(!companyId  || !currentUserId || !applicationId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  let application;
  try {
    let currentParty = await findByUserId(currentUserId);

    application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'currentProgress',
        model: 'ApplicationProgress',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      },
      {
        path: 'progress',
        model: 'ApplicationProgress',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      }
    ]);
    if (application) {


    } else {
      application=null;
    }


  } catch (error) {
    console.log(error);
  }

  return application;
}


async function rejectApplication(currentUserId, jobId, applicationId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await applicationService.findApplicationBy_Id(applicationId, locale);

    if(job) {




    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


async function updateApplication(currentUserId, jobId, applicationId, newStatus) {

  if(!jobId || !applicationId || !currentUserId || !newStatus){
    return null;
  }

  let application;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    application = await applicationService.findApplicationBy_Id(applicationId, locale);

    if(application) {




    }

  } catch (error) {
    console.log(error);
  }

  return application;
}

async function updateApplicationProgress(currentUserId, applicationId, newStage) {

  if(!currentUserId || !applicationId || !newStage){
    return null;
  }


  let progress;
  try {

    let application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'currentProgress',
        model: 'ApplicationProgress',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      },
      {
        path: 'progress',
        model: 'ApplicationProgress',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      },
      {
        path: 'user',
        model: 'Candidate'
      }
    ]);


    if(application) {
      let previousProgress = application.currentProgress;
      _.forEach(application.progress, function(item){
        if(item.stage._id==ObjectID(newStage)){
          progress = item;
        }
      });

      if(progress){
        application.currentProgress = progress;
        await application.save();
      } else {
        let pipeline = await getPipelineByJobId(application.jobId);
        if(pipeline) {
          foundStage = _.find(pipeline.stages, {_id: ObjectID(newStage)})
          if(foundStage) {
            progress = await  applicationProgressService.addApplicationProgress({
              applicationId: application.applicationId,
              stage: foundStage._id
            });

            application.currentProgress = progress;
            application.progress.push(progress);
            application.progress = _.orderBy(application.progress, ['stageId'], []);
            await application.save();

          }
        }
      }


      let job = await jobService.findJob_Id(application.jobId);
      let activity = await activityService.addActivity({causerId: ''+currentUserId, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subjectId: ''+application._id, action: actionEnum.MOVED, meta: {name: application.user.firstName + ' ' + application.user.lastName, jobId: job._id, jobTitle: job.title, from: previousProgress.stage.name, to: foundStage.name}});
    }

  } catch (error) {
    console.log(error);
  }

  return progress;
}


async function getApplicationQuestions(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  let result;
  try {


    let application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'questionSubmission',
        model: 'QuestionSubmission',
        populate: {
          path: 'answers',
          model: 'Answer',
          populate: {
            path: 'question',
            model: 'Question',

          }
        }
      }
    ]);


    if(application) {
      result = application.questionSubmission;
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}






async function getApplicationLabels(currentUserId, applicationId) {

  if(!currentUserId || !applicationId){
    return null;
  }

  let result;
  try {


    let application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'labels',
        model: 'Label'
      }]);

    if(application){
      retsult = application.labels;
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addApplicationLabel(currentUserId, applicationId, label) {

  if(!currentUserId || !applicationId || !label){
    return null;
  }

  let result;
  try {


    let application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'labels',
        model: 'Label'
      }]);


    if(application) {
      console.log(application)
      console.log(label);
      application.labels.push(label);

      // comment.applicationId = application._id;
      // comment.candidate = application.user;
      // comment.createdBy = currentUserId;
      result = await application.save();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function deleteApplicationLabel(currentUserId, applicationId, labelId) {

  if(!currentUserId || !applicationId || !labelId){
    return null;
  }

  let result;
  try {

    let application = await applicationService.findApplicationBy_Id(applicationId);


    if(application) {
      application = await application.update(
        { $pull: { labels: labelId } }
      );

    }

  } catch (error) {
    console.log(error);
  }

  return application.labels;
}



async function getApplicationComments(currentUserId, applicationId, filter) {

  if(!currentUserId || !applicationId || !filter){
    return null;
  }

  let result=[];
  try {


    result = await commentService.getComments(subjectType.APPLICATION, applicationId, filter);
    if(result) {
      let userIds = _.map(result.docs, 'createdBy');
      let users = await lookupUserIds(userIds);
      result.docs.forEach(function (comment) {
        let found = _.find(users, {id: comment.createdBy});
        if (found) {
          comment.createdBy = convertToTalentUser(found);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addApplicationComment(currentUserId, applicationId, comment) {

  if(!currentUserId || !applicationId || !comment){
    return null;
  }

  let result;
  try {


    let application = await applicationService.findApplicationBy_Id(applicationId);

    if(application) {
      comment.subjectType = subjectType.APPLICATION;
      comment.subjectId = application._id;
      comment.createdBy = currentUserId;
      result = await commentService.addComment(comment);

      // await application.comments.push(result._id);
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function deleteApplicationComment(currentUserId, applicationId, commentId) {

  if(!currentUserId || !applicationId || !commentId){
    return null;
  }

  let result;
  try {
    let comment = await commentService.findBy_Id(commentId);

    if(comment) {
      result = await comment.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function updateApplicationComment(currentUserId, applicationId, commentId, comment) {

  if(!currentUserId || !applicationId || !commentId || !comment){
    return null;
  }

  let result;
  try {


    let found = await commentService.findBy_Id(commentId);


    if(found) {
      found.message = comment.message;
      found.lastUpdatedDate = Date.now();
      result = await found.save()

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}




async function getApplicationEvaluations(companyId, currentUserId, candidateId, applicationId, progressId, filter) {

  if(!companyId || !currentUserId || !candidateId || !filter){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {


    result = await evaluationService.getEvaluations(candidateId, companyId, applicationId, progressId, filter);
    let userIds = _.map(result.docs, 'createdBy');
    let users = await lookupUserIds(userIds);

    console.log(users)
    result.docs.forEach(function(evaluation){
      let found = _.find(users, {id: evaluation.createdBy});
      if(found){
        evaluation.createdBy = convertToTalentUser(found);
      }
    });

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);
}


async function addApplicationProgressEvaluation(companyId, currentUserId, applicationId, applicationProgressId, form) {

  if(!companyId || !currentUserId || !applicationId || !applicationProgressId || !form){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {

    let application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'currentProgress',
        model: 'ApplicationProgress',
        populate: [{
          path: 'evaluations',
          model: 'Evaluation'
        },
        {
          path: 'stage',
          model: 'Stage'
        }]
      },
      {
        path: 'user',
        model: 'Candidate'
      }
    ]);


    if(application && application.currentProgress && !_.some(application.currentProgress.evaluations, {createdBy: currentUserId})) {

      form.createdBy = currentUserId;
      form.applicationId=ObjectID(applicationId);
      form.applicationProgressId=ObjectID(applicationProgressId);
      form.candidateId = application.user._id


      result = await evaluationService.addEvaluation(form);

      if(result){
        application.user.evaluations.push(result._id);
        application.currentProgress.evaluations.push(result._id);
        await application.currentProgress.save();
        await application.user.save();
        let job = await jobService.findJob_Id(application.jobId);
        let activity = await activityService.addActivity({causerId: ''+result.createdBy, causerType: subjectType.MEMBER, subjectType: subjectType.EVALUATION, subjectId: ''+result._id, action: actionEnum.ADDED, meta: {name: application.currentProgress.stage.name, jobId: job._id}});
      }
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function removeApplicationProgressEvaluation(companyId, currentUserId, applicationId, applicationProgressId) {

  if(!companyId || !currentUserId || !applicationId || !applicationProgressId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {
    result = await evaluationService.removeEvaluation(currentUserId, ObjectID(applicationProgressId));
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function disqualifyApplication(companyId, currentUserId, applicationId, disqualification) {

  if(!companyId || !currentUserId || !applicationId || !disqualification){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {

    result = await applicationService.disqualifyApplication(applicationId, disqualification.reason, member);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function revertApplication(companyId, currentUserId, applicationId, disqualification) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {

    result = await applicationService.revertApplication(applicationId, member);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function subscribeApplication(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {

    let subscription = {createdBy: currentUserId, subjectType: subjectType.APPLICATION, subjectId: ObjectID(applicationId)};
    result = await memberService.subscribe(subscription);

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function unsubscribeApplication(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {

    result = await memberService.unsubscribe(currentUserId, subjectType.APPLICATION, applicationId);

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function getApplicationActivities(companyId, currentUserId, applicationId, filter) {
  if(!companyId || !currentUserId || !applicationId || !filter){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {

    result = await activityService.findBySubjectTypeAndSubjectId(subjectType.APPLICATION, applicationId, filter);
    let userIds = _.map(result.docs, 'causerId');
    let users = await lookupUserIds(userIds);
    result.docs.forEach(function(activity){
      let found = _.find(users, {id: parseInt(activity.causerId)});
      if(found){
        activity.causer = convertToTalentUser(found);
      }
    });
    return new Pagination(result);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getBoard(currentUserId, jobId, locale) {

  if(currentUserId==null || jobId==null){
    return null;
  }

  let boardStages = [];
  let pipelineStages;
  let job = await jobService.findJob_Id(jobId, locale);

  let pipeline = await getPipelineByJobId(job._id);
  if(pipeline.stages) {


    let pipelineStages = pipeline.stages;


    let applicationsGroupByStage = await Application.aggregate([
      {$match: {jobId: job._id}},
      {$lookup: {from: 'applicationprogresses', localField: 'currentProgress', foreignField: '_id', as: 'currentProgress' } },
      {$unwind: '$currentProgress'},
      {$lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
      {$unwind: '$user'},
      {$project: {createdDate: 1, user: 1, email: 1, phoneNumber: 1, photo: 1, availableDate: 1, status: 1, hasFollowed: 1, sources: 1, note: 1, user: 1, jobTitle: 1, currentProgress: 1 }},
      {$group: {_id: '$currentProgress.stage', applications: {$push: "$$ROOT"}}}
    ]);


    applicationsGroupByStage.forEach(function(stage){
      stage.applications.forEach(function(app){
        app.user = convertToCandidate(app.user);
      })
    });

    pipelineStages.forEach(function(item){
      let found = _.find(applicationsGroupByStage, {'_id': item._id});
      if(found){


        item.applications = found.applications;
      }

      let stage = {_id: item._id, type: item.type, name: item.name, timeLimit: item.timeLimit, applications: item.applications}
      boardStages.push(stage);


    });
  }
  return boardStages;


}


// async function searchCandidates(currentUserId, company, filter, locale) {
//
//   if(!currentUserId || !company || !filter){
//     return null;
//   }
//
//   let result;
//   let select = '';
//   let limit = (filter.size && filter.size>0) ? filter.size:20;
//   let page = (filter.page && filter.page==0) ? filter.page:1;
//   let sortBy = {};
//   sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;
//
//   let options = {
//     limit:    limit,
//     page: parseInt(filter.page)+1
//   };
//
//   result = await applicationService.findCandidatesByCompanyId(company, filter);
//   let userIds = _.map(result.docs, 'id');
//   let users = await lookupUserIds(userIds)
//
//   for(var i=0; i<result.docs.length; i++){
//     let foundUser = _.find(users, {id: result.docs[i].id});
//     if(foundUser) {
//       foundUser.noOfMonthExperiences = 68;
//       foundUser.level = 'SENIOR'
//       foundUser.match = 87;
//
//       foundUser = convertToCandidate(foundUser);
//       foundUser.applications = result.docs[i].applications;
//       result.docs[i] = foundUser
//
//     }
//
//   };
//
//
//   return new Pagination(result);
//
// }

async function searchCandidates(currentUserId, company, filter, locale) {
  if(!currentUserId || !company || !filter){
    return null;
  }

  let result;
  let select = '';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  result = await candidateService.findByCompany(company, filter);

  if(result.docs.length) {
    let currentProgressIds = _.reduce(result.docs, function (res, candidate) {
      let currentProgresses = _.reduce(candidate.applications, function(res, app) {
        res.push(ObjectID(app.currentProgress));
        return res;
      }, []);

      res = res.concat(currentProgresses);
      return res;
    }, [])

    let progresses = await applicationProgressService.findApplicationProgresssByIds(currentProgressIds);
    for (i in result.docs) {
      result.docs[i].source = [];
      result.docs[i].tags = [];

      for(j in result.docs[i].applications){
        result.docs[i].applications[j].currentProgress = _.find(progresses, function(progress){
          return progress._id.equals(result.docs[i].applications[j].currentProgress)
        });
      }
      result.docs[i] = convertToCandidate(result.docs[i]);

    }


  }
  return new Pagination(result);

}



async function getCandidateById(currentUserId, company, candidateId, locale) {

  if(!currentUserId || !company || !candidateId){
    return null;
  }

  let result;

  let candidate = await candidateService.findByUserIdAndCompanyId(candidateId, company).populate([
    {
      path: 'applications',
      model: 'Application'
    },
    {
      path: 'tags',
      model: 'Label'
    },
    {
      path: 'sources',
      model: 'Label'
    }
    ]);

  if(candidate){
    candidate.match = 78;
    let partyLink = await getUserLinks(candidate.userId);
    if(partyLink){
      candidate.links = partyLink.links;
    }

    result = convertToCandidate(candidate);
  }

  return result;

}



async function addCandidateTag(companyId, currentUserId, candidateId, tags) {

  if(!companyId || !currentUserId || !candidateId || !tags){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findByUserId(candidateId);


    if(candidate) {
      for(index in tags){
        if(!tags[index]._id){
          let newLabel = {name: tags[index].name, type: 'TAG', company: companyId, createdBy: currentUserId};
          newLabel = await labelService.addLabel(newLabel);
          if(newLabel){
            tags[index]._id = newLabel._id;
          }
        }
      };

      let tagIds = _.reduce(tags, function(res, tag){
        res.push(tag._id);
        return res;
      }, []);

      candidate.tags = tagIds;
      result = await candidate.save();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function removeCandidateTag(companyId, currentUserId, candidateId, tagId) {

  if(!companyId || !currentUserId || !candidateId || !tagId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findByUserId(candidateId);

    for(const [i, tag] of candidate.tags.entries()){
      if(tag==tagId){
        candidate.tags.splice(i, 1);
        await candidate.save();
        result = {success: true};
      }
    }
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function addCandidateSource(companyId, currentUserId, userId, sources) {

  if(!companyId || !currentUserId || !userId || !sources){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findByUserIdAndCompanyId(userId, companyId);


    if(candidate) {
      for(index in sources){
        if(!sources[index]._id){
          let newLabel = {name: sources[index].name, type: 'SOURCE', company: companyId, createdBy: currentUserId  };
          newLabel = await labelService.addLabel(newLabel);
          if(newLabel){
            sources[index]._id = newLabel._id;
          }
        }
      };

      let sourceIds = _.reduce(sources, function(res, source){
        res.push(source._id);
        return res;
      }, []);

      candidate.sources = sourceIds;
      result = await candidate.save();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function removeCandidateSource(companyId, currentUserId, candidateId, sourceId) {

  if(!companyId || !currentUserId || !candidateId || !sourceId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findByUserId(candidateId);

    for(const [i, source] of candidate.sources.entries()){
      if(source==sourceId){
        candidate.sources.splice(i, 1);
        await candidate.save();
        result = {success: true};
      }
    }
  } catch (error) {
    console.log(error);
  }

  return result;
}



async function updateCandidatePool(company, currentUserId, candidateId, poolIds) {
  if(!company || !currentUserId || !candidateId || !poolIds){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = null;


  try {
    let pools = await poolService.findByCompany(company);
    if (pools) {
      for([i, pool] of pools.entries()){

        let existPool = _.find(poolIds, function(item){ console.log(item); return ObjectID(item).equals(pool._id); });
        if(!existPool){
          for(const [i, candidate] of pool.candidates.entries()){
            if(candidate==candidateId){
              pool.candidates.splice(i, 1);
            }
          }

          await pool.save();
        } else {
          let existCandidate= false;
          for(const [i, candidate] of pool.candidates.entries()){
            if(candidate==candidateId){
              existCandidate = true
            }
          }
          if(!existCandidate){
            pool.candidates.push(candidateId);
            await pool.save();
          }

        }


      }

    }



  } catch(e){
    console.log('addPoolCandidate: Error', e);
  }


  return result
}


/************************** DEPARTMENTS *****************************/
async function addCompanyDepartment(company, currentUserId, form) {
  form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await addDepartment(form);
    }
  } catch(e){
    console.log('addCompanyDepartment: Error', e);
  }


  return result
}

async function updateCompanyDepartment(company, departmentId, currentUserId, form) {
  form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!company || !currentUserId || !departmentId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let department = await Department.findById(departmentId);
      if(department){
        department.name = form.name;
        department.updatedBy = currentUserId;
        result = await department.save();
      }

    }
  } catch(e){
    console.log('updateCompanyDepartment: Error', e);
  }


  return result
}

async function deleteCompanyDepartment(company, departmentId, currentUserId) {
  if(!company || !currentUserId || !departmentId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let department = await Department.findById(departmentId);
      if(department){
        result = await department.delete();
        if(result){
          result = {deleted: 1};
        }

      }

    }
  } catch(e){
    console.log('deleteCompanyDepartment: Error', e);
  }


  return result
}

async function getCompanyDepartments(company, query, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getDepartments(company, query);

  return result;

}


/************************** QUESTIONTEMPLATES *****************************/
async function addCompanyQuestionTemplate(company, currentUserId, form) {
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      form.createdBy = currentUserId;
      form.company = company;
      result = await addQuestionTemplate(form);
    }
  } catch(e){
    console.log('addCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function updateCompanyQuestionTemplate(company, questionId, currentUserId, form) {
  if(!company || !currentUserId || !questionId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await updateQuestionTemplate(questionId, form);
    }
  } catch(e){
    console.log('updateCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function deleteCompanyQuestionTemplate(company, questionId, currentUserId) {
  if(!company || !currentUserId || !questionId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await deleteQuestionTemplate(questionId);

    }
  } catch(e){
    console.log('deleteCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function getCompanyQuestionTemplates(company, query, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getQuestionTemplates(company, query);

  return result;

}


/************************** PIPELINES *****************************/
async function addCompanyPipelineTemplate(company, currentUserId, form) {

  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  try {
    if (isPartyActive(currentParty)) {
      result = await addPipelineTemplate(form);
    }
  } catch(e){
    console.log('addCompanyPipeline: Error', e);
  }


  return result
}

async function updateCompanyPipelineTemplate(company, pipelineId, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!company || !currentUserId || !pipelineId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let pipeline = await getPipelineTemplateById(pipelineId);
      if(pipeline){
        pipeline.name = form.name;
        pipeline.updatedBy = currentUserId;
        pipeline.stages=form.stages;
        pipeline.category=form.category;
        pipeline.department=form.department;
        pipeline.type=form.type;
        result = await pipeline.save();
      }

    }
  } catch(e){
    console.log('updateCompanyPipeline: Error', e);
  }


  return result
}

async function deleteCompanyPipelineTemplate(company, pipelineId, currentUserId) {
  if(!company || !currentUserId || !pipelineId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let pipeline = await getPipelineTemplateById(pipelineId);
      if(pipeline){
        result = await pipeline.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyPipeline: Error', e);
  }


  return result
}

async function getCompanyPipelineTemplate(company, pipelineId, currentUserId, locale) {

  if(!company || !pipelineId || !currentUserId){
    return null;
  }

  let result = await getPipelineTemplateById(pipelineId);

  return result;

}

async function getCompanyPipelineTemplates(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getPipelineTemplates(company);

  return result;

}



/************************** ROLES *****************************/
async function addCompanyRole(company, currentUserId, form) {
  console.log('addCompanyRole', form)
  form = await Joi.validate(form, roleSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await roleService.addRole(form);
    }
  } catch(e){
    console.log('addCompanyRole: Error', e);
  }


  return result
}

async function updateCompanyRole(company, roleId, currentUserId, form) {
  form = await Joi.validate(form, roleSchema, { abortEarly: false });
  if(!company || !currentUserId || !roleId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let role = await Role.findById(roleId);
      if(role){
        role.name = form.name;
        role.updatedBy = currentUserId;
        role.privileges=form.privileges;
        role.description=form.description;
        result = await role.save();
      }

    }
  } catch(e){
    console.log('updateCompanyRole: Error', e);
  }


  return result
}

async function deleteCompanyRole(company, roleId, currentUserId) {
  if(!company || !currentUserId || !roleId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let role = await Role.findById(roleId);
      if(role){
        result = await role.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyRole: Error', e);
  }


  return result
}

async function getCompanyRoles(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await roleService.getRoles(company);

  return result;

}



/************************** LABELS *****************************/
async function addCompanyLabel(company, currentUserId, form) {
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      form.createdBy = currentUserId;
      result = await labelService.addLabel(form);
    }
  } catch(e){
    console.log('addCompanyLabel: Error', e);
  }


  return result
}

async function updateCompanyLabel(company, labelId, currentUserId, form) {
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!company || !currentUserId || !labelId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let label = await labelService.findById(labelId);
      if(label){
        label.name = form.name;
        label.updatedBy = currentUserId;
        label.type=form.type;
        result = await label.save();
      }

    }
  } catch(e){
    console.log('updateCompanyLabel: Error', e);
  }


  return result
}


async function deleteCompanyLabel(company, labelId, currentUserId) {
  if(!company || !currentUserId || !labelId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let label = await labelService.findById(labelId);
      if(label){
        result = await label.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyLabel: Error', e);
  }


  return result
}

async function getCompanyLabels(company, query, type, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await labelService.getLabels(company, query, type);

  return result;

}



async function inviteMembers(company, currentUserId, form) {

  if(!company || !currentUserId || !form){
    return null;
  }

  let result = await memberService.inviteMembers(company, currentUserId, form.emails, form.role);


  return result;

}


async function getCompanyMemberInvitations(company) {

  if(!company){
    return null;
  }

  let result = await memberService.getMemberInvitations(company);
  result.forEach(function(member){
    member.role = roleMinimal(member.role);
  });
  return result;

}


async function getCompanyMembers(company, query, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await memberService.getMembers(company, query);
  let userIds = _.map(result, 'userId');
  let users = await lookupUserIds(userIds);

  result.forEach(function(member){
    let found = _.find(users, {id: member.userId});
    if(found){
      member.firstName = found.firstName;
      member.lastName = found.lastName;
      member.avatar = found.avatar;
    }
    member.role = roleMinimal(member.role);
  });

  return result;

}


async function addCompanyMember(company, form, invitationId) {
  if(!company || !form || !invitationId){
    return null;
  }

  let result = null;
  try {
      let role = form.role;
      delete form.role

      result = await memberService.addMember(form, role, invitationId);

  } catch(e){
    console.log('addCompanyMember: Error', e);
  }


  return result
}

async function updateCompanyMember(company, memberId, currentUserId, form) {
  if(!company || !currentUserId || !memberId || !form){
    return null;
  }


  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      result = await memberService.updateMember(memberId, form);


    }
  } catch(e){
    console.log('updateCompanyMember: Error', e);
  }


  return result
}

async function updateCompanyMemberRole(company, memberId, currentUserId, role) {
  if(!company || !currentUserId || !memberId || !role){
    return null;
  }


  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      result = await memberService.updateMemberRole(memberId, role);


    }
  } catch(e){
    console.log('updateCompanyMember: Error', e);
  }


  return result
}

async function deleteCompanyMember(company, memberId, currentUserId) {
  if(!company || !currentUserId || !memberId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let member = await memberService.findMemberBy_Id(memberId);
      if(member){
        result = await member.delete();
        if(result){
          result = {deleted: 1};
        }

      }

    }
  } catch(e){
    console.log('deleteCompanyMember: Error', e);
  }


  return result
}




async function getCompanyPools(company, currentUserId, query, candidateId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await poolService.findByCompany(company, query);
  result.forEach(function(pool){
    pool.isIn = _.some(pool.candidates, ObjectID(candidateId))
  });

  return result;

}

async function addCompanyPool(company, form, currentUserId) {
  if(!company || !form){
    return null;
  }

  let result = null;
  try {

    result = await poolService.addPool(currentUserId, form);

  } catch(e){
    console.log('addCompanyPool: Error', e);
  }


  return result
}

async function updateCompanyPool(company, poolId, currentUserId, form) {
  if(!company || !currentUserId || !poolId || !form){
    return null;
  }


  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }


  let result = null;
  try {
    form.department = ObjectID(form.department);

    result = await poolService.updatePool(poolId, form);

  } catch(e){
    console.log('updateCompanyPool: Error', e);
  }


  return result
}

async function deleteCompanyPool(company, poolId, currentUserId) {
  if(!company || !currentUserId || !poolId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }


  let result = null;

  try {
    let pool = await poolService.findPoolBy_Id(poolId);
    if(pool){
      result = await pool.delete();
      if(result){
        result = {deleted: 1};
      }

    }


  } catch(e){
    console.log('deleteCompanyPool: Error', e);
  }


  return result
}

async function getPoolCandidates(company, currentUserId, poolId, sort) {
  if(!company || !poolId || !currentUserId){
    return null;
  }

  let result;
  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };



  try {
    let pool = await poolService.findPoolBy_Id(poolId);
    let candidateIds = pool.candidates;
    result = await candidateService.searchCandidates(candidateIds, options);
    for(i in result.docs){
      result.docs[i] = convertToCandidate(result.docs[i]);
    };
  } catch(e){
    console.log('getPoolCandidates: Error', e);
  }


  return new Pagination(result);
}

async function addPoolCandidates(company, poolId, candidateIds, currentUserId) {
  if(!company || !poolId || !candidateIds || !currentUserId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = null;


  try {
    let pool = await poolService.findPoolBy_Id(poolId);
    if (pool) {
      candidateIds.forEach(function(candidate){

        let exists = false;
        pool.candidates.forEach(function(item){
          if(item==candidate){
            exists = true;
          }
        });
        if (!exists) {
          pool.candidates.push(ObjectID(candidate));
        }
      })
      result = await pool.save();

    }



  } catch(e){
    console.log('addPoolCandidate: Error', e);
  }


  return result
}

async function removePoolCandidate(company, poolId, candidateId, currentUserId) {
  if(!company || !poolId || !candidateId || !currentUserId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = null;

  try {
    let pool = await poolService.findPoolBy_Id(poolId).populate('candidates');
    if (pool) {
      for(const [i, candidate] of pool.candidates.entries()){
        if(candidate.userId==candidateId){
          pool.candidates.splice(i, 1);
        }
      }
      await pool.save();
      result = {success: true};

    }

  } catch(e){
    console.log('addPoolCandidate: Error', e);
  }


  return result
}

async function removePoolCandidates(company, poolId, candidateIds, currentUserId) {
  if(!company || !poolId || !candidateIds || !currentUserId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = null;

  try {
    let pool = await poolService.findPoolBy_Id(poolId);
    if (pool && pool.candidates) {
      for(const [i, candidate] of pool.candidates.entries()){
        let exists = false;
        candidateIds.forEach(function(item){
          if(item==candidate){
            exists = true;
          }
        });
        if(exists){
          pool.candidates.splice(i, 1);
        }
      }
      await pool.save();
      result = {success: true};

    }

  } catch(e){
    console.log('addPoolCandidate: Error', e);
  }


  return result
}



async function getCompanyProjects(company, query, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await projectService.getProjects(company);

  return result;

}

async function addCompanyProject(company, form, currentUserId) {
  if(!company || !form){
    return null;
  }

  let result = null;
  try {

    result = await projectService.addProject(currentUserId, form);

  } catch(e){
    console.log('addCompanyProject: Error', e);
  }


  return result
}

async function updateCompanyProject(company, projectId, currentUserId, form) {
  if(!company || !currentUserId || !projectId || !form){
    return null;
  }


  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }


  let result = null;
  try {

    result = await projectService.updateProject(projectId, form);

  } catch(e){
    console.log('updateCompanyProject: Error', e);
  }


  return result
}

async function deleteCompanyProject(company, projectId, currentUserId) {
  if(!company || !currentUserId || !projectId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }


  let result = null;

  try {
    let project = await projectService.findProjectBy_Id(projectId);
    if(project){
      result = await project.delete();
      if(result){
        result = {deleted: 1};
      }

    }


  } catch(e){
    console.log('deleteCompanyProject: Error', e);
  }


  return result
}

async function getProjectCandidates(company, projectId, currentUserId) {
  if(!company || !projectId || !currentUserId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = [];


  try {
    let project = await projectService.findProjectBy_Id(projectId).populate('candidates');
    if(project){
      result = project.candidates;
    }


  } catch(e){
    console.log('getProjectCandidates: Error', e);
  }


  return result
}

async function addProjectCandidates(company, projectId, candidateIds, currentUserId) {
  if(!company || !projectId || !candidateIds || !currentUserId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = null;


  try {
    let project = await projectService.findProjectBy_Id(projectId);
    if (project) {
      candidateIds.forEach(function(candidate){

        let exists = false;
        project.candidates.forEach(function(item){
          if(item==candidate){
            exists = true;
          }
        });
        if (!exists) {
          project.candidates.push(candidate);
        }
      })
      result = await project.save();

    }



  } catch(e){
    console.log('addProjectCandidates: Error', e);
  }


  return result
}

async function removeProjectCandidate(company, projectId, candidateId, currentUserId) {
  if(!company || !projectId || !candidateId || !currentUserId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = null;

  try {
    let project = await projectService.findProjectBy_Id(projectId);
    if (project) {
      for(const [i, candidate] of project.candidates.entries()){
        if(candidate==candidateId){
          project.candidates.splice(i, 1);
        }
      }
      await project.save();
      result = {success: true};

    }

  } catch(e){
    console.log('removeProjectCandidate: Error', e);
  }


  return result
}

async function removeProjectCandidates(company, projectId, candidateIds, currentUserId) {
  if(!company || !projectId || !candidateIds || !currentUserId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = null;

  try {
    let project = await projectService.findProjectBy_Id(projectId);
    if (project && project.candidates) {
      for(const [i, candidate] of project.candidates.entries()){
        let exists = false;
        candidateIds.forEach(function(item){
          if(item==candidate){
            exists = true;
          }
        });
        if(exists){
          project.candidates.splice(i, 1);
        }
      }
      await project.save();
      result = {success: true};

    }

  } catch(e){
    console.log('removeProjetCandidates: Error', e);
  }


  return result
}



async function updateCandidateProject(company, currentUserId, candidateId, projectIds) {
  if(!company || !currentUserId || !candidateId || !projectIds){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, company);

  if(!member){
    return null;
  }

  let result = null;


  try {
    let projects = await projectService.findByCompany(company);
    if (projects) {
      for([i, project] of projects.entries()){

        let existproject = _.find(projectIds, function(item){ return ObjectID(item).equals(project._id); });
        if(!existproject){
          for(const [i, candidate] of project.candidates.entries()){
            if(candidate==candidateId){
              project.candidates.splice(i, 1);
            }
          }

          await project.save();
        } else {
          let existCandidate= false;
          for(const [i, candidate] of project.candidates.entries()){
            if(candidate==candidateId){
              existCandidate = true
            }
          }
          if(!existCandidate){
            project.candidates.push(candidateId);
            await project.save();
          }

        }


      }

    }



  } catch(e){
    console.log('updateCandidateProject: Error', e);
  }


  return result
}

async function subscribeJob(currentUserId, companyId, jobId) {
  if(!currentUserId || !companyId || !jobId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  let result;
  try {
    let subscription = {createdBy: currentUserId, subjectType: subjectType.JOB, subjectId: ObjectID(jobId)};
    result = await memberService.subscribe(subscription);
  } catch(e){
    console.log('subscribeJob: Error', e);
  }

  return result;
}



async function unsubscribeJob(currentUserId, companyId, jobId) {
  if(!memberId || !companyId || !jobId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  let result;
  try {
    result = await memberService.unsubscribe(memberId, jobId);
  } catch(e){
    console.log('unsubscribeJob: Error', e);
  }

  return result;
}




async function getFiles(companyId, currentUserId, applicationId) {
  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  let result=[];
  try {
    let application = await applicationService.findApplicationBy_Id(ObjectID(applicationId)).populate([
      {
        path: 'files',
        model: 'File'
      }
    ]);

    if (application) {
      result = application.files;
    }

  } catch(e){
    console.log('unsubscribeJob: Error', e);
  }

  return result;
}



