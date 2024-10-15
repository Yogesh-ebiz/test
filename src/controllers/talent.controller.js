const bcrypt = require('bcrypt');
const Joi = require('joi');
const catchAsync = require("../utils/catchAsync");
const { ObjectId } = require('mongodb');
const httpStatus = require('http-status');
const _ = require('lodash');
const md5File = require('md5-file');
const fs = require('fs');
const ejs = require('ejs');
const pdf = require('html-pdf');
var path = require('path');
var Promise = require('promise');
var FormData = require('form-data');
const ResumeParser = require('simple-resume-parser');
const handlebars = require('handlebars');
const he = require('he');
const geoip = require('geoip-lite');
const ApiError = require("../utils/ApiError");
const UnauthorizedError = require("../middlewares/error/UnauthorizedError");


const config = require('../config/config');
const { myEmitter } = require('../config/eventemitter');

let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/pagination');
let {buildUserAvatar} = require('../utils/urlHelper');

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
const labelType = require('../const/labelType');
const emailSourceTypeEnum = require('../const/emailSourceTypeEnum');

const awsService = require('../services/aws.service');
const {dateDifference, buildFileUrl, buildCompanyUrl, buildUserUrl, buildCandidateUrl, jobMinimal, categoryMinimal, roleMinimal, convertToCandidate, convertToCandidateMinimum, convertToTalentUser, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');
const paymentService = require('../services/api/payment.service.api');
const sovrenService = require('../services/api/sovren.service.api');
const affindaService = require('../services/api/affinda.service.api');
const userService = require('../services/user.service');
const invoiceService = require('../services/invoice.service');

const companyService = require('../services/company.service');
const jobService = require('../services/jobrequisition.service');
const applicationService = require('../services/application.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getDepartments, addDepartment} = require('../services/companydepartment.service');
const pipelineTemplateService = require('../services/pipelineTemplate.service');
const industryService = require('../services/industry.service');

const pipelineService = require('../services/jobpipeline.service');
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
const signatureService = require('../services/signature.service');
const questionTemplateService= require('../services/questiontemplate.service');
const candidateService = require('../services/candidate.service');
const userImpressionService = require('../services/userimpression.service');
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
const { getFromCache, saveToCache, deleteFromCache } = require('../services/cacheService');
const taskAutomationService = require('../services/api/taskautomation.service.api');
const messagingService = require('../services/api/messaging.service.api');
const authService = require('../services/api/auth.service.api');
const linkedInService = require('../services/socialmedia/linkedinService');
const notificationPreferenceService = require('../services/notificationPreference.service');

const {findCurrencyRate} = require('../services/currency.service');

const {} = require('../services/company.service');
const Company = require('../models/company.model');
const Application = require('../models/application.model');
const Role = require('../models/role.model');
const Department = require('../models/companydepartment.model');
const NotificationPreference = require('../models/notificationpreference.model');
const pick = require("../utils/pick");
const { Member, JobRequisition } = require("../models");
const skillService = require("../services/skill.service");
const partySkillService = require("../services/partyskill.service");
const reactionService = require('../services/reaction.service');
const { objectId } = require('../validations/custom.validation');
const {generateMemberInvitationEmail} = require('../utils/emailHelper');
const memberinvitationService = require('../services/memberinvitation.service');


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



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const getUserSession = catchAsync(async (req, res) => {
  const {query} = req;
  let currentUserId = parseInt(req.header('UserId'));
  let preferredCompany = parseInt(query.company);
  let subscription;
  let result;
  let user;

  let allAccounts = await memberService.findMemberByUserId(currentUserId).populate('role').populate('company');
  // Note: To handle if it returns list of accounts with company is null
  allAccounts = _.reduce(allAccounts, function(res, o, index){
    if(o.company){
      o.company.members = [];
      o.company.roles = [];
      o.company.benefits = [];
      o.company.industry = [];
      res.push(o);
    }
    return res;
  }, []);

  let companies = _.map(allAccounts, 'company');
  let feedCompanies = await feedService.lookupCompaniesIds(_.map(_.map(allAccounts, 'company'), 'companyId'));
  // let companies2 = await companyService.findByCompanyIds(_.map(allAccounts, 'companyId'), true);

  if(companies.length) {
    const member = _.find(allAccounts, function(o){ return o.companyId===preferredCompany});
    if(member){
      user = convertToTalentUser(member);
      user.messengerId = member?.messengerId;
      user.calendarId = member?.calendarId;
      user.calendarUserId = member?.calendarUserId;
      user.role = member.role;
    } else {
      // console.log('no member, no prefercompany', allAccounts[0])
      user = convertToTalentUser(allAccounts[0]);
      user.messengerId = allAccounts[0].messengerId;
      user.calendarId = allAccounts[0].calendarId;
      user.calendarUserId = allAccounts[0].calendarUserId;
      user.role = allAccounts[0].role;
      preferredCompany = allAccounts[0].company?.companyId;
      // console.log('preferred company', allAccounts[0]);
    }

    if(user.role && user.role.status != statusEnum.ACTIVE){
      user.role.privileges = [];
    }

    const selectedIndex = _.findIndex(companies, {companyId: preferredCompany});
    const noOfJobs = await companyService.getNoOfJobs(companies[selectedIndex]._id);
    companies[selectedIndex].noOfJobs = noOfJobs;
  } else {
    // console.log('company', companies[0])
    user = await feedService.findUserByIdFull(currentUserId);
    user = convertToTalentUser(user);
    preferredCompany = companies[0]?.companyId;

  }



  // const selectedCompany = _.find(companies2, function(o){return o?.companyId===preferredCompany});
  // // console.log('selectedCompany', preferredCompany, selectedCompany);
  // if(selectedCompany){
  //   subscription = await paymentService.getSubscriptionById(companies2[0].talentSubscription);
  //   // console.log('subscription', subscription);
  // }

  // companies = _.reduce(companies, function (res, item) {
  //   let found = _.find(allAccounts, function(o){  return o?.companyId===item.id});
  //   let company = _.find(companies2, function(o){  return o?.companyId===item.id});
  //   // item = convertToCompany(item);
  //
  //   item.talentSubscription = null;
  //
  //   if(found){
  //     // console.log('found', found)
  //     const role = found?.role;
  //     if(role && role.status != statusEnum.ACTIVE){
  //       role.privileges = [];
  //     }
  //
  //     item.role = roleMinimal(role);
  //     item.memberId = found._id;
  //   }
  //
  //   if(company){
  //     item.customerId = company.customerId;
  //     item.inMailCredit = company.inMailCredit;
  //     item.credit = company.credit;
  //
  //     // console.log('found', found?.company?.companyId, preferredCompany)
  //     if(found?.company?.companyId===preferredCompany){
  //       item.talentSubscription = found?.company?.talentSubscription;
  //     }
  //   }
  //
  //   item.avatar = buildCompanyUrl(item);
  //   item.subscriptions = subscription ? [subscription] : [];
  //   // item.talentSubscription = null;
  //   res.push(item)
  //   return res;
  // }, [])
  // // Move preferred company to the top
  // companies = _.sortBy(companies, (company) => {
  //   return company.id === preferredCompany ? 0 : 1;
  // });

  user.company = companies;
  user.preferredCompany = preferredCompany;
  res.json(user);

})
const registerNewUser = catchAsync(async (req, res) => {
  const {body} = req;

  if(!body.timezone){
    let ip = req.header('X-Forwarded-For') || req.connection.remoteAddress || req.ip;
    const geo = geoip.lookup(ip); // Lookup geolocation info
    if(geo && geo.timezone){
      body.timezone = geo.timezone;
    }
  }
  let result = {success: false}, member, company;

  try {
    let response = await feedService.register({
      ...body,
      ...(body.company && body.company.primaryAddress ? {
        primaryAddress: {
          ...body.company.primaryAddress,
          type: 'BUSINESS'
        }
      } : {})
    });

    if(!response) {
      res.status(400).json({
        status: 400,
        message: 'Bad Request'
      })
    }

    const { user } = response;
    if (user && !_.isEmpty(body.company)) {
      company = await companyService.register(user, body.company, null);
    }

    result = {success: true};


  } catch (e){
    console.log('error: ', e)
  }

  res.json(result);

});
/************************** MANAGE COMPANY *****************************/
const getCompany = catchAsync(async (req, res) => {
  const {params} = req;
  const {companyId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  if(!currentUserId || !companyId){
    throw new ApiError(httpStatus.FORBIDDEN, 'Permission Denied');
  }

  const cacheKey = `company:${companyId}`;
  let company = await getFromCache(cacheKey);
  if(!company){
    company = await companyService.findByCompanyId(companyId).populate('industry').populate('benefits').lean();
    let feedCompany = null;
    if(company.partyType=='COMPANY'){
      feedCompany = await feedService.findCompanyById(companyId);
    }else {
      feedCompany = await feedService.findInstituteById(companyId);
    }

    if(feedCompany){
      company.legalName = feedCompany.legalName;
      company.avatar = feedCompany.avatar;
      company.cover = feedCompany.cover;
      company.images = feedCompany.images ? feedCompany.images : [];
      company.videos = feedCompany.videos ? feedCompany.videos : [];
      company.primaryAddress = feedCompany.primaryAddress;
      company.about = feedCompany.about;
      company.mission = feedCompany.mission;
      company.yearFounded = feedCompany.yearFounded;
      company.size = feedCompany.size;
      company.industry = company.industry ? company.industry.map(o => {
        o.name = o.name.en;
        return o;
      }) : [];
    }
   // await saveToCache(cacheKey, company); // removing save to cahce since it should be done in feed service.
  }else{
    console.log('Serving Company data from cache');
    company = JSON.parse(company);
  }

  res.json(company);
});
const updateCompany = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { companyId } = params;

  let result;
  try {

    body.industry = _.reduce(body.industry, function(res, o){res.push(new ObjectId(o)); return res;}, []);
    result = await companyService.update(companyId, user, body);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const uploadCompanyAvatar = catchAsync(async (req, res) => {
  const { user, params, files } = req;
  const { companyId } = params;

  if (!files || !files.file || files.file.length === 0) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  let company = await companyService.findByCompanyId(companyId);
  if(!company){
    return res.status(400).json({ success: false, error: 'Company not found' });
  }

  let result;
  try {
    const avatarFile = files.file[0];
    const formData = new FormData();
    const fileStream = fs.createReadStream(avatarFile.path);
    formData.append('file', fileStream, {
      filename: avatarFile.originalname,
      contentType: avatarFile.mimetype,
    });
    result = await feedService.uploadCompanyAvatar(companyId, user.userId, formData);
    if (result && result.avatar) {
      company.avatar = result.avatar;
      await company.save();
      await deleteFromCache(`company:${companyId}`);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Failed to upload avatar' });
  }

  res.json(result);
});
const uploadCompanyCover = catchAsync(async (req, res) => {
  const { user, params, files } = req;
  const { companyId } = params;

  if (!files || !files.file || files.file.length === 0) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  let company = await companyService.findByCompanyId(companyId);
  if(!company){
    return res.status(400).json({ success: false, error: 'Company not found' });
  }

  let result;
  try {
    const coverFile = files.file[0];
    const formData = new FormData();
    const fileStream = fs.createReadStream(coverFile.path);
    formData.append('file', fileStream, {
      filename: coverFile.originalname,
      contentType: coverFile.mimetype,
    });
    result = await feedService.uploadCompanyCover(companyId, user.userId, formData);
    if (result && result.cover) {
      company.cover = result.cover;
      await company.save();
      await deleteFromCache(`company:${companyId}`);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Failed to upload cover' });
  }

  res.json(result);
});
const getInmailCredits = catchAsync(async (req, res) => {

  const {params, query} = req;
  const {companyId} = params;

  const currentUserId = parseInt(req.header('UserId'));

  let company = await companyService.findByCompanyId(companyId);

  res.json({credit: company.credit});

});
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
const getCompanyInsights = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;
  const {timeframe} = query;

  const impressionTypes = ['VIEWED', 'LIKED', 'SAVED', 'APPLIED', 'SHARED'];

  // Fetch insights for each type
  const promises = impressionTypes.map(type =>
    userImpressionService.getCompanyInsight(user.company?._id, timeframe, type)
  );

  const insights = await Promise.all(promises);

  const result = {
    impressions: insights,
    impressionByRoles: await applicationService.getCandidateImpressionByRoles(user.company._id, timeframe),
    sources: await applicationService.getCandidatesSourceByCompanyId(user.company._id, timeframe),
    jobSummary: await jobService.getCompanyJobSummary(user.company._id, timeframe, user.timezone),
  }

  res.json(result);

});
const getTasksInsights = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;
  const {timeframe} = query;

  if (!companyId || !timeframe) {
    return res.status(400).json({ message: 'Missing required parameters: companyId, timeframe' });
  }
  try{
    const stats = await taskService.getTaskStatsByTimeframe(user._id, timeframe, user.timezone);

    res.status(200).json(stats);

  }catch(error){
    console.error('Error fetching task stats:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }

});
const getImpressionCandidates = catchAsync(async (req, res) => {
  const {params, query} = req;
  const { companyId } = params;
  const { timeframe, type, level, jobId, size, page, sortBy, direction } = query;
  const currentUserId = parseInt(req.header('UserId'));

  let select = '';
  let limit = (size && size>0) ? size:20;
  let pageNo = (page && page==0) ? page+1:1;
  let sort = {};
  sort[sortBy] = (direction && direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sort,
    lean:     true,
    limit:    limit,
    page: pageNo
  };

  let result;
  let from, to;

  if(jobId){
    // jobId = ObjectId(jobId);
    let job = await jobService.findJob_Id(jobId);
    if(job){
      from = new Date(job.createdDate);
      to = new Date();
    }
  }

  const date = new Date();
  if(timeframe){
    if(timeframe=='1M'){
      date.setDate(date.getDate()-30);
      date.setMinutes(0);
      date.setHours(0)
      from = date;
      to = new Date();
    } else if(timeframe=='3M'){
      date.setMonth(date.getMonth()-3);
      date.setDate(1);
      from = date;
      to = new Date();
    } else if(timeframe=='6M'){
      date.setMonth(date.getMonth()-6);
      date.setDate(1);
      from = date;
      to = new Date();
    }
  }

  if(type) {
    let company = await companyService.findByCompanyId(companyId);
    if (type == 'viewed') {
      result = await userImpressionService.getInsightCandidates(from, to, company._id, jobId, options);
    } else if (type == 'saved') {
      result = await bookmarkService.getInsightCandidates(from, to, company._id, jobId, options);
    } else if (type == 'applied') {
      result = await applicationService.getInsightCandidates(from, to, company._id, jobId, options);
    }
  }

  if(level){
    result = await companyService.getCompanyCandidateInsights(companyId, options);
  }

  if(result){
    let userIds = _.map(result.docs, 'partyId');
    let users = await feedService.lookupCandidateIds(userIds);

    for(const i in result.docs){

      let found = _.find(users, {id: result.docs[i].partyId});
      if(found){
        found.educations = _.reduce(found.educations, function(res, edu){
          edu.fieldOfStudy=null;
          res.push(edu);
          return res;
        }, []);
        result.docs[i] = found;
      }

    }
  }




  // if(result.docs.length) {
  //   let currentProgressIds = _.reduce(result.docs, function (res, candidate) {
  //     let currentProgresses = _.reduce(candidate.applications, function(res, app) {
  //       res.push(ObjectId(app.currentProgress));
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
  res.json(new Pagination(result));

});
const getDashboard = catchAsync(async (req, res) => {
  const {params, user} = req;
  const {companyId} = params;

  let result;
  let data = [];

  let company = await companyService.findByCompanyId(companyId);

  if(company){

    let mostViewed = await userImpressionService.findMostViewedByCompany(company._id);
    let jobIds = _.map(mostViewed, '_id');

    let subscribes = [];
    if(jobIds){
      subscribes = await memberService.findSubscribeByUserIdAndSubjectTypeAndSubjectIds(user._id, subjectType.JOB, jobIds);
    }
    let feedCompany = await feedService.lookupCompaniesIds([companyId]);
    if(mostViewed){
      mostViewed.forEach(function(job){
        job.company = convertToCompany(feedCompany[0]);
        job.department = job.department?job.department[0]:null;
        job.hasSaved = _.some(subscribes, {subject: job._id});
      });
    }

    let applicationEndingSoon = await applicationService.getApplicationsEndingSoon(company._id, 10);
    applicationEndingSoon.data.forEach(function(app){
      if(app.user) {
        app.user.applications = [];
        app.user.evaluations = [];
        app.user.sources = [];
        app.user.tags = [];
        app.user.avatar = buildCandidateUrl(app.user);
      }
    });

    let newApplications = await applicationService.getNewApplications(company._id, 10);
    newApplications.data.forEach(function(app){
      if(app.user) {
        app.user.applications = [];
        app.user.evaluations = [];
        app.user.sources = [];
        app.user.tags = [];
        app.user.avatar = buildCandidateUrl(app.user);
      }
    });

    let taskDueSoon = await taskService.getTasksDueSoon(user)
    let jobEndingSoon = await jobService.getJobsEndingSoon(company._id);
    let userIds = _.map(jobEndingSoon, 'createdBy.userId');
    let users = await feedService.lookupUserIds(userIds);

    jobEndingSoon.forEach(function(job){
      job.company = convertToCompany(feedCompany[0]);
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
  }

  res.json(result);
});

const getCompanyJobSummary = catchAsync(async (req, res) => {
  const {params, user, query} = req;
  const {companyId} = params;
  const {timeframe} = query;

  try {
    if(!timeframe){
      timeframe = '1W';
    }
    const result = await jobService.getCompanyJobSummary(timeframe, user.company._id, user.timezone);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal Server error' });
  }

})

const searchCompany = catchAsync(async (req, res) => {
    const {params, user, query, body} = req;
    const currentUserId = parseInt(req.header('UserId'));
    const companyId = parseInt(req.header('companyId'))

    let preferredCompany;
    if(parseInt(query.page) === 0 && companyId && companyId > 0){
      preferredCompany = await memberService.findByUserIdAndCompany(currentUserId, companyId)
      if(preferredCompany){
        query.size = Math.max(0, parseInt(query.size) - 1).toString();
      }
    }

  let result = await memberService.searchCompanyByUserId(currentUserId, body, query);
  let resultDocs = preferredCompany ? [preferredCompany].concat(result.docs) : result.docs;
  resultDocs = _.uniqBy(resultDocs, 'companyId');

  const companyIds = _.map(resultDocs, 'companyId');
  let companies = await companyService.findByCompanyIds(companyIds, true);
  let feedCompanies = await feedService.lookupCompaniesIds(companyIds);

  // Create a lookup for company details and feed companies
  const companiesById = _.keyBy(companies, 'companyId');
  const feedCompaniesById = _.keyBy(feedCompanies, 'id');

  result.docs = _.reduce(resultDocs, (res, doc) => {

    if(doc) {
      let item = companiesById[doc.companyId];
      let company = feedCompaniesById[doc.companyId];

      if (item) {
        item = convertToCompany(item);
        item.role = doc.role;
        item.memberId = doc._id;
        item.avatar = company ? company.avatar : null;
        item.cover = company ? company.cover : null;
        item.subscription = null;
        item.primaryAddress = null;
        item.customerId = null;

        res.push(item);
      }
    }
    return res;
  }, []);
  res.json(new Pagination(result));

});
/************************** MANAGE PAYMENT *****************************/
const addPaymentMethod = catchAsync(async (req, res) => {
  const {params, user, body} = req;
  const {companyId} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let company = await companyService.findByCompanyId(companyId);
  if(!company.customerId){
    let customer = {
      partyId: companyId,
      partyType: company.partyType,
      name: company.name,
      phone: body.card.phone,
      email: body.card.email,
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
    console.log('customer', customer)
    if(customer){
      company.customerId = customer.id;
      await company.save();
    }
  }

  let result = await paymentProvider.addPaymentMethod(company.customerId, body);
  res.json(result);
})
const getCards = catchAsync(async (req, res) => {
  const {params} = req;
  const {companyId} = params;
  const currentUserId = parseInt(req.header('UserId'));


  let result = await cardService.findByCompany(companyId);
  result = _.reduce(result, function(res, c){
    res.push({id: c.id?c.id:'', brand: c.brand, last4: c.last4, isDefault: c.isDefault?true:false});
    return res;
  }, []);
  res.json( result );
});
const removeCard = catchAsync(async (req, res) => {
  const {params} = req;
  const {id, cardId} = params;

  let result = null;
  let company = await companyService.findByCompanyId(companyId);
  if(company && company.customerId){
    result = await cardService.remove(company.customerId, cardId);
  }

  res.json(result);
})
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
/************************** MANAGE SUBSCRIPTION *****************************/
const getSubscription = catchAsync(async (req, res) => {
  const { params, files } = req;
  const {companyId} = params;

  let currentUserId = parseInt(req.header('UserId'));

  let subscriptions = [];
  try {

    let company = await companyService.findByCompanyId(companyId).populate('talentSubscription');
    subscriptions = await paymentService.getCustomerSubscriptions(company.customerId);

  } catch (error) {
    console.log(error);
  }

  res.json(subscriptions);
});
const getSubscriptions = catchAsync(async (req, res) => {
  const { params, files } = req;
  const {companyId} = params;

  let currentUserId = parseInt(req.header('UserId'));

  let subscriptions = [];
  try {

    let company = await companyService.findByCompanyId(companyId);
    console.log(company.customerId)
    subscriptions = await paymentService.getCustomerSubscriptions(company.customerId);

  } catch (error) {
    console.log(error);
  }

  res.json(subscriptions);
});
const addSubscription = catchAsync(async (req, res) => {
  const {user, params, body} = req
  const {companyId} = params;
  let subscription = null;
  try {
    let company = await companyService.findByCompanyId(companyId);

    body.defaultPaymentMethod = body.payment.id;
    body.createdBy = user.userId;
    body.trialDays = user.company.talentSubscription?0:14;

    subscription = await paymentService.addSubscription(body);
    if(company && subscription){
      company.talentSubscription = subscription.id;
      company.subscriptions.push(subscription.id);

      //call messageService see if company exist, if not create a company.
      let messagingSrvCompany = await messagingService.getCompany(companyId);
      if(!messagingSrvCompany){
        messagingSrvCompany = await messagingService.createCompany({
          name: company.name,
          legalName: company.legalName,
          companyId: company.companyId,
          partyType: company.partyType
        });
      }

      //Call messageService to add inmailCredit;
      if(subscription?.plan?.credits.length > 0){
        let credits = {};
        for(let credit of subscription?.plan?.credits){
          if(credit.type==='MAIL' && credit.name.toLowerCase().includes('inmail')){
            credits.inMailCredit = credit.value;
          }else if(credit.type==='PEOPLE' && credit.name.toLowerCase().includes('peopleview')){
            credits.peopleViewCredit = credit.value;
          }else if(credit.type==='PEOPLE' && credit.name.toLowerCase().includes('peoplesearch')){
            credits.peopleSearchCredit = credit.value;
          }
        }
        await messagingService.updateCompanyCredit(companyId, credits);
      }

      await company.save();
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  res.json(subscription);
});
const updateSubscription = catchAsync(async (req, res) => {
  const {user, params, body} = req
  const {id, subscriptionId} = params;
  const currentUserId = parseInt(req.header('UserId'));
  let subscription = null;
  try {
    form.updatedBy = currentUserId;
    subscription = await paymentService.updateSubscription(subscriptionId, body);
    if(subscription){
      company.talentSubscription = subscription.id;
      await company.save();
    }
  } catch (error) {
    console.log(error);
  }

  res.json(subscription);
});

const activateSubscription = catchAsync(async (req, res) => {
  const {params} = req
  const {id, subscriptionId} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let subscription = null;
  try {
    let company = await companyService.findByCompanyId(id).populate('subscription');
    if(company && company.talentSubscription==subscriptionId) {
      subscription = await paymentService.activateSubscription(subscriptionId);
    }
  } catch (error) {
    console.log(error);
  }

  res.json(subscription);
});

const getInvoices = catchAsync(async (req, res) => {
  const {user, params, query} = req
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result;
  const filter = {company: [user.company?._id]};

  try {
    result = await invoiceService.search(filter, query);
  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});
/************************** MANAGE JOB *****************************/
const getCompanyJobCount = catchAsync(async (req, res) => {
  const {user} = req;
  let result = await jobService.getCompanyJobCounts(user.company._id);

  res.json(result);

});
const searchJobs = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const searchText = query.query;
  delete query.query;

  body.company = [params.companyId];
  body.jobFunction = _.reduce(body.jobFunction, function(res, o){res.push(new ObjectId(o)); return res;}, []);
  let result = await jobService.search(user, searchText, body, query);

  if(result) {
    let jobSubscribed = await memberService.findMemberSubscribedToSubjectType(user._id, subjectType.JOB);
    let company = await companyService.findByCompanyId(params.companyId);

    let feedCompany = null;
    if(company?.partyType==='COMPANY'){
      feedCompany = await feedService.findCompanyById(company.companyId);
    }else {
      feedCompany = await feedService.findInstituteById(company.companyId);
    }
    if(feedCompany){
      company.avatar = feedCompany.avatar;
    }

    result.docs.map(job => {
      job.company = company.transform();
      job.hasSaved = _.find(jobSubscribed, {subject: job._id})?true:false;
      job.createdBy.avatar = buildUserUrl(job.createdBy);
      return job;
    });

  }
  res.json(new Pagination(result));

});

const searchJobsWithBudget = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const searchText = query.query;
  delete query.query;

  body.company = [params.companyId];
  body.jobFunction = _.reduce(body.jobFunction, function(res, o){res.push(new ObjectId(o)); return res;}, []);
  let result = await jobService.searchWithBudget(user, searchText, body, query);

  if(result) {
    let jobSubscribed = await memberService.findMemberSubscribedToSubjectType(user._id, subjectType.JOB);
    let company = await companyService.findByCompanyId(params.companyId);

    result.docs.map(job => {
      job.company = company.transform();
      job.hasSaved = _.find(jobSubscribed, {subject: job._id})?true:false;
      job.createdBy.avatar = buildUserUrl(job.createdBy);
      return job;
    });

  }
  res.json(new Pagination(result));
});

const lookupJobs = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const searchText = query.query;
  delete query.query;

  let result = await jobService.lookUpJobs(user.company?._id, searchText);

  res.json(result);

});

const searchJobTitle = catchAsync(async (req, res) => {
  const {user, params, query} = req;

  let result = await jobService.searchJobTitle(query.query || '');

  res.json(result);

});

const createJob = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId} = params;

  let result;
  try{
    body.company = user.company;
    body.companyId = companyId;
    body.createdBy = user._id;
    body.members = [user._id];
    result = await jobService.addJob(body);

    let feedCompany = null;
    if(result.company?.partyType=='COMPANY'){
      feedCompany = await feedService.findCompanyById(result.company.companyId);
    }else {
      feedCompany = await feedService.findInstituteById(result.company.companyId);
    }
    if(feedCompany){
      result.company.avatar = feedCompany.avatar;
    }
  } catch (error) {
    console.log(error)
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Server Error');
  }


  res.json(result);
});
const getJobById = catchAsync(async (req, res) => {
  const {params, user, locale} = req;
  const {companyId, jobId} = params;
  let localeStr = locale? locale : 'en';
  let propLocale = '$name.'+localeStr;
  const cacheKey = `job:${jobId}`;
  let job = null //await getFromCache(cacheKey);
  if (!job){
    try {

      job = await jobService.findById(jobId, locale).populate('skills').populate('department').populate('tags').populate('members').populate('createdBy').populate('ads').populate('searchAd').populate('jobFunction').populate('industry');
      const isSuper = user.role?.isSuper;
      const isOwner = job && job.createdBy?._id.equals(user._id);
      const isMember = _.find(job?.members, function(o){ return o._id.equals(user._id)});

      if(!job || (!isOwner && !isMember && !isSuper)) {
        return res.status(404).json({ message: 'Not Found' });
      }

      let noOfApplied = await applicationService.findAppliedCountByJobId(job._id);
      job.noOfApplied = noOfApplied;

      // if(job.category){
      //   let category = await feedService.findCategoryByShortCode(job.category, locale);
      //   job.category = categoryMinimal(category);
      // }

      for(let [i, ad] of job.ads.entries()){
        if(ad.feedId){
          job.feedId = ad.feedId;
        }
      }

      job.hasSaved = _.some(user.followedJobs, job._id);

      // ToDo: return right local, not just en
      const jobFunctionName = job.jobFunction?.name? job.jobFunction.name.en : '';
      if(jobFunctionName){
        job.jobFunction.name = jobFunctionName
      }

      job.industry = _.reduce(job.industry, function(res, o){
        // ToDo: return right local, not just en
        let name = o.en;
        o.name = o.name.en;
        res.push(o);
        return res;
      }, []);

      //Save to Cache
      await saveToCache(cacheKey, job);

    } catch (error) {
      console.log(error);
    }
  } else {
    console.log('Serving Job data from cache');
    // job = JSON.parse(job);
  }


  res.json(job);
});
const updateJob = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { jobId } = params;
  let result;

  body.updatedBy = user._id;
  body.department =  body.department? new ObjectId(body.department) : null;
  body.jobFunction =  body.jobFunction? new ObjectId(body.jobFunction) : null;
  body.industry =  body.industry ? _.reduce(body.industry, function(res, item){res.push(new ObjectId(item)); return res;}, []) : null;
  body.skills =  body.skills ? _.reduce(body.skills, function(res, item){res.push(new ObjectId(item)); return res;}, []) : null;

  result = await jobService.updateJob(jobId, user, body);

  //delete from cache
  let cacheKey = `job:${jobId}`;
  await deleteFromCache(cacheKey);

  res.json(result);
});
const closeJob = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { jobId } = params;

  let result = await jobService.closeJob(jobId, user);
  if(result && result.status === statusEnum.CLOSED){
    //delete from cache
    let cacheKey = `job:${jobId}`;
    await deleteFromCache(cacheKey);
  }
  res.json(result);
});
const archiveJob = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { jobId } = params;
  let result = await jobService.archiveJob(jobId, user);
  if(result && result.status === statusEnum.ARCHIVED){
    //delete from cache
    let cacheKey = `job:${jobId}`;
    await deleteFromCache(cacheKey);
  }
  res.json({status: result?.status});
});
const unarchiveJob = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { jobId } = params;
  let result = await jobService.unarchiveJob(jobId, user);
  if(result && (result.status === statusEnum.ACTIVE || result.status === statusEnum.DRAFT)){
    //delete from cache
    let cacheKey = `job:${jobId}`;
    await deleteFromCache(cacheKey);
  }
  res.json({status: result?.status});
});
const deleteJob = catchAsync(async (req, res) => {

  const { user, params, body } = req;
  const { jobId } = params;
  let result = await jobService.deleteJob(jobId, user);
  let cacheKey = `job:${jobId}`;
  await deleteFromCache(cacheKey);
  res.json(result);
});

