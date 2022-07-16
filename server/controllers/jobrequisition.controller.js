const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const { ApplicationExist } = require('../middleware/baseError');

const {jobMinimal, convertToAvatar, convertToCompany, convertIndustry, categoryMinimal, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const axiosInstance = require('../services/api.service');
const {findCandidateById, lookupUserIds, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findCompanyById, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');

const statusEnum = require('../const/statusEnum');
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
const jobviewService = require('../services/jobview.service');
const jobfunctionService = require('../services/jobfunction.service');

const {getListofSkills} = require('../services/skill.service');
const {findApplicationByUserIdAndJobId, findByApplicationId, applyJob, findAppliedCountByJobId} = require('../services/application.service');
const {findApplicationByCurrentStatus, findApplicationProgresssById, addApplicationProgress} = require('../services/applicationprogress.service');
const {findApplicationHistoryById, addApplicationHistory} = require('../services/applicationhistory.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getIndustry} = require('../services/industry.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {findById, findByJobId} = require('../services/pipeline.service');


const jobService = require('../services/jobrequisition.service');
const {findJobViewByUserId, findJobViewByUserIdAndJobId, findMostViewed} = require('../services/jobview.service');
const {findSearchHistoryByKeyword, saveSearch} = require('../services/searchhistory.service');
const {getTopCategory} = require('../services/category.service');
const {getTopIndustry} = require('../services/industry.service');

const filterService = require('../services/filter.service');
const bookmarkService = require('../services/bookmark.service');
const questionSubmissionService = require('../services/questionsubmission.service');
const stageService = require('../services/stage.service');


const JobRequisition = require('../models/jobrequisition.model');
const Skill = require('../models/skill.model');
const JobFunction = require('../models/jobfunction.model');
const Bookmark = require('../models/bookmark.model');
const PartySkill = require('../models/partyskill.model');
const Application = require('../models/application.model');
const EmploymentType = require('../models/employmenttypes.model');
const ExperienceLevel = require('../models/experiencelevel.model');
const Industry = require('../models/industry.model');
const JobView = require('../models/jobview.model');
const Category = require('../models/category.model');
const ReportedJob = require('../models/reportedjob.model');



let Pagination = require('../utils/pagination');
let JobSearchParam = require('../const/jobSearchParam');
let SearchParam = require('../const/searchParam');

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
  getSponsorJobs
}


async function importJobs(type, jobs) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  // if(job) {
  //   job.skills = await Skill.find({id: {$in: job.skills}});
  // }
  return await new JobRequisition(job).save();
}


async function getJobById(currentUserId, jobId, isMinimal, locale) {

  if(!jobId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    // job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } }).populate('promotion')
    job = await jobService.findJobId(jobId, locale).populate([
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
        path: 'ads',
        model: 'Ad',
        populate: {
          path: 'targeting',
          model: 'Target'
        }
      }

      ])


    if(job) {
      job = job.toObject();
      if(currentUserId) {
        let currentParty = await findByUserId(currentUserId);

        if (isPartyActive(currentParty)) {

          let hasSaved = await bookmarkService.findBookById(currentParty.id, job._id);
          job.hasSaved = (hasSaved) ? true : false;

          let hasApplied = await findApplicationByUserIdAndJobId(currentParty.id, job._id);
          job.hasApplied = (hasApplied) ? true : false;

          partySkills = await findUserSkillsById(currentParty.id);
          partySkills = _.map(partySkills, "id");

        }
      }

      let company = await feedService.findCompanyById([job.company.companyId]);
      job.company = convertToCompany(company);

      if(!isMinimal) {
          job.createdBy = convertToAvatar(job.createdBy);

          let jobSkills = [];
          if(job.skills.length){
            jobSkills = await findSkillsById(job.skills);
          }

          let noApplied = await findAppliedCountByJobId(job.jobId);
          job.noApplied = noApplied;

          if(job.industry) {
            let industry = await findIndustry('', job.industry, locale);
            job.industry = industry;
          }

          if(job.jobFunction) {
            let jobFunction = await findJobfunction('', job.jobFunction, locale);
            job.jobFunction = jobFunction;
          }

          if (job.promotion) {
            let promotion = await findPromotionById(job.promotion);

            job.promotion = promotion?promotion[0]:null;
          }

          if(job.category) {
            job.category = await feedService.findCategoryByShortCode(job.category, locale, true);
            job.category = categoryMinimal(job.category);
          }

          // let promotion = await JobRequisition.populate(job, 'promotion')

          let currentParty, partySkills = [];

          let skills = _.reduce(jobSkills, function (res, skill, key) {
            let temp = _.clone(skill);

            if (_.includes(partySkills, skill.id)) {
              temp.hasSkill = true;
            } else {
              temp.hasSkill = false;
            }

            res.push(temp);
            return res;
          }, []);

          job.skills = skills;
          job.shareUrl = 'https://www.accessed.co/jobs/' + job.jobId;

          let today = Date.now();
          job.isHot = job.ads?_.reduce(job.ads, function(res, ad){
            if(_.includes(ad.targeting.adPositions, 'hottag') && (ad.startTime < today && ad.endTime > today)){
              res = true;
            }
            return res;
          }, false):false;
      }
    }

  } catch (error) {
    console.log(error);
  }

  return job;
}

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

    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


