const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const md5File = require('md5-file');
const fs = require('fs');
const ejs = require('ejs');
const pdf = require('html-pdf');
var path = require('path');
var async = require("async");
var Promise = require('promise');
var FormData = require('form-data');
const ResumeParser = require('simple-resume-parser');


const config = require('../config/config');

let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/pagination');

let JobSearchParam = require('../const/jobSearchParam');
let SearchParam = require('../const/searchParam');

const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
let employmentTypeEnum = require('../const/employmentTypeEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');
const taskType = require('../const/taskType');
const stageType = require('../const/stageType');
const jobType = require('../const/jobType');
const notificationType = require('../const/notificationType');
const notificationEvent = require('../const/notificationEvent');


const awsService = require('../services/aws.service');
const {buildFileUrl, buildCompanyUrl, buildUserUrl, buildCandidateUrl, jobMinimal, categoryMinimal, roleMinimal, convertToCandidate, convertToTalentUser, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');
const paymentService = require('../services/api/payment.service.api');
const sovrenService = require('../services/api/sovren.service.api');
const affindaService = require('../services/api/affinda.service.api');
const userService = require('../services/user.service');

const companyService = require('../services/company.service');
const jobService = require('../services/jobrequisition.service');
const applicationService = require('../services/application.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getDepartments, addDepartment} = require('../services/companydepartment.service');
const pipelineTemplateService = require('../services/pipelineTemplate.service');

const pipelineService = require('../services/pipeline.service');
const applicationProgressService = require('../services/applicationprogress.service');
const roleService = require('../services/role.service');
const labelService = require('../services/label.service');
const memberService = require('../services/member.service');
const poolService = require('../services/pool.service');
const projectService = require('../services/project.service');
const activityService = require('../services/activity.service');
const commentService = require('../services/comment.service');
const noteService = require('../services/note.service');
const evaluationService = require('../services/evaluation.service');
const evaluationTemplateService = require('../services/evaluationtemplate.service');
const emailService = require('../services/email.service');
const emailTemplateService = require('../services/emailtemplate.service');
const questionTemplateService= require('../services/questiontemplate.service');
const candidateService = require('../services/candidate.service');
const jobViewService = require('../services/jobview.service');
const bookmarkService = require('../services/bookmark.service');
const departmentService = require('../services/companydepartment.service');
const cardService = require('../services/card.service');
const flagService = require('../services/flag.service');
const taskService = require('../services/task.service');
const stageService = require('../services/stage.service');
const emailCampaignService = require('../services/emailcampaign.service');
const sourceService = require('../services/source.service');
const fileService = require('../services/file.service');
const adService = require('../services/ad.service');
const checkoutService = require('../services/checkout.service');
const paymentProvider = require('../services/api/payment.service.api');
const calendarService = require('../services/api/calendar.service.api');
const parserService = require('../services/api/sovren.service.api');
const companyDepartmentService = require('../services/companydepartment.service');

const {findCurrencyRate} = require('../services/currency.service');

const {} = require('../services/company.service');
const JobRequisition = require('../models/jobrequisition.model');
const Application = require('../models/application.model');
const Role = require('../models/role.model');
const Department = require('../models/companydepartment.model');
const NotificationPreference = require('../models/notificationpreference.model');


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
  pipelineTemplateId: Joi.object().required(),
  stages: Joi.array().required(),
  autoRejectBlackList: Joi.boolean().optional(),
  stageMigration: Joi.array()
});


const labelSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  company: Joi.number().required()
});


module.exports = {
  getUserSession,
  registerNewUser,
  getCompany,
  updateCompany,
  uploadCompanyAvatar,
  getSubscriptions,
  getMarketSalary,
  getCompanyInsights,
  getInmailCredits,
  getTaxAndFee,
  getImpressionCandidates,
  getDashboard,
  searchCompany,
  addPaymentMethod,
  getCards,
  removeCard,
  verifyCard,
  updateSubscription,
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
  getJobMembers,
  updateJobMembers,
  updateJobApplicationForm,
  getJobAds,
  getBoard,
  publishJob,
  payJob,
  getJobInsights,
  getJobActivities,
  searchPeopleSuggestions,
  searchApplications,
  searchSources,
  removeSources,
  addSourceApplication,
  searchCampaigns,
  addApplication,
  getAllApplicationsEndingSoon,
  getApplicationById,
  updateApplicationProgress,
  getApplicationProgress,
  getApplicationQuestions,
  getApplicationLabels,
  addApplicationLabel,
  deleteApplicationLabel,
  getApplicationComments,
  addApplicationComment,
  deleteApplicationComment,
  updateApplicationComment,
  getEvaluationById,
  getApplicationEvaluations,
  searchApplicationEmails,
  addApplicationProgressEvaluation,
  removeApplicationProgressEvaluation,
  updateApplicationProgressEvent,
  removeApplicationProgressEvent,
  disqualifyApplication,
  revertApplication,
  deleteApplication,
  acceptApplication,
  rejectApplication,
  subscribeApplication,
  unsubscribeApplication,
  getApplicationActivities,
  addCandidate,
  importResumes,
  searchCandidates,
  getCandidateById,
  updateCandidateById,
  removeCandidateById,
  getCandidateEvaluations,
  getCandidateEvaluationsStats,
  getCandidateEvaluationById,
  getCandidatesSimilar,
  getCandidateActivities,
  addCandidateExperience,
  removeCandidateExperience,
  getCandidateExperiences,
  addCandidateEducation,
  getCandidateEducations,
  removeCandidateEducation,
  getCandidateSkills,
  addCandidateSkills,
  removeCandidateSkill,
  getCandidateAccomplishments,
  addCandidateLanguages,
  uploadAvatar,
  uploadCandidateResume,
  getCandidateResumes,
  assignCandidatesJobs,
  checkCandidateEmail,
  getAllCandidatesSkills,
  getCandidateNotes,
  addCandidateNote,
  removeCandidateNote,
  updateCandidateNote,
  addCandidateTag,
  removeCandidateTag,
  addCandidateSource,
  addCandidateSources,
  removeCandidateSource,
  updateCandidatePool,
  updatePeoplePool,
  getPeopleFlagged,
  addCompanyDepartment,
  updateCompanyDepartment,
  deleteCompanyDepartment,
  getCompanyDepartments,
  addCompanyQuestionTemplate,
  getCompanyQuestionTemplate,
  updateCompanyQuestionTemplate,
  deleteCompanyQuestionTemplate,
  deactivateCompanyQuestionTemplate,
  activateCompanyQuestionTemplate,
  getCompanyQuestionTemplates,
  addCompanyPipelineTemplate,
  updateCompanyPipelineTemplate,
  deleteCompanyPipelineTemplate,
  getCompanyPipelineTemplate,
  deactivateCompanyPipelineTemplate,
  activateCompanyPipelineTemplate,
  getCompanyPipelineTemplates,
  addCompanyRole,
  getCompanyRoles,
  updateCompanyRole,
  deleteCompanyRole,
  disableCompanyRole,
  enableCompanyRole,
  addCompanyLabel,
  getCompanyLabels,
  updateCompanyLabel,
  deleteCompanyLabel,
  inviteMembers,
  getCompanyMemberInvitations,
  cancelMemberInvitation,
  acceptMemberInvitation,
  getCompanyMembers,
  getCompanyMember,
  updateCompanyMember,
  updateCompanyMemberRole,
  deleteCompanyMember,
  getJobsSubscribed,
  getApplicationsSubscribed,
  getNotificationPreference,
  updateNotificationPreference,
  searchTasks,
  getCompanyPools,
  getCompanyPoolById,
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
  getProjectCandidates,
  addProjectCandidates,
  removeProjectCandidate,
  removeProjectCandidates,
  subscribeJob,
  unsubscribeJob,
  uploadApplication,
  getFiles,
  getCompanyEvaluationTemplates,
  addCompanyEvaluationTemplate,
  getCompanyEvaluationTemplate,
  updateCompanyEvaluationTemplate,
  deleteCompanyEvaluationTemplate,
  deactivateCompanyEvaluationTemplate,
  activateCompanyEvaluationTemplate,
  getEvaluationFilters,
  getCompanyEmailTemplates,
  addCompanyEmailTemplate,
  updateCompanyEmailTemplate,
  deleteCompanyEmailTemplate,
  deactivateCompanyEmailTemplate,
  activateCompanyEmailTemplate,
  searchContacts
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
  let user;
  let member = await memberService.findByUserId(currentUserId);
  if(!member){
    return;
  }

  user = member.toJSON();
  let companies = await companyService.findAllCompanyByMemberId(member._id);

  user.company = _.reduce(companies, function(res, co){
    let company = _.clone(co);
    const members = co.members;
    const found = _.find(members, { 'member': member._id});
    if(found){
      company.messengerId = found.messengerId;
    }
    company.noOfMembers = members.length;
    // company.members = [];
    company.roles = []
    company.isOwner = company.createdBy===currentUserId?true:false;
    company.role = _.omit(company.role, 'description');
    res.push(_.omit(company, ['members', 'roles']));
    return res;
  }, []);
  user.preferredCompany = _.some(companies, {companyId: preferredCompany})?preferredCompany:companies.length>0?companies[0].companyId:preferredCompany;

  return user;

}


async function registerNewUser(form) {

  if(!form ){
    return null;
  }

  let result, member;
  let response = await feedService.register({...form, primaryAddress: {...form.company.primaryAddress, type: 'BUSINESS'}});
  const { user } = response;
  if(user){
    let newMember = {
      createdBy: user.id,
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      phone: form.phoneNumber,
      email: form.email,
      timezone: user.timezone?user.timezone:'',
      preferTimeFormat: '',
      userId: user.id
    }

    member = await memberService.addMember(newMember);
    if(member){
      const company = await companyService.register(member, {...form.company});
    }

  }


  return member;

}


async function getCompany(currentUserId, companyId, locale) {

  if(!currentUserId || !companyId){
    return null;
  }

  let company = await companyService.findByCompanyId(companyId)
  if(company.partyType=='COMPANY'){
    company = await feedService.findCompanyById(companyId);
  }else {
    company = await feedService.findInstituteById(companyId);
  }
  return company;

}