const shareJobToSocialAccount = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { companyId, jobId, socialAccountType } = params;
  let result;

  try{
    const userSocialAccount = await authService.getUserSocialAccount(user.email,socialAccountType)

    if(!userSocialAccount || Object.keys(userSocialAccount).length === 0){
      return res.status(500).json({ success: false, message: `User's ${socialAccountType} account not found. Kindly register your linkedIn account` });
    }

    const job = await jobService.findById(new ObjectId(jobId));
    if (!job) {
      return res.status(500).json({ success: false, message: `Job not found.` });
    }

    const linkedInPostId = await linkedInService.shareToLinkedIn(userSocialAccount, job);
    if(linkedInPostId){
      result = {success:true}
    }else{
      return res.status(500).json({ success: false, message: `Failed to share job to LinkedIn.` });
    }
    res.json(result);
  }catch (error) {
    console.error("Error sharing job to LinkedIn:", error);
    res.status(500).json({ success: false, message: `Internal server error.` });
  }
});
/************************** JOB COMMENT *****************************/
const getJobComments = catchAsync(async (req, res) => {
  const {user, params, query} = req
  const {jobId, companyId} = params;
  let result;
  try {


    result = await commentService.getComments(subjectType.JOB, new ObjectId(jobId), query);

    const commentIds = result.docs.map(comment => comment._id);

    result.docs.forEach(function(comment){
      comment.createdBy = convertToTalentUser(comment.createdBy);
    });

  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
})
const addJobComment = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {jobId, companyId} = params;

  let result;
  let job = await jobService.findById(jobId);
  if(job) {
    body.subjectType = subjectType.JOB;
    body.subject = job;
    body.createdBy = user._id;
    result = await commentService.addComment(body, user);
  }
  res.json(result);
});