async function reportJobById(currentUserId, jobId, report) {


  if(!currentUserId || !jobId || !report){
    return null;
  }

  let result;
  let newReport;
  try {

    let foundJob = await JobRequisition.findOne({jobId: jobId});
    if(foundJob){
      let currentParty = await feedService.findByUserId(currentUserId);

      if(!isPartyActive(currentParty, currentUserId)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }

      newReport = await ReportedJob.findOne({jobId:jobId, user: currentUserId});
      if(newReport!=null){
        return newReport;
      }

      report = await Joi.validate(report, ReportedJobSchema, { abortEarly: false });
      newReport = await new ReportedJob(report).save();

      if(newReport){
        // let attendees = await getAllAttendees(foundEvent.eventId);
        // let currentAttendee = _.find(attendees, {partyId: currentParty.id});
        //
        // let finalAttendeees = _.reduce(attendees, function(res, attendee){
        //   if(attendee.partyId!=currentParty.id){
        //     res.push(attendee.partyId);
        //   }
        //   return res;
        // }, []);
        //
        // if(currentAttendee){
        //   await currentAttendee.remove();
        // }

        // foundEvent.attendees = finalAttendeees;
        // foundEvent.eventStatus=statusEnum.REPORTED;
        // result  = await foundEvent.save();
      }


    }


  } catch (error) {
    console.log(error);
  }

  return newReport;
}


async function captureJob(currentUserId, jobId, capture) {

  if(!jobId || !currentUserId || !capture){
    return null;
  }

  let result = await jobviewService.add(currentUserId, jobId, capture.token);

  return result;
}


async function getJobInsight(currentUserId, jobId, locale) {

  if(!currentUserId || !jobId){
    return null;
  }

  let result = {};
  try {
    let job = await jobService.findJobId(jobId);
    let jobSkills = [];
    if(job.skills.length){
      jobSkills = await feedService.findSkillsById(job.skills);
    }
    // let currentParty = await findByUserId(currentUserId);

    let min = Math.ceil(60);
    let max = Math.floor(100);
    result.match = {rank: Math.floor(Math.random() * (max - min + 1)) + min, role: Math.floor(Math.random() * (max - min + 1)) + min, skills:Math.floor(Math.random() * (max - min + 1)) + min,  experience: Math.floor(Math.random() * (max - min + 1)) + min};

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
        {"JUNIOR": 4},
        {"MID": 26},
        {"SENIOR": 23},
        {"MANAGER": 47}
      ],
      educations: [
        {"ASSOCIATE": 20},
        {"BACHELOR": 58},
        {"MASTER": 10},
        {"DOCTORAL": 12}
      ]
    };
    result.skills = _.reduce(jobSkills, function(res, item){
      res.push({name: item.name, hasSkill: false});
      return res;
    }, []);

  } catch (error) {
    console.log(error);
  }

  return result;
}


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