async function updateCompany(companyId, currentUserId, form) {
  if(!currentUserId || !companyId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await companyService.update(companyId, currentUserId, form);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function uploadCompanyAvatar(companyId, currentUserId, req) {
  if(!currentUserId || !companyId || !req){
    return null;
  }

  console.log(companyId, currentUserId)
  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;
  try {
    // create formData for your request:
    // console.log(req.files)
    const thisForm = new FormData();
    const { files } = req;
    const { buffer } = files.file[0];
    // var formData = {
    //   name: 'file',
    //   file: {
    //     value:  fs.createReadStream(files.file[0].path),
    //     options: {
    //       filename: files.file[0].originalname,
    //       contentType: 'image/png'
    //     }
    //   }
    // };

    // thisForm.append('file', files.file[0]);
    // for (let i = 0; i < files.length; i++) {
    //   thisForm.append(files[i].name, files[i])
    // }
    // result = await feedService.uploadCompanyAvatar(companyId, currentUserId, thisForm);



    // thisForm.append('file', files.file[0]);
    // result = await feedService.uploadCompanyAvatar(25, currentUserId, thisForm);

    // passing a file buffer:
    const fileBuffer = Buffer.from(files.file[0].originalname, 'utf-8');
    thisForm.append('file', files.file[0]);

    // const response = await axios.post(`http://localhost:5000/api/company/${companyId}/upload/avatar`, thisForm, {
    //   // must getHeaders() from "formData" to define the boundaries of the appended data:
    //   headers: { ...thisForm.getHeaders() },
    // });

    result = await feedService.uploadCompanyAvatar(25, currentUserId, thisForm);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function getSubscriptions(companyId, currentUserId) {
  if(!currentUserId || !companyId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let subscriptions = [];
  try {
    let company = await companyService.findByCompanyId(companyId).populate('subscription');
    subscriptions = await paymentService.getCustomerSubscriptions(company.customerId);

  } catch (error) {
    console.log(error);
  }

  return subscriptions;
}

async function getMarketSalary(jobTitle) {

  if(!jobTitle){
    return null;
  }

  let result = {min: 15500, max: 25000, currency: 'USD'};
  return result;

}


async function getInmailCredits(companyId, currentUserId) {

  if(!companyId || !currentUserId){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let company = await companyService.findByCompanyId(companyId);

  return {credit: company.credit};

}


async function getTaxAndFee(companyId, currentUserId) {

  if(!companyId || !currentUserId){
    return null;
  }


  // let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  //
  // if(!memberRole){
  //   return null;
  // }


  return {taxRate: 9.5, fee: 25};

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


async function getImpressionCandidates(companyId, currentUserId, timeframe, type, level, jobId, sort, locale) {
  if(!currentUserId || !companyId || !sort){
    return null;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page+1:1;
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

  if(type) {
    if (type == 'viewed') {
      result = await jobViewService.getInsightCandidates(from, to, companyId, jobId, options);
    } else if (type == 'saved') {
      result = await bookmarkService.getInsightCandidates(from, to, companyId, jobId, options);
    } else if (type == 'applied') {
      result = await applicationService.getInsightCandidates(from, to, companyId, jobId, options);
    }
  }

  if(level){
    result = await companyService.getCompanyCandidateInsights(companyId, options);
  }

  if(result){
    let userIds = _.map(result.docs, 'partyId');
    let users = await feedService.lookupCandidateIds(userIds);
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

async function getDashboard(currentUserId, companyId) {


  if(!currentUserId || !companyId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result;
  let data = [];

  let company = await companyService.findByCompanyId(companyId);

  let newApplications = await applicationService.getLatestCandidates(companyId);

  newApplications.forEach(function(app){
    app.progress=[];
    app.user.avatar = buildCandidateUrl(app.user);
  });

  let mostViewed = await jobViewService.findMostViewedByCompany(company._id);
  let jobIds = _.map(mostViewed, '_id');

  let subscribes = [];
  if(jobIds){
    subscribes = await memberService.findSubscribeByUserIdAndSubjectTypeAndSubjectIds(currentUserId, subjectType.JOB, jobIds);
  }

  if(mostViewed){
    let company = await feedService.lookupCompaniesIds([companyId]);
    mostViewed.forEach(function(job){
      job.company = convertToCompany(company[0]);
      job.department = job.department?job.department[0]:null;
      job.hasSaved = _.some(subscribes, {subjectId: job._id});
    });
  }

  let applicationEndingSoon = await applicationService.applicationsEndingSoon(companyId);
  applicationEndingSoon.forEach(function(app){
    app.user.applications = [];
    app.user.evaluations = [];
    app.user.sources = [];
    app.user.tags = [];
    app.user.avatar = buildCandidateUrl(app.user);
  });

  let taskDueSoon = await taskService.getTasksDueSoon(member)
  let jobEndingSoon = await jobService.getJobsEndingSoon(companyId);
  let userIds = _.map(jobEndingSoon, 'createdBy');
  let users = await feedService.lookupUserIds(userIds);

  jobEndingSoon.forEach(function(job){
    job.created = _.find(users, {id: job.createdBy});
    job.skills = [];
    job.responsibilities = [];
    job.qualifications = [];
    job.minimalQualifications = [];
    job.members = [];
    job.tags = [];
  });

  result = {
    taskDueSoon: taskDueSoon,
    newApplications: newApplications,
    mostViewedJobs: mostViewed,
    applicationsEndingSoon: applicationEndingSoon,
    jobEndingSoon:jobEndingSoon
  }



  return result;

}


async function searchCompany(currentUserId, filter, sort) {

  if(currentUserId==null){
    return null;
  }

  let result = await memberService.searchCompanyByUserId(currentUserId, filter, sort);
  let companies = await companyService.findByCompanyIds(_.map(result.docs, 'company'), true);


  companies = _.reduce(companies, function(res, item){
    let found = _.find(result.docs, {company: item.companyId});
    item = convertToCompany(item);
    item.role = found.role;
    item.subscription = null;
    item.primaryAddress = null;
    item.customerId=null;
    item.memberId = found._id
    res.push(item)

    return res;
  }, [])

  result.docs = companies;
  return new Pagination(result);

}


async function searchJobs(currentUserId, companyId, query, filter, sort, locale) {

  if(!currentUserId || !companyId || !filter || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  filter.company = [companyId];
  filter.status = filter.status? filter.status:[statusEnum.ACTIVE, statusEnum.DRAFT];

  let result = await jobService.talentSearch(memberRole.member, query, filter, sort, locale);

  if(result) {
    let departmentIds = _.map(result.docs, 'department');
    let departments = await departmentService.findDepartmentsByCompany(companyId);
    let jobSubscribed = await memberService.findMemberSubscribedToSubjectType(memberRole.member._id, subjectType.JOB);

    result.docs.map(job => {
      job.department = _.find(departments, {_id: job.department});
      job.hasSaved = _.find(jobSubscribed, {subject: job._id})?true:false;
      job.createdBy.avatar = buildUserUrl(job.createdBy);
      return job;
    });

  }
  return new Pagination(result);

}


async function addPaymentMethod(companyId, currentUserId, form) {

  if(!companyId || !currentUserId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let company = await companyService.findByCompanyId(companyId);
  if(!company.customerId){
    let customer = {
      partyId: companyId,
      partyType: 'COMPANY',
      name: company.name,
      phone: form.card.phone,
      email: form.card.email,
      address: {
        address1: company.primaryAddress.address1,
        address2: company.primaryAddress.address2,
        city: company.primaryAddress.city,
        state: company.primaryAddress.state,
        country: company.primaryAddress.country,
        postalCode: company.primaryAddress.postalCode,
      }
    }

    customer = await paymentProvider.addCustomer(customer);
    if(customer){
      company.customerId = customer.id;
      await company.save();
    }
  }

  let result = await paymentProvider.addPaymentMethod(company.customerId, form);
  return result;
}


async function getCards(companyId, currentUserId) {

  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result = await cardService.findByCompany(companyId);
  result = _.reduce(result, function(res, c){
    res.push({id: c.id?c.id:'', brand: c.brand, last4: c.last4, isDefault: c.isDefault?true:false});
    return res;
  }, []);
  return result;
}


async function removeCard(companyId, currentUserId, cardId) {

  if(!companyId || !currentUserId || !cardId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result = null;
  let company = await companyService.findByCompanyId(companyId);
  if(company && company.customerId){
    result = await cardService.remove(company.customerId, cardId);
  }

  return result;
}


async function verifyCard(companyId, currentUserId, jobId, form) {

  if(!companyId || !currentUserId  || !jobId || !form){
    return null;
  }

  let result;
  let oneOrZero = (Math.random()>=0.5)? 1 : 0;

  if(oneOrZero) {
    let job = await jobService.findJob_Id(jobId);
    if (job) {
      job.status = statusEnum.ACTIVE;
      await job.save();
    }

    result = {success: true};
  } else {
    result = {success: false};
  }
  return result;
}


async function updateSubscription(companyId, currentUserId, subscription) {

  if(!companyId || !currentUserId  || !subscription){
    return null;
  }

  let result;
  let oneOrZero = (Math.random()>=0.5)? 1 : 0;

  if(oneOrZero) {
    let job = await jobService.findJob_Id(jobId);
    if (job) {
      job.status = statusEnum.ACTIVE;
      await job.save();
    }

    result = {success: true};
  } else {
    result = {success: false};
  }
  return result;
}


async function createJob(companyId, currentUserId, job) {
  if(!companyId || !currentUserId || !job){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return;
  }


  let result;
  // let currentParty = await feedService.findByUserId(currentUserId);

  // if (isPartyActive(currentParty)) {
  result = await jobService.addJob(companyId, memberRole.member, job);

  // }

  return result;
}

async function updateJob(companyId, currentUserId, jobId, form) {

  if(!companyId || !currentUserId || !jobId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  result = await jobService.updateJob(jobId, memberRole.member, form);

  return result;
}


async function closeJob(companyId, currentUserId, jobId) {

  if(!companyId || !currentUserId || !jobId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await jobService.closeJob(jobId, memberRole.member);

  return result;
}



async function archiveJob(companyId, currentUserId, jobId) {

  if(!companyId || !currentUserId || !jobId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await jobService.archiveJob(jobId, memberRole.member);

  return result;
}



async function unarchiveJob(companyId, currentUserId, jobId) {

  if(!companyId || !currentUserId || !jobId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await jobService.unarchiveJob(jobId, memberRole.member);

  return result;
}


async function deleteJob(companyId, currentUserId, jobId) {

  if(!companyId || !currentUserId || !jobId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let job = await jobService.findJob_Id(jobId);
  if(job){
    result = await job.delete();
  }


  return result;
}


async function getJobComments(companyId, currentUserId, jobId, filter) {

  if(!currentUserId || !jobId || !filter){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {


    result = await commentService.getComments(subjectType.JOB, jobId, filter);

    result.docs.forEach(function(comment){
      comment.createdBy = convertToTalentUser(comment.createdBy);
    });

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);
}

async function addJobComment(companyId, currentUserId, jobId, comment) {

  if(!currentUserId || !jobId || !comment){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
    let job = await jobService.findJob_Id(jobId);
    if(job) {
      comment.subjectType = subjectType.JOB;
      comment.subject = job;
      comment.createdBy = memberRole.member._id;
      result = await commentService.addComment(comment, memberRole.member);

    }


  return result;
}


async function deleteJobComment(companyId, currentUserId, jobId, commentId) {

  if(!currentUserId || !jobId || !commentId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result, job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    // job = await jobService.findJob_Id(jobId, locale);
    job = await jobService.findById(jobId, locale).populate('department').populate('tags').populate('members').populate('createdBy').populate('ads').populate('searchAd').populate('pipeline');
    console.log(job)
    if(job) {

      let noOfApplied = await applicationService.findAppliedCountByJobId(job._id);
      job.noOfApplied = noOfApplied;

      if(job.industry) {
        const industry = await feedService.findIndustry('', job.industry, locale);
        job.industry = industry;
      }

      if(job.joFunction) {
        let jobFunction = await feedService.findJobfunction('', job.jobFunction, locale);
        if (jobFunction.length) {
          job.jobFunction = jobFunction[0];
        }
      }

      if(job.category){
        let cateogry = await feedService.findCategoryByShortCode(job.category, locale);
        job.category = categoryMinimal(cateogry);
      }

      if(job.skills && job.skills.length) {
        let jobSkills = await feedService.findSkillsById(job.skills);
        job.skills = jobSkills;
      }

      for(let [i, ad] of job.ads.entries()){
        if(ad.feedId){
          job.feedId = ad.feedId;
        }
      }


      // let userIds = _.map(job.members, 'userId');
      // userIds.push(job.createdBy)
      // let users  = await lookupUserIds(userIds);


      // job.createdBy = _.find(users, {id: job.createdBy});
      // job.members.forEach(function(member){
      //   let found = _.find(users, {id: member.userId});
      //
      //   if(found){
      //     member.avatar = found.avatar?found.avatar:'';
      //   }
      // });

      job.hasSaved = _.some(memberRole.member.followedJobs, job._id);


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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await jobService.updateJobPipeline(jobId, form, currentUserId);

  return result
}


async function getJobPipeline(companyId, jobId, currentUserId) {
  if(!companyId || !jobId || !currentUserId){
    return null;
  }

  let result = null;

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  try {
    result = await jobService.getJobPipeline(jobId);
    result.stages = _.reduce(result.stages, function(res, stage){
      stage.tasks = _.reduce(stage.tasks, function(res, task){
        task.members = _.reduce(task.members, function(res, member){
          member.avatar = buildUserUrl(memberRole.member);
          res.push(member);
          return res;
        }, []);

        res.push(task);
        return res;
      }, []);
      res.push(stage);
      return res;
    }, []);

  } catch(e){
    console.log('getJobPipeline: Error', e);
  }


  return result
}


async function getJobMembers(jobId) {
  let result;
  try {
    result = await jobService.getJobMembers(jobId);

  } catch(e){
    console.log('updateJobMember: Error', e);
  }


  return result
}

async function updateJobMembers(companyId, currentUserId, jobId, members) {
  if(!companyId || !currentUserId  || !jobId || !members){
    return null;
  }

  let result = null;
  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  try {
    result = await jobService.updateJobMembers(jobId, members, currentUserId);

  } catch(e){
    console.log('updateJobMember: Error', e);
  }


  return result
}


async function updateJobApplicationForm(companyId, currentUserId, jobId, form) {
  if(!companyId || !currentUserId || !jobId || !form){
    return null;
  }

  let result = null;
  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  try {
    result = await jobService.updateJobApplicationForm(jobId, form, currentUserId);

  } catch(e){
    console.log('updateJobApplicationForm: Error', e);
  }


  return result
}


async function getJobAds(companyId, currentuserId, jobId) {
  let result;
  try {
    let job = await jobService.getJobAds(jobId);
    if (job){
      let ads = _.reduce(job.ads, function(res, ad){
        if(ad.endTime>Date.now()){
          res.push(ad);
        }
        return res;
      }, []);

      result = {today: Date.now(), suggestedBudget: 3.80, searchAd: job.searchAd, ads: job.ads}
    }

  } catch(e){
    console.log('getJobAds: Error', e);
  }


  return result
}


async function publishJob(companyId, currentUserId, jobId, type) {
  if(!companyId  || !currentUserId || !jobId || !type){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result = null;
  let job = await jobService.findJob_Id(jobId);
  if(job){
    job.type = type;
    job.status = statusEnum.ACTIVE;

    let publishedDate = Date.now();
    job.originalPublishedDate = !job.originalPublishedDate?publishedDate:job.originalPublishedDate;
    job.publishedDate = publishedDate;
    job = await job.save();

    job.skills = await feedService.findSkillsById(job.skills);


    await activityService.addActivity({
      causer: memberRole.member._id,
      causerType: subjectType.MEMBER,
      subjectType: subjectType.JOB,
      subject: job._id,
      action: actionEnum.PUBLISHED,
      meta: {type: type, job: job._id}
    });

    // var promise = new Promise(function (resolve, reject) {
    //
    //   const data = {
    //     font: {
    //       "color" : "green",
    //       "include": "https://api.****.com/parser/v3/css/combined?face=Kruti%20Dev%20010,Calibri,DevLys%20010,Arial,Times%20New%20Roman"
    //     },
    //     job: job
    //   };
    //
    //   const filePathName = path.resolve(__dirname, '../templates/jobtopdf.ejs');
    //   const htmlString = fs.readFileSync(filePathName).toString();
    //   let  options = { format: 'Letter', "height": "10.5in", "width": "8in", "border": "0",  };
    //   const ejsData = ejs.render(htmlString, data);
    //
    //
    //   pdf.create(ejsData, options).toFile('job_' + job.jobId +' .pdf',(err, response) => {
    //     if (err) reject(err);
    //     resolve(response);
    //   });
    // }).then(function(res){
    //   parserService.uploadJob(res.filename);
    // }).then(function(res){
    //   console.log('finally')
    //   result = res;
    // });


// job = await parserService.uploadJob(filePath);

  }

  return job;
}


async function payJob(companyId, currentUserId, jobId, form) {

  if(!companyId  || !currentUserId || !jobId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result = {success: false, verification: false};
  let job = await jobService.getJobAds(jobId)

  console.log(form)
  if(job) {
    let company = await companyService.findByCompanyId(companyId).populate('subscription');
    form.customer = {id: company.customerId};
    if(company.customerId) {
      console.log('customerId', company.customerId)
      if (form.dailyBudget) {
        console.log('budget', form.dailyBudget)
        if(job.searchAd){
          job.searchAd.bidAmount = form.dailyBudget;
          console.log('saving new budget', job.searchAd)
          await job.searchAd.save();
        } else {
          let startTime = new Date();
          let endTime = new Date();
          endTime.setDate(endTime.getDate() + 30);
          endTime.setHours(23);
          endTime.setMinutes(59);
          let ad = {
            lifetimeBudget: form.dailyBudget * 30,
            startTime: startTime.getTime(),
            endTime: endTime.getTime(),
            bidAmount: form.dailyBudget,
            targeting: {
              ageMin: 0,
              ageMax: 100,
              genders: [],
              geoLocations: {countries: [job.country]},
              adPositions: ['jobsearch']
            }
          };
          ad = await adService.add(ad);
          job.searchAd = ad;
        }

      }

      if (form.cart.items.length) {
        let checkout = await checkoutService.payJob(memberRole.member, form);
        if (checkout) {
          let products = await paymentProvider.lookupProducts(_.map(form.cart.items, 'id'));
          for (const [i, product] of products.entries()) {

            let startTime = new Date();
            let endTime = new Date();
            endTime.setDate(endTime.getDate() + parseInt(product.durationDay));
            endTime.setHours(23);
            endTime.setMinutes(59);

            let ad = {
              productId: product.id,
              name: product.name,
              lifetimeBudget: product.listPrice,
              startTime: startTime.getTime(),
              endTime: endTime.getTime(),
              bidAmount: 0,
              targeting: {
                ageMin: 0,
                ageMax: 100,
                genders: [],
                geoLocations: {countries: [job.country]},
                adPositions: [product.adPosition]
              }
            };

            if (product.adPosition == 'feed') {
              let feed = await feedService.createJobFeed(job.jobId, company.partyType, company.companyId, job.description, memberRole.member.userId);
              if (feed) {
                ad.feedId = feed.id;
              }
            }

            ad = await adService.add(ad);
            job.ads.push(ad);
          }
        }
      }

      job.status = statusEnum.ACTIVE;
      job.publishedDate = Date.now();
      job.type = jobType.PROMOTION;
      job = await job.save();

      await activityService.addActivity({
        causer: memberRole.member._id,
        causerType: subjectType.MEMBER,
        subjectType: subjectType.JOB,
        subject: job._id,
        action: actionEnum.PROMOTED,
        meta: {type: jobType.PROMOTION, job: job._id}
      });
      result = {success: true, verification: false};
    }
    // } else {
    //   result = { success: false, verification: true };
    // }

  }
  return result;
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

  let applicationByStages = await applicationService.getApplicationsStagesByJobId(jobId);
  result.stages = applicationByStages;

  let job = await jobService.findById(jobId).populate([
    {path: 'searchAd', model: 'Ad'},
    {path: 'ads', model: 'Ad'}
  ]);
  console.log(job.searchAd)
  let ads = {
    budget: job.searchAd?{lifetimeBudget: parseInt(job.searchAd.lifetimeBudget), remainingBudget: 100, startTime: job.searchAd.startTime, endTime: job.searchAd.endTime, bidAmount: job.searchAd.bidAmount}:null,
    ads: job.ads? _.reduce(job.ads, function(res, ad){

      ad.targeting=null;
      res.push(ad);
      return res;
      }, []):[]
  };
  result.advertising = ads;

  return result;

}


async function getJobActivities(companyId, currentUserId, jobId, filter) {
  if(!companyId || !currentUserId || !jobId || !filter){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await activityService.findByJobId(companyId, jobId, filter);
    // let userIds = _.map(result.docs, 'causerId');
    // let users = await feedService.lookupUserIds(userIds);
    // result.docs.forEach(function(activity){
    //   let found = _.find(users, {id: parseInt(activity.causerId)});
    //   if(found){
    //     activity.causer = convertTstagsoTalentUser(found);
    //   }
    // });
    return new Pagination(result);

  } catch (error) {
    console.log(error);
  }

  return result;

}


async function searchPeopleSuggestions(companyId, currentUserId, jobId, filter, sort) {
  if(!companyId || !currentUserId || !jobId || !filter || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!membermemberRole){
    return null;
  }

  let result;
  try {

    filter.jobTitles = ["Sr. Manager"];
    filter.location = ["US", "Vietnam"]
    result = await feedService.searchPeople(filter, sort);
    result.content = _.reduce(result.content, function(res, people){

      people.employer = convertToCompany(people.employer);
      people = convertToCandidate(people);
      res.push(people);
      return res;
    }, []);
  } catch (error) {
    console.log(error);
  }

  return result;

}



async function searchApplications(companyId, currentUserId, jobId, filter, sort, locale) {
  if(!companyId || !currentUserId || !jobId || !filter){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await applicationService.search(jobId, filter, sort);

  let applicationSubscribed = await memberService.findMemberSubscribedToSubjectType(memberRole.member._id, subjectType.APPLICATION);
  result.docs.forEach(function(app){
    app.labels = [];
    app.note = [];
    app.comments = [];
    if(_.some(applicationSubscribed, {subjectId: ObjectID(app._id)})){
      app.hasFollowed = true;
    }
    app.hasFollowed = _.some(applicationSubscribed, {subject: ObjectID(app._id)});
    app.user.avatar = buildCandidateUrl(app.user);
    app.user = convertToCandidate(app.user);
  })

  return new Pagination(result);


}



async function searchSources(companyId, currentUserId, filter, sort, locale) {

  if(!companyId || !currentUserId || !filter){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await sourceService.search(filter, sort);
  // let userIds = _.map(result.docs, 'user');
  // let users = await feedService.lookupUserIds(userIds);


  let subscriptions = await memberService.findMemberSubscribedToSubjectType(currentUserId, subjectType.APPLICATION);

  result.docs.forEach(function(source){

    source.candidate.firstName = source.candidate.firstName?source.candidate.firstName:source.candidate.email;
    source.candidate.avatar = buildCandidateUrl(source.candidate);
    source.candidate = convertToCandidate(source.candidate);
    source.candidate.educations = [];
    source.candidate.experiences = [];

    let hasApplied = _.find(source.campaigns, function(o){return o.application;})? true:false;
    source.hasApplied = (hasApplied || _.some(source.candidate.applications, {job: filter.jobs[0]}) )? true: false;

  })

  return new Pagination(result);


}




async function removeSources(companyId, currentUserId, sourceIds) {

  if(!companyId || !currentUserId || !sourceIds){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await sourceService.remove(sourceIds);

  return {success: true};


}





async function addSourceApplication(companyId, currentUserId, jobId, sourceId, application) {

  if(!companyId || !currentUserId || !jobId || !sourceId || !application){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let progress;
  try {

    let source = await sourceService.findById(sourceId).populate('candidate').populate('job');

    if(source) {
      let stage = application.stage;
      delete application.stage;
      application.user = source.candidate._id;
      application.partyId= source.candidate.userId;
      application.jobId =source.job._id;
      application.jobTitle = source.job.jobTitle;
      application.company= source.job.company;

      application = await applicationService.apply(application);

    }
  } catch (error) {
    console.log(error);
  }

  return application;
}



async function searchCampaigns(companyId, currentUserId, jobId, filter, sort, locale) {

  if(!companyId || !currentUserId || !jobId || !filter || !sort){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await emailCampaignService.search(jobId, filter, sort);
  // let userIds = _.map(result.docs, 'user');
  // let users = await feedService.lookupUserIds(userIds);

  return new Pagination(result);
}


async function searchCompanyApplications(currentUserId, companyId, filter, locale) {

  if(!currentUserId || !companyId || !filter){
    return null;
  }

  let results = await applicationService.findApplicationsByCompany(companyId, filter);

  let userIds = _.map(results.content, 'user');
  let users = await feedService.lookupUserIds(userIds);

  results.content.forEach(function(app){
    let user = _.find(users, {id: app.user});
    if(user){
      app.user = user;
    }
  })

  return results;

}



async function addApplication(companyId, currentUserId, application ) {


  if(!companyId || !currentUserId || !application){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }


  let savedApplication;
  try {
    let foundApplication = await applicationService.findApplicationByCandidateIdAndJobId(application.user, application.jobId);
    if(!foundApplication) {

      // ToDo: Need to be able to add manual candidate w/o application.user(candidateId)
      let candidate = await candidateService.findById(application.user);

      let job = await jobService.findById(application.jobId).populate('createdBy');
      if (job && candidate) {
        candidate.email = application.email;
        candidate.phoneNumber = application.phoneNumber;
        candidate.firstName = application.firstName;
        candidate.lastName = application.lastName;
        candidate.hasApplied = true;

        application.jobTitle = job.title;
        application.partyId = candidate.userId;
        application.job = job._id;
        application.user = candidate._id;
        application.company = companyId;


        savedApplication = await applicationService.add(application, member);
        await candidate.save();

        let campaign = await emailCampaignService.findByToken(application.token);
        if(campaign) {
          let exists = _.find(campaign.stages, {type: emailCampaignStageType.SAVED});
          if (!exists) {

            let currentStageIndex = _.findIndex(campaign.stages, {type: emailCampaignStageType.APPLIED});
            let stage = await emailCampaignStageService.add({type: emailCampaignStageType.SAVED, organic: true});
            if (currentStageIndex > 0) {
              campaign.stages.splice((currentStageIndex - 1), 0, stage._id);

            } else {
              campaign.stages.push(stage._id);
              campaign.currentStage = stage._id;
            }
            await campaign.save();
          }
        }

      }
    }

  } catch (error) {
    console.log(error);
    return savedApplication;
  }

  return savedApplication;
}


async function getAllApplicationsEndingSoon(companyId, currentUserId, sort, locale) {

  if(!companyId || !currentUserId || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result = await applicationService.getAllAapplicationsEndingSoon(companyId, sort);

  return new Pagination(result);


}


async function getApplicationById(companyId, currentUserId, applicationId) {

  if(!companyId  || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let application;
  try {

    application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'progress',
        model: 'ApplicationProgress',
        populate: [
          {
            path: 'stage',
            model: 'Stage'
          },
          {
            path: 'attachment',
            model: 'File'
          },
          {
            path: 'candidateAttachment',
            model: 'File'
          },
          {
            path: 'emails',
            model: 'Email'
          },
          {
            path: 'evaluations',
            model: 'Evaluation'
          }
        ]
      },
      {
        path: 'user',
        model: 'Candidate'
      },
      {
        path: 'resume',
        model: 'File'
      },
      {
        path: 'offerLetter',
        model: 'File'
      }
    ]);
    let eventIds = _.map(application.progress, 'event');
    eventIds = _.reduce(eventIds, function (res, id) {
      if (!isNaN(id)) {
        res.push(parseInt(id));
      }

      return res;
    }, []);



    if (application) {
      application = application.toJSON();
      let requiredEvaluation = false;
      let hasEvaluated = false
      let noOfEvaluations = 0;
      let rating = 0;
      for ([i, progress] of application.progress.entries()) {
        for ([i, evaluation] of progress.evaluations.entries()) {
          rating += evaluation.rating
          noOfEvaluations += 1;
        }


        if (progress.attachment) {
          progress.attachment.path = config.cdn + "/" + progress.attachment.path;
        }

        if (progress.candidateAttachment) {
          progress.candidateAttachment.path = config.cdn + "/" + progress.candidateAttachment.path;
        }

        if (progress.event) {
          let events;
          try{
            events = await calendarService.lookupEvents(eventIds);
          } catch(err){
            consoe.log(err)
          }

          if(events){
            let event = _.find(events, {eventId: progress.event});
            if(event){
              event.eventTopic = null;
              event.meta = null;
              progress.event = event;
            }
          }
        }

        hasEvaluated = _.some(progress.evaluations, {createdBy: memberRole.member._id});
        if(progress.stage) {
          progress.stage.tasks.forEach(function (task) {
            if (task.type === taskType.EMAIL) {
              task.isCompleted = progress.emails.length ? true : false;
              task.required = (!progress.emails.length) ? true : false;
            }

            if (task.type === taskType.EVENT) {
              task.isCompleted = progress.event ? true : false;
              task.required = (!progress.event) ? true : false;
            }

            if (task.type === taskType.EVALUATION) {
              task.isCompleted = hasEvaluated;
              task.required = (!hasEvaluated) ? true : false;
            }
          });
          progress.stage.members = [];
        }

        if (progress._id.equals(application.currentProgress)) {
          application.currentProgress = progress
        }


        // progress.stage.evaluations = [];

        // progress.stage.tasks = [];
        progress.evaluations = [];
        // progress.emails = [];

      }

      application.progress = _.orderBy(application.progress, p => { return p.stage.stageId; }, ['asc']);

      application.noOfEvaluations = noOfEvaluations;
      application.rating = Math.round(rating / noOfEvaluations * 10) / 10;

      if(application.user.userId){
        let user = await feedService.findCandidateById(application.user.userId);
        const experiences = _.reduce(application.user.experiences, function(res, exp){res.push(exp); return res;}, user.experiences);
        const educations = _.reduce(application.user.educations, function(res, edu){res.push(edu); return res;}, user.educations);
        application.user = {...application.user, educations: educations, experiences: experiences};
        application.user = convertToCandidate(application.user);
      }
      // application.user = convertToCandidate(application.user);
    }

  } catch (error) {
    console.log(error);
  }

  return application;
}


async function rejectApplication(companyId, currentUserId, jobId, applicationId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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


async function updateApplication(companyId, currentUserId, jobId, applicationId, newStatus) {

  if(!companyId || !jobId || !applicationId || !currentUserId || !newStatus){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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

async function updateApplicationProgress(companyId, currentUserId, applicationId, newStage) {

  if(!companyId || !currentUserId || !applicationId || !newStage){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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


    let foundStage;
    if(application) {
      let job = await jobService.findById(application.jobId).populate('createdBy');

      let previousProgress = application.currentProgress;
      _.forEach(application.progress, function(item){
        if(item.stage._id.equals(ObjectID(newStage))){
          progress = item;
          foundStage = item.stage;
        }
      });


      if(progress){
        application.currentProgress = progress;
        newStage = progress.stage;
        await application.save();

      } else {
        let pipeline = await pipelineService.findById(job.pipeline);
        if(pipeline) {
          foundStage = _.find(pipeline.stages, {_id: ObjectID(newStage)});

          if(foundStage) {
            progress = await  applicationProgressService.addApplicationProgress({
              applicationId: application.applicationId,
              stage: foundStage
            });

            newStage = foundStage;
            let taskMeta = {applicationId: application._id, applicationProgressId: application.currentProgress._id};
            await stageService.createTasksForStage(foundStage, '', taskMeta);
            application.currentProgress = progress;
            application.progress.push(progress);
            application.progress = _.orderBy(application.progress, ['stageId'], []);
            await application.save();

          }
        }
      }


      let activity = await activityService.addActivity({causer: memberRole.member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.MOVED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user, job: job._id, jobTitle: job.title, from: previousProgress.stage.name, to: newStage.name}});

      //Create Notification
      let meta = {
        applicationId: application._id,
        jobId: job._id,
        jobTitle: job.title,
        candidateId: application.user._id,
        userId: application.user.userId,
        name: application.user.firstName + ' ' + application.user.lastName,
        avatar: application.user.avatar,
        stageName: foundStage.name
      };

      await await feedService.createNotification(job.createdBy.userId, companyId, notificationType.APPLICATION, notificationEvent.APPLICATION_PROGRESS_UPDATED, meta);

    }
  } catch (error) {
    console.log(error);
  }

  return progress;
}

async function getApplicationProgress(companyId, currentUserId, applicationId, progressId) {

  if(!companyId || !currentUserId || !applicationId || !progressId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let progress;
  try {

    progress = await applicationProgressService.findById(progressId).populate([
      {
        path: 'stage',
        model: 'Stage'
      },
      {
        path: 'attachment',
        model: 'File'
      },
      {
        path: 'candidateAttachment',
        model: 'File'
      },
      {
        path: 'emails',
        model: 'Email'
      },
      {
        path: 'evaluations',
        model: 'Evaluation'
      }
    ]);


    if(progress) {
      let rating = 0;
      let noOfEvaluations = 0;

      for ([i, evaluation] of progress.evaluations.entries()) {
        rating += evaluation.rating
        noOfEvaluations += 1;
      }

      let events = await calendarService.lookupEvents([progress.event]);


      if (progress.attachment) {
        progress.attachment.path = config.cdn + "/" + progress.attachment.path;
      }

      if (progress.candidateAttachment) {
        progress.candidateAttachment.path = config.cdn + "/" + progress.candidateAttachment.path;
      }

      if (progress.event) {
        let event = _.find(events, {eventId: progress.event});
        if(event){
          event.eventTopic = null;
          event.meta = null;
          progress.event = event;
        }

      }


      hasEvaluated = _.some(progress.evaluations, {createdBy: memberRole.member._id});
      progress.stage.tasks.forEach(function (task) {
        if (task.type === taskType.EMAIL) {
          task.isCompleted = progress.emails.length ? true : false;
          task.required = (!progress.emails.length) ? true : false;
        }

        if (task.type === taskType.EVENT) {
          task.isCompleted = progress.event ? true : false;
          task.required = (!progress.event) ? true : false;
        }

        if (task.type === taskType.EVALUATION) {
          task.isCompleted = hasEvaluated;
          task.required = (!hasEvaluated) ? true : false;
        }
      });


      progress.noOfEvaluations = progress.evaluations.length;
      progress.noOfEmails = progress.emails.length;
      progress.noOfEvents = progress.event?1:0;
      progress.stage.members = [];
      progress.evaluations = [];
      progress.emails = [];
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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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






async function getApplicationLabels(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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

async function addApplicationLabel(companyId, currentUserId, applicationId, label) {

  if(!companyId || !currentUserId || !applicationId || !label){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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


async function deleteApplicationLabel(companyId, currentUserId, applicationId, labelId) {

  if(!companyId || !currentUserId || !applicationId || !labelId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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



async function getApplicationComments(companyId, currentUserId, applicationId, filter) {

  if(!companyId || !currentUserId || !applicationId || !filter){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result=[];
  try {


    result = await commentService.getComments(subjectType.APPLICATION, applicationId, filter);
    if(result) {
      let userIds = _.map(result.docs, 'createdBy');
      let users = await feedService.lookupUserIds(userIds);
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

  return new Pagination(result);
}

async function addApplicationComment(companyId, currentUserId, applicationId, comment) {

  if(!companyId || !currentUserId || !applicationId || !comment){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;

  let application = await applicationService.findApplicationBy_Id(applicationId).populate('user').populate('job');
  if(application) {
    comment.subjectType = subjectType.APPLICATION;
    comment.subject = application;
    comment.createdBy = memberRole.member._id;
    result = await commentService.addComment(comment, memberRole.member);
    if(result){
      application.noOfComments++;
      await application.save();
    }
  }
  return result;
}


async function deleteApplicationComment(companyId, currentUserId, applicationId, commentId) {

  if(!companyId || !currentUserId || !applicationId || !commentId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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

async function getEvaluationById(companyId, currentUserId, evaluationId) {
  if(!companyId || !currentUserId || !evaluationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result=[];
  try {
    result = await evaluationService.findById(ObjectID(evaluationId));

  } catch(e){
    console.log('getEvaluationById: Error', e);
  }

  return result;
}

async function getApplicationEvaluations(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result, stats = {}, rating = 0;
  try {

    result = await evaluationService.findByApplicationId(applicationId);
    if(result){
      const fields = _.keys(_.omit(result[0].assessment.toJSON(), ['_id', 'createdBy', 'candidateId', 'createdDate']));
      stats = _.reduce(fields, function(res, field){
        res[field] = _.meanBy(result, function(o) { return o.assessment[field]; });
        return res;
      }, {});

      rating = _.meanBy(result, function(o){ return o.rating});
    }
    // result.docs.forEach(function(evaluation){
    //     evaluation.createdBy = convertToTalentUser(evaluation.createdBy);
    // });

  } catch (error) {
    console.log(error);
  }

  return {rating: rating, stats: stats, evaluations: result};
}


async function searchApplicationEmails(currentUserId, companyId, applicationId, sort, locale) {
  if(!currentUserId || !companyId || !applicationId || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }


  let result = await applicationService.searchEmails(companyId, member, applicationId, sort);

  return new Pagination(result);

}



async function addApplicationProgressEvaluation(companyId, currentUserId, applicationId, applicationProgressId, form) {

  if(!companyId || !currentUserId || !applicationId || !applicationProgressId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    let application = await applicationService.findById(applicationId).populate([
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

      form.createdBy = memberRole.member._id;
      form.applicationId=ObjectID(applicationId);
      form.applicationProgressId=ObjectID(applicationProgressId);
      form.candidateId = application.user._id;
      form.partyId = application.partyId;
      form.companyId = companyId;


      result = await evaluationService.add(form);

      if(result){
        result.applicationProgressId = application.currentProgress;
        result.createdBy = memberRole.member;

        application.user.evaluations.push(result._id);
        application.currentProgress.evaluations.push(result._id);
        await application.currentProgress.save();
        await application.user.save();
        let job = await jobService.findJob_Id(application.jobId);

        let activity = await activityService.addActivity({
          causer: memberRole.member._id,
          causerType: subjectType.MEMBER,
          subjectType: subjectType.EVALUATION,
          subject: result._id,
          action: actionEnum.ADDED,
          meta: {
            candidate: application.user._id,
            name: application.user.firstName + ' ' + application.user.lastName,
            stage: application.currentProgress.stage.name,
            job: job._id,
            application: application._id,
            rating: result.rating
          }
        });

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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
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

    let foundEvaluation = _.find(application.currentProgress.evaluations, {applicationProgressId: applicationProgressId, createdBy: member._id});
    if(foundEvaluation) {
      result = await evaluationService.remove(member._id, applicationId, applicationProgressId);
      if (result) {
        let activity = await activityService.addActivity({
          causer: member._id,
          causerType: subjectType.MEMBER,
          subjectType: subjectType.EVALUATION,
          subject: application._id,
          action: actionEnum.DELETED,
          meta: {
            candidate: application.user._id,
            name: application.user.firstName + ' ' + application.user.lastName,
            stage: application.currentProgress.stage.name,
            job: application.job,
            application: application._id
          }
        });
        console.log(activity)
      }
    }
  } catch (error) {
    console.log(error);
  }

  return result;
}



async function updateApplicationProgressEvent(companyId, currentUserId, applicationId, applicationProgressId, form) {

  if(!companyId || !currentUserId || !applicationId || !applicationProgressId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    result = await applicationProgressService.updateApplicationProgressEvent(applicationProgressId, form);
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function removeApplicationProgressEvent(companyId, applicationId, applicationProgressId) {
  console.log(companyId, applicationId, applicationProgressId)
  if(!companyId || !applicationId || !applicationProgressId){
    return null;
  }

  // let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  // if(!memberRole){
  //   return null;
  // }

  let result;
  try {
    result = await applicationProgressService.removeApplicationProgressEvent(applicationProgressId);
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function disqualifyApplication(companyId, currentUserId, applicationId, disqualification) {

  if(!companyId || !currentUserId || !applicationId || !disqualification){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await applicationService.disqualify(applicationId, disqualification.reason, memberRole.member);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function revertApplication(companyId, currentUserId, applicationId, disqualification) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await applicationService.revert(applicationId, memberRole.member);

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function deleteApplication(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await applicationService.deleteById(applicationId, memberRole.member);

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function acceptApplication(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await applicationService.accept(applicationId, memberRole.member);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function rejectApplication(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await applicationService.reject(applicationId, memberRole.member);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function subscribeApplication(companyId, currentUserId, applicationId) {

  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    let subscription = {createdBy: currentUserId, member: memberRole.member._id, subjectType: subjectType.APPLICATION, subject: ObjectID(applicationId)};
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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await memberService.unsubscribe(memberRole.member._id, subjectType.APPLICATION, applicationId);

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function getApplicationActivities(companyId, currentUserId, applicationId, sort) {
  if(!companyId || !currentUserId || !applicationId || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await activityService.findByApplicationId(companyId, applicationId, sort);
    let userIds = _.map(result.docs, 'causerId');
    let users = await feedService.lookupUserIds(userIds);
    result.docs.forEach(function(activity){
      // let found = _.find(users, {id: parseInt(activity.causerId)});
      // if(found){
      //   activity.causer = convertToTalentUser(found);
      // }
    });
    return new Pagination(result);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getBoard(currentUserId, companyId, jobId, locale) {
  if(!currentUserId || !companyId || !jobId){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let boardStages = [];
  let pipelineStages;
  let applicationSubscribed = await memberService.findMemberSubscribedToSubjectType(memberRole.member._id, subjectType.APPLICATION);
  let job = await jobService.findJob_Id(jobId, locale);
  if(job.pipeline) {
    let pipeline = await pipelineService.findById(job.pipeline);
    if (pipeline.stages) {

      let pipelineStages = pipeline.stages;
      let applicationsGroupByStage = await Application.aggregate([
        {$match: {job: job._id, status: {$in: ['ACTIVE', 'ACCEPTED']}}},
        // {$lookup: {from: 'applicationprogresses', localField: 'currentProgress', foreignField: '_id', as: 'currentProgress' } },
        {
          $lookup: {
            from: "applicationprogresses",
            let: {currentProgress: "$currentProgress"},
            pipeline: [
              {$match: {$expr: {$eq: ["$_id", "$$currentProgress"]}}},
              {
                $addFields:
                  {
                    noOfEvaluations: {$size: "$evaluations"},
                    noOfEmails: {$size: '$emails'}
                  }
              },
              {
                $lookup: {
                  from: 'evaluations',
                  localField: 'evaluations',
                  foreignField: '_id',
                  as: 'evaluations',
                },
              },

            ],
            as: 'currentProgress'
          }
        },
        {$unwind: '$currentProgress'},
        {
          $lookup: {
            from: "candidates",
            let: {user: "$user"},
            pipeline: [
              {$match: {$expr: {$eq: ["$_id", "$$user"]}}},
              {
                $lookup: {
                  from: 'labels',
                  localField: 'sources',
                  foreignField: '_id',
                  as: 'sources',
                },
              },
              {
                $lookup: {
                  from: 'evaluations',
                  localField: 'evaluations',
                  foreignField: '_id',
                  as: 'evaluations',
                },
              },
              {
                $addFields:
                  {
                    rating: {$round: [{$avg: "$evaluations.rating"}, 1]},
                    evaluations: [],
                    applications: []
                  }
              },
            ],
            as: 'user'
          }
        },
        {$unwind: '$user'},
        {
          $project: {
            createdDate: 1,
            user: 1,
            email: 1,
            phoneNumber: 1,
            photo: 1,
            availableDate: 1,
            status: 1,
            hasFollowed: 1,
            sources: 1,
            note: 1,
            user: 1,
            jobTitle: 1,
            jobId: 1,
            job: 1,
            currentProgress: 1,
            noOfComments: 1,
            noOfEvaluations: 1
          }
        },
        {$group: {_id: '$currentProgress.stage', applications: {$push: "$$ROOT"}}}
      ]);

      pipelineStages.forEach(function (item) {

        let stage = {
          _id: item._id,
          type: item.type,
          name: item.name,
          timeLimit: item.timeLimit,
          tasks: item.tasks,
          applications: []
        }
        let found = _.find(applicationsGroupByStage, {'_id': item._id});
        if (found) {
          stage.applications = found.applications;
          for (let [i, item] of stage.applications.entries()) {
            item.hasFollowed = _.find(applicationSubscribed, {subject: item._id}) ? true : false;
            item.user.avatar = buildCandidateUrl(item.user);
            if (item.currentProgress) {
              let completed = _.reduce(stage.tasks, function (res, item) {
                res.push(false);
                return res;
              }, []);
              for (const [j, task] of stage.tasks.entries()) {
                if (task.type === taskType.EVALUATION && task.required) {
                  let noOfCompletedEvaluation = 0;
                  if (task.members.length) {
                    let createdBy = _.sortedUniq(_.reduce(item.currentProgress.evaluations, function (res, item) {
                      res.push(item.createdBy.toString());
                      return res;
                    }, []));
                    let members = _.sortedUniq(_.reduce(task.members, function (res, item) {
                      res.push(item.toString());
                      return res;
                    }, []));
                    completed[j] = (!_.difference(createdBy, members).length) ? true : false;
                  } else {
                    completed[j] = true;
                  }
                } else if (task.type === taskType.EMAIL) {
                  completed[j] = (task.required && item.currentProgress.emails.length) ? true : false;
                } else if (task.type === taskType.EVENT) {
                  completed[j] = (task.required && item.currentProgress.event) ? true : false;
                }

              }

              item.isCompleted = (!_.includes(completed, false)) ? true : false;
            }
          }
        }


        boardStages.push(stage);

      });
    }
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
//   let users = await feedService.lookupUserIds(userIds)
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

/*
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
*/


async function addCandidate(currentUserId, companyId, form) {
  if(!currentUserId || !companyId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let candidate = await candidateService.addCandidate(currentUserId, companyId, form, false, true);
  return candidate
}


async function importResumes(companyId, currentUserId, files) {
  if(!companyId || !currentUserId || !files){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = {};
  let basePath = 'candidates/';
  try {
    const allResumes = await affindaService.getAllResumes();
    // result = await affindaService.createResume(files.file[0].path);
    // console.log(result)

    // const resume = new ResumeParser(files.file[0].path);
    // //Convert to JSON Object
    // let parsed = await resume.parseToJSON()
    //   .then(data => {
    //     return data;
    //
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
    //
    // if(parsed.parts && parsed.parts.email) {
    //   let candidate = await candidateService.findByEmailAndCompanyId(parsed.parts.email, companyId);
    //   if (candidate) {
    //
    //     result.exist = {
    //       id: candidate._id,
    //       userId: candidate.userId,
    //       email: candidate.email,
    //       firstName: candidate.firstName,
    //       lastName: candidate.lastName
    //     }
    //   }
    // }


    // result = {
    //   "_id": "62fc2efdd934f8f75663c0ce",
    //   "avatar": "https://accessed.s3.us-west-2.amazonaws.com/candidates/60feef853c173527d8f956d7/images/person_63_1603789806552.jpg",
    //   "firstName": "John",
    //   "middleName": "",
    //   "lastName": "Doe",
    //   "dob": "1968-07-05",
    //   "email": "test@gmail.com",
    //   "phoneNumber": "+1 5453453454",
    //   "primaryAddress": {
    //     "address1": null,
    //     "address2": null,
    //     "district": "Quan 1",
    //     "city": "Ho Chi Minh",
    //     "state": "Hồ Chí Minh",
    //     "country": "Vietnam"
    //   },
    //   "partyType": "",
    //   "jobTitle": "Sr. Java Develooper",
    //   "about": "",
    //   "gender": "M",
    //   "marital": "MARRIED",
    //   "noOfMonthExperiences": 35,
    //   "level": "SENIOR",
    //   "links": [
    //     {type: "FACEBOOK", "url": "https://www.facebook.com/45345"},
    //     {type: "LINKEDIN", "url": "https://www.linkedin.com/45345"},
    //     {type: "TWITTER", "url": "https://www.twitter.com/45345"},
    //     {type: "WEB", "url": "https://www.profile.com/45345"}
    //   ],
    //   "resumes": [
    //     {
    //       "_id": "611cd438c1a0aa1d052717d2"
    //     }
    //   ],
    //   "experiences": [
    //     {
    //       "isCurrent": false,
    //       "employmentTitle": "Android Developer",
    //       "employmentType": "FREELANCE",
    //       "description": "",
    //       "terminationReason": "",
    //       "terminationType": "",
    //       "employer": {
    //         "id": 25,
    //         "name": "Hacker News"
    //       },
    //       "fromDate": 534859340,
    //       "thruDate": 63465,
    //       "city": "aaaa",
    //       "state": "bbbb",
    //       "country": "ccc"
    //     }
    //   ],
    //   "educations": [
    //     {
    //       "fieldOfStudy": {"shortCode": "BUS"},
    //       "degree": "MASTER",
    //       "gpa": 4,
    //       "fromDate": 1320123741111,
    //       "thruDate": 1398920541111,
    //       "hasGraduated": true,
    //       "isCurrent": false,
    //       "institute": {
    //         "name": "San Diego University"
    //       },
    //       "city": "San Jose",
    //       "state": "California",
    //       "country": "US"
    //     }
    //   ],
    //   "skills": [
    //     {
    //       "id": 9663,
    //       "name": "Analytical Skills",
    //       "noOfMonths": 90,
    //       "rating": 0
    //     },
    //     {
    //       "id": 7717,
    //       "name": "Adobe Photoshop",
    //       "noOfMonths": 12,
    //       "rating": 0
    //     }
    //   ],
    //   "languages": [
    //     {
    //       "language": "am",
    //       "level": "PROFICIENT",
    //       "name": "Amharic (አማርኛ)"
    //     }
    //   ]
    // }


  } catch (error) {
    console.log(error);
  }

  return result;

}


async function searchCandidates(currentUserId, companyId, filter, sort, locale) {

  if(!currentUserId || !companyId || !filter || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  result = await candidateService.search(filter, sort);

  let people = await feedService.lookupCandidateIds(_.map(result.docs, 'userId'));
  let pools = await poolService.findByCompany(companyId);

  result.docs = _.reduce(result.docs, function(res, candidate){
    let hasSaved = false;
    for (let pool of pools) {
      let found = _.includes(pool.candidates, candidate._id);
      for (let c of pool.candidates) {
        if(candidate._id.equals(c)){
          hasSaved=true;
        }
      }
      if (found) {
        hasSaved = true;
      }
    }

    const applications = [];
    for (let application of candidate.applications) {
      application.currentProgress.stage = _.pick(application.currentProgress.stage, ['name', 'type', 'createdAt', 'updatedAt']);
      application.currentProgress = _.pick(application.currentProgress, ['_id', 'stage']);
      application = _.pick(application, ['_id', 'jobTitle', 'currentProgress']);

      applications.push(application);
    }
    candidate.applications = applications;

    let found = _.find(people, {id: candidate.userId});
    if(found)
    {
      candidate.skills = found.skills
      candidate.past = found.past;
      candidate.experiences = found.experiences;
      candidate.educations = found.educations;
      candidate.avatar = candidate.avatar || found.avatar;
    }
    candidate.firstName = candidate.firstName?candidate.firstName:candidate.email;
    candidate.hasSaved=hasSaved;
    candidate.avatar = buildCandidateUrl(candidate);
    res.push(convertToCandidate(candidate));
    return res;
  }, []);

  return new Pagination(result);

}


async function getCandidateById(currentUserId, companyId, candidateId, locale) {

  if(!currentUserId || !companyId || !candidateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;

  let candidate = null;

  if(isNaN(candidateId)) {
    console.log('isnan')
    candidate = await candidateService.findById(candidateId).populate([
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
      },
      {
        path: 'flag',
        model: 'Flag'
      },
      {
        path: 'resumes',
        model: 'File'
      }
    ]);

  } else {
    candidate = await candidateService.findByUserIdAndCompanyId(parseInt(candidateId), companyId).populate([
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
      },
      {
        path: 'flag',
        model: 'Flag'
      },
      {
        path: 'resumes',
        model: 'File'
      }
    ]);
  }


  if(candidate) {
    candidate = _.merge({}, candidate);
    if(candidate.skills) {
      candidate.skills = await feedService.findSkillsById(candidate.skills);
    }
    if(candidate.userId){
      let people = await feedService.findCandidateById(candidate.userId);
      if(people){
        // console.log(candidate.skills)
        // console.log(people.skills)
        people.skills = _.reduce(people.skills, function(res, s){res.push({...s, _private: true}); return res;}, []);
        const skills =_.reduce(candidate.skills, function(res, s){
          if(!_.find(people.skills, {id: s.id})){
            res.push(s);
          }
          return res;
        }, people.skills);
        candidate.skills = skills;
        candidate.experiences = people.experiences;
        candidate.educations = people.educations;
        candidate.avatar = candidate.avatar || people.avatar;
      }
    }


    let preferences = await userService.getJobPreferences(candidate.userId);
    candidate.preferences = preferences;

    let evaluations = await evaluationService.getCandidateEvaluations(candidate.userId);
    if (evaluations) {
      let companyEvaluations = _.filter(evaluations, {companyId: companyId});

      if (companyEvaluations) {
        candidate.teamRating = Math.round(_.reduce(companyEvaluations, function (res, e) {
          return res + e.rating;
        }, 0) / companyEvaluations.length * 100) / 100;
      }

      candidate.rating = Math.round(_.reduce(evaluations, function (res, e) {
        return res + e.rating;
      }, 0) / evaluations.length * 100) / 100;

    }

    candidate.firstName = candidate.firstName?candidate.firstName:candidate.email
    candidate.match = 78;
    // let partyLink = await feedService.getUserLinks(candidate.userId);
    // if (partyLink) {
    //   candidate.links = partyLink.links;
    // }
    // candidate.avatar = buildCandidateUrl(candidate);
    result = convertToCandidate(candidate);
  } else if(!candidate && !isNaN(candidateId)) {
    let people = await feedService.findCandidateById(candidateId);
    if(people){
      let preferences = await userService.getJobPreferences(candidate.userId);
      people.preferences = preferences;
      people.match = 78;
      people.avatar = buildUserUrl(people);
      result = convertToCandidate(people);
    }
  }



  return result;

}


async function updateCandidateById(currentUserId, companyId, candidateId, form) {

  if(!currentUserId || !companyId || !candidateId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;

  let candidate = await candidateService.findById(candidateId);

  if(candidate) {
    candidate.firstName = form.firstName;
    candidate.lastName = form.lastName;
    candidate.email = form.email;
    candidate.emails = form.emails;
    candidate.phoneNumber = form.phoneNumber;
    candidate.phoneNumbers = form.phoneNumbers;
    candidate.about = form.about;
    candidate.gender = form.gender;
    candidate.maritalStatus = form.maritalStatus;
    candidate.dob = form.dob;
    candidate.links = form.links;
    candidate.primaryAddress = form.primaryAddress;
    candidate.jobTitle = form.jobTitle;
    result = await candidate.save();
  }

  return result;

}


async function removeCandidateById(currentUserId, companyId, candidateId) {

  if(!currentUserId || !companyId || !candidateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;
  await candidateService.removeCandidate(candidateId);

  return {success: true};

}



async function getCandidateEvaluations(companyId, currentUserId, candidateId, filter, sort) {
  if(!companyId || !currentUserId || !candidateId || !filter || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    if(isNaN(candidateId)) {
      result = await evaluationService.findByCandidateId(candidateId, filter, sort);
    } else if(filter.companyId) {
      result = await evaluationService.findByPartyIdAndCompany(candidateId, filter, sort);
    } else if(filter.applicationId) {
      result = await evaluationService.findByPartyIdAndApplicationId(candidateId, filter, sort);
    } else {
      result = await evaluationService.findByPartyId(candidateId, filter, sort);
    }

    let userIds = _.reduce(result.docs, function(res, item){res.push(item.createdBy.userId); return res;}, []);
    let users = await feedService.lookupUserIds(userIds);

    result.docs.forEach(function(evaluation){
      let found = _.find(users, {id: evaluation.createdBy.userId});
      if(found){
        evaluation.createdBy.avatar = found.avatar;
      }
      evaluation.createdBy.followJobs = [];

    });

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);
}


async function getCandidateEvaluationsStats(companyId, currentUserId, candidateId, filter) {
  if(!companyId || !currentUserId || !candidateId || !filter){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    if(isNaN(candidateId)){
      result = await evaluationService.getCandidateEvaluationsStats(candidateId, companyId, filter);
    } else {
      result = await evaluationService.getCandidateEvaluationsStatsByPartyId(candidateId, companyId, filter);
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getCandidateEvaluationById(companyId, currentUserId, evaluationId) {
  if(!companyId || !currentUserId || !evaluationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    result = await evaluationService.findById(evaluationId);


  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getCandidatesSimilar(companyId, currentUserId, candidateId) {
  if(!companyId || !currentUserId || !candidateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = [];
  try {
    let userId = null;
    if(isNaN(candidateId)) {
      let candidate = await candidateService.findById(candidateId);
      userId = candidate.userId?candidate.userId:null;
    } else {
      userId = candidateId;
    }

    result = await candidateService.getCandidatesSimilar(userId);


  } catch (error) {
    console.log(error);
  }

  return result;
}



async function getCandidateActivities(companyId, currentUserId, candidateId, sort) {
  if(!companyId || !currentUserId || !candidateId || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    result = await activityService.findByCandidateId(companyId, candidateId, sort);


  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);
}


async function addCandidateExperience(companyId, currentUserId, candidateId, form) {
  if(!companyId || !currentUserId || !candidateId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    result = await candidateService.addExperience(candidateId, form);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getCandidateExperiences(companyId, currentUserId, candidateId) {
  if(!companyId || !currentUserId || !candidateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result=[];
  try {

    let experiences;
    let candidate = await candidateService.findById(candidateId).populate('experiences');

    experiences = candidate.experiences;
    if(!candidate.hasImported && candidate.userId){
      experiences = await feedService.getUserExperiences(candidate.userId);
      experiences = _.reduce(experiences, function(res, exp){
        exp.employer = convertToCompany(exp.employer);
        res.push(exp);
        return res;
      }, []);
    }

    let companies = await feedService.lookupCompaniesIds(_.map(experiences, 'employer.id'))
    experiences = _.reduce(experiences, function(res, exp){
      let employer = _.find(companies, {id: exp.employer.id});
      exp.employer = convertToCompany(employer);
      res.push(exp);
      return res;
    }, []);


    result = experiences;

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function removeCandidateExperience(companyId, currentUserId, candidateId, experienceId) {
  if(!companyId || !currentUserId || !candidateId || !experienceId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    await candidateService.removeExperience(candidateId, experienceId);

  } catch (error) {
    console.log(error);
  }

  return {success: true};
}

async function addCandidateEducation(companyId, currentUserId, candidateId, form) {
  if(!companyId || !currentUserId || !candidateId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  result = await candidateService.addEducation(candidateId, form);

  return result;
}


async function getCandidateEducations(companyId, currentUserId, candidateId) {
  if(!companyId || !currentUserId || !candidateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let educations;
  let result = [];
  try {
    // result = await candidateService.getEducations(candidateId);
    let candidate = await candidateService.findById(candidateId).populate('educations');
    educations = candidate.educations;

    if(!candidate.hasImported && candidate.userId){
      educations = await feedService.getUserEducations(candidate.userId);
      educations = _.reduce(educations, function(res, exp){
        exp.institute = convertToCompany(exp.institute);
        res.push(exp);
        return res;
      }, []);
    }

    let institutes = await feedService.lookupInstituteIds(_.map(candidate.educations, 'institute.id'));
    educations = _.reduce(candidate.educations, function(res, exp){
      let institute = _.find(institutes, {id: exp.institute.id});
      exp.institute = convertToCompany(institute);
      res.push(exp);
      return res;
    }, []);


    result = educations;

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function removeCandidateEducation(companyId, currentUserId, candidateId, educationId) {
  if(!companyId || !currentUserId || !candidateId || !educationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  let educations = await candidateService.removeEducation(candidateId, educationId);
  result = educations;

  return {success: true};
}



async function getCandidateSkills(companyId, currentUserId, candidateId) {
  if(!companyId || !currentUserId || !candidateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = [];
  try {
    let candidate = await candidateService.findById(candidateId);
    let skillIds = _.map(candidate.skills, 'id');

    if(skillIds.length) {
      let foundSkills = await feedService.findSkillsById(skillIds);
      result = _.reduce(foundSkills, function (res, skill) {
        let found = _.find(foundSkills, {id: skill.id})
        if (found) {
          skill.name = found.name;
        }
        res.push(skill);
        return res;

      }, []);
    }

    if(!candidate.hasImported && candidate.userId){
      let skills = await feedService.getUserSkills(candidate.userId);
      result = _.reduce(skills, function(res, item){
        let skill = {id: item.skill.id, name: item.skill.name, noOfMonths: item.noOfMonths, rating: 0};
        res.push(skill);
        return res;
      }, []);
    }




  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addCandidateSkills(companyId, currentUserId, candidateId, form) {
  if(!companyId || !currentUserId || !candidateId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  result = await candidateService.addSkills(candidateId, form);

  return result;
}


async function removeCandidateSkill(companyId, currentUserId, candidateId, skillId) {

  if(!companyId || !currentUserId || !candidateId || !skillId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findById(candidateId);

    for(const [i, skill] of candidate.skills.entries()){
      if(skill==skillId){
        candidate.skills.splice(i, 1);
        await candidate.save();
        result = {success: true};
      }
    }
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function getCandidateAccomplishments(companyId, currentUserId, candidateId) {
  if(!companyId || !currentUserId || !candidateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = {languages: [], publications:[], certifications:[]}
  try {
    let candidate = await candidateService.findById(candidateId);
    result.languages = candidate.languages;
    result.publications = candidate.publications;
    result.certifications = candidate.certifications

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function addCandidateLanguages(companyId, currentUserId, candidateId, form) {
  if(!companyId || !currentUserId || !candidateId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  let candidate = await candidateService.findById(candidateId);
  candidate.languages = form.languages;
  result = await candidate.save();

  return result;
}




async function uploadAvatar(companyId, currentUserId, candidateId, files) {
  if(!companyId || !currentUserId || !candidateId || !files){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  let basePath = 'candidates/';
  try {

    let candidate = await candidateService.findById(candidateId);

    if (candidate) {
      let type, name;
      if(files.file) {
        let cv = files.file[0];
        let fileName = cv.originalname.split('.');
        let fileExt = fileName[fileName.length - 1];
        let timestamp = Date.now();
        name = candidate.firstName + '_' + candidate.lastName + '_' + candidate._id + '-' + timestamp + '.' + fileExt;
        let path = basePath + candidate._id + '/images/' + name;
        let response = await awsService.upload(path, cv.path);
        switch (fileExt) {
          case 'png':
            type = 'PNG';
            break;
          case 'jpeg':
            type = 'JPG';
            break;
          case 'jpg':
            type = 'JPG';
            break;

        }

        candidate.avatar = name;
        result = await candidate.save();
      }
    }


  } catch (error) {
    console.log(error);
  }

  return result;

}


async function uploadCandidateResume(companyId, currentUserId, candidateId, files) {
  if(!companyId || !currentUserId || !candidateId || !files){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  let basePath = 'candidates/';
  try {

    let candidate = await candidateService.findById(candidateId).populate('resumes');

    if (candidate) {
      let type, name;
      //------------Upload CV----------------

      if(files.file) {

        let cv = files.file[0];
        const hash = md5File.sync(cv.path)

        let fileName = cv.originalname.split('.');
        let fileExt = fileName[fileName.length - 1];
        // let date = new Date();
        let timestamp = Date.now();
        name = candidate.firstName + '_' + candidate.lastName + '_' + candidate._id + '-' + timestamp + '.' + fileExt;
        let path = basePath + candidate._id + '/' + name;

        console.log(hash, _.map(candidate.resumes, 'hash'), _.some(candidate.resumes, {hash: hash}))
        if(!_.some(candidate.resumes, {hash: hash})){
          await sovrenService.uploadResume(cv.path, candidate._id);
        }

        await awsService.upload(path, cv.path);
        switch (fileExt) {
          case 'pdf':
            type = 'PDF';
            break;
          case 'doc':
            type = 'WORD';
            break;
          case 'docx':
            type = 'WORD';
            break;

        }

        let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId, hash: hash});
        if(file){
          candidate.resumes.push(file._id);
          await candidate.save();


          result = file;
        }

      }
    }

  } catch (error) {
    console.log(error);
  }

  return result;

}


async function getCandidateResumes(companyId, currentUserId, candidateId) {
  if(!companyId || !currentUserId || !candidateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  let basePath = 'candidates/';
  try {

    let candidate = await candidateService.findById(candidateId).populate('resumes');
    result = _.reduce(candidate.resumes, function(res, item){
      item.path = config.cdn + "/" + item.path;
      res.push(item);
      return res;
    }, []);

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function assignCandidatesJobs(companyId, currentUserId, candidates, jobs) {
  if(!companyId || !currentUserId || !candidates || !jobs){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    job = await jobService.findByIds(jobs);
    candidates = await candidateService.findByIds(candidates);


    for(const [i, job] of jobs.entries()){
      for(const [i, candidate] of candidates.entries()){
        let source = {
          job: job._id,
          candidate: candidate._id,
          createdBy: member._id
        };
        source = sourceService.addWithCheck(source);

        if(source) {
          let meta = {
            candidateName: candidate.firstName + ' ' + candidate.lastName,
            candidate: candidate._id,
            jobTitle: job.title,
            job: job._id
          };
          await activityService.addActivity({
            causer: member._id,
            causerType: subjectType.MEMBER,
            subjectType: subjectType.CANDIDATE,
            subject: candidate._id,
            action: actionEnum.ADDED,
            meta: meta
          });
        }

      }
    }


  } catch (error) {
    console.log(error);
  }

  return {success: true}
}


async function checkCandidateEmail(companyId, currentUserId, email) {
  if(!companyId || !currentUserId || !email){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {

    result = await candidateService.checkEmail(companyId, email);

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function getAllCandidatesSkills(companyId, currentUserId, locale) {
  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    let skills = await candidateService.getAllCandidatesSkills(companyId);
    result = await feedService.findSkillsById(skills)

  } catch (error) {
    console.log(error);
  }

  return result;
}

/************************** CANDIDATE NOTES *****************************/

async function getCandidateNotes(companyId, currentUserId, candidateId, sort) {
  console.log(companyId, currentUserId, candidateId, sort)
  if(!currentUserId || !candidateId || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    result = await noteService.getNotes(subjectType.CANDIDATE, candidateId, sort);

    result.docs.forEach(function(note){
      note.createdBy = convertToTalentUser(note.createdBy);
    });

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);
}

async function addCandidateNote(companyId, currentUserId, candidateId, note) {
  if(!currentUserId || !candidateId || !note){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  // let job = await jobService.findJob_Id(jobId);
  // if(job) {
    note.subjectType = subjectType.CANDIDATE;
    note.subject = ObjectID(candidateId);
    note.createdBy = member._id;
    result = await noteService.addNote(note, member);

  // }


  return result;
}


async function removeCandidateNote(companyId, currentUserId, noteId) {

  if(!companyId || !currentUserId || !noteId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    let note = await noteService.findBy_Id(noteId);

    if(note) {
      result = await note.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function updateCandidateNote(companyId, currentUserId, candidateId, noteId, note) {

  if(!companyId || !currentUserId || !commentId || !note){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {


    let found = await noteService.findBy_Id(noteId);


    if(found) {
      found.message = note.message;
      found.lastUpdatedDate = Date.now();
      result = await found.save()

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}




/************************** CANDIDATE TAGS *****************************/

async function addCandidateTag(companyId, currentUserId, candidateId, tags) {
  if(!companyId || !currentUserId || !candidateId || !tags){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result=[];
  try {
    let candidate = await candidateService.findById(candidateId);

    if(candidate) {
      for(index in tags){
        if(!tags[index]._id){
          let newLabel = {name: tags[index].name, type: 'TAG', company: companyId, createdBy: currentUserId};
          newLabel = await labelService.addLabel(newLabel);
          if(newLabel){
            tags[index]._id = newLabel._id;
            result.push(newLabel);
          }
        }
      };

      let tagIds = _.reduce(tags, function(res, tag){
        res.push(tag._id);
        return res;
      }, []);

      candidate.tags = tagIds;
      await candidate.save();

    }

  } catch (error) {
    console.log(error);
  }

  console.log(result)
  return result;
}


async function removeCandidateTag(companyId, currentUserId, candidateId, tagId) {

  if(!companyId || !currentUserId || !candidateId || !tagId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findById(candidateId);

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


/************************** CANDIDATE SOURCE *****************************/

async function addCandidateSource(companyId, currentUserId, userId, newSource) {
  if(!companyId || !currentUserId || !userId || !newSource){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findById(userId);
    if(candidate) {
      if(!_.some(candidate.sources, {_id: newSource})){
        const source = await labelService.findById(newSource);
        if(source){
          candidate.sources.push(source._id);
          await candidate.save();
          result = source;
        }

      }


    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function addCandidateSources(companyId, currentUserId, userId, sourceList) {
  if(!companyId || !currentUserId || !userId || !sourceList){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findById(userId);
    const sources = [];
    if(candidate) {
      for(index in sourceList){
        if(!sourceList[index]._id){
          let newLabel = {name: sourceList[index].name, type: 'SOURCE', company: companyId, createdBy: currentUserId  };
          newLabel = await labelService.addLabel(newLabel);
          if(newLabel){
            sources.push(newLabel._id);
          }
        } else {
          sources.push(sourceList[index]);
        }
      };

      // let sourceIds = _.reduce(sources, function(res, source){
      //   res.push(source._id);
      //   return res;
      // }, []);

      candidate.sources = sources;
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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result;
  try {
    let candidate = await candidateService.findById(candidateId);

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



async function updateCandidatePool(companyId, currentUserId, candidateId, poolIds) {
  if(!companyId || !currentUserId || !candidateId || !poolIds){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result = null;


  try {

    let pools = await poolService.findByCompany(companyId);
    if (pools) {
      for([i, pool] of pools.entries()){

        let existPool = _.find(poolIds, function(item){return ObjectID(item).equals(pool._id); });
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


async function updatePeoplePool(companyId, currentUserId, userId, poolIds) {
  if(!companyId || !currentUserId || !userId || !poolIds){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }


  let result;
  let candidateId;
  let candidate = await candidateService.findByUserIdAndCompanyId(userId, companyId);
  if(!candidate){
    let user = await feedService.findCandidateById(userId);
    if(user){
        user.skills = null;
        user.experiences = null;
        user.educations = null;
        candidate = await candidateService.addCandidate(currentUserId, companyId, user, false, false);
        candidateId = candidate._id;
    }
  } else {
    candidateId = candidate._id;
  }

  try {
    let pools = await poolService.findByCompany(companyId);
    if (pools) {
      for([i, pool] of pools.entries()){

        let existPool = _.find(poolIds, function(item){return ObjectID(item).equals(pool._id); });
        if(!existPool){
          for(const [i, candidate] of pool.candidates.entries()){
            if(candidate.equals(candidateId)){
              pool.candidates.splice(i, 1);
            }
          }
          await pool.save();
        } else {
          let existCandidate= false;
          for(const [i, candidate] of pool.candidates.entries()){
            if(candidate.equals(candidateId)){
              existCandidate = true
            }
          }
          if(!existCandidate){
            pool.candidates.push(candidateId);
            await pool.save();
          }

        }


      }

      result = {success: true};

    }



  } catch(e){
    console.log('updatePeoplePool: Error', e);
  }


  return result
}



async function getPeopleFlagged(companyId, currentUserId, sort) {
  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  let result;
  if(!memberRole){
    return null;
  }

  try {
    result = await candidateService.getCompanyBlacklisted(companyId, sort);
  } catch(e){
    console.log('getPeopleFlagged: Error', e);
  }


  return new Pagination(result);
}




/************************** DEPARTMENTS *****************************/
async function addCompanyDepartment(companyId, currentUserId, form) {
  // form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!companyId || !currentUserId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;


  try {
    result = await companyDepartmentService.add(form);

  } catch(e){
    console.log('addCompanyDepartment: Error', e);
  }


  return result
}

async function updateCompanyDepartment(companyId, departmentId, currentUserId, form) {
  // form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!companyId || !currentUserId || !departmentId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;


  try {

    // let department = await Department.findById(departmentId);
    // if(department){
    //   department.name = form.name;
    //   department.updatedBy = currentUserId;
    //   department.background = form.background;
    //   result = await department.save();
    // }
    result = await companyDepartmentService.update(form);

  } catch(e){
    console.log('updateCompanyDepartment: Error', e);
  }


  return result
}

async function deleteCompanyDepartment(companyId, departmentId, currentUserId) {
  if(!companyId || !currentUserId || !departmentId){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;

  try {
    let department = await Department.findById(departmentId);
    if(department){
      result = await department.delete();
      if(result){
        result = {deleted: 1};
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
async function addCompanyQuestionTemplate(companyId, currentUserId, form) {
  if(!companyId || !currentUserId || !form){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;

  try {
    form.createdBy = currentUserId;
    form.company = companyId;
    result = await questionTemplateService.addQuestionTemplate(form);

  } catch(e){
    console.log('addCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function getCompanyQuestionTemplate(companyId, questionId, currentUserId) {
  if(!companyId || !currentUserId || !questionId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;

  try {
    result = await questionTemplateService.findById(questionId);

  } catch(e){
    console.log('getCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function updateCompanyQuestionTemplate(companyId, questionId, currentUserId, form) {
  if(!companyId || !currentUserId || !questionId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;

  try {
    result = await questionTemplateService.updateQuestionTemplate(questionId, form);

  } catch(e){
    console.log('updateCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function deleteCompanyQuestionTemplate(companyId, questionId, currentUserId) {
  if(!companyId || !currentUserId || !questionId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  let currentParty = await feedService.findByUserId(currentUserId);


  try {
    result = await questionTemplateService.deleteQuestionTemplate(questionId);
  } catch(e){
    console.log('deleteCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function deactivateCompanyQuestionTemplate(companyId, questionId, currentUserId) {
  if(!companyId || !currentUserId || !questionId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;

  try {
    result = await questionTemplateService.deactivate(questionId, member);

  } catch(e){
    console.log('deactivateCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function activateCompanyQuestionTemplate(companyId, questionId, currentUserId) {
  if(!companyId || !currentUserId || !questionId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;

  try {

    result = await questionTemplateService.activate(questionId, member);

  } catch(e){
    console.log('activateCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function getCompanyQuestionTemplates(companyId, query, currentUserId, locale) {

  if(!companyId || !currentUserId){
    return null;
  }

  let result = await questionTemplateService.getQuestionTemplates(companyId, query);

  return result;

}


/************************** PIPELINES *****************************/
async function addCompanyPipelineTemplate(companyId, currentUserId, form) {

  if(!companyId || !currentUserId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {
    let company = await companyService.findByCompanyId(companyId);
    form.company = company._id;
    result = await pipelineTemplateService.add(form);
    // result = await pipelineService.add(form);

  } catch(e){
    console.log('addCompanyPipeline: Error', e);
  }


  return result
}

async function updateCompanyPipelineTemplate(companyId, pipelineId, currentUserId, form) {
  if(!companyId || !currentUserId || !pipelineId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result = null;
  try {
    result = await pipelineTemplateService.update(pipelineId, form, member);
    // form.updatedBy = member.userId;
    // result = await pipelineService.update(pipelineId, form);
  } catch(e){
    console.log('updateCompanyPipeline: Error', e);
  }


  return result
}

async function deleteCompanyPipelineTemplate(companyId, pipelineId, currentUserId) {
  if(!companyId || !currentUserId || !pipelineId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = {success: false};
  try {

    result = await pipelineTemplateService.remove(pipelineId);
    // await jobService.removePipeline(pipelineId);
    // result = await pipelineService.remove(pipelineId);

    if(result.ok==1){
      result = {success: true};
    }
  } catch(e){
    console.log('deleteCompanyPipeline: Error', e);
  }


  return result
}

async function getCompanyPipelineTemplate(companyId, pipelineId, currentUserId, locale) {

  if(!companyId || !pipelineId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await pipelineTemplateService.findById(pipelineId);
  // let result = await pipelineService.findById(pipelineId);

  return result;

}


async function deactivateCompanyPipelineTemplate(companyId, pipelineId, currentUserId) {
  if(!companyId || !currentUserId || !pipelineId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result = null;
  try {
    result = await pipelineTemplateService.deactivate(pipelineId, member);
    // result = await pipelineService.deactivate(pipelineId, member);

  } catch(e){
    console.log('updateCompanyPipeline: Error', e);
  }


  return result
}


async function activateCompanyPipelineTemplate(companyId, pipelineId, currentUserId) {
  if(!companyId || !currentUserId || !pipelineId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result = null;
  try {
    result = await pipelineTemplateService.activate(pipelineId, member);
    // result = await pipelineService.activate(pipelineId, member);

  } catch(e){
    console.log('activateCompanyPipelineTemplate: Error', e);
  }


  return result
}

async function getCompanyPipelineTemplates(companyId, currentUserId, locale) {

  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = [];
  let company = await companyService.findByCompanyId(companyId);
  if(company) {
    result = await pipelineTemplateService.getPipelineTemplates(company._id);
    // result = await pipelineService.findByCompany(company._id);
  }
  return result;

}



/************************** ROLES *****************************/
async function addCompanyRole(companyId, currentUserId, form) {

  if(!companyId || !currentUserId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  form.createdBy = member.userId;
  result = await roleService.add(form);
  if(result){
    const company = await companyService.findByCompanyId(companyId);
    company.roles.push(result._id);
    await company.save();
  }

  return result
}

async function updateCompanyRole(companyId, currentUserId, roleId, form) {
  if(!companyId || !currentUserId || !roleId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  form.updatedBy = member.userId;
  result = roleService.update(roleId, form);

  return result
}

async function deleteCompanyRole(companyId, currentUserId, roleId) {
  if(!companyId || !currentUserId || !roleId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  const company = await companyService.findByCompanyId(companyId).populate('roles');
  const role = _.find(company.roles, function(o){ return o._id.equals(roleId)});
  if(role){
    await role.delete();
    company.roles = _.reject(company.roles, function(o) { return o._id.equals(roleId); });
    await company.save();
    // let result = await roleService.remove(roleId);

  }

  return {success: true};
}


async function disableCompanyRole(companyId, currentUserId, roleId) {
  if(!companyId || !currentUserId || !roleId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await roleService.disable(roleId);
  if(result){
    result = {success: true}
  }

  return result
}


async function enableCompanyRole(companyId, currentUserId, roleId) {
  if(!companyId || !currentUserId || !roleId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await roleService.enable(roleId);
  if(result){
    result = {success: true}
  }



  return result
}

async function getCompanyRoles(companyId, currentUserId, filter, locale) {

  if(!companyId || !currentUserId || !filter){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await roleService.getRoles(companyId, filter.all);

  return result;

}



/************************** LABELS *****************************/
async function addCompanyLabel(companyId, currentUserId, form) {
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!companyId || !currentUserId || !form){
    return null;
  }
  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;

  try {
    form.createdBy = currentUserId;
    result = await labelService.addLabel(form);

  } catch(e){
    console.log('addCompanyLabel: Error', e);
  }


  return result
}

async function updateCompanyLabel(companyId, labelId, currentUserId, form) {
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!companyId || !currentUserId || !labelId || !form){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {
      let label = await labelService.findById(labelId);
      if(label){
        label.name = form.name;
        label.updatedBy = currentUserId;
        label.type=form.type;
        result = await label.save();
      }
  } catch(e){
    console.log('updateCompanyLabel: Error', e);
  }


  return result
}


async function deleteCompanyLabel(companyId, labelId, currentUserId) {
  if(!companyId || !currentUserId || !labelId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {

      let label = await labelService.findById(labelId);
      if(label){
        result = await label.delete();
        if(result){
          result = {deleted: 1};
        }
      }
  } catch(e){
    console.log('deleteCompanyLabel: Error', e);
  }


  return result
}

async function getCompanyLabels(companyId, query, types, locale) {


  let result = await labelService.getLabelByCompany(companyId, query, types);

  return result;

}



async function inviteMembers(companyId, currentUserId, form) {

  if(!companyId || !currentUserId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result = await memberService.inviteMembers(companyId, currentUserId, form.emails, form.role);

  return result;

}


async function getCompanyMemberInvitations(companyId, currentUserId, query) {

  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let company = await companyService.findByCompanyId(companyId);
  let result = await memberService.getMemberInvitations(company?._id, query);
  result.forEach(function(member){
    member.role = roleMinimal(member.role);
  });
  return result;

}


async function cancelMemberInvitation(companyId, currentUserId, invitationId) {

  if(!companyId || !currentUserId || !invitationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await memberService.cancelMemberInvitation(companyId, invitationId);
  if(result){
    result = {success: true}
  }
  return result;

}


async function getCompanyMembers(companyId, query, currentUserId, locale) {
  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = await companyService.getMembers(companyId, query);

  // result.forEach(function(member){
  //   let found = _.find(users, {id: member.userId});
  //   if(found){
  //     member.firstName = found.firstName;
  //     member.lastName = found.lastName;
  //     member.avatar = found.avatar;
  //   }
  //   member.role = roleMinimal(member.role);
  // });

  return result;

}


async function acceptMemberInvitation(companyId, form, invitationId) {
  if(!companyId || !form || !invitationId){
    return null;
  }

  let result = null;
  try {

      result = await memberService.addMemberFromInvitation(form, invitationId);

  } catch(e){
    console.log('addCompanyMember: Error', e);
  }


  return result
}


async function getCompanyMember(companyId, memberId, currentUserId) {
  if(!companyId || !currentUserId || !memberId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {
    if(isNaN(memberId)){
      member = await memberService.findById(memberId);
      member.avatar = buildUserUrl(member);
    }

  } catch(e){
    console.log('updateCompanyMember: Error', e);
  }


  return member
}



async function updateCompanyMember(companyId, memberId, currentUserId, form) {
  if(!companyId || !currentUserId || !memberId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {
    result = await memberService.updateMember(memberId, form);

  } catch(e){
    console.log('updateCompanyMember: Error', e);
  }


  return result
}

async function updateCompanyMemberRole(companyId, memberId, currentUserId, roleId) {
  if(!companyId || !currentUserId || !memberId || !roleId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let updateMember;
  let result = null;
  try {
    updateMember = await memberService.updateMemberRole(memberId, companyId, roleId);
  } catch(e){
    console.log('updateCompanyMemberRole: Error', e);
  }


  return updateMember;
}

async function deleteCompanyMember(companyId, currentUserId, memberId) {
  if(!companyId || !currentUserId || !memberId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;

  try {
      result = await memberService.removeMember(memberId)
      if(result){
        result = {deleted: 1};
      }


  } catch(e){
    console.log('deleteCompanyMember: Error', e);
  }


  return result
}


async function getJobsSubscribed(companyId, currentUserId, sort) {
  if(!companyId || !currentUserId || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {
    result = await memberService.findJobSubscriptions(member._id, sort);
    let company = await feedService.lookupCompaniesIds([companyId]);
    let departments = await departmentService.findDepartmentsByCompany(companyId);
    company = convertToCompany(company[0]);
    result.docs.forEach(function(sub){
      sub.subject.hasSaved = true;
      sub.subject.company = company;
      sub.subject = jobMinimal(sub.subject)


      sub.subject.department = _.find(departments, function(o){ return o._id.equals(ObjectID(sub.subject.department))});
    });

  } catch(e){
    console.log('getJobsSubscribed: Error', e);
  }


  return new Pagination(result);
}


async function getApplicationsSubscribed(companyId, currentUserId, sort) {
  if(!companyId || !currentUserId || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {
    result = await memberService.findApplicationSubscriptions(member._id, sort);

    result.docs.forEach(function(sub){
      sub.subject.user = convertToCandidate(sub.subject.user);
    });

  } catch(e){
    console.log('getApplicationsSubscribed: Error', e);
  }


  return new Pagination(result);
}



async function getNotificationPreference(companyId, currentUserId) {
  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId).populate('notificationPreference');
  if(!memberRole){
    return null;
  }

  let result = null;


  return member.notificationPreference;
}

async function updateNotificationPreference(companyId, currentUserId, form) {
  if(!companyId || !currentUserId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId).populate('notificationPreference');
  if(!memberRole){
    return null;
  }
  if(member.notificationPreference){
    member.notificationPreference.isNotificationOn = form.isNotificationOn;
    member.notificationPreference.isApplicationUpdated = form.isApplicationUpdated;
    member.notificationPreference.isApplied = form.isApplied;
    member.notificationPreference.isCandidateRecommended = form.isCandidateRecommended;
    member.notificationPreference.isEventInvited = form.isEventInvited;
    member.notificationPreference.isEventConfirmed = form.isEventConfirmed;
    member.notificationPreference.isEventCancelled = form.isEventCancelled;
    member.notificationPreference.isEventDeclined = form.isEventDeclined;
    member.notificationPreference.isEventAccepted = form.isEventAccepted;
    member.notificationPreference.isEventUpdated = form.isEventUpdated;
    member.notificationPreference.isJobUpdated = form.isJobUpdated;
    member.notificationPreference.isJobCommented = form.isJobCommented;
    member.notificationPreference.isJobMembered = form.isJobMembered;
    member.notificationPreference.isMessaged = form.isMessaged;
    await member.notificationPreference.save();
  } else {
    let notificationPreference = {};
    notificationPreference.isNotificationOn = form.isNotificationOn;
    notificationPreference.isApplicationUpdated = form.isApplicationUpdated;
    notificationPreference.isApplied = form.isApplied
    notificationPreference.isCandidateRecommended = form.isCandidateRecommended;
    notificationPreference.isEventInvited = form.isEventInvited;
    notificationPreference.isEventConfirmed = form.isEventConfirmed;
    notificationPreference.isEventCancelled = form.isEventCancelled;
    notificationPreference.isEventDeclined = form.isEventDeclined;
    notificationPreference.isEventAccepted = form.isEventAccepted;
    notificationPreference.isEventUpdated = form.isEventUpdated;
    notificationPreference.isJobUpdated = form.isJobUpdated;
    notificationPreference.isJobCommented = form.isJobCommented;
    notificationPreference.isJobMembered = form.isJobMembered;
    notificationPreference.isMessaged = form.isMessaged;
    notificationPreference = await new NotificationPreference(notificationPreference).save();
    member.notificationPreference = notificationPreference;
    member = await member.save();
  }



  return member.notificationPreference;
}


async function searchTasks(companyId, currentUserId, filter, sort, query) {
  if(!companyId || !currentUserId || !filter || !sort){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {
    filter.members = [member._id];
    result = await taskService.search(filter, sort, query);

  } catch(e){
    console.log('searchTasks: Error', e);
  }


  return new Pagination(result);
}




/************************** POOOL *****************************/

async function getCompanyPools(company, currentUserId, query, candidateId, userId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  if(userId){
    let candidate = await candidateService.findByUserIdAndCompanyId(userId, company);
      if(candidate){
      candidateId = candidate._id;
    }
  }

  let result = await poolService.findByCompany(company, query).populate('candidates');
  if(candidateId || userId) {
    result.forEach(function (pool) {
      let isIn = false;
      if(candidateId){
        isIn = _.some(pool.candidates, {_id: candidateId});
      }

      if(userId){
        isIn = _.some(pool.candidates,{userId: userId});
      }

      pool.isIn = isIn;
      pool.noOfCandidates = pool.candidates.length;
      pool.candidates = [];
    });

  }
  return result;

}

async function getCompanyPoolById(company, currentUserId, poolId, locale) {

  if(!poolId){
    return null;
  }

  let result = await poolService.findPoolBy_Id(poolId);
  return result;

}


async function addCompanyPool(companyId, form, currentUserId) {
  if(!companyId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {

    form.createdBy = currentUserId;
    result = await poolService.add(form);

  } catch(e){
    console.log('addCompanyPool: Error', e);
  }


  return result
}

async function updateCompanyPool(companyId, poolId, currentUserId, form) {
  if(!companyId || !currentUserId || !poolId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }


  let result = null;
  try {

    result = await poolService.updatePool(poolId, form);

  } catch(e){
    console.log('updateCompanyPool: Error', e);
  }


  return result
}

async function deleteCompanyPool(companyId, poolId, currentUserId) {
  if(!companyId || !currentUserId || !poolId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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

async function getPoolCandidates(companyId, currentUserId, poolId, query, sort) {
  if(!companyId || !poolId || !currentUserId){
    return null;
  }

  let result;
  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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
    result = await poolService.getPoolCandidates(poolId);
    result.docs = _.reduce(result.docs, function(res, candidate){
      res.push(convertToCandidate(candidate));
      return res;

    }, []);

    // let candidateIds = pool.candidates;
    // result = await candidateService.searchCandidates(candidateIds, query, options);
    // for(i in result.docs){
    //   result.docs[i] = convertToCandidate(result.docs[i]);
    // };
  } catch(e){
    console.log('getPoolCandidates: Error', e);
  }


  return new Pagination(result);
}

async function addPoolCandidates(companyId, currentUserId, poolId, candidateIds) {
  if(!companyId || !currentUserId || !poolId || !candidateIds){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result = null;


  try {
    let pool = await poolService.findPoolBy_Id(poolId).populate('candidates');
    if (pool) {
      pool.candidates = candidateIds;
      result = await pool.save();

    }



  } catch(e){
    console.log('addPoolCandidate: Error', e);
  }


  return result
}

async function removePoolCandidate(companyId, poolId, candidateId, currentUserId) {
  if(!companyId || !poolId || !candidateId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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

async function removePoolCandidates(companyId, poolId, candidateIds, currentUserId) {
  if(!companyId || !poolId || !candidateIds || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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


/************************** PROJECTS *****************************/

async function getCompanyProjects(companyId, query, currentUserId, locale) {

  if(!companyId || !currentUserId){
    return null;
  }

  let result = await projectService.getProjects(companyId);

  return result;

}

async function addCompanyProject(companyId, form, currentUserId) {
  if(!companyId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
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

async function updateCompanyProject(companyId, projectId, currentUserId, form) {
  if(!companyId || !currentUserId || !projectId || !form){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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

async function deleteCompanyProject(companyId, projectId, currentUserId) {
  if(!companyId || !currentUserId || !projectId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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

async function getProjectCandidates(companyId, projectId, currentUserId, sort) {
  if(!companyId || !projectId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;

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
    let project = await projectService.findProjectBy_Id(projectId);
    let candidateIds = project.candidates;

    result = await feedService.searchPeopleByIds(currentUserId, '', candidateIds, sort);
    for(i in result.content){
      result.content[i].experiences.forEach(function(exp){
        exp.employer = convertToCompany(exp.employer)
      });
      result.content[i].educations.forEach(function(inst){
        inst.institute = convertToCompany(inst.institute)
      });

      if(result.content[i].current) {
        result.content[i].current.employer = convertToCompany(result.content[i].current)
      }
      if(result.content[i].past)
        result.content[i].past.employer = convertToCompany(result.content[i].past.employer)
    };
  } catch(e){
    console.log('getProjectCandidates: Error', e);
  }


  return result;
}

async function addProjectCandidates(companyId, projectId, candidateIds, currentUserId) {
  if(!companyId || !projectId || !candidateIds || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, company);

  if(!memberRole){
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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, company);

  if(!memberRole){
    return null;
  }

  let result = null;

  try {
    let project = await projectService.findProjectBy_Id(projectId);
    if (project && project.candidates) {
      candidateIds.forEach(function(item){
        for(const [i, candidate] of project.candidates.entries()){
          if(item==candidate){
            project.candidates.splice(i, 1);
          }
        };

      });
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

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, company);

  if(!memberRole){
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


/************************** SUBSCRIBE JOB *****************************/

async function subscribeJob(currentUserId, companyId, jobId) {
  if(!currentUserId || !companyId || !jobId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;
  try {
    let subscription = {createdBy: currentUserId, member: member._id, subjectType: subjectType.JOB, subject: ObjectID(jobId)};
    result = await memberService.subscribe(subscription);
  } catch(e){
    console.log('subscribeJob: Error', e);
  }

  return result;
}

async function unsubscribeJob(currentUserId, companyId, jobId) {
  if(!currentUserId || !companyId || !jobId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;
  try {
    result = await memberService.unsubscribe(memberRole.member._id, subjectType.JOB, ObjectID(jobId));
  } catch(e){
    console.log('unsubscribeJob: Error', e);
  }

  return result;
}



async function uploadApplication(companyId, currentUserId, applicationId, files) {
  if(!companyId || !currentUserId || !applicationId || !files){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  console.log(member)
  if(!memberRole){
    return null;
  }

  let result = null;
  let basePath = 'applications/';
  try {

    let application = await applicationService.findApplicationBy_Id(applicationId).populate('user');

    if (application) {
      let type, name;
      let progress = application.currentProress;
      //------------Upload CV----------------

      if(files.file) {

        let cv = files.file[0];
        let fileName = cv.originalname.split('.');
        let fileExt = fileName[fileName.length - 1];
        // let date = new Date();
        let timestamp = Date.now();
        name = application.user.firstName + '_' + application.user.lastName + '_' + application.user._id + '-' + timestamp + '.' + fileExt;
        let path = basePath + application.applicationId + '/' + name;
        let response = await awsService.upload(path, cv.path);
        switch (fileExt) {
          case 'pdf':
            type = 'PDF';
            break;
          case 'doc':
            type = 'WORD';
            break;
          case 'docx':
            type = 'WORD';
            break;

        }

        application.resume = {filename: name, type: type};
        let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId});
        if(file){
          application.resume = file._id;
          application.files.push(file._id);
        }

      }


      if(files.photo) {
        let photo = files.photo[0];
        fileName = photo.originalname.split('.');
        fileExt = fileName[fileName.length - 1];
        timestamp = Date.now();
        name = application.user.firstName + '_' + application.user.lastName + '_' + application.user._id + '_' + application.applicationId + '-' + timestamp + '.' + fileExt;
        path = basePath + application.applicationId + '/photos/' + name;
        response = await awsService.upload(path, photo.path);
        switch (fileExt) {
          case 'png':
            type = 'PNG';
            break;
          case 'jpeg':
            type = 'JPG';
            break;
          case 'jpg':
            type = 'JPG';
            break;

        }
        application.photo = {filename: path, type: type};
        let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId});
        if(file){
          application.photo = file._id;
          application.files.push(file._id);
        }
      }

      result = await application.save();

    }


  } catch (error) {
    console.log(error);
  }

  return result;

}


async function getFiles(companyId, currentUserId, applicationId) {
  if(!companyId || !currentUserId || !applicationId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
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
      result = _.reduce(application.files, function(res, file){
        file.path = buildFileUrl(file.path);
        res.push(file);
        return res;
      }, []);
    }

  } catch(e){
    console.log('getFiles: Error', e);
  }

  return result;
}



/************************** EVALUATIONTEMPLATES *****************************/

async function getCompanyEvaluationTemplates(companyId, filter, currentUserId, locale) {

  if(!companyId || !currentUserId || !filter){
    return null;
  }

  let company = await companyService.findByCompanyId(companyId);
  let result = await evaluationTemplateService.search(company._id, filter);

  return result;

}

async function addCompanyEvaluationTemplate(companyId, form, currentUserId) {
  if(!companyId || !form){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {

    let company = await companyService.findByCompanyId(companyId);
    form.company = company._id;
    form.createdBy = currentUserId;
    result = await evaluationTemplateService.add(form);

  } catch(e){
    console.log('addCompanyEvaluationTemplate: Error', e);
  }


  return result
}

async function getCompanyEvaluationTemplate(companyId, templateId, currentUserId) {
  if(!companyId || !currentUserId || !templateId){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }


  let result = null;
  try {

    result = await evaluationTemplateService.findById(ObjectID(templateId));

  } catch(e){
    console.log('getCompanyEvaluationTemplate: Error', e);
  }


  return result
}

async function updateCompanyEvaluationTemplate(companyId, templateId, currentUserId, form) {
  if(!companyId || !currentUserId || !templateId || !form){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }


  let result = null;
  try {

    result = await evaluationTemplateService.update(ObjectID(templateId), form);

  } catch(e){
    console.log('updateCompanyEvaluationTemplate: Error', e);
  }


  return result
}

async function deleteCompanyEvaluationTemplate(companyId, templateId, currentUserId) {
  if(!companyId || !currentUserId || !templateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }


  let result = null;

  try {
    let evaluation = await evaluationTemplateService.findById(ObjectID(templateId));
    if(evaluation){
      result = await evaluation.delete();
      if(result){
        result = {success: true};
      }
    }


  } catch(e){
    console.log('deleteCompanyEvaluationTemplate: Error', e);
  }


  return result
}


async function deactivateCompanyEvaluationTemplate(companyId, templateId, currentUserId) {
  if(!companyId || !currentUserId || !templateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result = null;
  try {
    result = await evaluationTemplateService.deactivate(templateId, member);


  } catch(e){
    console.log('deactivateCompanyEvaluationTemplate: Error', e);
  }


  return result
}


async function activateCompanyEvaluationTemplate(companyId, templateId, currentUserId) {
  if(!companyId || !currentUserId || !templateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result = null;
  try {
    result = await evaluationTemplateService.activate(templateId, member);


  } catch(e){
    console.log('activateCompanyEvaluationTemplate: Error', e);
  }


  return result
}


async function getEvaluationFilters(companyId, currentUserId) {
  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }


  let result = null;

  try {
    result = await evaluationService.getFilters(companyId);

  } catch(e){
    console.log('getEvaluationFilters: Error', e);
  }


  return result
}





/************************** EMAILTEMPLATES *****************************/

async function getCompanyEmailTemplates(companyId, currentUserId, filter, locale)  {

  if(!companyId || !currentUserId || !filter){
    return null;
  }
  let company = await companyService.findByCompanyId(companyId);
  let result = await emailTemplateService.search(company._id, filter);

  return result;

}

async function addCompanyEmailTemplate(companyId, form, currentUserId) {
  if(!companyId || !form){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result = null;
  try {
    let company = await companyService.findByCompanyId(companyId);
    form.company = company._id;
    form.createdBy = currentUserId;
    result = await emailTemplateService.add(form);

  } catch(e){
    console.log('addCompanyEmailTemplate: Error', e);
  }


  return result
}

async function updateCompanyEmailTemplate(companyId, templateId, currentUserId, form) {
  if(!companyId || !currentUserId || !templateId || !form){
    return null;
  }


  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }


  let result = null;
  try {

    result = await emailTemplateService.update(ObjectID(templateId), form);

  } catch(e){
    console.log('updateCompanyEmailTemplate: Error', e);
  }


  return result
}

async function deleteCompanyEmailTemplate(companyId, templateId, currentUserId) {
  if(!companyId || !currentUserId || !templateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }


  let result = null;

  try {
    let evaluation = await emailTemplateService.findById(ObjectID(templateId));
    if(evaluation){
      result = await evaluation.delete();
      if(result){
        result = {success: true};
      }

    }
  } catch(e){
    console.log('deleteCompanyEmailTemplate: Error', e);
  }
  return result
}


async function deactivateCompanyEmailTemplate(companyId, templateId, currentUserId) {
  if(!companyId || !currentUserId || !templateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result = null;
  try {
    result = await emailTemplateService.deactivate(templateId, member);


  } catch(e){
    console.log('updateTemplate: Error', e);
  }


  return result
}


async function activateCompanyEmailTemplate(companyId, templateId, currentUserId) {
  if(!companyId || !currentUserId || !templateId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }
  let result = null;
  try {
    result = await emailTemplateService.activate(templateId, member);


  } catch(e){
    console.log('updateTemplate: Error', e);
  }


  return result
}

async function searchContacts(companyId, currentUserId, query) {
  if(!companyId || !currentUserId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  if(!memberRole){
    return null;
  }

  let result=[];
  try {

    let members = await memberService.searchMembers(companyId, query);
    members = _.reduce(members, function(res, m){
      m.isMember = true;
      m.isCandidate = false;
      m.avatar = buildUserUrl(m);
      res.push(m);
      return res;
    }, []);

    let candidates = await candidateService.searchCandidates(companyId, query);
    candidates = _.reduce(candidates, function(res, c){
      c.isMember = false;
      c.isCandidate = (c.hasApplied || c.hasImported)?true: false
      c.avatar = buildCandidateUrl(c);
      res.push(c);
      return res;
    }, []);

    result = _.reduce(members.concat(candidates), function (res, item) {
      let exists = _.find(res, {id: item.userId});
      if(!exists) {
        res.push(convertToAvatar(item));
      }
      return res;
    }, []);


  } catch (error) {
    console.log(error);
  }

  return result;

}