/************************** JOB TAGS *****************************/
const addJobTag = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { jobId } = params;
  let result = [];

  const job = await jobService.findById(new ObjectId(jobId));
  console.log(job)
  if(job){

    if(body._id){

      const found = _.find(job.tags, function(o){ return o.equals(new ObjectId(body._id)) });

      if(!found)
      job.tags.push(new ObjectId(body._id));
    } else {
      let tag = await labelService.updateAndAdd({name: body.name, createdBy: user._id, company: user.company._id, type: labelType.TAG});
      if(tag){
        job.tags.push(tag._id);
      }
    }

    await job.save().then(async () => {
      let cacheKey = `job:${jobId}`;
      await deleteFromCache(cacheKey);
    });
  }

  res.json(job?.tags || []);
});
const updateJobTags = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { jobId } = params;
  let result = [];

  const job = await jobService.findById(new ObjectId(jobId)).populate('tags');
  if(job){
    // result = job.tags;
    let ids = [];
    for (const [j, item] of body.tags.entries()) {
      if(item._id){
        // const found = _.fin  d(job.tags, function(o){ return o._id.equals(new ObjectId(item._id)) });

        ids.push(new ObjectId(item._id));
        result.push(item);
      } else {
        let tag = await labelService.updateAndAdd({name: item.name, createdBy: user._id, company: user.company, type: labelType.TAG});
        if(tag){
          ids.push(tag._id);
          result.push(tag);
        }
      }

    }
    job.tags = ids;
    await job.save().then(async () => {
      let cacheKey = `job:${jobId}`;
      await deleteFromCache(cacheKey);
    });
  }

  res.json(result);
});
const removeJobTags = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { jobId } = params;
  let result = [];

  const job = await jobService.findById(new ObjectId(jobId));
  if(job){
    job.tags = _.reduce(job.tags, function(res, tag){
      let found = _.find(body.tags, function(o){ return tag.equals(new ObjectId(o._id)) });
      if(!found){
        res.push(tag);
      }
      return res;
    }, [])
    await job.save().then(async () => {
      let cacheKey = `job:${jobId}`;
      await deleteFromCache(cacheKey);
    });
  }

  res.json(null);
});
/************************** JOB INSIGHT *****************************/
const getJobInsights = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {jobId} = params;
  const {timeframe} = query;

  let data = [];
  let min = 10, max = 100;
  let result = {}
  let job = await jobService.findById(jobId).populate([
    {path: 'searchAd', model: 'Ad'},
    {path: 'ads', model: 'Ad'}
  ]);

  if(job) {
    const impressionTypes = ['VIEWED', 'LIKED', 'SAVED', 'APPLIED', 'SHARED'];

    // Fetch insights for each type
    const promises = impressionTypes.map(type =>
      userImpressionService.getJobInsight(user.company?._id, job._id, timeframe, type)
    );

    const insights = await Promise.all(promises);

    result.impressions = insights || [];

    let impressionByLevels = await applicationService.getCandidatesLevelByJobId(jobId, timeframe);
    result.impressionByLevels = impressionByLevels;

    let sources = await applicationService.getCandidatesSourceByJobId(jobId, timeframe);
    result.sources = sources;

    let applicationByStages = await applicationService.getApplicationsStagesByJobId(jobId, timeframe);
    result.stages = applicationByStages;

    const { searchAd } = job;
    const remaining = searchAd ? searchAd.lifetimeBudget - searchAd.totalSpend : 0;
    let ads = {
      budget: job.searchAd ? {
        lifetimeBudget: parseInt(job.searchAd.lifetimeBudget),
        remainingBudget: remaining,
        totalSpend: searchAd.totalSpend,
        startTime: searchAd.startTime,
        endTime: searchAd.endTime,
        bidAmount: searchAd.bidAmount
      } : null,
      ads: job.ads ? _.reduce(job.ads, function(res, ad) {

        ad.targeting = null;
        res.push(ad);
        return res;
      }, []) : []
    };
    result.advertising = ads;
  }
  res.json(result);
});
const getJobActivities = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId, jobId} = params;

  let result = null;
  try {
    result = await activityService.findByJobId(companyId, new ObjectId(jobId), query);
    result = new Pagination(result);

  } catch (error) {
    console.log(error);
  }

  res.json(result);

});
const searchPeopleSuggestions = catchAsync(async (req, res) => {
  const {params, query, body} = req;

  let result;
  try {

    // body.jobTitles = ["Sr. Manager"];
    // body.locations = []
    // result = await feedService.searchPeople(body, query);
    result = await userService.search(query.query, body, query);
    // result.content = _.reduce(result.content, function(res, people){
    //
    //   people.employer = convertToCompany(people.employer);
    //   people = convertToCandidate(people);
    //   res.push(people);
    //   return res;
    // }, []);
  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));

});
/************************** JOB PIPELINE *****************************/
const updateJobPipeline = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {jobId} = params;

  try{
    body.updatedBy = user._id;
    let result = await jobService.updateJobPipeline(new ObjectId(jobId), body);
    if(result){
      let cacheKey = `job:${jobId}`;
      await deleteFromCache(cacheKey);
    }
    res.json(result);
  }catch(error){
    console.log(error);
    return res.status(500).send({success: false, error: 'Internal Server Error'})
  }

});
const getJobPipeline = catchAsync(async (req, res) => {
  const {params} = req;
  const {jobId, companyId} = params;
  let result = null;

  try {
    result = await jobService.getJobPipeline(jobId);
    if(result){
      result.stages = _.reduce(result.stages, function(res, stage){
        stage.tasks = _.reduce(stage.tasks, function(res, task){
          task.members = _.reduce(task.members, function(res, member){
            member.avatar = buildUserUrl(member);
            res.push(member);
            return res;
          }, []);

          res.push(task);
          return res;
        }, []);
        res.push(stage);
        return res;
      }, []);
    }

  } catch(e){
    console.log('getJobPipeline: Error', e);
  }


  res.json(result)
});
/************************** JOB MEMBERS *****************************/
const getJobMembers = catchAsync(async (req, res) => {
  const {params} = req;
  const {jobId} = params;
  let result;
  try {
    result = await jobService.getJobMembers(jobId);

  } catch(e){
    console.log('getJobMembers: Error', e);
  }


  res.json(_.reduce(result, function(res, m){res.push(m.transform()); return res}, []));
});
const updateJobMembers = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {jobId} = params;
  let result = null;
  try {
    result = await jobService.updateJobMembers(jobId, body.members, user);
    if(result.modifiedCount > 0){
      let cacheKey = `job:${jobId}`;
      await deleteFromCache(cacheKey);
    }
  } catch(e){
    console.log('updateJobMember: Error', e);
  }

  res.json({success: result.modifiedCount?true:false});
});
/************************** SUBSCRIBE JOB *****************************/
const subscribeJob = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {jobId} = params;
  let result;
  try {
    let subscription = {createdBy: user._id, member: user._id, subjectType: subjectType.JOB, subject: new ObjectId(jobId)};
    result = await memberService.subscribe(subscription);
  } catch(e){
    console.log('subscribeJob: Error', e);
  }

  res.json(result);
});
const unsubscribeJob = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {jobId} = params;

  let result;
  try {
    result = await memberService.unsubscribe(user._id, subjectType.JOB, new ObjectId(jobId));
  } catch(e){
    console.log('unsubscribeJob: Error', e);
  }

  res.json(result);
});
const updateJobApplicationForm = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {jobId} = params;
  let result;
  try {

    const job = await jobService.findById(jobId);
    if(!job){
      return res.status(500).send({success: false, error: 'Job not found'});
    }
    body.questionTemplate = body.questionTemplateId ? new ObjectId(body.questionTemplateId):null;
    const update = await jobService.updateJobApplicationForm(jobId, body, user._id);
    if(update && update.modifiedCount==1){
      result = {success: true};
      //Delete from Cache
      let cacheKey = `job:${jobId}`;
      await deleteFromCache(cacheKey);
      await deleteFromCache(`job:${job.jobId}`);
    }

  } catch(e){
    console.log('updateJobApplicationForm: Error', e);
  }

  res.json(result);
});
const getBoard = catchAsync(async (req, res) => {
  const { user, params, locale } = req;
  const { jobId } = params;

  let boardStages = [];
  let pipelineStages;
  let applicationSubscribed = await memberService.findMemberSubscribedToSubjectType(user._id, subjectType.APPLICATION);
  let job = await jobService.findById(jobId, locale).populate('pipeline');

  if (job.pipeline) {
    // let pipeline = await pipelineService.findById(job.pipeline);
    const { pipeline } = job;
    if (pipeline.stages) {

      let pipelineStages = pipeline.stages;
      let applicationsGroupByStage = await Application.aggregate([
        { $match: { job: job._id, status: { $in: ['ACTIVE', 'ACCEPTED'] } } },
        // {$lookup: {from: 'applicationprogresses', localField: 'currentProgress', foreignField: '_id', as: 'currentProgress' } },
        {
          $lookup: {
            from: "applicationprogresses",
            let: { currentProgress: "$currentProgress" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$currentProgress"] } } },
              {
                $addFields:
                  {
                    noOfEvaluations: { $size: "$evaluations" },
                    noOfEmails: { $size: '$emails' }
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
        { $unwind: '$currentProgress' },
        {
          $lookup: {
            from: "candidates",
            let: { user: "$user" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$user"] } } },
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
                    rating: { $round: [{ $avg: "$evaluations.rating" }, 1] },
                    evaluations: [],
                    applications: []
                  }
              },
            ],
            as: 'user'
          }
        },
        { $unwind: '$user' },
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
        { $group: { _id: '$currentProgress.stage', applications: { $push: "$$ROOT" } } },
        {
          $project: {
            _id: "$_id",
            noOfApplications: { $size: "$applications" },
            applications: { $slice: ["$applications", 10] }
          }
        }
      ]);

      // console.log(applicationsGroupByStage)
      pipelineStages.forEach(function(item) {

        let stage = {
          _id: item._id,
          type: item.type,
          name: item.name,
          timeLimit: item.timeLimit,
          tasks: item.tasks,
          applications: [],
          noOfApplications: 0
        }

        let found = _.find(applicationsGroupByStage, { '_id': item.type });

        if (found) {
          stage.applications = found.applications;
          stage.noOfApplications = found.noOfApplications;

          for (let [i, item] of stage.applications.entries()) {
            item.hasFollowed = _.find(applicationSubscribed, { subject: item._id }) ? true : false;
            item.user.avatar = buildCandidateUrl(item.user);
            if (item.currentProgress) {
              let completed = _.reduce(stage.tasks, function(res, item) {
                res.push(false);
                return res;
              }, []);
              if(stage.tasks) {
                for (const [j, task] of stage.tasks.entries()) {
                  if (task.type === taskType.EVALUATION && task.required) {
                    let noOfCompletedEvaluation = 0;
                    if (task.members && task.members.length) {
                      let createdBy = _.sortedUniq(_.reduce(item.currentProgress.evaluations, function(res, item) {
                        res.push(item.createdBy.toString());
                        return res;
                      }, []));
                      let members = _.sortedUniq(_.reduce(task.members, function(res, item) {
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
              }
              item.isCompleted = (!_.includes(completed, false)) ? true : false;
            }
          }
        }


        boardStages.push(stage);

      });
    }
  }
  res.json(boardStages);
});
// ToDO: Don't recall what this is for
const addSourceApplication = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {sourceId} = params;

  let progress;
  try {

    let source = await sourceService.findById(sourceId).populate('candidate').populate('job');

    if(source) {
      let stage = application.stage;
      delete application.stage;
      application.user = source.candidate._id;
      application.partyId= source.candidate.userId;
      application.job =source.job._id;
      application.jobTitle = source.job.jobTitle;
      application.company= source.job.company;

      application = await applicationService.apply(application);

    }
  } catch (error) {
    console.log(error);
  }

  res.json(application);
});
const searchCampaigns = catchAsync(async (req, res) => {
  const {params, body, query} = req;
  const {jobId} = params;

  let result = await emailCampaignService.search(new ObjectId(jobId), body, query);
  // let userIds = _.map(result.docs, 'user');
  // let users = await feedService.lookupUserIds(userIds);

  res.json(new Pagination(result));
})
const getJobAds = catchAsync(async (req, res) => {
  const {params} = req;
  const {jobId} = params;

  let result;
  try {
    let job = await jobService.getJobAds(new ObjectId(jobId));
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


  res.json(result);
});
const publishJob = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {jobId} = params;
  const {type} = body;

  let result = null;
  let job = await jobService.findById(new ObjectId(jobId)).populate('createdBy');
  if(job){
    job.type = type;
    job.status = statusEnum.ACTIVE;

    let publishedDate = Date.now();
    job.originalPublishedDate = !job.originalPublishedDate?publishedDate:job.originalPublishedDate;
    job.publishedDate = publishedDate;

    let endDate = new Date(publishedDate);
    endDate.setDate(endDate.getDate() + 30);
    job.endDate = endDate.getTime();
    job = await job.save();

    // job.skills = await feedService.findSkillsById(job.skills);


    await activityService.add({
      causer: user._id,
      causerType: subjectType.MEMBER,
      subjectType: subjectType.JOB,
      subject: job._id,
      action: actionEnum.PUBLISHED,
      meta: {type: type, job: job._id}
    });

    //Create Notification
    let meta = {
      companyId: job.companyId,
      jobId: job._id,
      jobTitle: job.title,
      publishedDate: new Date(job.publishedDate).toISOString(),
      userId: job.createdBy._id,
    };

    if(job.createdBy.messengerId !== user.messengerId){
      myEmitter.emit('create-notification', job.createdBy.messengerId, job.company, notificationType.JOB, 'JOB_POSTED', meta);
    }
    // Notify each job member
    const jobmembers = await jobService.getJobMembers(job._id);
    if (jobmembers && jobmembers.length > 0) {
      for (const jobmember of jobmembers) {
        if (jobmember.messengerId && jobmember.messengerId !== user.messengerId) {
          myEmitter.emit('create-notification', jobmember.messengerId, job.company, notificationType.JOB, 'JOB_POSTED', meta);
        }
      }
    }
    let cacheKey = `job:${jobId}`;
    await deleteFromCache(cacheKey);

  }

  res.json({status: actionEnum.PUBLISHED});
});
const payJob = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {jobId, companyId} = params;

  let result = {success: false, verification: false};
  let job = await jobService.getJobAds(new ObjectId(jobId));

  if(job) {
    let company = await companyService.findByCompanyId(companyId);
    body.customer = {id: company.customerId};
    if(company.customerId) {
      if (body.dailyBudget) {
        if(job.searchAd){
          job.searchAd.bidAmount = body.dailyBudget;
          await job.searchAd.save();
        } else {
          let startTime = new Date();
          let endTime = new Date();
          endTime.setDate(endTime.getDate() + 30);
          endTime.setHours(23);
          endTime.setMinutes(59);
          let ad = {
            lifetimeBudget: body.dailyBudget * 30,
            startTime: startTime.getTime(),
            endTime: endTime.getTime(),
            bidAmount: body.dailyBudget,
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

      if (body.cart.items.length) {
        let checkout = await checkoutService.payJob(user, body);
        if (checkout) {
          let products = await paymentProvider.lookupProducts(_.map(body.cart.items, 'id'));
          for (const [i, product] of products.entries()) {
            console.log('prod', product);
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
              let feed = await feedService.createJobFeed(job.jobId, company.partyType, company.companyId, job.description, user.userId);
              if (feed) {
                ad.feedId = feed.id;
              }
            }

            ad = await adService.add(ad);
            job.ads.push(ad);
          }
        }
      }

      const publishedDate = Date.now();
      job.status = statusEnum.ACTIVE;
      job.publishedDate = publishedDate;
      let endDate = new Date(publishedDate);
      endDate.setDate(endDate.getDate() + 30);
      job.endDate = endDate.getTime();
      job.type = (body.dailyBudget === 0) ? jobType.FREE : jobType.PROMOTION;;
      job = await job.save();

      await activityService.add({
        causer: user._id,
        causerType: subjectType.MEMBER,
        subjectType: subjectType.JOB,
        subject: job._id,
        action: actionEnum.PROMOTED,
        meta: {type: jobType.PROMOTION, job: job._id}
      });
      //Create Notification
      let meta = {
        companyId: job.companyId,
        jobId: job._id,
        jobTitle: job.title,
        publishedDate: new Date(job.publishedDate).toISOString(),
        userId: job.createdBy,
      };

      myEmitter.emit('create-notification', user.messengerId, job.company, notificationType.JOB, 'JOB_POSTED', meta);

      result = {success: true, verification: false};
    }
    // } else {
    //   result = { success: false, verification: true };
    // }

  }
  res.json(result);
});
const searchApplications = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {jobId} = params;

  body.job = new ObjectId(jobId);
  let applicationSubscribed = [];
  applicationSubscribed = await memberService.findMemberSubscribedToSubjectType(user._id, subjectType.APPLICATION);
  applicationSubscribed = applicationSubscribed.map(sub => sub.subject);

  let result = await applicationService.search(body, query, applicationSubscribed);
  result.docs.forEach(function(app){
    app.labels = [];
    app.note = [];
    app.comments = [];
    if(_.some(applicationSubscribed, {subjectId: new ObjectId(app._id)})){
      app.hasFollowed = true;
    }
    app.hasFollowed = applicationSubscribed.some(sub => sub.equals(app._id));
    app.user.avatar = buildCandidateUrl(app.user);
    app.user = convertToCandidate(app.user);
  })

  res.json(new Pagination(result));
});
const shortlistApplications = catchAsync(async (req, res) => {
  const {user, params, body} = req;

  const applications = _.reduce(body.applications, function(res, id){res.push(new ObjectId(id)); return res;}, []);
  let result = await applicationService.shortlistApplications(applications);
  if(result.nModified>0){
    result = {success: true}
  }
  res.json(result);
});
const removeShortlistApplications = catchAsync(async (req, res) => {
  const {user, params, body} = req;

  const applications = _.reduce(body.applications, function(res, id){res.push(new ObjectId(id)); return res;}, []);
  let result = await applicationService.removeShortlistApplications(applications);
  if(result.nModified>0){
    result = {success: true}
  }
  res.json(result);
});
const addApplication = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {jobId, companyId} = params;

  let savedApplication;
  try {
    const job = await jobService.findById(new ObjectId(body.jobId));

    // ToDo: Need to be able to add manual candidate w/o application.user(candidateId)
    const candidate = await candidateService.findById(new ObjectId(body.user)).populate('user');

    if(!job) {
      res.status(400).send('Invalid Job');
    }

    if(!candidate) {
      res.status(400).send('Invalid Candidate');
    }

    candidate.email = body.email || candidate.email;
    candidate.phoneNumber = body.phoneNumber || candidate.phoneNumber;
    candidate.firstName = body.firstName;
    candidate.lastName = body.lastName;

    savedApplication = await applicationService.add(body, job, candidate, user);



  } catch (error) {
    console.log(error.message);
    res.status(500).send({success:false, error: error.message});
  }

  res.json(savedApplication);
});
const getAllApplicationsEndingSoon = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;
  let result;

  const company = await companyService.findByCompanyId(companyId);
  if(company){
    result = await applicationService.getAllApplicationsEndingSoon(company._id, query);
    let applicationSubscribed = await memberService.findMemberSubscribedToSubjectType(user._id, subjectType.APPLICATION);
    result.docs.forEach(function(app){
      app.labels = [];
      app.progress=[];
      app.note = [];
      app.comments = [];
      if(_.some(applicationSubscribed, {subjectId: new ObjectId(app._id)})){
        app.hasFollowed = true;
      }
      app.hasFollowed = _.some(applicationSubscribed, {subject: new ObjectId(app._id)});
      app.user && (app.user.avatar = buildCandidateUrl(app.user));
      app.user = convertToCandidateMinimum(app.user);
    });
  }

  res.json(new Pagination(result));
});
const getAllApplicationsNewlyCreated = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;

  let result = await applicationService.getAllApplicationsNewlyCreated(user.company._id, query);
  let applicationSubscribed = await memberService.findMemberSubscribedToSubjectType(user._id, subjectType.APPLICATION);
  result.docs.forEach(function(app){
    app.labels = [];
    app.progress=[];
    app.note = [];
    app.comments = [];
    if(_.some(applicationSubscribed, {subjectId: new ObjectId(app._id)})){
      app.hasFollowed = true;
    }
    app.hasFollowed = _.some(applicationSubscribed, {subject: new ObjectId(app._id)});
    app.user && (app.user.avatar = buildCandidateUrl(app.user));
    app.user = convertToCandidateMinimum(app.user);
  });
  res.json(new Pagination(result));
});
const getApplicationById = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, applicationId} = params;

  let application;
  try {

    application = await applicationService.findById(new ObjectId(applicationId)).populate([
      {
        path: 'progress',
        model: 'ApplicationProgress',
        populate: [
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
        model: 'Candidate',
        populate: [
          { path: 'evaluations', model: 'Evaluation' },
          { path: 'experiences', model: 'Experience' },
          { path: 'educations', model: 'Education' },
        ]
      },
      {
        path: 'evaluations',
        model: 'Evaluation'
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
    let eventIds = _.compact(_.map(application.progress, 'event'));
    let events;
    try{
      events = await calendarService.lookupEvents(eventIds);
    } catch(err){
      console.log(err)
    }

    if (application) {
      application = application.toJSON();
      let requiredEvaluation = false;
      let hasEvaluated = false
      let noOfEvaluations = 0;
      let rating = 0;

      for (const [i, progress] of application.progress.entries()) {
        if (progress.attachment) {
          progress.attachment.path = config.cdn + "/" + progress.attachment.path;
        }

        if (progress.candidateAttachment) {
          progress.candidateAttachment.path = config.cdn + "/" + progress.candidateAttachment.path;
        }

        if (progress.event && events) {
          let event = _.find(events, {_id: progress.event.toString()});
          if(event){
            event.eventTopic = null;
            event.meta = null;
            progress.event = event;
          }
        }

        hasEvaluated = _.some(progress.evaluations, {createdBy: user._id});
        if(progress.stage) {

          //ToDo: Mobile will need to remove this on UI.  No more tasks per stage.  Only applications.task
          // progress.stage.tasks.forEach(function (task) {
          //   if (task.type === taskType.EMAIL) {
          //     task.isCompleted = progress.emails.length ? true : false;
          //     task.required = (!progress.emails.length) ? true : false;
          //   }
          //
          //   if (task.type === taskType.EVENT) {
          //     task.isCompleted = progress.event ? true : false;
          //     task.required = (!progress.event) ? true : false;
          //   }
          //
          //   if (task.type === taskType.EVALUATION) {
          //     task.isCompleted = hasEvaluated;
          //     task.required = (!hasEvaluated) ? true : false;
          //   }
          // });
          // progress.stage.members = [];
        }

        if (progress._id.equals(application.currentProgress)) {
          application.currentProgress = progress
          application.currentProgress.hasEvaluated = hasEvaluated;
        }


        // progress.stage.evaluations = [];

        // progress.stage.tasks = [];
        //progress.evaluations = [];
        // progress.emails = [];

      }

      application.progress = _.orderBy(application.progress, p => { return p.stage.stageId; }, ['asc']);

      application.noOfEvaluations = application.evaluations.length;

      if(application.user.userId){
        let user = await feedService.findByUserId(application.user.userId);
        const experiences = _.reduce(application.user.experiences, function(res, exp){res.push(exp); return res;}, user.experiences);
        const educations = _.reduce(application.user.educations, function(res, edu){res.push(edu); return res;}, user.educations);
        application.user = {...application.user, educations: educations, experiences: experiences};
        application.user = convertToCandidate(application.user);
      }else if(application.user.avatar){
        application.user.avatar = buildCandidateUrl(application.user);
      }

      // Calculate teamRating for application.user from application.user.evaluations
      if (application.user.evaluations) {
        const companyEvaluations = _.filter(application.user.evaluations, { companyId: companyId });
        if (companyEvaluations.length) {
          application.user.teamRating = Math.round(_.reduce(companyEvaluations, (res, e) => res + e.rating, 0) / companyEvaluations.length * 100) / 100;
        } else {
          application.user.teamRating = 0;
        }
      }
      // application.user = convertToCandidate(application.user);
    }

  } catch (error) {
    console.log(error);
  }

  res.json(application);
});
const disqualifyApplications = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {jobId, applications} = params;

  let result = null;
  try {

    body.applications = _.reduce(body.applications, function(res, o){ res.push(new ObjectId(o)); return res; }, []);
    result = await applicationService.disqualifyApplications(new ObjectId(jobId), body, user);
    console.log('result', result)
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }

  res.json(result);
});
const disqualifyApplication = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId} = params;

  let result;
  try {

    result = await applicationService.disqualify(new ObjectId(applicationId), body.reason, user);
    console.log('result', result)
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const revertApplications = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { jobId } = params;

  try {
    const applicationIds = body.applications.map(id => new ObjectId(id));
    body.applications = applicationIds;
    const result = await applicationService.revertApplications(new ObjectId(jobId), body, user);
    res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error reverting applications' });
  }

});
const revertApplication = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId} = params;

  let result;
  try {

    result = await applicationService.revert(new ObjectId(applicationId), user);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const deleteApplication = catchAsync(async (req, res) =>  {
  const {user, params, body} = req;
  const {applicationId} = params;

  let result;
  try {

    result = await applicationService.deleteById(new ObjectId(applicationId), user);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const acceptApplication = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId} = params;

  let result;
  try {

    result = await applicationService.accept(new ObjectId(applicationId), user);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const rejectApplication = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId} = params;

  let result;
  try {

    result = await applicationService.reject(new ObjectId(applicationId), user);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
// ToDo: Currently not using
const updateApplication = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId, companyId} = params;

  let application;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    application = await applicationService.findById(new ObjectId(applicationId));

    if(application) {




    }

  } catch (error) {
    console.log(error);
  }

  res.json(application);
});
const updateApplicationProgress = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, applicationId} = params;
  let currentUserId = parseInt(req.header('UserId'));
  let newStage = body.newStage;

  let progress = null;
  try {

    let application = await applicationService.findById(new ObjectId(applicationId)).populate([
      {
        path: 'currentProgress',
        model: 'ApplicationProgress'
      },
      {
        path: 'progress',
        model: 'ApplicationProgress'
      },
      {
        path: 'user',
        model: 'Candidate'
      },
      {
        path: 'company',
        model: 'Company'
      },
      {
        path: 'job',
        model: 'JobRequisition'
      }
    ]);

    if(application) {

      let job = await jobService.findById(application.job).populate('createdBy').populate('pipeline');
      let previousProgress = application.currentProgress;
      const {pipeline} = job;
      // _.forEach(application.progress, function(item){
      //   if(item.stage.equals(newStage)){
      //     progress = item;
      //     foundStage = item.stage;
      //   }
      // });

      progress = _.find(application.progress, {stage: newStage});
      // let pipeline = await pipelineTemplateService.findById(job.pipeline);
      let foundStage = _.find(pipeline.stages, {type: newStage});
      let previousStage = _.find(pipeline.stages, {type: previousProgress.stage});
      if(progress){
        application.currentProgress = progress;
        await application.save();
      } else {
        if(pipeline && foundStage) {
          progress = await  applicationProgressService.add({
            applicationId: application.applicationId,
            stage: foundStage.type
          });

          let taskMeta = {applicationId: application._id, applicationProgressId: application.currentProgress._id};
          await stageService.createTasksForStage(foundStage, '', taskMeta);

          application.currentProgress = progress;
          application.progress.push(progress);
          application.progress = _.orderBy(application.progress, ['stageId'], []);

          await application.save();

          let emailTask = _.find(foundStage.tasks, {type: 'EMAIL'});
          if(emailTask && emailTask.options.template){
            let emailtemplate = await emailTemplateService.findById(emailTask.options.template);
            if(emailtemplate){
              const placeHolderData = {
                candidate: {
                  firstName: application.user.firstName,
                  lastName: application.user.lastName,
                },
                company: {
                  name: application.company.name,
                  address: application.company.primaryAddress,
                },
                recruiter: {
                  firstName: job.createdBy.firstName,
                  lastName: job.createdBy.lastName,
                  jobTitle: job.createdBy.jobTitle,
                  email: job.createdBy.email,
                  phone: job.createdBy.phone,
                },
                job: {
                  jobTitle: application.jobTitle
                }
              };
              emailtemplate.bodyHtml = emailtemplate.bodyHtml?he.decode(emailtemplate.bodyHtml):null;
              let bodyTemplate = handlebars.compile(emailtemplate.bodyHtml);
              let subjectTemplate = handlebars.compile(emailtemplate.subject);
              emailtemplate.subject = subjectTemplate(placeHolderData);
              emailtemplate.bodyHtml = bodyTemplate(placeHolderData);
              let senderId = job.createdBy?.messengerId;
              let emailMeta = {from: {name: placeHolderData.recruiter.firstName + " " + placeHolderData.recruiter.lastName, email: placeHolderData.recruiter.email}, to: [{name: placeHolderData.candidate.firstName + " " + placeHolderData.candidate.lastName, email: application.email}], cc: [], bcc: [], message: emailtemplate.bodyHtml, isHtml: true, subject: emailtemplate.subject, senderId: senderId, applicationId: application._id, applicationProgressId: progress._id, source: emailSourceTypeEnum.JOB};
              let currentDate = new Date();
              if (emailTask.options && emailTask.options.date) {
                currentDate = addDurationToDate(currentDate, emailTask.options.date); // Parse the date string in pipeline and add to the current date
              }
              myEmitter.emit('create-task-for-automation', currentDate, currentDate,'EMAIL', emailMeta);
            }
          }
        }
      }

      if(progress || (pipeline && foundStage)){
        let activity = await activityService.add({causer: user._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.MOVED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, job: job._id, jobTitle: job.title, from: previousProgress.stage, to: newStage}});
        //Create Notification
        let meta = {
          applicationId: application._id,
          jobId: job._id,
          jobTitle: job.title,
          candidateId: application.user._id,
          userId: application.user.userId,
          name: application.user.firstName + ' ' + application.user.lastName,
          avatar: buildCandidateUrl(application.user),
          previousStage: previousStage?.name,
          newStage: foundStage.name
        };
        myEmitter.emit('create-notification', job.createdBy.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_PROGRESS_UPDATED, meta);
        // Notify each job member
        const members = await jobService.getJobMembers(job._id);
        if (members && members.length > 0) {
          for (const member of members) {
            if (member.messengerId && member.messengerId !== job.createdBy.messengerId) {
              myEmitter.emit('create-notification', member.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_PROGRESS_UPDATED, meta);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  res.json(progress);
});

function addDurationToDate(date, durationString) {
  // Extract days and minutes from the duration string
  const match = durationString.match(/(\d+)d,\s*(\d+):(\d+)/);
  if (!match) return date; // Return the original date if parsing fails

  const days = parseInt(match[1], 10);
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);

  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  newDate.setHours(newDate.getHours() + hours);
  newDate.setMinutes(newDate.getMinutes() + minutes);

  return newDate;
}

function replacePlaceholders(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
  }).replace(/\[(\w+\.\w+)\]/g, (match, key) => {
      const keys = key.split('.');
      let value = data;
      keys.forEach(k => {
          value = (value && value[k]) ? value[k] : null;
      });
      return value || match;
  });
}