async function getJobLanding(currentUserId, locale) {

  let result = {categories: [], popularJobs: [], popularCompanies: [], viewedJobs: [], savedJobs: [], newJobs: [], highlightJobs: []};
  try {
    let industries = await getTopIndustry();
    let viewed = await findJobViewByUserId(currentUserId, 4);
    let saved = await bookmarkService.findBookByUserId(currentUserId);
    let highlight = await JobRequisition.find({}).sort({createdDate: -1}).limit(10);
    let newJobs = await jobService.getNewJobs();
    let popularJobs = await findMostViewed();

    if(!popularJobs.length){
      popularJobs = await bookmarkService.findMostBookmarked();
    }

    let ids = _.map(viewed, 'jobId').concat(_.map(saved, 'jobId')).concat(_.map(popularJobs, '_id')).concat(_.map(highlight, '_id')).concat(_.map(newJobs, '_id'));

    let jobs = await JobRequisition.find({_id: {$in: ids}}).populate('company');
    let foundCompanies = await feedService.lookupCompaniesIds(_.map(jobs, 'company.companyId'));
    jobs = _.reduce(jobs, function(res, job){
      job.company = convertToCompany(job.company);
      job.description = null;
      job.industry = [];
      job.responsibilities = [];
      job.qualifications = [];
      job.skills = [];
      job.applicationForm= null;
      job.members = [];
      job.tags = [];
      job.hasSaved = _.find(saved, function(o){console.log(o.jobId.equals(job._id)); return o.jobId.equals(job._id)})?true:false;

      res.push(job);
      return res;
    }, [])



    // let popular = await searchCompany('', listOfCompanyIds, currentUserId);
    let popularCompanies = foundCompanies;


    result.viewedJobs = _.reduce(viewed, function(res, item){
      let job = _.find(jobs, {_id: item.jobId});
      if(job){
        res.push(job);
      }
      return res;
    }, []);

    result.savedJobs = _.slice(_.reduce(saved, function(res, item){
      let job = _.find(jobs, {_id: item.jobId});
      if(job){
        res.push(job);
      }
      return res;
    }, []), 0, 8);

    result.popularJobs = _.reduce(popularJobs, function(res, item){
      let job = _.find(jobs, {_id: item._id});
      if(job){
        res.push(job);
      }
      return res;
    }, []);



    _.forEach(highlight, function(item){
      let job = _.find(jobs, {_id: item._id});

      if(job) {
        result.highlightJobs.push(job);

      }
    })

    _.forEach(newJobs, function(item){
      let job = _.find(jobs, {_id: item._id});

      if(job) {
        result.newJobs.push(job);

      }
    })



    // let industryFull = await findIndustry('', _.reduceRight(industries, function(res, item){res.push(item.shortCode); return res}, []), locale);
    // industryFull = _.reduceRight(industryFull, function(res, item){
    //   let found = _.find(industries, { 'shortCode': item.shortCode });
    //   if(found){
    //     item.noOfItems = found.count;
    //     res.push(convertIndustry(item));
    //   }
    //
    //   return res;
    // }, [])
    // result.categories = industryFull;

    result.categories = await jobfunctionService.getPopularJobFunctions(locale);
    result.popularCompanies = popularCompanies;

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function getTopFiveJobs(companies, locale) {

  let result = [];
  try {
    result = await jobService.getGroupOfCompanyJobs(companies);

  } catch (error) {
    console.log(error);
  }

  return result;

}



async function searchJob(currentUserId, query, filter, sort, locale) {

  if(!filter || !sort){
    return null;
  }


  filter.status = [statusEnum.ACTIVE];
  filter.types = [jobType.FREE, jobType.PROMOTION];

  let result = await jobService.search(currentUserId, query, filter, sort, locale);
  let history = await  saveSearch(currentUserId, filter.query);

  return new Pagination(result);

}



async function searchSuggestions(keyword, locale) {

  if(keyword==null){
    return null;
  }


  let results = await JobRequisition.aggregate([
      { $match: {title: { $regex: keyword, $options: 'i'} } },
      { $group:{_id:{title:'$title'}, count:{$sum:1}} },
      { $project: {_id: 0, title:'$_id.title'} }
      ]).limit(10).sort({title: 1});

  results = _.reduce(results, function(a, b){
    a.push(b.title);
    return a;
  }, []);

  return results;

}



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


async function getSimilarJobList(currentUserId, jobId, locale) {

  let foundJob = null;
  if(!jobId) {
    return [];
  }

  let result = await jobService.getSimilarJobList(jobId);
  let saved = await bookmarkService.findBookByUserId(currentUserId);
  result = _.reduce(result, function(res, job){
    if(_.some(saved, {jobId: job._id})){
      job.hasSaved=true;
    }
    job.responsibilities=[];
    job.qualifications=[];
    job.minimumQualifications=[];
    job.description='';
    job.updatedBy=null
    job.company.id = job.company.companyId;

    res.push(job);
    return res;
  }, []);
  return result;

}

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

      let group = await jobService.getCountsGroupByCompany(match);
      group = _.reduce(group, function(res, item){
        res.push(item._id.company);
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

  return result;

}

async function applyJobById(currentUserId, jobId, application ) {

  if(currentUserId==null || !jobId || application==null){
    return null;
  }


  let savedApplication;
  try {

    let currentParty = await findCandidateById(currentUserId);
    //Security Check if user is part of meeting attendees that is ACTIVE.

    if (isPartyActive(currentParty)) {

      let candidate = null;
      let job = await JobRequisition.findOne({jobId: jobId }).populate('createdBy').populate('company');
      if(job) {

        let exists = await applicationService.findApplicationByEmailAndJobId(application.email, job._id);
        if (exists) {
          throw new ApplicationExist(500, `User already applied`);

        }


        let candidate = await candidateService.findByUserIdAndCompanyId(currentUserId, job.company.companyId);
        if(!candidate){
          currentParty.skills = null;
          currentParty.experiences = null;
          currentParty.educations = null;
          currentParty.primaryEmail = {value: application.email};
          currentParty.primaryPhone = {value: application.phoneNumber};
          candidate = await candidateService.addCandidate(job.company.companyId, currentParty, true, false);
        } else {
          candidate.status = statusEnum.ACTIVE;
          candidate.email = application.email;
          candidate.phoneNumber = application.phoneNumber;
          candidate._avatar = currentParty.avatar;
          candidate.company = job.company.companyId;
          candidate.firstName = currentParty.firstName;
          candidate.middleName = currentParty.middleName;
          candidate.lastName =  currentParty.lastName;
          candidate.url = currentParty.shareUrl;
        }
        candidate.hasApplied = true;

        application.user = candidate;
        application.jobId = job._id;
        application.job = job;
        application.jobTitle = job.title;
        application.partyId = currentParty.id;
        application.company = job.company.companyId;

        if (application.source) {
          // application.sources.push(source);
          delete application.source;
        }

        savedApplication = await applicationService.apply(application);

      }
    }


  } catch (error) {
    console.log(error);
    return savedApplication;
  }

  return savedApplication;
}

async function addBookmark(currentUserId, jobId, token) {

  if(!currentUserId || !jobId){
    return null;
  }


  let result;
  try {
    let job = await JobRequisition.findById(jobId);
    if(job) {
      result = await bookmarkService.add(currentUserId, jobId, token);


    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}

async function removeBookmark(currentUserId, jobId) {

  if(!currentUserId || !jobId){
    return null;
  }


  let result;
  try {

      let deleted = await bookmarkService.removeBookById(currentUserId, ObjectID(jobId));

      if(deleted && deleted.deletedCount>0){
        result = {success: true};
      } else {
        result = null;
      }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}

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

async function getJobQuestionaires(jobId) {

  if(!jobId){
    return null;
  }


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

    console.log(job)
    if(job.questionTemplate && job.questionTemplate.questions) {
      // delete job.questionTemplate.questions.answers;
      result = job.questionTemplate.questions;
    }
  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}


async function getJobSkills(jobId, locale) {

  if(!jobId){
    return null;
  }


  let result = [];
  try {

    let job;
    if(isNaN(jobId)){
      job = await JobRequisition.findById(ObjectID(jobId));
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
