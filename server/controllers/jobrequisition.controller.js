const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');

const {convertToAvatar, convertToCompany, convertIndustry, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const axiosInstance = require('../services/api.service');
const {lookupUserIds, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findCompanyById, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');

const statusEnum = require('../const/statusEnum');
const partyEnum = require('../const/partyEnum');
const applicationEnum = require('../const/applicationEnum');
const notificationType = require('../const/notificationType');


const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');

const {getListofSkillTypes} = require('../services/skilltype.service');
const {findApplicationByUserIdAndJobId, findApplicationById, applyJob, findAppliedCountByJobId} = require('../services/application.service');
const {findApplicationByCurrentStatus, findApplicationProgresssById, addApplicationProgress} = require('../services/applicationprogress.service');
const {findApplicationHistoryById, addApplicationHistory} = require('../services/applicationhistory.service');
const {findBookById, addBookById, removeBookById, findBookByUserId, findMostBookmarked} = require('../services/bookmark.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getIndustry} = require('../services/industry.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');

const {findJobId, getCountsGroupByCompany, getNewJobs} = require('../services/jobrequisition.service');
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



let Pagination = require('../utils/job.pagination');
let SearchParam = require('../const/searchParam');

const jobRequisitionSchema = Joi.object({
  createdBy: Joi.number(),
  title: Joi.string().required(),
  requiredResume: Joi.boolean().optional(),
  description: Joi.string().required(),
  durationMonths: Joi.number().optional(),
  minMonthExperience: Joi.number().optional(),
  maxMonthExperience: Joi.number().optional(),
  currency: Joi.string(),
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




module.exports = {
  importJobs,
  createJob,
  getJobLanding,
  getJobById,
  searchJob,
  getSimilarJobs,
  getLatestJobs,
  getSimilarCompany,
  applyJobById,
  addBookmark,
  removeBookmark,
  searchCandidates
}

async function createJob(currentUserId, job) {

  let sharePost = job.sharePost;
  delete job.sharePost;
  let shareText = job.shareText?job.shareText:job.description;
  delete job.shareText;

  job.createdBy = currentUserId;

  if(!job || !currentUserId){
    return null;
  }

  let result;

  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });

  let currentParty = await findByUserId(currentUserId);

  if (isPartyActive(currentParty)) {

    //job.skills = await Skilltype.find({id: {$in: job.skills}});
    let promotion;
    if (job.promotion) {
      promotion = await findPromotionById(job.promotion);
      job.promotion = (promotion) ? promotion[0].promotionId : null;

    }

    job.isExternal = job.externalUrl?true:false;
    result = await new JobRequisition(job).save();


    if(result && sharePost){
      await createJobFeed(result.jobId, result.company, shareText, currentUserId);
    }
  }

  return result;
}

async function importJobs(type, jobs) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  // if(job) {
  //   job.skills = await Skilltype.find({id: {$in: job.skills}});
  // }
  return await new JobRequisition(job).save();
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


async function getJobById(currentUserId, jobId, locale) {

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
      job.company = company;

      let jobSkills = await findSkillsById(job.skills);
      // console.log('jobSkils', jobSkills)


      let noApplied = await findAppliedCountByJobId(job.jobId);
      job.noApplied = noApplied;

      let employmentType = await getEmploymentTypes(_.map(job, 'employmentType'), locale);
      job.employmentType = employmentType[0];

      let experienceLevel = await getExperienceLevels(_.map(job, 'level'), locale);
      job.level = experienceLevel[0];

      //let jobFunction = await JobFunction.findOne({shortCode: job.jobFunction});
      // let jobFunction = await JobFunction.aggregate([{$match: {shortCode: job.jobFunction} }, {$project: {name: '$name.'+localeStr, shortCode:1}}]);

      let industry = await findIndustry('', job.industry, locale);
      job.industry = industry;

      let jobFunction = await findJobfunction('', job.jobFunction, locale);
      job.jobFunction = jobFunction;

      // let promotion = await findPromotionByObjectId(job.promotion);
      // job.promotion = promotion;

      if(job.promotion){
        let promotion = await findPromotionById(job.promotion);
        job.promotion = promotion[0];
      }



      let users  = await lookupUserIds([job.createdBy]);
      job.createdBy = _.find(users, {id: job.createdBy});

      // let promotion = await JobRequisition.populate(job, 'promotion')

      let currentParty, partySkills=[];
      if(currentUserId){

        let currentParty = await findByUserId(currentUserId);

        if (isPartyActive(currentParty)) {
          let jobView = await findJobViewByUserIdAndJobId(currentParty.id, jobId);
          if(!jobView){
            await addJobViewByUserId(currentParty.id, jobId);
          } else {
            jobView.viewCount++
            await jobView.save();
          }

          let hasSaved = await findBookById(currentParty.id, job.jobId);
          job.hasSaved = (hasSaved)?true:false;

          let hasApplied = await findApplicationByUserIdAndJobId(currentParty.id, job.jobId);
          job.hasApplied = (hasApplied)?true:false;

          partySkills = await findUserSkillsById(currentParty.id);
          partySkills = _.map(partySkills, "id");
        }


      }
      let skills = _.reduce(jobSkills, function(res, skill, key){
        let temp = _.clone(skill);

        if(_.includes(partySkills, skill.id)){
          temp.hasSkill=true;
        } else {
          temp.hasSkill=false;
        }

        res.push(temp);
        return res;
      }, []);

      job.skills = skills;
      job.jobFunction=jobFunction[0];
      job.shareUrl = 'https://www.anymay.com/jobs/'+job.jobId;


    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


async function searchJob(currentUserId, jobId, filter, locale) {

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



  let history = await  saveSearch(currentUserId, filter.query);

  if(jobId){
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
    job.shareUrl = 'https://www.anymay.com/jobs/'+job.jobId;
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
        res.push(item._id.company);
        return res;
      }, []);

      let companies = await searchParties(group, partyEnum.COMPANY, 20, filter.page);
      result = (companies.data)? companies.data.data : null;

      _.forEach(result.content, function(res){
        res.hasFollowed = false;
      })

    }
  } catch (error) {
    console.log(error);
  }

  return result;

}

async function applyJobById(currentUserId, application ) {


  application = await Joi.validate(application, applicationSchema, { abortEarly: false });


  if(currentUserId==null || application==null){
    return null;
  }

  let result;
  try {
    let job = await JobRequisition.findOne({jobId: application.jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {
      let currentParty = await findByUserId(currentUserId);

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        let foundApplication = await findApplicationByUserIdAndJobId(currentParty.id, application.jobId);
        if(!foundApplication){
          application.job = job._id;
          // application.candidateAttachment = {type: 'PDF', url: application.jobId.toString().concat("_").concat(application.partyId).concat(".pdf") };
          let savedApplication = await applyJob(application);

          if(savedApplication){
            await addApplicationHistory({applicationId: savedApplication.applicationId, partyId: currentParty.id, action: {type: applicationEnum.APPLIED} });
            let progress = await  addApplicationProgress({applicationId: savedApplication.applicationId, status: applicationEnum.APPLIED, type: 'APPLY'});
            savedApplication.progress.push(progress._id)
            await savedApplication.save();

            //TODO: Call Follow API
            if(application.follow){
              await followCompany(job.company, currentUserId);
            }

          }
          let meta = {jobId: application.jobId, applicationId: savedApplication.applicationId, userId: currentUserId};
          await feedService.createNotification(savedAppointment.customer.id, notificationType.APPLICATION, savedAppointment.status, meta);
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