const getApplicationProgress = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {progressId} = params;
  let progress;
  try {

    progress = await applicationProgressService.findById(new ObjectId(progressId)).populate([
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

      // let events = await calendarService.lookupEvents([progress.event]);


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

      const hasEvaluated = _.some(progress.evaluations, {createdBy: user._id});

      // ToDo: Stage is not a Stage Model anymore.  Now stage='APPLIED'
      // progress.stage.tasks.forEach(function (task) {
      //   if (task.type === taskType.EMAIL) {
      //     task.isCompleted = progress.emails.length ? true : false;
      //     task.required = (!progress.emails.length) ? true : false;
      //   }
      //
      //   if (task.type === taskType.EVENT) {
      //     task.isCompleted = progress.event ? true : false;
      //     task.required = (!progress.event) ? true : false;
      //   }
      //
      //   if (task.type === taskType.EVALUATION) {
      //     task.isCompleted = hasEvaluated;
      //     task.required = (!hasEvaluated) ? true : false;
      //   }
      // });


      progress.noOfEvaluations = progress.evaluations.length;
      progress.noOfEmails = progress.emails.length;
      progress.noOfEvents = progress.event?1:0;
      progress.evaluations = [];
      progress.emails = [];
    }

  } catch (error) {
    console.log(error);
  }

  res.json(progress);
})
const getApplicationQuestions = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {applicationId} = params;

  let result = null;
  try {

    let application = await applicationService.findById(new ObjectId(applicationId)).populate([
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
  res.json(result);
});
const getApplicationEvaluations = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {applicationId} = params;

  let result=[], stats = {}, rating = 0;
  try {

    result = await evaluationService.findByApplication(new ObjectId(applicationId));
    if(result.length){

      result.forEach(function(evaluation){
        evaluation.applicationProgress.hasEvaluated = evaluation.createdBy._id.equals(user._id);
      });

      const fields = _.keys(_.omit(result[0].assessment, ['_id', 'createdBy', 'candidateId', 'createdDate']));
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

  res.json({rating: rating, stats: stats, evaluations: result});
});
const addApplicationEvaluation = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, applicationId} = params;

  let result;
  try {

    let application = await applicationService.findById(new ObjectId(applicationId)).populate('user').populate('job').populate('currentProgress');
    if(application){
      const {job} = application;
      body.createdBy = user._id;
      body.application= new ObjectId(applicationId);
      body.applicationProgress=application.currentProgress;
      body.candidate = application.user._id;
      body.user = application.user.user;
      body.partyId = application.partyId;
      body.companyId = companyId;


      result = await evaluationService.add(body);
      if(result){

        // Update new evaluation in application, user, and applicationProgress
        application.user.evaluations.push(result._id);
        application.evaluations.push(result._id);
        application.currentProgress.evaluations.push(result._id);

        // Update the rating for the application
        const applicationEvaluations = await evaluationService.findByApplication(application._id);
        if(applicationEvaluations.length > 0){
          const applicationRating = applicationEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / applicationEvaluations.length;
          application.rating = applicationRating;
        }
        await application.currentProgress.save();
        await application.save();

        // Update the rating for the candidate (per company)
        const candidateEvaluations = await evaluationService.findByCandidate(application.user._id);
        if(candidateEvaluations.length > 0){
          const candidateRating = candidateEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / candidateEvaluations.length;
          application.user.rating = candidateRating;
        }
        await application.user.save();

        // Update the overall user rating (across all companies)
        const userEvaluations = await evaluationService.findByUser(application.user.user);
        if(userEvaluations){
          const userRating = userEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / userEvaluations.length;
          const userRecord = await userService.findbyId(application.user.user);
          userRecord.rating = userRating;
          await userRecord.save();
        }


        let activity = await activityService.add({
          causer: user._id,
          causerType: subjectType.MEMBER,
          subjectType: subjectType.EVALUATION,
          subject: result._id,
          action: actionEnum.ADDED,
          meta: {
            application: application._id,
            job: application.job,
            candidate: application.user._id,
            name: application.user.firstName + ' ' + application.user.lastName,
            stage: application.currentProgress.stage,
            rating: result.rating
          }
        });

      }
    }

  } catch (error) {
    console.log(error);
    return res.status(500).send({success:false, error: 'Internal Server Error'});
  }

  res.json(result);
});
const updateApplicationEvaluation = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId, evaluationId} = params;

  let evaluation = await evaluationService.findById(new ObjectId(evaluationId));
  try {
    if(evaluation) {
      evaluation.comment = body.comment;
      await evaluation.save();
    }
  } catch (error) {
    console.log(error);
  }

  res.json(evaluation);
});
const removeApplicationEvaluation = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {applicationId, evaluationId} = params;

  let result;
  try {
    let application = await applicationService.findById(new ObjectId(applicationId)).populate('user').populate('currentProgress');
    let foundEvaluation = _.find(application.evaluations, function(o){ return o.equals(new ObjectId(evaluationId))});
    if(foundEvaluation) {
      result = await evaluationService.remove(new ObjectId(evaluationId));
      if (result) {
        application.evaluations = _.reject(application.evaluations, function(o){ return o.equals(new ObjectId(evaluationId)); });

        // Update the rating for the application
        const applicationEvaluations = await evaluationService.findByApplication(application._id);
        if(applicationEvaluations.length > 0){
          const applicationRating = applicationEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / applicationEvaluations.length;
          application.rating = applicationRating;
        }else{
          application.rating = 0;
        }
        await application.save();

        // Update the rating for the candidate (per company)
        const candidateEvaluations = await evaluationService.findByCandidate(application.user._id);
        if(candidateEvaluations.length > 0){
          const candidateRating = candidateEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / candidateEvaluations.length;
          application.user.rating = candidateRating;
        }else{
          application.user.rating = 0;
        }
        await application.user.save();

        // Update the overall user rating (across all companies)
        const userEvaluations = await evaluationService.findByUser(application.user.user);
        const userRecord = await userService.findbyId(application.user.user);
        if(userEvaluations.length > 0){
          const userRating = userEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / userEvaluations.length;
          userRecord.rating = userRating;
        }
        await userRecord.save();

        let activity = await activityService.add({
          causer: user._id,
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

      }
    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
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
    result = await applicationProgressService.updateApplicationProgressEvent(new ObjectId(applicationProgressId), form);
  } catch (error) {
    console.log(error);
  }

  return result;
}
async function removeApplicationProgressEvent(companyId, applicationId, applicationProgressId) {
  if(!companyId || !applicationId || !applicationProgressId){
    return null;
  }

  // let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);
  // if(!memberRole){
  //   return null;
  // }

  let result;
  try {
    result = await applicationProgressService.removeApplicationProgressEvent(new ObjectId(applicationProgressId));
  } catch (error) {
    console.log(error);
  }

  return result;
}
const getApplicationEmails = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId, applicationId} = params;

  //let result = await applicationService.searchEmails(companyId, user, new ObjectId(applicationId), query);
  let result = await messagingService.searchMail({applicationId:applicationId},query);
  res.json(result.data);
});
const getApplicationLabels = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {applicationId} = params;
  let result = [];
  try {


    let application = await applicationService.findById(new ObjectId(applicationId)).populate([
      {
        path: 'labels',
        model: 'Label'
      }]);

    result = application?.labels?application.labels:[];


  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const addApplicationLabel = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId} = params;
  let result;
  try {


    let application = await applicationService.findById(new ObjectId(applicationId));
    if(application) {
      if(body._id){
        application.labels.push(new ObjectId(body._id));
        result = body;
      } else {
        const newLabel = await labelService.add(body);
        application.labels.push(newLabel._id);
        result = newLabel;
      }


      result = await application.save();

    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
})
const deleteApplicationLabel = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId, labelId} = params;

  let application;
  try {

    let application = await applicationService.findById(new ObjectId(applicationId));
    if(application) {
      application = await application.update(
        { $pull: { labels: ObjectId(labelId) } }
      );

    }

  } catch (error) {
    console.log(error);
  }

  res.json(application?.labels);
})
const getApplicationComments = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {applicationId, labelId} = params;

  let result=[];
  try {


    result = await commentService.getComments(subjectType.APPLICATION, new ObjectId(applicationId), query);

    if(result) {
      const commentIds = result.docs.map(comment => comment._id);
      result.docs.forEach(function(comment){
        comment.createdBy = convertToTalentUser(comment.createdBy);
      });
    }
  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});
const addApplicationComment = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId, labelId} = params;

  let result;

  let application = await applicationService.findById(new ObjectId(applicationId));
  if(application) {
    body.subjectType = subjectType.APPLICATION;
    body.subject = application;
    body.createdBy = user._id;
    result = await commentService.addComment(body, user);
    if(result){
      application.noOfComments++;
      await application.save();
    }
  }
  res.json(result);
})

const subscribeApplication = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId} = params;

  let result;
  try {
    let subscription = {
      createdBy: user._id,
      member: user._id,
      subjectType: subjectType.APPLICATION,
      subject: new ObjectId(applicationId)
    };
    result = await memberService.subscribe(subscription);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const unsubscribeApplication = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId} = params;

  let result;
  try {

    result = await memberService.unsubscribe(user._id, subjectType.APPLICATION, new ObjectId(applicationId));

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const getApplicationActivities = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId, applicationId} = params;

  let result = null;
  try {

    const activities = await activityService.findByApplicationId(companyId, new ObjectId(applicationId), query);
    let userIds = _.map(activities.docs, 'causerId');
    let users = await feedService.lookupUserIds(userIds);
    result = new Pagination(activities);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const uploadApplication = catchAsync(async (req, res) => {
  const {user, params, body, files} = req;
  const {companyId, applicationId} = params;

  let result = null;
  let basePath = 'applications/';
  let fileExt, fileName, cv, file, type, name, path, photo, response;
  let timestamp = Date.now();
  try {

    let application = await applicationService.findById(new ObjectId(applicationId)).populate('user');
    if (application) {
      let progress = application.currentProress;
      //------------Upload CV----------------

      if(files.file) {

        cv = files.file[0];
        fileName = cv.originalname.split('.');
        fileExt = fileName[fileName.length - 1];
        // let date = new Date();

        name = application.user.firstName + '_' + application.user.lastName + '_' + application.user._id + '-' + timestamp + '.' + fileExt;
        path = basePath + application.applicationId + '/' + name;
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
        file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: user.userId});
        if(file){
          application.resume = file._id;
          application.files.push(file._id);
          file.path = buildFileUrl(file.path);
          result = file;
        }

      }


      if(files.photo) {
        photo = files.photo[0];
        fileName = photo.originalname.split('.');
        fileExt = fileName[fileName.length - 1];
        timestamp = Date.now();
        name = application.user.firstName + '_' + application.user.lastName + '_' + application.user._id + '_' + application.applicationId + '-' + timestamp + '.' + fileExt;
        path = basePath + application.applicationId + '/photos/' + name;
        response = await awsService.upload(path, photo.path);
        switch (photo?.mimetype) {
          case 'image/png':
            type = 'PNG';
            break;
          case 'image/jpeg':
            type = 'JPG';
            break;
          case 'image/jpg':
            type = 'JPG';
            break;

        }
        application.photo = {filename: path, type: type};
        let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: user.userId});
        if(file){
          application.photo = file._id;
          application.files.push(file._id);
          file.path = buildFileUrl(file.path);
          result = file;
        }
      }

      await application.save();
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);

});
const getFiles = catchAsync(async (req, res) => {
  const {user, params, body, files} = req;
  const {applicationId} = params;

  let result=[];
  try {
    let application = await applicationService.findById(new ObjectId(applicationId)).populate([
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

  res.json(result);
})
const removeApplicationFile = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {applicationId, fileId} = params;

  let result = null;
  try {
    let application = await applicationService.findById(new ObjectId(applicationId)).populate([
    ]);

    if (application && application.files && _.some(application.files, {_id: new ObjectId(fileId)})) {
      result = await fileService.deleteById(fileId);
      const left =_.reject(application.applications, function(o){ return o.equals(new ObjectId(fileId))});
      await application.save();
      if(result){

      }
    }

  } catch(e){
    console.log('deleteApplicationFile: Error', e);
  }

  res.json(result);
})
const addCandidate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, applicationId} = params;

  body.company = user.company;
  body.companyId = parseInt(companyId);
  body.createdBy = user._id;
  let candidate = await candidateService.addCandidate(user.userId, body, false, true);
  res.json(candidate);
});
const importResumes = catchAsync(async (req, res) => {
  const {user, params, body, files} = req;
  const {companyId} = params;

  let result = [];
  let basePath = 'candidates/';
  try {
    // const allResumes = await affindaService.getAllResumes();
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



    for(const [i, newFile] of files.file.entries()){
      const hash = md5File.sync(newFile.path)
      let file = await fileService.findByHash(hash);


      const resume = new ResumeParser(newFile.path);
      await resume.parseToJSON()
        .then(async data => {
          const {parts} = data;

          if(parts){
            const {name, email, phone, skills} = parts;
            let newUser = await userService.findByEmailOrPhone(email, phone);

            if(!newUser) {
              newUser = {
                firstName: '',
                middleName: '',
                lastName: '',
                email: '',
                emails: [],
                phoneNumber: '',
                phones: [],
                resumes: []
              };

              if (name) {
                const fullName = name.split(' ');
                switch (fullName.length) {
                  case 3:
                    newUser.firstName = fullName[0];
                    newUser.middleName = fullName[1];
                    newUser.lastName = fullName[2];
                    break;
                  case 2:
                    newUser.firstName = fullName[0];
                    newUser.lastName = fullName[1];
                    break;
                  case 1:
                    newUser.firstName = fullName[0];
                    break;
                }
              }

              if (email) {
                newUser.email = email;
                newUser.emails.push({ isPrimary: true, contactType: "PERSONAL", value: email });
              }

              if (phone) {
                newUser.phones.push({ isPrimary: true, contactType: "MOBILE", value: phone });
                newUser.phoneNumber = phone;
              }

              if (skills) {

              }

              newUser = await userService.add(newUser);
            }

            console.log(newUser)
            if(newUser){
              const existingCandidate = await candidateService.findByUserAndCompany(newUser._id, user.company._id);
              const candidate = await candidateService.create(newUser, user.company._id);
              const isDuplicate = existingCandidate?true:false;

              //ToDo: Check file.
              if (!file && !candidate) {
                let fileName = newFile.originalname.split('.');
                let fileExt = fileName[fileName.length - 1];
                let timestamp = Date.now();
                let path = basePath + candidate._id + '/' + newFile.originalname;

                await awsService.upload(path, newFile.path);
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
                file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: user.userId, hash: hash});
                if(file){
                  candidate.resume = file._id;
                  await candidate.save();
                }

              }

              result.push({_id: candidate._id, firstName: candidate.firstName, lastName: candidate.lastName, resume: newFile.originalname, isDuplicate });
            }

          }

        })
        .catch(error => {
          console.error(error);
        });
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
})


