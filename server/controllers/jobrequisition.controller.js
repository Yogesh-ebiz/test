const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const {convertToAvatar, convertToCompany, convertIndustry, categoryMinimal, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const axiosInstance = require('../services/api.service');
const {lookupUserIds, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findCompanyById, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');

const statusEnum = require('../const/statusEnum');
const partyEnum = require('../const/partyEnum');
const applicationEnum = require('../const/applicationEnum');
const notificationType = require('../const/notificationType');


const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const feedService = require('../services/api/feed.service.api');

const {getListofSkillTypes} = require('../services/skilltype.service');
const {findApplicationByUserIdAndJobId, findApplicationById, applyJob, findAppliedCountByJobId} = require('../services/application.service');
const {findApplicationByCurrentStatus, findApplicationProgresssById, addApplicationProgress} = require('../services/applicationprogress.service');
const {findApplicationHistoryById, addApplicationHistory} = require('../services/applicationhistory.service');
const {findBookById, addBookById, removeBookById, findBookByUserId, findMostBookmarked} = require('../services/bookmark.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getIndustry} = require('../services/industry.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getPipelineByJobId} = require('../services/pipeline.service');


const {findJobId, getCountsGroupByCompany, getNewJobs, getGroupOfCompanyJobs} = require('../services/jobrequisition.service');
const {addJobViewByUserId, findJobViewByUserId, findJobViewByUserIdAndJobId, findMostViewed} = require('../services/jobview.service');
const {findSearchHistoryByKeyword, saveSearch} = require('../services/searchhistory.service');
const {getTopCategory} = require('../services/category.service');
const {getTopIndustry} = require('../services/industry.service');

const filterService = require('../services/filter.service');

const JobRequisition = require('../models/jobrequisition.model');
const Skilltype = require('../models/skilltype.model');
const JobFunction = require('../models/jobfunctions.model');
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
let SearchParam = require('../const/searchParam');

const applicationSchema = Joi.object({
  jobId: Joi.number().required(),
  user: Joi.number().required(),
  phoneNumber: Joi.string(),
  email: Joi.string().required(),
  availableDate: Joi.number(),
  attachment: Joi.string().allow('').optional(),
  follow: Joi.boolean().optional(),
  resumeId: Joi.any().optional(),
  questionAnswers: Joi.array(),
  coverLetter: Joi.string().allow('').optional()
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
  getJobLanding,
  getTopFiveJobs,
  searchJob,
  searchSuggestions,
  getSimilarJobs,
  getLatestJobs,
  getSimilarCompany,
  applyJobById,
  addBookmark,
  removeBookmark,
  searchCandidates,
  submitJobQuestionaires,
  getJobQuestionaires
}


async function importJobs(type, jobs) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  // if(job) {
  //   job.skills = await Skilltype.find({id: {$in: job.skills}});
  // }
  return await new JobRequisition(job).save();
}


async function getJobById(currentUserId, jobId, isMinimal, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    // job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } }).populate('promotion')
    job = await findJobId(jobId, locale);

    if(job) {

      let company = await findCompanyById(job.company, currentUserId);
      job.company = convertToCompany(company);

      if(!isMinimal) {

        let hiringManager = await findByUserId(job.createdBy);
        job.createdBy = convertToAvatar(hiringManager);

        let jobSkills = await findSkillsById(job.skills);
        // console.log('jobSkils', jobSkills)


        let noApplied = await findAppliedCountByJobId(job.jobId);
        job.noApplied = noApplied;

        let employmentType = await getEmploymentTypes(_.map(job, 'employmentType'), locale);
        job.employmentType = employmentType[0];

        let experienceLevel = await getExperienceLevels(_.map(job, 'level'), locale);
        job.level = experienceLevel[0];



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
        if (currentUserId) {

          let currentParty = await findByUserId(currentUserId);

          if (isPartyActive(currentParty)) {
            let jobView = await findJobViewByUserIdAndJobId(currentParty.id, jobId);
            if (!jobView) {
              await addJobViewByUserId(currentParty.id, jobId);
            } else {
              jobView.viewCount++
              await jobView.save();
            }

            let hasSaved = await findBookById(currentParty.id, job.jobId);
            job.hasSaved = (hasSaved) ? true : false;

            let hasApplied = await findApplicationByUserIdAndJobId(currentParty.id, job.jobId);
            job.hasApplied = (hasApplied) ? true : false;

            partySkills = await findUserSkillsById(currentParty.id);
            partySkills = _.map(partySkills, "id");
          }


        }
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
        job.shareUrl = 'https://www.anymay.com/jobs/' + job.jobId;

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
      job.category = jobForm.category;
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



async function getJobLanding(currentUserId, locale) {

  let result = {categories: [], popularJobs: [], popularCompanies: [], viewedJobs: [], savedJobs: [], newJobs: [], highlightJobs: []};
  try {
    let industries = await getTopIndustry();

    let viewed = await findJobViewByUserId(currentUserId, 4)
    let saved = await findBookByUserId(currentUserId, 4);
    let highlight = await JobRequisition.find({}).sort({createdDate: -1}).limit(10);
    let newJobs = await getNewJobs();
    let popularJobs = await findMostViewed();

    if(!popularJobs.length){
      popularJobs = await findMostBookmarked();
    }

    let ids = _.map(viewed, 'jobId').concat(_.map(saved, 'jobId')).concat(_.map(popularJobs, 'jobId')).concat(_.map(highlight, 'jobId')).concat(_.map(newJobs, 'jobId'));
    let jobs = await JobRequisition.find({jobId: {$in: ids}});
    let listOfCompanyIds = _.map(jobs, 'company');

    let res = await searchCompany('', listOfCompanyIds, currentUserId);
    let foundCompanies = res.content;

    // let popular = await searchCompany('', listOfCompanyIds, currentUserId);
    let popularCompanies = foundCompanies;


    _.forEach(jobs, function(job){
      job.company = _.find(foundCompanies, {id: job.company});
      job.description = null;
      job.industry = [];
      job.responsibilities = [];
      job.qualifications = [];
      job.skills = [];
    });

    _.forEach(viewed, function(item){
      let job = _.find(jobs, {jobId: item.jobId});

      if(job) {
        // job.company = _.find(foundCompanies, {id: job.company});
        job.description = null;
        job.industry = [];
        job.responsibilities = [];
        job.qualifications = [];
        job.skills = [];
        result.viewedJobs.push(job);

      }
    })


    _.forEach(saved, function(item){
      let job = _.find(jobs, {jobId: item.jobId});

      if(job) {
        // job.company = convertToCompany(_.find(foundCompanies, {id: job.company}));

        job.hasSaved=true;
        result.savedJobs.push(job);
      }
    })

    _.forEach(popularJobs, function(item){
      let job = _.find(jobs, {jobId: item.jobId});

      if(job) {
        result.popularJobs.push(job);

      }
    })

    _.forEach(highlight, function(item){
      let job = _.find(jobs, {jobId: item.jobId});

      if(job) {
        result.highlightJobs.push(job);

      }
    })

    _.forEach(newJobs, function(item){
      let job = _.find(jobs, {jobId: item.jobId});

      if(job) {
        result.newJobs.push(job);

      }
    })



    let industryFull = await findIndustry('', _.reduceRight(industries, function(res, item){res.push(item.shortCode); return res}, []), locale);
    industryFull = _.reduceRight(industryFull, function(res, item){
      let found = _.find(industries, { 'shortCode': item.shortCode });
      if(found){
        item.noOfItems = found.count;
        res.push(convertIndustry(item));
      }

      return res;
    }, [])

    result.categories = industryFull;
    result.popularCompanies = popularCompanies;

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function getTopFiveJobs(companies, locale) {

  let result = [];
  try {
    result = await getGroupOfCompanyJobs(companies);

  } catch (error) {
    console.log(error);
  }

  return result;

}



async function searchJob(currentUserId, jobId, filter, pagination, locale) {

  if(!filter || !pagination){
    return null;
  }

  let foundJob = null;
  let select = '-description -qualifications -responsibilities';
  let limit = (pagination.size && pagination.size>0) ? pagination.size:20;
  let page = (pagination.page && pagination.page==0) ? pagination.page:1;
  let sortBy = {};
  pagination.sortBy = (pagination.sortyBy) ? pagination.sortyBy : 'createdDate';
  pagination.direction = (pagination.direction && pagination.direction=="ASC") ? "ASC" : 'DESC';
  sortBy[pagination.sortBy] = (pagination.direction == "DESC") ? -1 : 1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(pagination.page)+1
  };



  let history = await  saveSearch(currentUserId, filter.query);

  if(jobId){
    foundJob = await JobRequisition.findOne({jobId:jobId});
    //
    // if(!foundJob){
    //   return new Pagination(null);
    // }


    if(foundJob) {
      filter.similarId = jobId;
      //filter.query = foundJob.title;
      // filter.level = [foundJob.level];
      filter.jobFunction = [foundJob.jobFunction];
      filter.industry = [foundJob.industry];
      filter.employmentType = [];
      // filter.city = [foundJob.city];
      // filter.state = [foundJob.state];
      // filter.country = [foundJob.country];

    }
  }

  let result = await JobRequisition.paginate(new SearchParam(filter), options);
  let docs = [];

  // let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
  // let listOfSkills = await findSkillsById(skills, locale);
  let employmentTypes = await getEmploymentTypes(_.uniq(_.map(result.docs, 'employmentType')), locale);
  let experienceLevels = await getExperienceLevels(_.uniq(_.map(result.docs, 'level')), locale);
  let industries = await findIndustry('', _.uniq(_.flatten(_.map(result.docs, 'industry'))), locale);
  let promotions = await getPromotions(_.uniq(_.flatten(_.map(result.docs, 'promotion'))), locale);

  let listOfCompanyIds = _.uniq(_.flatten(_.map(result.docs, 'company')));

  let res = await searchCompany('', listOfCompanyIds, currentUserId);
  let foundCompanies = res.content;

  let hasSaves = [];

  if(currentUserId){
    hasSaves=await findBookByUserId(currentUserId);
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

    // var skills = _.reduce(job.skills, function(res, skill){
    //   let find = _.filter(listOfSkills, { 'id': skill});
    //   if(find){
    //     res.push(find[0]);
    //   }
    //   return res;
    // }, [])
    //
    // job.skills = skills;
  })

  return new Pagination(result);

}



async function searchSuggestions(keyword, locale) {

  if(keyword==null){
    return null;
  }


  let results = await JobRequisition.aggregate([
      {$match: {title: { $regex: keyword, $options: 'i'} } },
      { $project: {_id: 0, title: 1} }
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

    //filter.query = foundJob.title;
    filter.level = foundJob.level;
    filter.jobFunction=foundJob.jobFunction;
    filter.employmentType=foundJob.employmentType;
    filter.employmentType=null;


    result = await JobRequisition.paginate({ $text: { $search: foundJob.title, $diacriticSensitive: true, $caseSensitive: false } } , options);
    let docs = [];

    let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
    let listOfSkills = await findSkillsById(skills);

    let listOfCompanyIds = _.uniq(_.flatten(_.map(result.docs, 'company')));

    let res = await searchParties(listOfCompanyIds, partyEnum.COMPANY);
    let foundCompanies = res.data.data.content;


    let hasSaves = await findBookByUserId(currentUserId);


    _.forEach(result.docs, function(job){
      job.shareUrl = 'https://www.anymay.com/jobs/'+job.jobId;
      job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
      job.company = _.find(foundCompanies, {id: job.company});
      var skills = _.reduce(job.skills, function(res, skill){
        let find = _.filter(listOfSkills, { 'id': skill});
        if(find){
          res.push(find[0]);
        }

        return res;
      }, [])

      job.skills = skills;
    })




  }
  return new Pagination(result, locale);

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

  application = await Joi.validate(application, applicationSchema, { abortEarly: false });




  let savedApplication;
  try {
    let job = await JobRequisition.findOne({jobId: jobId, status: statusEnum.ACTIVE });

    if(job) {
      let currentParty = await findByUserId(currentUserId);
      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        let candidate = null;


        let foundApplication = await findApplicationByUserIdAndJobId(currentParty.id, application.jobId);
        if(!foundApplication){
          application.job = job._id;

          if(application.resumeId){
            let resume = await feedService.getResumeById(currentUserId, application.resumeId);
            if(resume){
              application.resume = {filename: resume.name, fileType: resume.fileType}
            }
          }


          if(application.source){
            application.sources.push(source);
          }

          savedApplication = await applyJob(application);

          if(savedApplication){
            let jobPipeline = await getPipelineByJobId(job.jobId);
            let applyStage = _.find(jobPipeline.stages, {type: 'APPLIED'} );

            await addApplicationHistory({applicationId: savedApplication.applicationId, partyId: currentParty.id, action: {type: applicationEnum.APPLIED} });


            let progress = await  addApplicationProgress({applicationId: savedApplication.applicationId, stage: applyStage._id});
            // progress.stage = applyStage._id;
            savedApplication.progress.push(progress._id)
            savedApplication.currentProgress = progress._id;
            await savedApplication.save();

            //Create Notification
            let meta = {companyId: job.company, jobId: application.jobId, jobTitle: job.title, applicationId: savedApplication.applicationId, applicantId: currentUserId, createdBy: job.createdBy};
            await feedService.createNotification(currentUserId, notificationType.APPLICATION, applicationEnum.APPLIED, meta);

            //TODO: Call Follow API
            if(application.follow){
              await followCompany(job.company, currentUserId);
            }

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

async function addBookmark(currentUserId, jobId) {

  if(currentUserId==null || jobId==null){
    return null;
  }


  let result;
  try {
    job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {
      let currentParty = await findByUserId(currentUserId);
      // console.log('currentParty', currentParty)
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

    let currentParty = await findByUserId(currentUserId);

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
  let listOfSkills = await Skilltype.find({ skillTypeId: { $in: skills } });
  let employmentTypes = await getEmploymentTypes(_.uniq(_.map(result.docs, 'employmentType')), locale);
  let experienceLevels = await getExperienceLevels(_.uniq(_.map(result.docs, 'level')), locale);
  let industries = await findIndustry('', _.uniq(_.flatten(_.map(result.docs, 'industry'))), locale);
  let promotions = await getPromotions(_.uniq(_.flatten(_.map(result.docs, 'promotion'))), locale);

  let listOfCompanyIds = _.uniq(_.flatten(_.map(result.docs, 'company')));

  let res = await searchCompany('', listOfCompanyIds, currentUserId);
  let foundCompanies = res.content;

  let hasSaves = [];

  if(currentUserId){
    hasSaves=await findBookByUserId(currentUserId);
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
