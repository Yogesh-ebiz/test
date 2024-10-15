const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const localeCodes = require('locale-codes');
const httpStatus = require('http-status');
const {ObjectId} = require('mongodb');
const moment = require('moment-timezone');
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const pick = require('../utils/pick');

const {jobMinimal, convertToAvatar, convertToCompany, convertIndustry, categoryMinimal, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const axiosInstance = require('../services/api.service');
const maxmindService = require('../services/maxmind/maxmind.service');
const {findCandidateById, lookupUserIds, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findCompanyById, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');

const statusEnum = require('../const/statusEnum');
const contactType = require('../const/contactType');
const partyEnum = require('../const/partyEnum');
const applicationEnum = require('../const/applicationEnum');
const notificationType = require('../const/notificationType');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');
const jobType = require('../const/jobType');
const emailCampaignStageType = require('../const/emailCampaignStageType');


const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const feedService = require('../services/api/feed.service.api');
const candidateService = require('../services/candidate.service');
const activityService = require('../services/activity.service');
const emailCampaignService = require('../services/emailcampaign.service');
const emailCampaignServiceStage = require('../services/emailcampaignstage.service');
const applicationService = require('../services/application.service');
const industryService = require('../services/industry.service');
const userImpressionService = require('../services/userimpression.service');
const jobfunctionService = require('../services/jobfunction.service');
const labelService = require('../services/label.service');
const jobTitleService = require('../services/jobtitle.service');
const userService = require('../services/user.service');
const questionService = require('../services/questiontemplate.service');


const {getListofSkills} = require('../services/skill.service');
const {findApplicationByUserIdAndJobId, findByApplicationId, applyJob, findAppliedCountByJobId} = require('../services/application.service');
const {findApplicationByCurrentStatus, findApplicationProgresssById, addApplicationProgress} = require('../services/applicationprogress.service');
const {findApplicationHistoryById, addApplicationHistory} = require('../services/applicationhistory.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getIndustry} = require('../services/industry.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');


const jobService = require('../services/jobrequisition.service');
const {findJobViewByUserId, findJobViewByUserIdAndJobId, findMostViewed} = require('../services/userimpression.service');
const {findSearchHistoryByKeyword, saveSearch} = require('../services/searchhistory.service');
const {getTopCategory} = require('../services/category.service');
const {getTopIndustry} = require('../services/industry.service');

const filterService = require('../services/filter.service');
const bookmarkService = require('../services/bookmark.service');
const questionSubmissionService = require('../services/questionsubmission.service');
const stageService = require('../services/stage.service');
const { getFromCache, saveToCache, deleteFromCache } = require('../services/cacheService');
const companyReviewService = require('../services/companyreview.service');
const jobReportService = require('../services/jobreport.service');
const jobImpressionService = require('../services/jobimpression.service')


const JobRequisition = require('../models/jobrequisition.model');
const Skill = require('../models/skill.model');
const JobFunction = require('../models/jobfunction.model');
const Bookmark = require('../models/bookmark.model');
const PartySkill = require('../models/partyskill.model');
const Application = require('../models/application.model');
const EmploymentType = require('../models/employmenttypes.model');
const ExperienceLevel = require('../models/experiencelevel.model');
const Industry = require('../models/industry.model');
const Category = require('../models/category.model');
const ReportedJob = require('../models/jobreport.model');



let Pagination = require('../utils/pagination');
let JobSearchParam = require('../const/jobSearchParam');
let SearchParam = require('../const/searchParam');
const User = require("../models/user.model");


const applicationSchema = Joi.object({
  jobTitle: Joi.string().allow(''),
  jobId: Joi.object().required(),
  user: Joi.object().required(),
  partyId: Joi.number().required(),
  phoneNumber: Joi.string(),
  email: Joi.string().required(),
  availableDate: Joi.number(),
  attachment: Joi.string().allow('').optional(),
  follow: Joi.boolean().optional(),
  resumeId: Joi.any().optional(),
  questionAnswers: Joi.array(),
  coverLetter: Joi.string().allow('').optional(),
  source: Joi.string().allow('').optional(),
  desiredSalary: Joi.number().optional(),
  currency: Joi.string().optional(),
  applicationQuestions: Joi.object().optional()
});


const ReportedJobSchema = Joi.object({
  _id: Joi.string(),
  jobId: Joi.number().required(),
  user: Joi.number().required(),
  isAnonymous: Joi.boolean(),
  createdDate: Joi.date(),
  lastUpdatedDate: Joi.date(),
  reason: Joi.string().required(),
  note: Joi.string().allow('')
});

async function importJobs(type, jobs) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  // if(job) {
  //   job.skills = await Skill.find({id: {$in: job.skills}});
  // }
  return await new JobRequisition(job).save();
}


const getJobById = catchAsync(async (req, res) => {
  const { query, params, locale } = req;
  const {id} = params;
  const {isMinimal} = query
  const currentUserId = parseInt(req.header('UserId'));
  const cacheKey = `job:${id}`;

  let job, user, partySkills = [], hasApplied, hasSaved, hasLiked;
  job = await getFromCache(cacheKey);

  if (!job){
    console.log('Serving Job data from Database');
    try {
      let localeStr = locale? locale : 'en';
      let propLocale = '$name.'+localeStr;
      // job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } }).populate('promotion')
      job = await jobService.findJobId(id, locale).populate([
        {
          path: 'tags',
          model: 'Label'
        },
        {
          path: 'createdBy',
          model: 'Member'
        },
        {
          path: 'company',
          model: 'Company'
        },
        {
          path: 'skills',
          model: 'Skill'
        },
        {
          path: 'ads',
          model: 'Ad',
          populate: {
            path: 'targeting',
            model: 'Target'
          }
        },
        {
          path: 'impression',
          model: 'JobImpression',
          select: 'liked saved shared viewed applied'
        }
        ]);

      console.log(job)

      if(job) {
        if(job.endDate === undefined || job.endDate < Date.now()){
          return res.status(400).json({ success: false, error: 'Not Available' });
        }

        // let company = await feedService.findCompanyById([job.company.companyId]);
        // job.company = convertToCompany(company);
        job.company = job.company.transform();
        job.skills = _.reduce(job.skills, function(res, i){
          res.push(_.omit(i, ['_id']));
          return res;
        }, []);

        const jobFunction = await jobfunctionService.findByShortCode(job.jobFunction);
        job.jobFunction = jobFunction;

        //Save to Cache
        await saveToCache(cacheKey, job);
      }else{
        return res.status(400).send({success: false, error: 'Job not found'})
      }

    } catch (error) {
      console.log(error);
      return res.status(500).send({success: false, error: 'Internal Server Error'});
    }
  }else {
    console.log('Serving Job data from cache');
    job = JSON.parse(job);
    if(job.endDate === undefined || job.endDate < Date.now()){
      return res.status(400).json({ success: false, error: 'The job has expired' });
    }
    job.impression = job.impression? await jobImpressionService.getByJobId(job._id): {};
  }

  if(job && currentUserId){
    user = await userService.findByUserId(currentUserId).populate('skills');
    hasSaved = await userImpressionService.findByUserIdSubjectIdAndType(currentUserId, job._id, 'SAVED');
    job.hasSaved = (hasSaved) ? true : false;
    hasLiked = await userImpressionService.findByUserIdSubjectIdAndType(currentUserId, job._id, 'LIKED');
    job.hasLiked = (hasLiked) ? true : false;
    job.hasApplied = await applicationService.exists(job._id, null, currentUserId);
    job.hasQuestions = job.questionTemplate ?  true : false;
    partySkills = _.map(user?.skills, 'skill')
    partySkills = _.map(partySkills, "id");
  }

  res.json(job);
});

async function updateJobById(jobId, currentUserId, jobForm, locale) {

  if(!jobId || !currentUserId || !jobForm){
    return null;
  }


  jobForm = await Joi.validate(jobForm, jobRequisitionSchema, { abortEarly: false });

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await JobRequisition.findOne({jobId: jobId});
    if(job) {

      // let jobSkills = await findSkillsById(job.skills);
      // console.log('jobSkils', jobSkills)

      job.title = jobForm.title;
      job.description = jobForm.description;
      job.durationMonths = jobForm.durationMonths;
      job.minMonthExperience = jobForm.minMonthExperience;
      job.maxMonthExperience = jobForm.maxMonthExperience;
      job.noOfResources = jobForm.noOfResources;
      job.type = jobForm.type;
      job.expirationDate = jobForm.expirationDate;
      job.requiredOnDate = jobForm.requiredOnDate;
      job.salaryRangeLow = jobForm.salaryRangeLow;
      job.salaryRangeHigh = jobForm.salaryRangeHigh;
      job.salaryFixed = jobForm.salaryFixed;
      job.isNegotiable = jobForm.isNegotiable;
      job.level = jobForm.level;
      job.jobFunction = jobForm.jobFunction;
      job.responsibilities = jobForm.responsibilities;
      job.qualifications = jobForm.qualifications;
      job.minimumQualifications = jobForm.minimumQualifications;
      job.salaryRangeLow = jobForm.salaryRangeLow;
      job.skills = jobForm.skills;
      job.employmentType = jobForm.employmentType;
      job.education = jobForm.education;
      job.industry = jobForm.industry;
      job.promotion = jobForm.promotion;
      job.hiringManager = jobForm.hiringManager;
      job.district = jobForm.district;
      job.city = jobForm.city;
      job.state = jobForm.state;
      job.country = jobForm.country;
      job.postalCode = jobForm.postalCode;
      job.tags = jobForm.tags;
      job.tags = jobForm.tags;
      job.isExternal = jobForm.externalUrl?true:false;
      job.workflowId = jobForm.workflowId;
      job.department = jobForm.department;
      job.labels = jobForm.labels;
      job.questions = jobForm.questions;
      job.requiredResume = jobForm.requiredResume;
      job.requiredCoverLetter = jobForm.requiredCoverLetter;
      job.requiredPhoto = jobForm.requiredPhoto;
      job.requiredPhone = jobForm.requiredPhone;
      job.applicationPreferences = jobForm.applicationPreferences;
      job.profileField = jobForm.profileField;
      job.pipeLine = jobForm.pipeLine;




      if (jobForm.promotion) {
        job.promotion = jobForm.promotion;
      }
      job.updatedBy = currentUserId;

      job = job.save();

      //delete from cache
      let cacheKey = `job:${jobId}`;
      await deleteFromCache(cacheKey);
    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


const reportJobById = catchAsync(async (req, res) => {
  const { body, params } = req;
  const {id} = params;
  const {reason, note} = body;
  const currentUserId = parseInt(req.header('UserId'));

  if(!currentUserId || !id || !reason || !note){
    return res.status(400).send({success: false, error: 'user id, job id, reason or note missing'});
  }

  let job = await jobService.findJobId(id);
  if(!job){
    return res.status(400).send({success: false, error: 'Job not found'});
  }

  let currentParty = await feedService.findByUserId(currentUserId);

  if(!isPartyActive(currentParty, currentUserId)) {
    console.debug('User Not Active: ', currentUserId);
    return res.status(400).send({success: false, error: 'User not active'})
  }

  let report = await jobReportService.findReportByJobAndUserId(id, currentUserId);
  if(report){
    return res.json(report);
  }

  try{
    report = await jobReportService.createReport({
      jobId: id,
      reportedBy: currentUserId,
      reason,
      note,
    });
    return res.json(report);
  }catch(error){
    console.log(error);
    return res.status(500).send({success: false, error: 'Internal Server Error'})
  }
});


const captureJob = catchAsync(async (req, res) => {
  const { query, params, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));
  let result;
  let job = await jobService.findJobId(id);
  if(job) {
    result = await userImpressionService.add(currentUserId, job, query.token, query.source, query.source, query.type);
  }

  res.json(result);
});

const getJobInsight = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result = null;
  try {
    let job = await jobService.findJobId(id);
    if(job) {
      result = {};
      let jobSkills = [];
      if (job.skills.length) {
        // jobSkills = await feedService.findSkillsById(job.skills);
      }
      // let currentParty = await findByUserId(currentUserId);

      let min = Math.ceil(60);
      let max = Math.floor(100);
      result.match = {
        rank: Math.floor(Math.random() * (max - min + 1)) + min,
        role: Math.floor(Math.random() * (max - min + 1)) + min,
        skills: Math.floor(Math.random() * (max - min + 1)) + min,
        experience: Math.floor(Math.random() * (max - min + 1)) + min
      };

      let applications = await applicationService.findByJobId(job._id);
      let lookupIds = _.map(applications, 'partyId');
      lookupIds.push(currentUserId)
      let applicants = await feedService.lookupCandidateIds(lookupIds);
      let currentUser = _.remove(applicants, function(n) {
        return n.id == currentUserId;
      })[0];

      currentUser.educations = null;
      currentUser.experiences = null;
      currentUser.skills = null;
      result.noOfApplications = applications.length;
      result.applications = {
        levels: [
          { "JUNIOR": 4 },
          { "MID": 26 },
          { "SENIOR": 23 },
          { "MANAGER": 47 }
        ],
        educations: [
          { "ASSOCIATE": 20 },
          { "BACHELOR": 58 },
          { "MASTER": 10 },
          { "DOCTORAL": 12 }
        ]
      };
      result.skills = _.reduce(jobSkills, function(res, item) {
        res.push({ name: item.name, hasSkill: false });
        return res;
      }, []);
    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


async function getCategories(locale) {

  let result = [];
  try {
    let categories = feedService.findCategoryByType('JOB', locale);
    console.log(categories)
  } catch (error) {
    console.log(error);
  }

  return result;

}

const getJobLanding = catchAsync(async (req, res) => {
  const { user, query, locale, userLocation } = req;
  const currentUserId = parseInt(req.header('UserId'));

  let result = {categories: [], popularJobs: [], popularCompanies: [], viewedJobs: [], savedJobs: [], newJobs: [], highlightJobs: []};
  try {
    // let industries = await getTopIndustry();
    if(currentUserId){
      result.viewedJobs = await findJobViewByUserId(currentUserId, 4);
      result.savedJobs = await bookmarkService.findBookByUserId(currentUserId);

      result.newJobs = await jobService.getNewJobsForDashboard({status: [statusEnum.ACTIVE]}, currentUserId, userLocation);
      result.newJobs = _.reduce(result.newJobs, function(res, job){
        job.company = convertToCompany(job.company);
        job.description = null;
        job.minimumQualifications = null;
        job.industry = [];
        job.responsibilities = [];
        job.qualifications = [];
        job.skills = [];
        job.applicationForm= null;
        job.members = [];
        job.tags = [];
        job.applications = [];

        res.push(job);
        return res;
      }, [])

      const user = userService.findByUserId(currentUserId);
      result.popularJobs = await jobService.getPopularJobs({status: [statusEnum.ACTIVE]}, userLocation);
      result.popularJobs = _.reduce(result.popularJobs, function(res, job){
        job.company = convertToCompany(job.company);
        job.description = null;
        job.minimumQualifications = null;
        job.industry = [];
        job.responsibilities = [];
        job.qualifications = [];
        job.skills = [];
        job.applicationForm= null;
        job.members = [];
        job.tags = [];
        job.applications = [];

        res.push(job);
        return res;
      }, []);

      result.highlightJobs = await jobService.getHighlightJobs({status: [statusEnum.ACTIVE]}, userLocation);
      result.highlightJobs = _.reduce(result.highlightJobs, function(res, job){
        job.company = convertToCompany(job.company);
        job.description = null;
        job.minimumQualifications = null;
        job.industry = [];
        job.responsibilities = [];
        job.qualifications = [];
        job.skills = [];
        job.applicationForm= null;
        job.members = [];
        job.tags = [];
        job.applications = [];

        res.push(job);
        return res;
      }, []);
    }

    result.popularCompanies = await companyReviewService.getPopularCompanies();
    console.log(result.popularCompanies);

    const companyIds = result.popularCompanies.map(company => company.companyId);
    let foundCompanies = await feedService.lookupCompaniesIds(companyIds);

    result.popularCompanies.forEach(company => {
      const foundCompany = foundCompanies.find(fc => fc.id === company.companyId);
      if (foundCompany) {
        company.company = foundCompany;
      }
    });


    // let highlight = await JobRequisition.find({}).sort({createdDate: -1}).limit(10);
    // let newJobs = await jobService.getNewJobs();
    // let popularJobs = await findMostViewed();
    //
    // if(!popularJobs.length){
    //   popularJobs = await bookmarkService.findMostBookmarked();
    // }
    //
    // let ids = _.map(result.viewedJobs, 'job').concat(_.map(result.savedJobs, 'jobId')).concat(_.map(popularJobs, '_id')).concat(_.map(highlight, '_id')).concat(_.map(newJobs, '_id'));
    //
    // let jobs = await JobRequisition.find({_id: {$in: ids}}).populate('company');
    // let foundCompanies = await feedService.lookupCompaniesIds(_.map(jobs, 'company.companyId'));
    // jobs = _.reduce(jobs, function(res, job){
    //   job.company = convertToCompany(job.company);
    //   job.description = null;
    //   job.industry = [];
    //   job.responsibilities = [];
    //   job.qualifications = [];
    //   job.skills = [];
    //   job.applicationForm= null;
    //   job.members = [];
    //   job.tags = [];
    //   job.hasSaved = _.find(result.savedJobs, function(o){return o.jobId.equals(job._id)})?true:false;
    //
    //   res.push(job);
    //   return res;
    // }, [])
    //
    //
    //
    //
    // result.popularJobs = _.reduce(popularJobs, function(res, item){
    //   let job = _.find(jobs, {_id: item._id});
    //   if(job){
    //     res.push(job);
    //   }
    //   return res;
    // }, []);
    //
    // result.viewedJobs = _.reduce(result.viewedJobs, function(res, item){
    //   let job = _.find(jobs, {_id: item.job?._id});
    //   if(job){
    //     res.push(job);
    //   }
    //   return res;
    // }, []);
    //
    //
    //
    //
    // _.forEach(highlight, function(item){
    //   let job = _.find(jobs, {_id: item._id});
    //
    //   if(job) {
    //     result.highlightJobs.push(job);
    //
    //   }
    // })
    //
    // _.forEach(newJobs, function(item){
    //   let job = _.find(jobs, {_id: item._id});
    //
    //   if(job) {
    //     result.newJobs.push(job);
    //
    //   }
    // })
    //
    //
    //
    // // let industryFull = await findIndustry('', _.reduceRight(industries, function(res, item){res.push(item.shortCode); return res}, []), locale);
    // // industryFull = _.reduceRight(industryFull, function(res, item){
    // //   let found = _.find(industries, { 'shortCode': item.shortCode });
    // //   if(found){
    // //     item.noOfItems = found.count;
    // //     res.push(convertIndustry(item));
    // //   }
    // //
    // //   return res;
    // // }, [])
    // // result.categories = industryFull;
    //
    // result.categories = await industryService.getFeatureIndustries(locale);

  } catch (error) {
    console.log(error);
  }

  res.json(result);

});

async function getTopFiveJobs(companies, locale) {

  let result = [];
  try {
    result = await jobService.getGroupOfCompanyJobs(companies);

  } catch (error) {
    console.log(error);
  }

  res.json(result);

};


const searchJob = catchAsync(async (req, res) => {
  const { query, body, locale } = req;
  const currentUserId = parseInt(req.header('UserId'));

  if(!body || !query){
    return null;
  }


  body.status = [statusEnum.ACTIVE];
  body.types = [jobType.FREE, jobType.PROMOTION];
  body.endDate = Date.now();

  let result = await jobService.searchWithBudget(currentUserId, query.query, body, query, locale);
  let history = await  saveSearch(currentUserId, body.query);

  res.json(new Pagination(result));

});

const searchSuggestions = catchAsync(async (req, res) => {
  const { query, locale } = req;
  const keyword = query.query || '';

  let results = await JobRequisition.aggregate([
      { $match: {title: { $regex: keyword, $options: 'i'} } },
      { $group:{_id:{title:'$title'}, count:{$sum:1}} },
      { $project: {_id: 0, title:'$_id.title'} }
      ]).limit(10).sort({title: 1});

  results = _.reduce(results, function(a, b){
    a.push(b.title);
    return a;
  }, []);

  res.json(results);
});

const getTitleSuggestion = catchAsync(async (req, res) => {
  const { query, body, locale } = req;
  const currentUserId = parseInt(req.header('UserId'));
  let result = [];
  if(!query.query){
    return result;
  }
  const keyword = query?.query || '';
  result = await jobTitleService.suggestion(keyword);

  res.json(result);

});

async function getSimilarJobs(currentUserId, jobId, filter, pagination, locale) {

  let foundJob = null;
  let select = '-description -qualifications -responsibilities';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    projection: {score: { $meta: "textScore" }},
    sort:     {score:{$meta:"textScore"}},
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  let result = null;
  if(jobId){
    foundJob = await JobRequisition.findOne({jobId: jobId});

    if(foundJob) {
      //filter.query = foundJob.title;
      filter.level = foundJob.level;
      filter.jobFunction = foundJob.jobFunction;
      filter.employmentType = foundJob.employmentType;
      filter.employmentType = null;


      const aggregate = JobRequisition.aggregate([
        {$match: {$text: {$search: foundJob.title, $diacriticSensitive: true, $caseSensitive: false}}},
        {
          $lookup: {
            from: 'companies',
            localField: "company",
            foreignField: "_id",
            as: "company"
          }
        },
        { $unwind: '$company'}
    ]);

      result = await JobRequisition.aggregatePaginate(aggregate, options);
      let docs = [];

      // let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
      // let listOfSkills = await findSkillsById(skills);


      let foundCompanies = await feedService.lookupCompaniesIds(_.reduce(result.docs, function(res, i){ res.push(i.company.companyId); return res;},  []));

      let hasSaves = await bookmarkService.findBookByUserId(currentUserId);

      _.forEach(result.docs, function (job) {
        job.shareUrl = 'https://www.anymay.com/jobs/' + job.jobId;
        job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
        job.skills=[];
        job.industry=[];
        job.members=[];
        job.responsibilities=[];
        job.qualifications = [];
        job.minimumQualifications=[];
        job.applicationForm=null;
        job.description = null;
        job.company = convertToCompany(_.find(foundCompanies, {id: job.company.companyId}));
        // var skills = _.reduce(job.skills, function (res, skill) {
        //   let find = _.filter(listOfSkills, {'id': skill});
        //   if (find) {
        //     res.push(find[0]);
        //   }
        //
        //   return res;
        // }, [])

        // job.skills = skills;
      })

    }


  }
  return new Pagination(result, locale);

}

const getSimilarJobList = catchAsync(async (req, res) => {
  const { query, params, locale } = req;
  const {id} = params;
  const {isMinimal} = query
  const currentUserId = parseInt(req.header('UserId'));
  let foundJob = null;
  if(!id) {
    return [];
  }

  const job = await jobService.findJobId(id);
  if(!job){
    return [];
  }

  let result = await jobService.getSimilarJobList(job._id, query);
  let savedJobs = await userImpressionService.findByUserIdSubjectTypeAndType(currentUserId, 'JOB', 'SAVED')
  let likedJobs = await userImpressionService.findByUserIdSubjectTypeAndType(currentUserId, 'JOB', 'LIKED')
  result.docs = _.reduce(result.docs, function(res, job){
    job.hasSaved = _.some(savedJobs, savedJob => savedJob.subject.toString() === job._id.toString());
    job.hasLiked = _.some(likedJobs, likedJob => likedJob.subject.toString() === job._id.toString());
    job.company.id = job.company.companyId;
    job.company = convertToCompany(job.company);

    res.push(job);
    return res;
  }, []);
  res.json(new Pagination(result));

});

async function getSimilarJobsByTitle(currentUserId, title, locale) {
  if(!currentUserId || !title) {
    return [];
  }

  let result = await jobService.getSimilarJobsByTitle(title);
  let saved = await bookmarkService.findBookByUserId(currentUserId);
  result = _.reduce(result, function(res, job){
    if(_.some(saved, {jobId: job._id})){
      job.hasSaved=true;
    }
    job.responsibilities=[];
    job.qualifications=[];
    job.minimumQualifications=[];
    job.description='';
    job.updatedBy=null;
    job.company.id = job.company.companyId;
    res.push(job);
    return res;
  }, []);
  return result;

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

const getSimilarCompany = catchAsync(async (req, res) => {
  const { query, params, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));
  let result = null;

  try {

    let foundJob = await JobRequisition.findOne({jobId: id});
    if(foundJob && foundJob.status==statusEnum.ACTIVE){

      let match = {level: foundJob.level, jobFunction: foundJob.jobFunction};
      // let match = {level: foundJob.level};

      let group = await jobService.getCountsGroupByCompany(match);
      group = _.reduce(group, function(res, item){
        res.push(item._id.company.companyId);
        return res;
      }, []);

      let companies = await feedService.searchCompany(null, group, currentUserId);
      result = companies;

      result.content = _.reduce(result.content, function(res, item){
        item = convertToCompany(item);
        item.hasFollowed = false;
        res.push(item);
        return res;

      }, [])


    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);

});

const applyJobById = catchAsync(async (req, res) => {
  const { userLocation, body, params, locale, query } = req;
  const {id} = params;
  const { source: sourceForCapture, token } = query;
  const currentUserId = parseInt(req.header('UserId'));
  let savedApplication = null;

  const location = {}; //await maxmindService.getLocation(req);
  let job = await JobRequisition.findOne({jobId: parseInt(id) }).populate('createdBy').populate('pipeline').populate('company');
  if(!job || job.status!=statusEnum.ACTIVE){
    return res.status(400).send({success: false, error: 'Invalid Job'});
  }


  let exists = exists = await applicationService.exists(job._id, body.email, currentUserId);
  if (exists) {
    return res.status(400).send({success: false, error: 'User already applied'});
  }

  try {
    let currentParty, user, candidate;

    if(!currentUserId){
      currentParty = await feedService.findUserByEmail(body.email.toLowerCase());
    } else {
      currentParty = await feedService.findByUserId(currentUserId);
    }

    if(currentParty){
      user = await userService.findByUserId(currentUserId);
    } else {
      user = await userService.findByEmail(body.email.toLowerCase());
    }

    const phoneNumber = body.phoneNumber || currentParty?.primaryPhone?.value;
    const email = body.email?.toLowerCase() || currentParty?.primaryEmail?.value?.toLowerCase();

    if(!user){
      user = await userService.create({
        id: currentParty?.id,
        firstName: body.firstName? body.firstName : currentParty.firstName,
        lastName: body.lastName? body.lastName : currentParty.lastName,
        primaryEmail: { value: email },
        primaryPhone: { value: phoneNumber },
        city: location?.city,
        state: userLocation.state,
        country: userLocation.country,
        latitude: "53",
        longitude: "43",
        timezone: userLocation.timezone,

        // city: location?.city,
        // state: location?.state,
        // country: location?.country?.iso,
        // latitude: location?.longitude,
        // longitude: location?.longitude,
        // timezone: location?.timezone,
      });
      candidate = await candidateService.create(user, job.company?._id);
      candidate.user = user;

      // if(currentParty){
      //   // const primaryEmail = currentParty.primaryEmail;
      //   // const primaryPhone = currentParty.primaryPhone;
      //
      //
      //   candidate = await candidateService.create(user, job.company?._id);
      //
      //   let languages = _.reduce(currentParty.languages, function(res, i){res.push({language: i.language, name: i.name, level: i.level}); return res}, []);
      //   if(languages.length===0){
      //     // languages.push({language: locale, name: localeCodes.getByTag(locale).name, level: null});
      //   }
      //
      // }else {
      //   candidate = await candidateService.create(user, job.company?._id);
      //   candidate.user = user;
      // }

    }
    else {
      candidate = await candidateService.findByUserAndCompany(user._id, job.company._id).populate('user');

      if(!candidate){
        user.email = user.email ? user.email : email;
        candidate = await candidateService.create(user, job.company?._id);
        candidate.user = user;
      }
      console.log('found candidate', candidate._id);
    }






    let source;
    if(body.source){
      source = await labelService.findOneBy({name: body.source, type:'SOURCE', company:job.company._id});
    } else {
      source = await labelService.findOneBy({name:'Accessed', type:'SOURCE', default:true});
    }

    if(source){
      candidate.sources = [source?._id];
    }

    // candidate = await candidateService.addCandidate(null, job.company._id, currentParty, true, false);

    if(!_.find(candidate.phones, {value: body.phoneNumber})){
      candidate.phones.push({
        contactType: contactType.MOBILE,
        value: body.phoneNumber
      });
    }

    if(!_.find(candidate.emails, {value: body.email})){
      candidate.emails.push({
        contactType: contactType.PERSONAL,
        value: body.email
      });
    }




    body.company = job.company._id;
    body.user = candidate;
    body.partyId = candidate.userId;
    body.jobId = job._id;
    body.jobTitle = job.title;

    if (body.source) {
      // application.sources.push(source);
      delete body.source;
    }

    savedApplication = await applicationService.apply(body, job, candidate);
    await userImpressionService.add(candidate.userId, job, 'JOB', token, sourceForCapture, 'APPLIED');

  } catch (error) {
    console.log(error);
  }

  res.json(savedApplication);
});


const addBookmark = catchAsync(async (req, res) => {
  const { query, params, locale } = req;
  const {id} = params;
  const {token, source} = query;
  const currentUserId = parseInt(req.header('UserId'));

  let result;
  try {
    let job = await JobRequisition.findById(id);
    let user = await userService.findByUserId(currentUserId);

    if(!user){
      let currentParty = await feedService.findByUserId(currentUserId);
      if(currentParty){
        user = await userService.create(currentParty);

      }
    }

    if(job && user) {
      result = await bookmarkService.add(user, job, token);
      await userImpressionService.add(currentUserId, job, 'JOB', token, source, 'SAVED');
    }

  } catch (error) {
    console.log(error);
    return res.status(500).send({success:false, error: 'Internal Server Error'});
  }

  res.json(result);
});

const removeBookmark = catchAsync(async (req, res) => {
  const { query, params, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result;
  try {

      let deleted = await bookmarkService.removeBookByJobId(new ObjectId(id), currentUserId);
      if(deleted){
        result = {success: true};
        await userImpressionService.removeImpression(currentUserId, new ObjectId(id),'JOB', 'SAVED')
      } else {
        result = null;
      }

  } catch (error) {
    console.log(error);
    return result;
  }

  res.json(result);
});

async function searchCandidates(currentUserId, jobId, filter, locale) {

  if(filter==null){
    return null;
  }


  let foundJob = null;
  let select = '-description -qualifications -responsibilities';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  filter.sortBy = (filter.sortyBy) ? filter.sortyBy : 'createdDate';
  filter.direction = (filter.direction && filter.direction=="ASC") ? "ASC" : 'DESC';
  sortBy[filter.sortBy] = (filter.direction == "DESC") ? -1 : 1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  if(jobId){

    filter.similarId = foundJob.jobId;
    //filter.query = foundJob.title;
    filter.level = foundJob.level;
    filter.jobFunction=foundJob.jobFunction;
    filter.employmentType=foundJob.employmentType;
    filter.employmentType=null;
  }

  let result = await JobRequisition.paginate(new SearchParam(filter), options);
  let docs = [];

  let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
  let listOfSkills = await Skill.find({ skillId: { $in: skills } });
  let employmentTypes = await getEmploymentTypes(_.uniq(_.map(result.docs, 'employmentType')), locale);
  let experienceLevels = await getExperienceLevels(_.uniq(_.map(result.docs, 'level')), locale);
  let industries = await findIndustry('', _.uniq(_.flatten(_.map(result.docs, 'industry'))), locale);
  let promotions = await getPromotions(_.uniq(_.flatten(_.map(result.docs, 'promotion'))), locale);

  let listOfCompanyIds = _.uniq(_.flatten(_.map(result.docs, 'company')));

  let res = await searchCompany('', listOfCompanyIds, currentUserId);
  let foundCompanies = res.content;

  let hasSaves = [];

  if(currentUserId){
    hasSaves=await bookmarkService.findBookByUserId(currentUserId);
  }


  _.forEach(result.docs, function(job){
    job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
    job.company = _.find(foundCompanies, {id: job.company});
    job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
    job.level = _.find(experienceLevels, {shortCode: job.level});

    job.shareUrl = 'https://www.anymay.com/jobs/'+job.jobId;
    job.promotion = _.find(promotions, {promotionId: job.promotion});

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

async function submitJobQuestionaires(currentUserId, jobId, form) {

  if(!currentUserId || !jobId || !form){
    return null;
  }


  let result;
  try {

    let job = await JobRequisition.findOne({jobId: jobId}).populate('questionTemplate');

    result = job.questionTemplate;

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}

const getJobQuestionaires = catchAsync(async (req, res) => {
  const { query, params, locale } = req;
  const {jobId} = params;


  let result = [];
  try {

    let job = await JobRequisition.findOne({jobId: jobId}).populate({
      path: 'questionTemplate',
      model: 'QuestionTemplate',
      populate: {
        path: 'questions',
        model: 'Question'
      }
    });

    if(job.questionTemplate && job.questionTemplate.questions) {
      // delete job.questionTemplate.questions.answers;
      result = job.questionTemplate.questions;
    }
  } catch (error) {
    console.log(error);
    return result;
  }

  res.json(result);
});


async function getJobSkills(jobId, locale) {

  if(!jobId){
    return null;
  }


  let result = [];
  try {

    let job;
    if(isNaN(jobId)){
      job = await JobRequisition.findById(new ObjectId(jobId));
    } else {
      job = await JobRequisition.findOne({jobId: parseInt(jobId)});
    }

    console.log('skills', job.skills)
    if(job.skills) {
      result = await feedService.findSkillsById(job.skills);
    }
  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}


async function getSponsorJobs(currentUserId, filter, locale) {

  if(!currentUserId || !filter){
    return null;
  }


  let result = [];
  try {


    result = await JobRequisition.find({status: statusEnum.ACTIVE}).populate('company').limit(20);
    let allCompanies = await feedService.lookupCompaniesIds(_.map(result, 'company.companyId'));
    let hasSaves = [];

    result = _.reduce(result, function(res, job){
      let company = _.find(allCompanies, {id: job.companyId});
      job.company = _.merge(job.company, company);
      job.createdBy = job.createdBy?convertToAvatar(job.createdBy):null;
      job.shareUrl = 'https://www.accessed.co/jobs/view/'+job.jobId;

      job.skills=[];
      job.industry=[];
      job.members=[];
      job.responsibilities=[];
      job.qualifications = [];
      job.minimumQualifications=[];
      job.description = null;
      job.applicationForm = null;
      // job.isHot = _.reduce(job.ads, function(res, ad){
      //   if(_.includes(ad.targeting.adPositions, adPosition.hottag)){
      //     if(ad.startTime < today && ad.endTime > today){
      //       res = true;
      //     }
      //
      //   }
      //   return res;
      // }, false);
      job.ads = [];
      res.push(job);
      return res;
    }, []);


  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}

const getMarketSalary = catchAsync(async (req, res) => {
  const {query} = req;
  const {jobTitle} = query;

  if(!jobTitle){
    res.json(null);
  }

  let result = {min: 15500, max: 25000, currency: 'USD'};
  res.json(result);
});

const getJobsEndingToday  = catchAsync(async (req, res) => {
  const {user, params, query} = req;

  const { date } = query;

  const options = pick(query, ['sortBy', 'size', 'page', 'direction']);

  let filter = {};
  let jobsEndingToday = [];

  try {
    jobsEndingToday = await jobService.getJobsEndingToday(filter, options, date);

  } catch (error) {
    console.error('Error fetching jobs ending today:', error);
  }

  res.json(new Pagination(jobsEndingToday));
});

const markJobAsExpired = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const{id} = params;

  try {
    const updatedJob = await jobService.updateJobStatus(id, statusEnum.EXPIRED);
    if (updatedJob) {
      res.json(updatedJob);
    } else {
      res.status(400).json({ success: false, error: 'Job not found.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

const getOutdatedDraftJobs = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const { date } = query;

  const options = pick(query, ['sortBy', 'size', 'page', 'direction']);

  let filter = {};
  let outdatedDraftJobs = [];

  try {
    outdatedDraftJobs = await jobService.getOutdatedDraftJobs(filter, options, date);

  } catch (error) {
    console.error('Error fetching outdated draft jobs:', error);
  }

  res.json(new Pagination(outdatedDraftJobs));
})

module.exports = {
  importJobs,
  getJobById,
  updateJobById,
  reportJobById,
  captureJob,
  getJobInsight,
  getJobLanding,
  getTopFiveJobs,
  searchJob,
  searchSuggestions,
  getTitleSuggestion,
  getSimilarJobs,
  getSimilarJobList,
  getSimilarJobsByTitle,
  getLatestJobs,
  getSimilarCompany,
  applyJobById,
  addBookmark,
  removeBookmark,
  searchCandidates,
  submitJobQuestionaires,
  getJobQuestionaires,
  getJobSkills,
  getSponsorJobs,
  getMarketSalary,

  getJobsEndingToday,
  markJobAsExpired,
  getOutdatedDraftJobs,
}