const getCandidatesFlagged = catchAsync(async (req, res) => {
  const {params, body, query} = req;
  const {companyId} = params;

  let result = null;
  try {
    result = await candidateService.getCompanyBlacklisted(companyId, query);

    result.docs = _.reduce(result?.docs, function(res, item){
      item = _.pick(item, ['_id', 'firstName', 'lastName', 'userId', 'companyId', 'company', 'avatar', 'status', 'city', 'state', 'country', 'rating', 'jobTitle', 'flag']);
      item.avatar = buildCandidateUrl(item);
      res.push(item);
      return res;
    }, []);
  } catch(e){
    console.log('getPeopleFlagged: Error', e);
  }


  res.json(new Pagination(result));
});
const searchCandidates = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId} = params;
  let result = null;

  if(user.company){
    if (!Array.isArray(body.company)) {
      body.company = [];
    }
    if (!body.company.includes(user.company._id)) {
      body.company.push(user.company._id);
    }
    body.query = query.query;

    let candidateSubscribed = [];
    candidateSubscribed = await memberService.findMemberSubscribedToSubjectType(user._id, subjectType.CANDIDATE);
    candidateSubscribed = candidateSubscribed.map(sub => sub.subject);

    result = await candidateService.search(body, query, candidateSubscribed );
    let people = await feedService.lookupCandidateIds(_.map(result.docs, 'userId'));
    let pools = await poolService.findByCompany(user.company._id);

    const isSuperUser = user.role.isSuper === true;
    result.docs = _.reduce(result.docs, function(res, candidate){
      let hasSaved = candidateSubscribed.some(sub => sub.equals(candidate._id));
      /*for (let pool of pools) {
        let found = _.includes(pool.candidates, candidate._id);
        for (let c of pool.candidates) {
          if(candidate._id.equals(c)){
            hasSaved=true;
          }
        }
        if (found) {
          hasSaved = true;
        }
      }*/

      const applications = [];
      for (let application of candidate.applications) {
        if (isSuperUser || _.find(application?.job?.members, function (m) { return m.equals(user._id); }) || 
            (application.job?.createdBy && application.job.createdBy.equals(user._id))) {
          application.match = getRandomMatchValue();
          application.job = application.job._id;
          application.currentProgress.stage = _.pick(application.currentProgress.stage, ['name', 'type', 'createdAt', 'updatedAt']);
          application.currentProgress = _.pick(application.currentProgress, ['_id', 'stage', 'createdDate']);
          application = _.pick(application, ['_id', 'job', 'jobTitle', 'currentProgress', 'createdDate', 'match']);
          applications.push(application);
        }
      }
      candidate.applications = applications;

      let found = _.find(people, {id: candidate.userId});
      if(found)
      {
        // candidate.skills = found.skills
        // candidate.past = found.past;
        // candidate.experiences = found.experiences;
        // candidate.educations = found.educations;
        candidate.avatar = candidate.avatar || found.avatar;
      }

      const noOfDays = dateDifference(candidate.createdDate);

      candidate.isNew = noOfDays && noOfDays < 7;
      candidate.firstName = candidate.firstName?candidate.firstName:candidate.email;
      candidate.hasSaved=hasSaved;
      candidate.tags=[];
      candidate.sources=[];
      candidate.evaluations=[];
      candidate.avatar = buildCandidateUrl(candidate);
      candidate.noOfMonthExperiences = candidate.noOfMonthExperiences ? candidate.noOfMonthExperiences : 0;
      candidate.openToJob = (candidate.preferences?.openToJob !== undefined) ? candidate.preferences?.openToJob : (candidate.user?.preferences?.openToJob !== undefined) ? candidate.user.preferences.openToJob : candidate.openToJob;
      // res.push(convertToCandidate(candidate));
      res.push(candidate);
      return res;
    }, []);
  }


  res.json(new Pagination(result));
});
const getRandomMatchValue = () => {
  //return random value between 30 & 100
  return Math.floor(Math.random() * (100 - 30 + 1)) + 30;
};
const getCandidateById = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, candidateId} = params;

  let result;
  let candidate;

  const allowToViewCandidate = _.includes(user?.role.privileges, 'view_candidate');
  if(!allowToViewCandidate){
    res.status(403).json({})
  }

  const cacheKey = `candidate:${candidateId}`
  const cachedCandidate = await getFromCache(cacheKey);
  if(!cachedCandidate){
    console.log('Retriving candidate data from Database');
    candidate = await candidateService.findById(new ObjectId(candidateId)).populate([
      {
        path: 'tags',
        model: 'Label'
      },
      {
        path: 'sources',
        model: 'Label'
      },
      {
        path: 'references',
        model: 'Reference'
      },
      {
        path: 'flag',
        model: 'Flag'
      },
      {
        path: 'experiences',
        model: 'Experience'
      },
      {
        path: 'educations',
        model: 'Education',
        populate: [
          {
            path: 'fieldOfStudy',
            model: 'FieldStudy'
          }
        ]
      },
      {
        path: 'skills',
        model: 'PartySkill'
      },
      {
        path: 'resume',
        model: 'File'
      },
      {
        path: 'user',
        model: 'User',
        populate: [
          {
            path: 'skills',
            model: 'PartySkill',
            populate: [
              {
                path: 'skill',
                model: 'Skill'
              }
            ]
          }
        ]
      }
    ]);


    if(!candidate || candidate.status===statusEnum.DELETED){
      res.status(404).json({})
    } else {


      // candidate = _.merge({}, candidate);
      if(candidate.skills && candidate.skills.length>0) {
        // candidate.skills = await feedService.findSkillsById(_.map(candidate.skills, 'id'));
      }

      // if (candidate.applications && candidate.applications.length > 0) {
      //   candidate.applications = candidate.applications.filter(application => application.status !== statusEnum.DELETED);
      // }

      if(candidate.userId){
        let user = await feedService.findByUserId(candidate.userId);
        if(user){
          // console.log(candidate.skills)
          // console.log(people.skills)
          // people.skills = _.reduce(people.skills, function(res, s){res.push({...s, _private: true}); return res;}, []);
          // const skills =_.reduce(candidate.skills, function(res, s){
          //   if(!_.find(people.skills, {id: s.id})){
          //     res.push(s);
          //   }
          //   return res;
          // }, people.skills);
          // candidate.skills = skills;
          // candidate.experiences = people.experiences;
          // candidate.educations = people.educations;
          candidate.avatar = candidate.avatar ? candidate.avatar : user.avatar;
        }
      }


      candidate.preferences = candidate.preferences? candidate.preferences : candidate.user?.preferences;
      candidate.firstName = candidate.firstName?candidate.firstName:candidate.email
      candidate.match = 78;

      let evaluations = await evaluationService.getCandidateEvaluations(candidate._id);
      if (evaluations) {
        let companyEvaluations = _.filter(evaluations, {companyId: Number(companyId)});

        if (companyEvaluations) {
          candidate.teamRating = Math.round(_.reduce(companyEvaluations, function (res, e) {
            return res + e.rating;
          }, 0) / companyEvaluations.length * 100) / 100;
        }

        candidate.rating = Math.round(_.reduce(evaluations, function (res, e) {
          return res + e.rating;
        }, 0) / evaluations.length * 100) / 100;

      }

      const pools = await poolService.findPoolsByCandidateId(new ObjectId(candidateId));
      candidate.pools = pools;
      if(candidate.resume){
        candidate.resume.path = buildFileUrl(candidate.resume.path);
      }

      result = candidate.transform();
      await saveToCache(cacheKey, result);
    }
  }else{
    console.log('Serving candidate data from cache');
    result = JSON.parse(cachedCandidate);
  }


  if(result){

    const applications = await applicationService.findApplicationsByUserId(new ObjectId(candidateId)).populate('job').populate('currentProgress');

    const isSuperUser = user.role.isSuper === true;
    if (isSuperUser) { // If the user is a super user, return all applications
      result.applications = applications;
    }else{
      const filteredApplications = applications.filter(o => {
        const isMember = _.find(o?.job?.members, function (m) { return m.equals(user._id); });
        const isOwner = o.job?.createdBy && o.job.createdBy.equals(user._id);
        return isMember || isOwner; // Include if the user is a member or the owner
      });
      result.applications = filteredApplications;
    }

  }

  res.json(result);
});
const updateCandidateById = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result;
  let candidate = await candidateService.findById(new ObjectId(candidateId)).populate('experiences').populate('educations').populate('tags').populate('skills');

  if(candidate) {
    candidate.firstName = body.firstName;
    candidate.middleName = body.middleName;
    candidate.lastName = body.lastName;
    candidate.email = body.email;
    candidate.emails = body.emails;
    candidate.phoneNumber = body.phoneNumber;
    candidate.phones = body.phones;
    candidate.countryCode = body.countryCode;
    candidate.phones = body.phones;
    candidate.about = body.about;
    candidate.gender = body.gender;
    candidate.maritalStatus = body.maritalStatus;
    candidate.dob = body.dob;
    candidate.links = body.links;
    candidate.primaryAddress = body.primaryAddress;
    candidate.jobTitle = body.jobTitle;
    candidate.level = body.level?body.level : candidate.level;
    result = await candidate.save();
    if(result.userId){
      let user = await feedService.findByUserId(result.userId);
      if(user){
        result.avatar = result.avatar ? result.avatar : user.avatar;
      }
    }
    if(result){
      result.avatar = buildCandidateUrl(result);
      const pools = await poolService.findPoolsByCandidateId(candidate._id);
      result.pools = pools;

      const applications = await applicationService.findApplicationsByUserId(new ObjectId(candidateId)).populate('job').populate('currentProgress');
      const isSuperUser = user.role.isSuper === true;
      if (isSuperUser) { // If the user is a super user, return all applications
        result.applications = applications;
      }else{
        const filteredApplications = applications.filter(o => {
          const isMember = _.find(o?.job?.members, function (m) { return m.equals(user._id); });
          const isOwner = o.job?.createdBy && o.job.createdBy.equals(user._id);
          return isMember || isOwner; // Include if the user is a member or the owner
        });
        result.applications = filteredApplications;
      }
    }
  }

  res.json(result);

});
const removeCandidateById = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result;
  try{
    await candidateService.removeCandidate(new ObjectId(candidateId));

    //delete from cache
    let cacheKey = `candidate:${candidateId}`;
    await deleteFromCache(cacheKey);
    res.json({ success: true });
  }catch (error){
    console.error('Error removing candidate:', error);
    res.status(500).json({ success: false, message: 'Failed to delete candidate.' });
  }

});

const removeCandidates = catchAsync(async (req, res) => {
  const { body } = req;
  const { candidateIds } = body;

  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).send({ error: 'candidateIds should be a non-empty array' });
  }

  try {
    await candidateService.removeCandidates(candidateIds.map(id => new ObjectId(id)));

    // delete from cache
    const cacheKeys = candidateIds.map(id => `candidate:${id}`);
    await Promise.all(cacheKeys.map(key => deleteFromCache(key)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing candidates:', error);
    res.status(500).json({ success: false, message: 'Failed to delete candidates.' });
  }
});

/************************** CANDIDATE NOTES *****************************/
const getCandidateNotes = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId, candidateId} = params;

  let result;
  try {
    result = await noteService.getNotes(subjectType.CANDIDATE, new ObjectId(candidateId), query);

    result.docs.forEach(function(note){
      note.createdBy = convertToTalentUser(note.createdBy);
    });

  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});
const addCandidateNote = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result;
  body.subjectType = subjectType.CANDIDATE;
  body.subject = new ObjectId(candidateId);
  body.createdBy = user._id;
  result = await noteService.addNote(body);
  res.json(result);
});
const updateCandidateNote = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, noteId} = params;

  let result;
  try {
    let note = await noteService.findById(new ObjectId(noteId));
    if(note && note.createdBy.equals(user._id)) {
      note.message = body.message;
      note.lastUpdatedDate = Date.now();
      result = await note.save()
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
})
const removeCandidateNote = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, noteId} = params;

  let result=null;
  try {
    let note = await noteService.findById(new ObjectId(noteId));

    if(note && note.createdBy.equals(user._id)) {
      result = await noteService.deleteById(noteId);
      if(result){
        result = {status: statusEnum.DELETED};
      }
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
/************************** CANDIDATE TAGS *****************************/
const addCandidateTag = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;
  const {tags} = body;

  let result=[];
  try {
    let candidate = await candidateService.findById(new ObjectId(candidateId));

    if(candidate) {
      for(const index in tags){
        if(!tags[index]._id){
          let newLabel = {name: tags[index].name, type: 'TAG', company: candidate.company, createdBy: user._id};
          newLabel = await labelService.add(newLabel);
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

  res.json(result);
});
const addTagsToMultipleCandidates = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { candidateIds, tags } = body;

  let results = [];
  try {
    const candidates = await candidateService.findByIds(candidateIds.map(id => new ObjectId(id)));

    for (const index in tags) {
      if (!tags[index]._id) {
        let newLabel = {
          name: tags[index].name,
          type: 'TAG',
          company: user.company,
          createdBy: user._id
        };
        newLabel = await labelService.add(newLabel);
        if (newLabel) {
          tags[index]._id = newLabel._id;
          results.push(newLabel._id);
        }
      } else {
        results.push(new ObjectId(tags[index]._id))
      }
    }

    // Add tags to each candidate
    await Promise.all(candidates.map(async candidate => {
      const tags = _.uniqWith([...candidate.tags, ...results], _.isEqual);
      candidate.tags = tags;
      await candidate.save();
    }));

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to add tags to candidates.' });
  }

  res.json({ success: true, tags: results });
});

const removeCandidateTag = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, tagId} = params;

  let result;
  try {
    let candidate = await candidateService.findById(new ObjectId(candidateId));
    if(candidate){
      for(const [i, tag] of candidate.tags.entries()){
        if(tag.equals(new ObjectId(tagId))){
          candidate.tags.splice(i, 1);
          await candidate.save();
          result = {success: true};
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  res.json(result);
});
const updateCandidatePool = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result = null;
  try {
    let pools = await poolService.findByCompany(user.company);
    if (pools) {
      for(const [i, pool] of pools.entries()){

        // let existPool = _.find(body.pools, function(item){return new ObjectId(item).equals(pool._id); });
        // if(!existPool){
        //   for(const [j, candidate] of pool.candidates.entries()){
        //     if(candidate==candidateId){
        //       pool.candidates.splice(j, 1);
        //     }
        //   }
        //
        // } else {
        //   let existCandidate= false;
        //   for(const [i, candidate] of pool.candidates.entries()){
        //     if(candidate==candidateId){
        //       existCandidate = true
        //     }
        //   }
        //   if(!existCandidate){
        //     pool.candidates.push(candidateId);
        //   }
        // }

        // console.log(pool._id, pool.candidates);
        const cid = new ObjectId(candidateId);
        const isOldPool =  _.find(pool.candidates, function(o){ return o.equals(cid); });
        const isNewPool =  _.find(body.pools, function(o){ return pool._id.equals(new ObjectId(o)); });
        if(isOldPool && isNewPool){
        } else if(isOldPool && !isNewPool) {
          pool.candidates = _.reduce(pool.candidates, function(res, item){
            if(!item.equals(cid)){
              res.push(item);
            }
            return res;
          }, []);
          await pool.save().then(async () => {
            await deleteFromCache(`candidate:${candidateId}`);
          });
        } else if(!isOldPool && isNewPool) {
          pool.candidates.push(cid);
          await pool.save().then(async () => {
            await deleteFromCache(`candidate:${candidateId}`);
          });
        }
        // Remove duplicates from pool.candidates after processing
        pool.candidates = [...new Set(pool.candidates.map(c => c.toString()))].map(id => new ObjectId(id));
        await pool.save();
      }
    }

  } catch(e){
    console.log('updateCandidatePool: Error', e);
  }
  res.json({ success: true });
});
/************************** CANDIDATE Evaluations *****************************/
const getCandidateEvaluations = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId, candidateId} = params;

  let result;
  try {
    body.applicationId = body.applicationId ? new ObjectId(body.applicationId): null;
    body.companyId = body.companyId ? parseInt(body.companyId) : null;
    result = await evaluationService.filterByCandidateId(new ObjectId(candidateId), body, query);


    // let userIds = _.reduce(result.docs, function(res, item){res.push(item.createdBy.userId); return res;}, []);
    // let users = await feedService.lookupUserIds(userIds);
    //
    // result.docs.forEach(function(evaluation){
    //   let found = _.find(users, {id: evaluation.createdBy.userId});
    //   if(found){
    //     evaluation.createdBy.avatar = found.avatar;
    //   }
    //   evaluation.createdBy.followJobs = [];
    //
    // });
    let job;
    if(result.docs.length > 0){
      job = await jobService.getJobByApplicationId(new ObjectId(result.docs[0].application));
    }

    let hasUserEvaluated = false;
    const isJobOwner = job && job.createdBy && (job.createdBy.toString() === user._id.toString());
    const isAdmin = user.role && user.role.name && user.role.name.toLowerCase().includes('Administrator'.toLowerCase());

    result.docs.forEach(function(evaluation){
      const member = Member(evaluation.createdBy);
      evaluation.createdBy = member.transform();
      if (evaluation.createdBy._id.equals(user._id)) {
        evaluation.applicationProgress.hasEvaluated = true;
        hasUserEvaluated = true; // Set flag if user has an evaluation
      }
    });
    if (!isJobOwner && !isAdmin && !hasUserEvaluated) {
      result.docs = []; // If none of the conditions are met, return an empty list
    }

  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
})

//
const getCandidateEvaluationsStats = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId, candidateId} = params;

  let result;
  try {
    body.applicationId = body.applicationId ? new ObjectId(body.applicationId): null;
    result = await evaluationService.getCandidateEvaluationsStats(new ObjectId(candidateId), companyId, body, user);


  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const getCandidateEvaluationById = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId, evaluationId} = params;

  let result;
  try {
    result = await evaluationService.findById(new ObjectId(evaluationId));
    result.createdBy = result.createdBy.transform();

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
/************************** CANDIDATE Activities *****************************/
const getCandidateActivities = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId, candidateId} = params;

  let result;
  try {
    let company = await companyService.findByCompanyId(companyId);
    if(company){
      result = await activityService.findByCandidateId(company._id, new ObjectId(candidateId), query);
    }


  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});
/************************** CANDIDATE Experiences *****************************/
const getCandidateExperiences = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result=[];
  try {
    const candidate = await candidateService.findById(new ObjectId(candidateId)).populate('experiences');
    if(candidate) {
      const companies = await feedService.lookupCompaniesIds(_.map(candidate.experiences, 'employer.id'))
      result = _.reduce(candidate.experiences, function(res, exp) {
        let employer = _.find(companies, { id: exp.employer.id });
        exp.employer = convertToCompany(employer);
        res.push(exp);
        return res;
      }, []);


    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const addCandidateExperience = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result;
  try {
    result = await candidateService.addExperience(new ObjectId(candidateId), body);
    if(result){
      let cacheKey = `candidate:${candidateId}`;
      await deleteFromCache(cacheKey);
    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const updateCandidateExperience = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, experienceId} = params;

  let result;
  try {
    result = await candidateService.updateExperience(new ObjectId(candidateId), new ObjectId(experienceId), body);
    if(result){
      let cacheKey = `candidate:${candidateId}`;
      await deleteFromCache(cacheKey);
    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const removeCandidateExperience = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, experienceId} = params;

  let result;
  try {
    await candidateService.removeExperience(new ObjectId(candidateId), new ObjectId(experienceId)).then(async () => {
      let cacheKey = `candidate:${candidateId}`;
      await deleteFromCache(cacheKey);
    });

  } catch (error) {
    result = {success: false};
    console.log(error);
  }

  res.json(result);
});
/************************** CANDIDATE Educations *****************************/
const addCandidateEducation = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let educations;
  let result = [];
  try {
    if(body.fieldOfStudy){
      body.fieldOfStudy = new ObjectId(body.fieldOfStudy);
    }
    result = await candidateService.addEducation(new ObjectId(candidateId), body);
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const updateCandidateEducation = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, educationId} = params;

  let result;
  result = await candidateService.updateEducation(new ObjectId(candidateId), new ObjectId(educationId), body);
  if(result){
    let cacheKey = `candidate:${candidateId}`;
    await deleteFromCache(cacheKey);
  }

  res.json(result);
});
const getCandidateEducations = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result=[];
  try {
    const candidate = await candidateService.findById(new ObjectId(candidateId)).populate(
      [
        {
          path: 'educations',
          model: 'Education',
          populate: [
            {
              path: 'fieldOfStudy',
              model: 'FieldStudy'
            }
          ]
        }
      ]);

    if(candidate) {
      let institutes = await feedService.lookupInstituteIds(_.map(candidate.educations, 'institute.id'))
      result = _.reduce(candidate.educations, function(res, edu) {
        let institute = _.find(institutes, { id: edu.institute.id });
        edu.institute = convertToCompany(institute);
        res.push(edu);
        return res;
      }, []);
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const removeCandidateEducation = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, educationId} = params;

  let result;
  let educations = await candidateService.removeEducation(new ObjectId(candidateId), new ObjectId(educationId));

  result = {success: true};

  res.json(result);
});
/************************** CANDIDATE Skills *****************************/
const getCandidateSkills = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result = [], candidate;
  try {
    candidate = await candidateService.findById(new ObjectId(candidateId)).populate('skills');
    let skillIds = _.map(candidate.skills, 'id');

    // if(skillIds.length) {
    //   let foundSkills = await feedService.findSkillsById(skillIds);
    //   result = _.reduce(foundSkills, function (res, skill) {
    //     let found = _.find(foundSkills, {id: skill.id})
    //     if (found) {
    //       skill.name = found.name;
    //     }
    //     res.push(skill);
    //     return res;
    //
    //   }, []);
    // }
    //
    // if(!candidate.hasImported && candidate.userId){
    //   let skills = await feedService.getUserSkills(candidate.userId);
    //   result = _.reduce(skills, function(res, item){
    //     let skill = {id: item.skill.id, name: item.skill.name, noOfMonths: item.noOfMonths, rating: 0};
    //     res.push(skill);
    //     return res;
    //   }, []);
    // }
    //



  } catch (error) {
    console.log(error);
  }

  res.json(candidate?.skills || []);
});
const updateCandidateSkills = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result;
  result = await candidateService.updateSkills(new ObjectId(candidateId), body);

  res.json(result);
})

const addCandidateSkill = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {candidateId} = params;

  let result = null;
  try {
    const candidate = await candidateService.findById(candidateId);
    if(candidate){
      if(body.rating){ body.selfRating = body.rating };
      result = await partySkillService.add(body)
      console.log(result)
      candidate.skills.push(result._id);
      await candidate.save();
    }


  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const updateCandidateSkill = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, skillId} = params;

  let result;
  const candidate = await candidateService.findById(new ObjectId(candidateId));
  if(candidate){
    result = await partySkillService.findById(new ObjectId(skillId));
    if(result){
      result.noOfMonths = body.noOfMonths;
      result.selfRating = body.rating;
      result.lastUpdatedDate = new Date()
      result = await result.save();
      let cacheKey = `candidate:${candidateId}`;
      await deleteFromCache(cacheKey);
    }
  }
  res.json(result);
})
const removeCandidateSkill = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, skillId} = params;

  let result;
  try {
    const candidate = await candidateService.findById(new ObjectId(candidateId));
    if(candidate){
      const skills = _.reject(candidate.skills, function(o){ return o.equals(new ObjectId(skillId))});
      candidate.skills = skills;
      await candidate.save();
    }
  } catch (error) {
    console.log(error);
  }

  res.json({ success: true });
});
/************************** CANDIDATE References *****************************/
const getCandidateReferences = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result = [], candidate;
  try {
    candidate = await candidateService.findById(new ObjectId(candidateId)).populate('references');
  } catch (error) {
    console.log(error);
  }

  res.json(candidate?.references || []);
});
const addCandidateReference = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result;
  result = await candidateService.addReference(new ObjectId(candidateId), body);
  res.json(result);
})
const updateCandidateReference = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, referenceId} = params;

  let result;
  result = await candidateService.updateReference(new ObjectId(candidateId), new ObjectId(referenceId), body);
  if(result){
    let cacheKey = `candidate:${candidateId}`;
    await deleteFromCache(cacheKey);
  }
  res.json(result);
})
const removeCandidateReference = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, referenceId} = params;

  let result;
  try {
    result = await candidateService.removeReference(new ObjectId(candidateId), new ObjectId(referenceId));
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
/************************** CANDIDATE COMMENT *****************************/
const getCandidateComments = catchAsync(async (req, res) => {
  const {user, params, query} = req
  const {candidateId, companyId} = params;
  let result;
  try {
    result = await commentService.getComments(subjectType.CANDIDATE, new ObjectId(candidateId), query, user._id);

    result.docs.forEach(function(comment){
      comment.createdBy = convertToTalentUser(comment.createdBy);
    });
  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});
const addCandidateComment = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {candidateId, companyId} = params;

  let result;
  let candidate = await candidateService.findById(candidateId);
  if(candidate) {
    body.subjectType = subjectType.CANDIDATE;
    body.subject = candidate._id;
    body.createdBy = user._id;
    result = await commentService.addComment(body, user);
  }

  res.json(result);
});
const updateCandidateComment = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {candidateId, commentId} = params;

  let result;
  try {
    let found = await commentService.findBy_Id(commentId);
    if(found) {
      found.message = body.message;
      found.lastUpdatedDate = Date.now();
      result = await found.save()
    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const deleteCandidateComment = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {candidateId, commentId} = params;

  let result;
  try {
    let comment = await commentService.findByIdAndDelete(new ObjectId(commentId));
    if(comment) {
      result = {success: true};
    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

/************************** CANDIDATE Comment Reactions *****************************/
const addReactionToCandidateCommentById = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {candidateId, companyId, commentId} = params;

  let result;

  try {
    let reaction = await reactionService.getReaction(subjectType.COMMENT, new ObjectId(commentId), user._id);
    if(reaction){
      if(body.reactionType){
        //Update Reaction
        reaction.reactionType = body.reactionType;
        reaction.createdDate = new Date();
        result = await reaction.save();
      }else{
        //Delete Reaction
        await reactionService.removeReaction(reaction._id).then(async () => {
          result = {success: true};
        });
      }
    }else{
      // Create new Reaction
      let newReaction = {
        subjectType: subjectType.COMMENT,
        subject: new ObjectId(commentId),
        reactionType: body.reactionType,
        reactionBy: user._id,
      }
      result = await reactionService.addReaction(newReaction);
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
/************************** CANDIDATE Subscribes *****************************/
const subscribeCandidate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {candidateId} = params;

  let result;
  try {
    let subscription = {
      createdBy: user._id,
      member: user._id,
      subjectType: subjectType.CANDIDATE,
      subject: new ObjectId(candidateId)
    };
    result = await memberService.subscribe(subscription);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const unsubscribeCandidate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {candidateId} = params;

  let result;
  try {

    result = await memberService.unsubscribe(user._id, subjectType.CANDIDATE, new ObjectId(candidateId));

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const subscribeCandidates = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { companyId } = params;
  const { candidateIds } = body;

  let results = [];

  try {
    for (const candidateId of candidateIds) {
      let subscription = {
        createdBy: user._id,
        member: user._id,
        subjectType: subjectType.CANDIDATE,
        subject: new ObjectId(candidateId),
      };
      const result = await memberService.subscribe(subscription);
      results.push(result);
    }
  } catch (error) {
    console.error('Error subscribing to candidates:', error);
    return res.status(500).json({ success: false, message: 'Failed to subscribe to candidates.' });
  }

  res.json(results);
});



const uploadAvatar = catchAsync(async (req, res) => {
  const {user, params, body, files} = req;
  const {companyId, candidateId} = params;

  let result = null;
  let basePath = 'candidates/';
  try {

    let candidate = await candidateService.findById(new ObjectId(candidateId));

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

  res.json(result?.avatar);

});
const uploadCandidateResume = catchAsync(async (req, res) => {
  const {user, params, body, files} = req;
  const {companyId, candidateId} = params;

  let result = null;
  let basePath = 'candidates/';
  try {

    let candidate = await candidateService.findById(new ObjectId(candidateId)).populate('resume');

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

        // console.log(hash, _.map(candidate.resumes, 'hash'), _.some(candidate.resumes, {hash: hash}))
        //if(candidate.resume.hash != hash){
          // await sovrenService.uploadResume(cv.path, candidate._id);
        //}

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

        console.log('has', hash)
        let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: user.userId, hash: hash});
        console.log(file)
        if(file){
          candidate.resume = file._id;
          await candidate.save();

          file.path = `${process.env.CDN}/${file.path}`;
          result = file;
        }

      }
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const getCandidateResume = catchAsync(async (req, res) => {
  const {user, params, body, files} = req;
  const {companyId, candidateId} = params;

  let result = null;
  let basePath = 'candidates/';
  let candidate = null;
  try {

    candidate = await candidateService.findById(new ObjectId(candidateId)).populate('resume');
    if(candidate && candidate.resume){
      candidate.resume.path = `${process.env.CDN}/${candidate.resume.path}`;
    }

  } catch (error) {
    console.log(error);
  }

  res.json(candidate?.resume);
});

const deleteCandidateResume = catchAsync(async (req, res) => {
  const {user, params, body, files} = req;
  const {companyId, candidateId, resumeId} = params;

  let result = null;

  let candidate = await candidateService.findById(new ObjectId(candidateId));
  if (candidate && candidate.resume && candidate.resume.equals(new ObjectId(resumeId))){
    candidate.resume = null;
    await candidate.save();

    const deleted = await fileService.remove(new ObjectId(resumeId));
    if(deleted){
      result = { success: true };
    }

  }

  res.json(result);
})
const assignCandidatesJobs = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result;
  try {

    const listOfJobIds = _.reduce(body.jobs, function(res, id){res.push(new ObjectId(id)); return res;} , []);
    const listOfCandidateIds = _.reduce(body.candidates, function(res, id){res.push(new ObjectId(id)); return res;} , []);
    const jobs = await jobService.findByIds(listOfJobIds);
    const candidates = await candidateService.findByIds(listOfCandidateIds).populate('user');

    for(const [i, job] of jobs.entries()){
      for(const [i, candidate] of candidates.entries()){
        const newApplication = await applicationService.add({
          email       : candidate.email,
          phoneNumber : candidate.phoneNumber
        }, job, candidate, user, false);

        let source = {
          job: job._id,
          candidate: candidate._id,
          createdBy: user._id
        };
        source = sourceService.addWithCheck(source);

        if(source) {
          let meta = {
            candidateName: candidate.firstName + ' ' + candidate.lastName,
            candidate: candidate._id,
            jobTitle: job.title,
            job: job._id,
            application: newApplication._id,
          };
          await activityService.add({
            causer: user._id,
            causerType: subjectType.MEMBER,
            subjectType: subjectType.CANDIDATE,
            subject: candidate._id,
            action: actionEnum.ASSIGNED,
            meta: meta
          });
        }
      }
      let meta = {
        companyId: job.companyId,
       // applicationId: null,
        jobId: job._id,
        jobTitle: job.title,
        candidateIds: candidates.map(cand => cand._id),
        name: candidates[0].firstName + ' ' + candidates[0].lastName,
        number: candidates.length - 1,
        //userId: candidate.userId,
        avatar: candidates[0].avatar
      };
      
      const jobOwner = await memberService.findById(job.createdBy);
      let jobmembers = await jobService.getJobMembers(job._id);
      jobmembers.push(jobOwner);
      jobmembers = jobmembers.filter((member, index, self) =>
        index === self.findIndex((m) => m._id.toString() === member._id.toString())
      );
      if (jobmembers && jobmembers.length > 0) {
        for (const jobmember of jobmembers) {
          if (jobmember.messengerId && jobmember.messengerId !== user.messengerId) {
            myEmitter.emit('create-notification', jobmember.messengerId, job.company, notificationType.JOB, notificationEvent.ASSIGNED_TO_JOB, meta);
          }
        }
      }
    }


  } catch (error) {
    console.log(error);
    return res.status(400).send({success:false, error: error.message});
  }

  res.json({success: true});
})
const assignCandidatesPools = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;

  let result;
  try {

    const listOfPoolIds = _.reduce(body.pools, function(res, id){res.push(new ObjectId(id)); return res;} , []);
    const listOfCandidateIds = _.reduce(body.candidates, function(res, id){res.push(new ObjectId(id)); return res;} , []);
    const pools = await poolService.findByIds(listOfPoolIds);

    for (let pool of pools) {
      for (let candidate of listOfCandidateIds) {
        const candidateExists = pool.candidates.some(c => c.equals(candidate));

        if (!candidateExists) {
          pool.candidates.push(candidate);
          //await pool.save();
          await deleteFromCache(`candidate:${candidate}`);
        }
      }
      // Remove duplicates after processing each pool
      pool.candidates = [...new Set(pool.candidates.map(c => c.toString()))].map(id => new ObjectId(id));
      await pool.save();
    }
  } catch (error) {
    console.log(error);
  }

  res.json({success: true});
})
/************************** DEPARTMENTS *****************************/
const getCompanyDepartments = catchAsync(async (req, res) => {
  const {user, params, query} = req;

  let result = await getDepartments(user.company?._id, query.query);

  res.json(result);

});
const addCompanyDepartment = catchAsync(async (req, res) => {
  const {user, params, body} = req;

  let result = null;
  try {
    body.company = user.company._id;
    body.createdBy = user._id;
    result = await companyDepartmentService.add(body);

  } catch(e){
    console.log('addCompanyDepartment: Error', e);
  }


  res.json(result);
})
const updateCompanyDepartment = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {departmentId} = params;

  let result = null;


  try {

    // let department = await Department.findById(departmentId);
    // if(department){
    //   department.name = form.name;
    //   department.updatedBy = currentUserId;
    //   department.background = form.background;
    //   result = await department.save();
    // }
    result = await companyDepartmentService.update(new ObjectId(departmentId), body);

  } catch(e){
    console.log('updateCompanyDepartment: Error', e);
  }


  res.json(result)
});

const deleteCompanyDepartment = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {departmentId} = params;

  let result = null;
  try {
    result = await Department.findByIdAndDelete(new ObjectId(departmentId));
    if(result){
      result = { success: true }
    }

  } catch(e){
    console.log('deleteCompanyDepartment: Error', e);
  }
  res.json(result);
});
/************************** QUESTIONTEMPLATES *****************************/
const getCompanyQuestionTemplates = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;

  let result = await questionTemplateService.getQuestionTemplates(user?.company._id, query);
  res.json(result);
});
const addCompanyQuestionTemplate = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { companyId } = params;

  let result;
  const company = await companyService.findByCompanyId(companyId);
  try {
    body.createdBy = user._id;
    body.company = company._id;
    result = await questionTemplateService.addQuestionTemplate(body);
  } catch(e){
    console.log('addCompanyQuestionTemplate: Error', e);
  }

  res.json(result);
});
const getCompanyQuestionTemplate = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, questionTemplateId} = params;

  let result = null;
  try {
    result = await questionTemplateService.findById(new ObjectId(questionTemplateId));

  } catch(e){
    console.log('getCompanyQuestionTemplate: Error', e);
  }
  res.json(result);
})
const updateCompanyQuestionTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, questionTemplateId} = params;

  let result = null;
  try {
    body.updatedBy = user._id;
    result = await questionTemplateService.updateQuestionTemplate(new ObjectId(questionTemplateId), body);

  } catch(e){
    console.log('updateCompanyQuestionTemplate: Error', e);
  }

  res.json(result);
});
const deleteCompanyQuestionTemplate = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, questionTemplateId} = params;

  let result = null;

  try {
    result = await questionTemplateService.deleteQuestionTemplate(new ObjectId(questionTemplateId));
  } catch(e){
    console.log('deleteCompanyQuestionTemplate: Error', e);
  }
  res.json(result);
})
const deactivateCompanyQuestionTemplate = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, questionTemplateId} = params;

  let result = null;
  try {
    result = await questionTemplateService.deactivate(new ObjectId(questionTemplateId), user);

  } catch(e){
    console.log('deactivateCompanyQuestionTemplate: Error', e);
  }

  res.json(result);
});
const activateCompanyQuestionTemplate = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, questionTemplateId} = params;

  let result = null;
  try {
    result = await questionTemplateService.activate(new ObjectId(questionTemplateId), user);
  } catch(e){
    console.log('deactivateCompanyQuestionTemplate: Error', e);
  }

  res.json(result);
});
/************************** PIPELINES *****************************/
const getCompanyPipelineTemplates = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId} = params;

  let result = [];
  result = await pipelineTemplateService.getPipelineTemplates(user?.company?._id);

  // result = await pipelineService.findByCompany(company._id);
  res.json(result);

});
const addCompanyPipelineTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId} = params;

  let result = null;
  try {
    body.company = user?.company?._id;
    body.createdBy = user._id;
    result = await pipelineTemplateService.add(body);
    // result = await pipelineService.add(form);

  } catch(e){
    console.log('addCompanyPipeline: Error', e);
  }


  res.json(result);
});
const updateCompanyPipelineTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {pipelineId} = params;

  let result = null;
  try {
    body.updatedBy = user._id;
    result = await pipelineTemplateService.update(new ObjectId(pipelineId), body);
    // form.updatedBy = member.userId;
    // result = await pipelineService.update(pipelineId, form);
  } catch(e){
    console.log('updateCompanyPipeline: Error', e);
  }


  res.json(result);
});

const deleteCompanyPipelineTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {pipelineId} = params;

  let result = {success: false};
  try {

    result = await pipelineTemplateService.remove(new ObjectId(pipelineId));

    // result = await pipelineService.remove(pipelineId);

    if(result){
      result = {success: true};
      //await jobService.removePipeline(new ObjectId(pipelineId));
    }
  } catch(e){
    console.log('deleteCompanyPipeline: Error', e);
  }

  res.json(result);
})
const getCompanyPipelineTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, pipelineId} = params;

  let template = await pipelineTemplateService.findById(pipelineId);
  if(template) {
    template.createdBy = null;
    template.updatedBy = null;
    template.company = null;
  }
  // let result = await pipelineService.findById(pipelineId);

  res.json(template);

});

const deactivateCompanyPipelineTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, pipelineId} = params;

  let result = null;
  try {
    result = await pipelineTemplateService.deactivate(new ObjectId(pipelineId), user);
    // result = await pipelineService.deactivate(pipelineId, member);

  } catch(e){
    console.log('updateCompanyPipeline: Error', e);
  }


  res.json(result);
});

const activateCompanyPipelineTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, pipelineId} = params;

  let result = null;
  try {
    result = await pipelineTemplateService.activate(new ObjectId(pipelineId), user);
    // result = await pipelineService.activate(pipelineId, member);

  } catch(e){
    console.log('activateCompanyPipelineTemplate: Error', e);
  }


  res.json(result);
});
/************************** LABELS *****************************/
const getCompanyLabels = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  let result = await labelService.getLabelByCompany(user.company, query.query, query.type);

  res.json(result);
});
const addCompanyLabel = catchAsync(async (req, res) => {
  const {user, params, body} = req;

  let result = null;
  try {
    body.company = user.company._id;

    if(body._id){
      body._id = new ObjectId(body._id);
    }
    result = await labelService.updateAndAdd(body, user._id);
  } catch(e){
    console.log('addCompanyLabel: Error', e);
    return res.status(500).send({success: false, error: e.message})
  }
  res.json(result);
})
const updateCompanyLabel = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {labelId} = params;

  let result = null;
  try {
    let label = await labelService.findById(new ObjectId(labelId));
    if(label){
      label.name = body.name;
      label.type = body.type;
      label.updatedBy = user._id;
      result = await label.save();
    }
  } catch(e){
    console.log('updateCompanyLabel: Error', e);
  }


  res.json(result);
});
const deleteCompanyLabel = catchAsync(async (req, res) => {
  const { user, params } = req;
  const { labelId } = params;
  let result = null;
  try {
    const label = await labelService.remove(new ObjectId(labelId));
    if (label) {
      result = { success: true };
    }

  } catch(e){
    console.log('activateCompanyQuestionTemplate: Error', e);
  }

  res.json(result);
});
/************************** Members *****************************/
const getCompanyMembers = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;

  let result = []
  const company = await companyService.findByCompanyId(companyId);
  if (!company) {
    return res.status(404).json({ success: false, error: 'Company not found' });
  }
  let members = await memberService.searchMembers(companyId, query.status, query.query);
  const userIds = _.map(members, 'userId');
  const feedUsers = await feedService.lookupUserIds(userIds);
  const membersWithAvatarAndCover = members.map(member => {
    const feedUser = feedUsers.find(user => user.id === member.userId);
    return {
      ...member.toObject(),
      avatar: feedUser?.avatar || member.avatar || null,
      cover: feedUser?.cover || member.cover || null,
    };
  });
  res.json(membersWithAvatarAndCover);
});
const getCompanyMember = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, memberId} = params;

  let result = null;
  try {
    result = await memberService.findById(new ObjectId(memberId));
    result.avatar = buildUserUrl(result);

  } catch(e){
    console.log('getCompanyMember: Error', e);
  }

  res.json(result);
});
const updateCompanyMember = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, memberId} = params;

  let result = null;
  try {
    result = await memberService.updateMember(new ObjectId(memberId), body, user);
  } catch(e){
    console.log('updateCompanyMember: Error', e);
  }

  res.json(result);
});
const deleteCompanyMember = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, memberId} = params;

  let result = null;
  try {
    result = await memberService.removeMember(new ObjectId(memberId), user);
    if(result){
      result = {deleted: 1};
    }

  } catch(e){
    console.log('deleteCompanyMember: Error', e);
  }

  res.json(result);
});
const updateCompanyMemberRole = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, memberId} = params;

  let result ;
  try {
    result = await memberService.updateMemberRole(new ObjectId(memberId), companyId, body.role?new ObjectId(body.role): '', user);
    if(result){
      result =  {success: true};
    }
  } catch(e){
    console.log('updateCompanyMemberRole: Error', e);
  }


  res.json(result);
})
const uploadMemberAvatar = catchAsync(async (req, res) => {
  const { user, params, files } = req;
  const { companyId } = params;

  if (!files || !files.file || files.file.length === 0) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let result;
  try {
    const avatarFile = files.file[0];
    const formData = new FormData();
    const fileStream = fs.createReadStream(avatarFile.path);

    formData.append('file', fileStream, {
      filename: avatarFile.originalname,
      contentType: avatarFile.mimetype,
    });

    const result = await feedService.uploadUserAvatar(user.userId, user.userId, formData);

    if (result && result.avatar) {
      user.avatar = result.avatar;
      await user.save();
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Failed to upload avatar' });
  }
});
const uploadMemberCover = catchAsync(async (req, res) => {
  const { user, params, files } = req;
  const { companyId } = params;

  if (!files || !files.file || files.file.length === 0) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let result;
  try {
    const coverFile = files.file[0];
    const formData = new FormData();
    const fileStream = fs.createReadStream(coverFile.path);

    formData.append('file', fileStream, {
      filename: coverFile.originalname,
      contentType: coverFile.mimetype,
    });

    const result = await feedService.uploadUserCover(user.userId, user.userId, formData);

    if (result && result.cover) {
      user.cover = result.cover;
      await user.save();
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Failed to upload cover Image' });
  }
});
const inviteMembers = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId} = params;
  const company = await companyService.findByCompanyId(companyId);
  let result = null;
  if(company){
    result = await memberService.inviteMembers(company._id, user, body);
    if (result) {
      // Send email to each invited member
      for (let invitation of result) {
        const emailContent = await generateMemberInvitationEmail(invitation.email, company.name, invitation._id.toString());
        await messagingService.sendMail('', '', emailContent);
      }
    }
  }

  res.json(result);
});
const getCompanyMemberInvitations = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;

  const company = await companyService.findByCompanyId(companyId);
  let result = [];
  result = await memberService.getMemberInvitations(company?._id, query.query);
  if(result) {
    result = _.reduce(result, function(res, member) {
      member.role = roleMinimal(member.role);
      member.company=null;
      res.push(member);
      return res;
    }, []);
  }
  res.json(result);
});
const cancelMemberInvitation = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId, invitationId} = params;

  let result = await memberService.cancelMemberInvitation(companyId, new ObjectId(invitationId));
  if(result){
    result = {success: true}
  }
  res.json(result);
});
const acceptMemberInvitation = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, invitationId} = params;

  let result = null;
  let invitation = await memberinvitationService.findById(invitationId);
  if(!invitation){
    return res.status(400).json({success: false, message: 'Invitation does not exist'});
  }
  try {
    if(!body.timezone){
      let ip = req.header('X-Forwarded-For') || req.connection.remoteAddress || req.ip;
      const geo = geoip.lookup(ip); // Lookup geolocation info
      if(geo && geo.timezone){
        body.timezone = geo.timezone;
      }
    }
    let existingMember = await memberService.findByEmailAndCompany(invitation.email, invitation.company)
    
    if(existingMember){ //If member already exists
      if (existingMember.status !== 'ACTIVE') {
        existingMember.status = 'ACTIVE';
        existingMember.timezone = body.timezone || existingMember.timezone;
        existingMember.firstName = body.firstName || existingMember.firstName;
        existingMember.middleName = body.middleName || existingMember.middleName;
        existingMember.lastName = body.lastName || existingMember.lastName;
        existingMember.countryCode = body.countryCode || existingMember.countryCode;
        existingMember.phone = body.phone || existingMember.phone;
        existingMember.language = body.language || existingMember.language; 
        existingMember.role = new ObjectId(invitation.role);
        existingMember.save();
        result = existingMember;
      } else {
        return res.status(400).json({success: false, message: 'Member already exists and is active.'});
      }
    }else{ // Member does not exist - create new member.
      result = await memberService.addMemberFromInvitation(body, new ObjectId(invitationId));
      if(result){
        //Save as user in messaging_service.
        const messagingUser = await messagingService.createUser({firstName: result.firstName, lastName: result.lastName, email: result.email, userId: result.userId});
        if(messagingUser){
          result.messengerId = messagingUser._id;
          result.save();
        }
        const calendarUser = await calendarService.createUser({firstName: result.firstName, lastName: result.lastName, email: result.email, userId: result.userId, messengerId: result.messengerId || null});
        if(calendarUser){
          result.calendarUserId = calendarUser._id;
          const newCalendar = await calendarService.createCalendar({userId: result.userId, timezone: result.timezone});
          if(newCalendar){
            result.calendarId = newCalendar._id;
          }
          result.save();
        }
      }
    }
  } catch(e){
    console.log('addCompanyMember: Error', e);
    return res.status(500).send({success: false, error: 'Internal Server Error. ' + e.message})
  }

  res.json(result);
});
/************************** ROLES *****************************/
const getCompanyRoles = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;

  const company = await companyService.findByCompanyId(companyId);
  let result = await roleService.getRoles(company?._id, query.all);
  result = _.reduce(result, function(res, role){
    role.company = null;
    role.createdBy = null;
    res.push(role);
    return res;
  }, []);

  const isDefault = _.sortBy(_.filter(result, {default: true}), ['name']);
  const custom =_.sortBy(_.filter(result, {default: false}), ['name']);
  result = [...isDefault, ...custom];
  res.json(result);

});
const addCompanyRole = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId} = params;

  let result = null;

  const company = await companyService.findByCompanyId(companyId);
  if(company){
    body.createdBy = user._id;
    body.company = company._id;
    result = await roleService.add(body);
  }

  res.json(result);
});
const updateCompanyRole = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {roleId} = params;

  let result = null;
  body.updatedBy = user._id;
  result = roleService.update(new ObjectId(roleId), body);

  res.json(result);
});
const deleteCompanyRole = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {roleId} = params;

  let result = null;
  let role = await roleService.remove(new ObjectId(roleId));
  if(role){
    result = {success: true};
  }

  res.json(result);
});
const disableCompanyRole = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {roleId} = params;

  const result = await roleService.disable(new ObjectId(roleId), user._id);
  res.json(result);
})
const enableCompanyRole = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {roleId} = params;

  let result = await roleService.enable(new ObjectId(roleId), user._id);
  res.json(result);
});

const getJobsSubscribed = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId, memberId} = params;

  let result = null;
  try {
    result = await memberService.findJobSubscriptions(user._id, query);

    // let company = await feedService.lookupCompaniesIds([companyId]);
    // let departments = await departmentService.findDepartmentsByCompany(companyId);
    // company = convertToCompany(company[0]);
    result.docs.forEach(function(sub){
      sub.subject.hasSaved = true;

      let company = sub.subject.company;
      if(company){
        company = new Company(company)
        company = company.transform();
      }

      let createdBy = sub.subject.createdBy;
      if(createdBy){
        createdBy = new Member(createdBy);
      }

      if(sub.subject){
        const subject = new JobRequisition(sub.subject);
        sub.subject = subject.transform();
        sub.subject.company = company;
        sub.subject.createdBy = createdBy;
      }


    });

  } catch(e){
    console.log('getJobsSubscribed: Error', e);
  }


  res.json(new Pagination(result));
});
const getApplicationsSubscribed = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;

  let result = null;
  try {
    result = await memberService.findApplicationSubscriptions(user._id, query);

    result.docs.forEach(function(sub){
      sub.subject.user = convertToCandidate(sub.subject.user);
    });

  } catch(e){
    console.log('getApplicationsSubscribed: Error', e);
  }


  res.json(new Pagination(result));
});
const getCandidatesSubscribed = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;

  let result = null;
  try {
    result = await memberService.findCandidateSubscriptions(user._id, query);

    result.docs.forEach(function(sub){
      sub.subject = convertToCandidate(sub.subject);
    });

  } catch(e){
    console.log('getCandidatesSubscribed: Error', e);
  }

  res.json(new Pagination(result));
});
const searchTasks = catchAsync(async (req, res) => {
  const {user, params, query, body} = req;
  const {companyId} = params;

  let result = null;
  try {
    body.members = [user._id];
    result = await taskService.search(body, query, query.query);

  } catch(e){
    console.log('searchTasks: Error', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }


  res.json(new Pagination(result));
});



/************************** POOOL *****************************/
const getCompanyPools = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;
  const {id, candidateId} = query;

  let result = null;
  let cid = null;
  if(candidateId){
    cid = new ObjectId(candidateId);
  }

  if(id){
    let candidate = await candidateService.findByUserIdAndCompanyId(id, user.company);
    cid = candidate?._id;

  }

  result = await poolService.findByCompany(user?.company?._id, query.query);


  if(result && cid || id) {
    result = _.reduce(result, function (res, pool) {
      let isIn = false;
      if(cid){
        isIn = _.some(pool.candidates, {_id: cid});
      }

      pool.isIn = isIn;
      pool.noOfCandidates = pool.candidates.length;
      pool.candidates = [];
      pool.company = null;
      pool.createdBy = null;
      res.push(pool);
      return res;
    }, []);
  }
  res.json(result)
});
const getCompanyPoolById = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId, poolId} = params;


  let result = await poolService.findById(new ObjectId(poolId));
  res.json(result);
})
const addCompanyPool = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId} = params;

  let result = null;
  try {

    body.createdBy = user._id;
    body.company = user.company;
    result = await poolService.add(body);

  } catch(e){
    console.log('addCompanyPool: Error', e);
  }


  res.json(result);
});
const updateCompanyPool = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, poolId} = params;

  let result = null;
  try {

    result = await poolService.updatePool(new ObjectId(poolId), body);

  } catch(e){
    console.log('updateCompanyPool: Error', e);
  }


  res.json(result);
});
const deleteCompanyPool = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, poolId} = params;

  let result = {success: false};
  try {
    let pool = await poolService.remove(new ObjectId(poolId));
    if(pool) {
      result = {success: true};
    }

  } catch(e){
    console.log('deleteCompanyPool: Error', e);
  }
  res.json(result)
})
const getPoolCandidates = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId, poolId} = params;

  let result = null;
  let select = '';
  let limit = (query.size && query.size>0) ? query.size:20;
  let page = (query.page && query.page>0) ? parseInt(query.page)+1:1;
  let sortBy = {};
  sortBy[query.sortBy] = (query.direction && query.direction==="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };



  try {
    result = await poolService.getPoolCandidates(new ObjectId(poolId), options);
    let people = await feedService.lookupCandidateIds(_.map(result.docs, 'userId'));
    result.docs = _.reduce(result.docs, function(res, candidate){
      candidate.id=candidate._id;
      candidate.avatar = buildUserAvatar(candidate);
      if(!candidate.avatar && candidate.userId){
        let found = _.find(people, {id: candidate.userId});
        if(found)
          {
            candidate.avatar = candidate.avatar || found.avatar;
          }
      }
      candidate.noOfMonthExperiences = candidate.noOfMonthExperiences ? candidate.noOfMonthExperiences : 0;
      res.push(candidate);
      return res;

    }, []);

  } catch(e){
    console.log('getPoolCandidates: Error', e);
  }


  res.json(new Pagination(result));
})
const addPoolCandidates = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, poolId} = params;

  let result = null;
  try {
    body.candidates = _.reduce(body.candidates, function(res, item){
      res.push(new ObjectId(item));
      return res;
    }, []);
    let pool = await poolService.findById(new ObjectId(poolId));
    if (pool) {
      const candidateIds = _.reduce(body.candidates, function(res, id){
        const exists = _.find(pool.candidates, function(o){ return o.equals(id); });
        if(!exists){
          res.push(id);
        }

        return res;
      }, []);
      pool.candidates = pool.candidates.concat(candidateIds);
      // Remove duplicates from pool.candidates
      pool.candidates = [...new Set(pool.candidates.map(c => c.toString()))].map(id => new ObjectId(id));
      result = await pool.save();

    }
  } catch(e){
    console.log('addPoolCandidate: Error', e);
  }


  res.json(result);
});
const removePoolCandidate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, poolId, candidateId} = params;

  let result = null;
  try {
    let pool = await poolService.findById(new ObjectId(poolId));
    if (pool) {
      pool.candidates = _.reject(pool.candidates, function(c) {
        return c.equals(new ObjectId(candidateId));
      });
      await pool.save();
      result = {success: true};

    }

  } catch(e){
    console.log('addPoolCandidate: Error', e);
  }
  res.json(result);
})
const removePoolCandidates = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, poolId} = params;

  let result = null, pool;
  try {
    pool = await poolService.findById(new ObjectId(poolId));
    if (pool && pool.candidates) {
      const candidates = _.reduce(pool.candidates, function(res, item){
        if(!_.includes(body.candidates, item.toString())){
          res.push(item);
        }
        return res;
      }, []);
      pool.candidates = candidates;
      await pool.save();
      result = {success: true};
    }

  } catch(e){
    console.log('addPoolCandidate: Error', e);
  }

  res.json(pool?.candidates);
})

/************************** PROJECTS *****************************/
const getProjects = catchAsync(async (req, res) => {
  const {user, params, query} = req;

  let result = await projectService.getMemberProjects(user._id);

  res.json(result);
});
const addProject = catchAsync(async (req, res) => {
  const {user, params, body} = req;

  let result = null;
  try {

    body.createdBy = user._id
    body.company = user.company;
    result = await projectService.addProject(body);

  } catch(e){
    console.log('addCompanyProject: Error', e);
  }

  res.json(result);
});
const getProject = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {projectId} = params;

  let result = null;
  try {
    body.updatedBy = user._id
    result = await projectService.findById(new ObjectId(projectId));

  } catch(e){
    console.log('getProject: Error', e);
  }


  res.json(result);
});
const updateProject = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {projectId} = params;

  let result = null;
  try {
    body.updatedBy = user._id
    result = await projectService.updateProject(new ObjectId(projectId), body);

  } catch(e){
    console.log('updateCompanyProject: Error', e);
  }


  res.json(result);
});
const updateProjectName = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {projectId} = params;

  let result = null;
  try {
    body.updatedBy = user._id
    body.updatedBy = user._id
    result = await projectService.updateProjectName(new ObjectId(projectId), body);

  } catch(e){
    console.log('updateProjectName: Error', e);
  }


  res.json(result);
});
const deleteProject = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId} = params;

  let result = null;
  try {
    let project = await projectService.findById(projectId);
    if(project){
      result = await project.delete();
      if(result){
        result = {deleted: 1};
      }

    }


  } catch(e){
    console.log('deleteProject: Error', e);
  }
  res.json(result);
})
const getProjectPeoples = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId} = params;

  let result;
  let select = '';
  let limit = (query.size && parseInt(query.size)>0) ? parseInt(query.size):20;
  let page = (query.page && parseInt(query.page)>0) ? parseInt(query.page)+1:1;
  let sortBy = {};
  sortBy[query.sortBy] = (query.direction && query.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };

  try {
    result = await projectService.getProjectPeoples(new ObjectId(projectId), options);
  } catch(e){
    console.log('getProjectCandidates: Error', e);
  }


  res.json(new Pagination(result));
});
const addProjectPeoples = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {projectId} = params;
  const {peoples} = body;
  let result = null;
  try {
    let project = await projectService.findById(projectId);
    if (project) {
      peoples.forEach(function(people){

        let exists = false;
        project.people.forEach(function(item){
          if(item.equals(new ObjectId(people))){
            exists = true;
          }
        });
        if (!exists) {
          project.people.push(people);
        }
      })
      result = await project.save();

    }



  } catch(e){
    console.log('addProjectPeoples: Error', e);
  }


  res.json(result)
});
const addProjectPeople = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId, peopleId} = params;

  let result = null;
  try {
    let project = await projectService.findById(projectId);
    if (project) {
      project.people.push(new ObjectId(peopleId))
      await project.save();
      result = { success: true };
    }
  } catch(e){
    console.log('addProjectCandidates: Error', e);
  }
  res.json(result)
});
const removeProjectPeople = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId, peopleId} = params;

  let result = null;
  try {
    let project = await projectService.findById(projectId);
    if (project) {
      project.people = _.reject(project.people, ObjectId(peopleId));
      await project.save();
      result = {success: true};

    }

  } catch(e){
    console.log('removeProjectCandidate: Error', e);
  }
  res.json(result);
});
const removeProjectPeoples = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {projectId} = params;
  const {peoples} = body;

  let result = null;

  try {
    let project = await projectService.findById(projectId);
    if (project && project.people) {
      peoples.forEach(function(item){
        for(const [i, people] of project.people.entries()){
          if(new ObjectId(item).equals(people)){
            project.people.splice(i, 1);
          }
        };

      });
      await project.save();
      result = {success: true};
    }

  } catch(e){
    console.log('removeProjetCandidates: Error', e);
  }
  res.json(result)
})
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

        let existproject = _.find(projectIds, function(item){ return ObjectId(item).equals(project._id); });
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
const getProjectSettings = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId} = params;

  let result = [];
  try {
    result = await projectService.getProjectSettings(new ObjectId(projectId));
  } catch(e){
    console.log('getProjectSettings: Error', e);
  }
  res.json(result);
});
const updateProjectSettings = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId} = params;

  let result = [];
  try {
    result = await projectService.getProjectSettings(new ObjectId(projectId));
  } catch(e){
    console.log('getProjectSettings: Error', e);
  }
  res.json(result);
});
const getProjectViewers = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId} = params;

  let result = [];
  try {
    result = await projectService.getProjectViewers(new ObjectId(projectId));
    // console.log(result)
  } catch(e){
    console.log('getProjectViewers: Error', e);
  }
  res.json(result);
});
const addProjectViewer = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId} = params;

  let result = null;
  try {
    let project = await projectService.findById(projectId);
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


  res.json(result)
});
const removeProjectViewer = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {projectId} = params;

  let result = null;
  try {
    let project = await projectService.findById(projectId);
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
  res.json(result);
});


/************************** EVALUATIONTEMPLATES *****************************/
const getCompanyEvaluationTemplates = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId} = params;

  const company = await companyService.findByCompanyId(companyId);
  let result = await evaluationTemplateService.search(company._id, query);

  res.json(result);
});
const addCompanyEvaluationTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId} = params;

  let result = null;
  const company = await companyService.findByCompanyId(companyId);
  try {

    body.company = company._id;
    body.createdBy = user._id;
    result = await evaluationTemplateService.add(body);

  } catch(e){
    console.log('addCompanyEvaluationTemplate: Error', e);
  }

  res.json(result);
});
const getCompanyEvaluationTemplate = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {templateId} = params;

  let result = null;
  try {
    result = await evaluationTemplateService.findById(new ObjectId(templateId));
  } catch(e){
    console.log('getCompanyEvaluationTemplate: Error', e);
  }


  res.json(result);
});
const updateCompanyEvaluationTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {templateId} = params;

  let result = null;
  try {
    body.updatedBy = user._id;
    result = await evaluationTemplateService.update(new ObjectId(templateId), body);

  } catch(e){
    console.log('updateCompanyEvaluationTemplate: Error', e);
  }

  res.json(result);
});
const deleteCompanyEvaluationTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {templateId} = params;

  let result = null;
  try {
    let evaluation = await evaluationTemplateService.findById(new ObjectId(templateId));
    if(evaluation){
      //result = await evaluation.delete();
      result = await evaluationTemplateService.deleteById(new ObjectId(templateId));
      if(result){
        result = {success: true};
      }
    }

  } catch(e){
    console.log('deleteCompanyEvaluationTemplate: Error', e);
  }

  res.json(result);
})
const deactivateCompanyEvaluationTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {templateId} = params;

  let result = null;
  try {
    result = await evaluationTemplateService.deactivate(new ObjectId(templateId), user);
  } catch(e){
    console.log('deactivateCompanyEvaluationTemplate: Error', e);
  }

  res.json(result);
});
const activateCompanyEvaluationTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {templateId} = params;

  let result = null;
  try {
    result = await evaluationTemplateService.activate(templateId, user);


  } catch(e){
    console.log('activateCompanyEvaluationTemplate: Error', e);
  }

  res.json(result);
});

const getEvaluationFilters = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId} = params;

  let result = null;
  try {
    result = await evaluationService.getFilters(companyId);

  } catch(e){
    console.log('getEvaluationFilters: Error', e);
  }

  res.json(result);
});




const searchSources = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId} = params;

  body.jobs = _.reduce(body.jobs, function(res, id){res.push(new ObjectId(id)); return res;}, []);
  let result = await sourceService.search(body, query);
  // let userIds = _.map(result.docs, 'user');
  // let users = await feedService.lookupUserIds(userIds);

  let subscriptions = await memberService.findMemberSubscribedToSubjectType(user._id, subjectType.APPLICATION);

  result.docs.forEach(function(source){

    source.candidate.firstName = source.candidate.firstName?source.candidate.firstName:source.candidate.email;
    source.candidate.avatar = buildCandidateUrl(source.candidate);
    source.candidate = convertToCandidate(source.candidate);
    source.candidate.educations = [];
    source.candidate.experiences = [];

    let hasApplied = _.find(source.campaigns, function(o){return o.application;})? true:false;
    source.hasApplied = (hasApplied || _.some(source.candidate.applications, {job: body.jobs[0]}) )? true: false;

  })

  res.json(new Pagination(result));


});
const removeSources = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId, sourceIds} = params;

  let result = await sourceService.remove(body.sources);

  res.json({success: true});
});






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
    result = await evaluationService.findById(new ObjectId(evaluationId));

  } catch(e){
    console.log('getEvaluationById: Error', e);
  }

  return result;
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
        res.push(new ObjectId(app.currentProgress));
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




async function lookupCandidates(currentUserId, companyId, filter, sort, locale) {
  if(!currentUserId || !companyId || !filter || !sort){
    return null;
  }

  let member = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  result = await candidateService.lookup(filter, sort);
  let people = await feedService.lookupCandidateIds(_.map(result.docs, 'userId'));

  result = _.reduce(result, function(res, candidate){
    let hasSaved = false;

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

  return result;

}


const getCandidatesSimilar = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId, candidateId} = params;
  let currentUserId = parseInt(req.header('UserId'));


  let result = [];
  try {
    let userId = null;
    // let candidate = await candidateService.findById(candidateId);

    //ToDo: temporary return basic candidate. need to return ai data
    result = await candidateService.getCandidatesSimilar(new ObjectId(candidateId));
    let people = await feedService.lookupCandidateIds(_.map(result, 'userId'));
    result = _.reduce(result, function(res, candidate){
      let found = _.find(people, {id: candidate.userId});
      if(found){
        candidate.avatar = candidate.avatar || found.avatar;
      }
      candidate.avatar = buildCandidateUrl(candidate);
      res.push(candidate);
      return res;
    }, []);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});




const checkCandidateEmail = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId} = params;
  const {email} = query;

  let result;
  try {
    result = await candidateService.checkEmail(user.company, email);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});



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


const addCandidateSources = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId} = params;
  const {sources} = body;

  let result = [];
  try {
    let candidate = await candidateService.findById(new ObjectId(candidateId));
    if(candidate) {

      for(const index in sources){
        if(!sources[index]._id){
          let newLabel = {name: sources[index].name, type: 'SOURCE', company: candidate.company, createdBy: user._id  };
          newLabel = await labelService.add(newLabel);
          if(newLabel){
            sources[index]._id = newLabel._id;
            result.push(newLabel);
          }
        }
      };

      let sourceIds = _.reduce(sources, function(res, source){
        res.push(source._id);
        return res;
      }, []);

      candidate.sources = sourceIds;
      await candidate.save();

    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const removeCandidateSource = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, candidateId, sourceId} = params;

  let result;
  try {
    let candidate = await candidateService.findById(new ObjectId(candidateId));
    if(candidate){
      for(const [i, source] of candidate.sources.entries()){
        if(source.equals(new ObjectId(sourceId))){
          candidate.sources.splice(i, 1);
          await candidate.save();
          result = {success: true};
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});



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

        let existPool = _.find(poolIds, function(item){return ObjectId(item).equals(pool._id); });
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
        // Remove duplicates from pool.candidates after processing
        pool.candidates = [...new Set(pool.candidates.map(c => c.toString()))].map(id => new ObjectId(id));
        await pool.save();

      }

      result = {success: true};

    }



  } catch(e){
    console.log('updatePeoplePool: Error', e);
  }


  return result
}

const getNotificationPreference = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, memberId} = params;

  let result = null;

  const member = await memberService.findById(new ObjectId(memberId)).populate('notificationPreference');

  res.json(member?.notificationPreference || {});
});


const updateNotificationPreference = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, memberId} = params;

  const member = await memberService.findById(new ObjectId(memberId)).populate('notificationPreference');
  if(!member){
    return res.status(400).json({ success: false, error: `Member not found.` });
  }

  try {
    let notificationPreference = null;
    if(member.notificationPreference){
      //update existing notification preference
      notificationPreference = await notificationPreferenceService.updateNotificationPreference(member.notificationPreference._id, body)
    } else {
      // create new notification preference
      notificationPreference = await notificationPreferenceService.createNotificationPreference(body);
      member.notificationPreference = notificationPreference._id;
      await member.save();
    }
    res.json(notificationPreference);
  }catch(error){
    console.log(error);
    return res.status(500).json({ success: false, error: error.message });
  }

});


/************************** EMAILTEMPLATES *****************************/
const getCompanyEmailTemplates = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId} = params;

  let company = await companyService.findByCompanyId(companyId);
  let result = await emailTemplateService.search(company._id, query);
  result = _.reduce(result, function(res, template){
    template.createdBy = null;
    template.updatedBy = null;
    res.push(template);
    return res;
  }, []);
  res.json(result);
});
const addCompanyEmailTemplate = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId} = params;

  let result = null;
  try {
    let company = await companyService.findByCompanyId(companyId);
    body.company = company._id;
    body.createdBy = user._id;
    result = await emailTemplateService.add(body);

  } catch(e){
    console.log('addCompanyEmailTemplate: Error', e);
  }

  res.json(result);
});
const getCompanyEmailTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, templateId} = params;

  let result = null;
  try {

    result = await emailTemplateService.findById(new ObjectId(templateId));
  } catch(e){
    console.log('getCompanyEmailTemplate: Error', e);
  }

  res.json(result);
});
const updateCompanyEmailTemplate = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, templateId} = params;

  let result = null;
  try {
    body.updatedBy = user._id
    result = await emailTemplateService.update(new ObjectId(templateId), body);

  } catch(e){
    console.log('updateCompanyEmailTemplate: Error', e);
  }

  res.json(result);
});
const deleteCompanyEmailTemplate = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, templateId} = params;
  let result = null;

  try {
    let template = await emailTemplateService.remove(new ObjectId(templateId));
    if(template){
      result = {success: true};
    }
  } catch(e){
    console.log('deleteCompanyEmailTemplate: Error', e);
  }

  res.json(result);
});

const deactivateCompanyEmailTemplate = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, templateId} = params;
  let result = null;

  try {
    result = await emailTemplateService.deactivate(new ObjectId(templateId), user);

  } catch(e){
    console.log('updateTemplate: Error', e);
  }

  res.json(result);
});

const activateCompanyEmailTemplate = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, templateId} = params;
  let result = null;

  try {
    result = await emailTemplateService.activate(new ObjectId(templateId), user);

  } catch(e){
    console.log('updateTemplate: Error', e);
  }

  res.json(result);
});


/************************** SIGNATURE *****************************/
const getCompanyEmailSignatures = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId} = params;

  let result = await signatureService.search(user.company._id, body);

  res.json(result);
});
const addCompanyEmailSignature = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId} = params;

  let result = null;
  try {
    body.company = user.company._id;
    body.createdBy = user._id;
    result = await signatureService.add(body);

  } catch(e){
    console.log('addCompanyEmailSignature: Error', e);
  }

  res.json(result);
});
const getCompanyEmailSignature = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, templateId} = params;

  let result = null;
  try {

    result = await signatureService.findById(new ObjectId(templateId));
  } catch(e){
    console.log('getCompanyEmailSignature: Error', e);
  }

  res.json(result);
});
const updateCompanyEmailSignature = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, templateId} = params;

  let result = null;
  try {
    body.updatedBy = user._id
    result = await signatureService.update(new ObjectId(templateId), body);

  } catch(e){
    console.log('updateCompanyEmailSignature: Error', e);
  }

  res.json(result);
});
const deleteCompanyEmailSignature = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {companyId, templateId} = params;
  let result = null;

  try {
    let template = await signatureService.remove(new ObjectId(templateId));
    if(template){
      result = {success: true};
    }
  } catch(e){
    console.log('deleteCompanyEmailSignature: Error', e);
  }

  res.json(result);
});

/************************** CONTACTS *****************************/
const searchContacts = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {companyId, templateId} = params;

  let result=[];
  try {
    const includes = query.includes.split(',');
    if(!query.includes || _.includes(includes, 'member')) {
      let members = await memberService.searchMembers(companyId, statusEnum.ACTIVE, query.query);
      members = _.reduce(members, function(res, m) {
        m.isMember = true;
        m.isCandidate = false;
        m.avatar = buildUserUrl(m);
        res.push(m);
        return res;
      }, []);

      result = [...result, ...members];
    }

    if(!query.includes || _.includes(includes, 'candidate')) {
      let candidates = await candidateService.searchCandidates(user.company._id, query.query);
      candidates = _.reduce(candidates, function(res, c) {
        c.isMember = false;
        c.isCandidate = (c.hasApplied || c.hasImported) ? true : false
        c.avatar = buildCandidateUrl(c);
        res.push(c);
        return res;
      }, []);

      result = [...result, ...candidates];
    }

    result = _.reduce(result, function (res, item) {
      let exists = _.find(res, {id: item.userId});
      if(!exists) {
        res.push(convertToAvatar(item));
      }
      return res;
    }, []);


  } catch (error) {
    console.log(error);
  }

  res.json(result);

});



module.exports = {
  getUserSession,
  registerNewUser,
  getCompany,
  updateCompany,
  uploadCompanyAvatar,
  uploadCompanyCover,
  getSubscriptions,
  getSubscription,
  addSubscription,
  getCompanyInsights,
  getTasksInsights,
  getInmailCredits,
  getTaxAndFee,
  getImpressionCandidates,
  getDashboard,
  getCompanyJobSummary,
  searchCompany,
  addPaymentMethod,
  getCards,
  removeCard,
  verifyCard,
  updateSubscription,
  getInvoices,
  searchJobTitle,
  createJob,
  updateJob,
  closeJob,
  archiveJob,
  unarchiveJob,
  deleteJob,
  shareJobToSocialAccount,
  getJobComments,
  addJobComment,
  addJobTag,
  updateJobTags,
  removeJobTags,
  getCompanyJobCount,
  searchJobs,
  searchJobsWithBudget,
  lookupJobs,
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
  shortlistApplications,
  removeShortlistApplications,
  searchSources,
  removeSources,
  addSourceApplication,
  searchCampaigns,
  addApplication,
  getAllApplicationsEndingSoon,
  getAllApplicationsNewlyCreated,
  getApplicationById,
  updateApplicationProgress,
  getApplicationProgress,
  getApplicationQuestions,
  getApplicationLabels,
  addApplicationLabel,
  deleteApplicationLabel,
  getApplicationComments,
  addApplicationComment,
  getEvaluationById,
  getApplicationEvaluations,
  addApplicationEvaluation,
  updateApplicationEvaluation,
  removeApplicationEvaluation,
  getApplicationEmails,
  updateApplicationProgressEvent,
  removeApplicationProgressEvent,
  disqualifyApplications,
  disqualifyApplication,
  revertApplications,
  revertApplication,
  deleteApplication,
  acceptApplication,
  rejectApplication,
  subscribeApplication,
  unsubscribeApplication,
  getApplicationActivities,
  addCandidate,
  importResumes,
  getCandidatesFlagged,
  searchCandidates,

  lookupCandidates,
  getCandidateById,
  updateCandidateById,
  removeCandidateById,
  removeCandidates,
  getCandidateEvaluations,
  getCandidateEvaluationsStats,
  getCandidateEvaluationById,
  getCandidatesSimilar,
  getCandidateActivities,
  addCandidateExperience,
  updateCandidateExperience,
  removeCandidateExperience,
  getCandidateExperiences,
  addCandidateEducation,
  updateCandidateEducation,
  getCandidateEducations,
  removeCandidateEducation,
  getCandidateSkills,
  updateCandidateSkills,
  addCandidateSkill,
  updateCandidateSkill,
  removeCandidateSkill,
  getCandidateReferences,
  addCandidateReference,
  updateCandidateReference,
  removeCandidateReference,
  getCandidateComments,
	addCandidateComment,
	updateCandidateComment,
	deleteCandidateComment,
  addReactionToCandidateCommentById,
  subscribeCandidate,
  unsubscribeCandidate,
  subscribeCandidates,
  uploadAvatar,
  uploadCandidateResume,
  getCandidateResume,
  deleteCandidateResume,
  assignCandidatesJobs,
  assignCandidatesPools,
  checkCandidateEmail,
  getAllCandidatesSkills,
  getCandidateNotes,
  addCandidateNote,
  removeCandidateNote,
  updateCandidateNote,
  addCandidateTag,
  addTagsToMultipleCandidates,
  removeCandidateTag,
  addCandidateSource,
  addCandidateSources,
  removeCandidateSource,
  updateCandidatePool,
  updatePeoplePool,
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
  getCompanyPipelineTemplates,
  getCompanyPipelineTemplate,
  updateCompanyPipelineTemplate,
  deleteCompanyPipelineTemplate,
  deactivateCompanyPipelineTemplate,
  activateCompanyPipelineTemplate,

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
  uploadMemberAvatar,
  uploadMemberCover,
  deleteCompanyMember,
  getJobsSubscribed,
  getApplicationsSubscribed,
  getCandidatesSubscribed,
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
  getProjects,
  addProject,
  getProject,
  updateProject,
  updateProjectName,
  deleteProject,
  getProjectPeoples,
  addProjectPeoples,
  addProjectPeople,
  removeProjectPeople,
  removeProjectPeoples,
  getProjectSettings,
  updateProjectSettings,
  getProjectViewers,
  addProjectViewer,
  removeProjectViewer,
  subscribeJob,
  unsubscribeJob,
  uploadApplication,
  getFiles,
  removeApplicationFile,
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
  getCompanyEmailTemplate,
  updateCompanyEmailTemplate,
  deleteCompanyEmailTemplate,
  deactivateCompanyEmailTemplate,
  activateCompanyEmailTemplate,
  getCompanyEmailSignatures,
  addCompanyEmailSignature,
  getCompanyEmailSignature,
  updateCompanyEmailSignature,
  deleteCompanyEmailSignature,
  searchContacts
}
