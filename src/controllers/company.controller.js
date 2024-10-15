const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const httpStatus = require('http-status');
const geoip = require('geoip-lite');
const {ObjectId} = require('mongodb')
const { success, error, validation } = require("../const/responseApi");

let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/pagination');
let SearchParam = require('../const/searchParam');
const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
let employmentTypeEnum = require('../const/employmentTypeEnum');

const {convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');

const {getUserExperienceById, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findUserByIdFull, findCompanyById, searchUsers, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');
const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populatePerson} = require('../services/party.service');
const {findListOfPartyEmploymentTitle} = require('../services/partyemployment.service');
const {findCompanyReviewReactionByPartyId, addCompanyReviewReaction} = require('../services/companyreviewreaction.service');
const {findCurrencyRate} = require('../services/currency.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getGroupOfCompanyJobs} = require('../services/jobrequisition.service');
const {getDepartments, addDepartment} = require('../services/companydepartment.service');
const {getPipelines, addPipeline} = require('../services/jobpipeline.service');
const companyService = require('../services/company.service');
const companyReviewService = require('../services/companyreview.service');
const memberService = require('../services/member.service');
const roleService = require('../services/role.service');
const labelService = require('../services/label.service');
const salaryReactionService = require('../services/salaryreaction.service');
const interestService = require('../services/interest.service');
const benefitService = require('../services/benefit.service');
const userQuestionService = require('../services/userquestion.service');
const companyDepartmentService = require('../services/companydepartment.service');
const jobService = require('../services/jobrequisition.service');
const salaryService = require('../services/salary.service');
const userService = require('../services/user.service');
const companyReviewReportService = require('../services/companyreviewreport.service');
const {addCompanySalary, findCompanySalaryByEmploymentTitle, findEmploymentTitlesCountByCompanyId, findSalariesByCompanyId, addCompanyReview,
  findCompanyReviewHistoryByCompanyId, addCompanyReviewReport, findAllCompanySalaryLocations, findAllCompanyReviewLocations, findAllCompanySalaryEmploymentTitles, findAllCompanySalaryJobFunctions, findTop3Highlights} = require('../services/company.service');
const {findBookById, addBookById, removeBookById, findBookByUserId, findMostBookmarked} = require('../services/bookmark.service');




const User = require('../models/user.model');
const Company = require('../models/company.model');
const JobRequisition = require('../models/jobrequisition.model');
const CompanyReview = require('../models/companyreview.model');
// const CompanyReviewReport = require('../models/companyreviewreport.model');
const CompanyReviewReaction = require('../models/companyreviewreaction.model');
const CompanyDepartment = require('../models/companydepartment.model');
const JobPipeline = require('../models/jobpipeline.model');
const Role = require('../models/role.model');
const Label = require('../models/label.model');
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const Application = require("../models/application.model");


const salarySchema = Joi.object({
  partyId: Joi.number().required(),
  company: Joi.number().required(),
  employmentTitle: Joi.string().required(),
  employmentType: Joi.string().required(),
  jobFunction: Joi.string().required(),
  yearsExperience: Joi.number().optional(),
  currency: Joi.string().required(),
  basePayPeriod: Joi.string().required(),
  baseSalary: Joi.number().required(),
  additionalIncome: Joi.number(),
  cashBonus: Joi.number(),
  stockBonus: Joi.number(),
  profitSharing: Joi.number(),
  tip: Joi.number(),
  commision: Joi.number(),
  gender: Joi.string(),
  city: Joi.string().allow(''),
  state: Joi.string().allow(''),
  country: Joi.string()
})


const companyReviewReportSchema = Joi.object({
  companyReviewId: Joi.number().required(),
  partyId: Joi.number().required(),
  isAnonymous: Joi.boolean(),
  reason: Joi.string().required(),
  note: Joi.string().allow('')
});

const companyReviewReactionSchema = Joi.object({
  company: Joi.number().required(),
  companyReviewId: Joi.number().required(),
  partyId: Joi.number().required(),
  reactionType: Joi.string().required()
});



const pipelineSchema = Joi.object({
  name: Joi.string().required(),
  department: Joi.number().required(),
  category: Joi.string().required(),
  company: Joi.number().required(),
  stages: Joi.array().required(),
  createdBy: Joi.number()
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




async function sync(form) {
  if(!form){
    return null;
  }

  try {
    let company = await companyService.findByCompanyId(form.id);
    if(company){
      company.avatar = form.avatar;
      company.name = form.name;
      company.primaryAddress = company.primaryAddress;
      await company.save();
    }
  } catch(e){
    console.log('sync: Error', e);
  }

}

const register = catchAsync(async (req, res) => {
  const {user, params, body} = req;

  let currentUserId = parseInt(req.header('UserId'));
  let currentParty = await findUserByIdFull(currentUserId);
  if(!currentParty.timezone){
    let ip = req.header('X-Forwarded-For') || req.connection.remoteAddress || req.ip;
    const geo = geoip.lookup(ip); // Lookup geolocation info
    if(geo && geo.timezone){
      currentParty.timezone = geo.timezone;
    }
  }

  let company;
  try {
    if (isPartyActive(currentParty)) {
      company = await companyService.register(currentParty, body, null);
    }
  } catch(e){
    console.log('register: Error', e);
  }


  res.json(company);
});

const leaveCompany = catchAsync(async (req, res) => {
  const {user, params} = req;

  try {
    if(!user || !user.company){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Bad Request');
    }

    user.company.members = _.reject(user.company.members, function(o) { return o.equals(user._id) });
    await user.company.save();
    user.company = null;
    user.role = null;
    await user.save();
  } catch(e){
    console.log('sync: Error', e);
  }

  res.json({ success: true });
});

async function getCompany(req, res) {
  const companyId = req.params.id;

  if(!companyId){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bad Request');
  }

  let company = await companyService.findById(companyId);
  console.log('company', company)
  if(!company){
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }

  res.send(success("OK", company, res.statusCode));
}



async function deactivateCompanyJobs(companyId) {

  if(!companyId){
    return null;
  }

  let result = await jobService.deactivateJobs({companyId: companyId});

  return result;

}

const getCompanyLatestJobs = catchAsync(async (req, res) => {
  const { body, params, locale } = req;
  const {id} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = [];
  const company = await companyService.findByCompanyId(id);
  if(company){
    result = await jobService.getNewJobs({ company: company._id, status: [statusEnum.ACTIVE]});
  }


  res.json(result);
});
const getCompanyJobs = catchAsync(async (req, res) => {
  const { body, params, query, locale } = req;
  const {id} = params;
  let currentUserId = parseInt(req.header('UserId'));

  body.company = [id];
  body.status = [statusEnum.ACTIVE];

  let result = await jobService.getCompanyJobs(currentUserId, null, body, query, locale);

  console.log(result)
  let hasSaves = [];

  if (currentUserId) {
    hasSaves = await findBookByUserId(currentUserId);
  }

  _.forEach(result.docs, function (job) {
    job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
  })

  res.json(new Pagination(result));
});

const addNewSalary = catchAsync(async (req, res) => {
  const { body, params, query, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));
  let result = null;

  try {
    result = await salaryService.add(body);

  } catch(e){
    console.log('addNewSalary: Error', e);
  }


  res.json(result);
});

const getCompanySalaries = catchAsync(async (req, res) => {
  const { body, params, query, locale } = req;
  const {id} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let currentParty = null;
  let result = null, filter={employmentTitle: query.employmentTitle, jobFunction: query.jobFunction, country: query.country, state: query.state, city: query.city, yearsExperience: query.yearsExperience};
  try {

      let preferredCurrency = 'USD';
      let total = await findEmploymentTitlesCountByCompanyId(query);
      result = await salaryService.searchByCompany(id, query, filter);

      let listOfCurrencies = _.reduce(result, function(res, item){

        if(currentParty){
          preferredCurrency = currentParty.preferredCurrency;
        }
        res.push({src: item.currency, target: preferredCurrency});
        return res;
      }, []);


      // let currencies = await findCurrencyRate(currentParty.preferredCurrency);
      let loadCurrencies = listOfCurrencies.map(currency => findCurrencyRate(currency.src, currency.target));
      let currencies = await Promise.all(loadCurrencies);

      result = _.reduce(result, function (res, item) {
        let currency = _.find(currencies, {currency: item.currency+preferredCurrency});
        let avgBaseSalary = 0;

        /* temporary commenting out
        switch (item.basePayPeriod){
          case 'ANNUALLY':
            avgBaseSalary = item.avgBaseSalary * currency.rate;
            break;
          case 'MONTHLY':
            avgBaseSalary = item.avgBaseSalary * currency.rate;
            break;
          case 'WEEKLY':
            avgBaseSalary = item.avgBaseSalary * currency.rate;
            break;
        }
        */

        item.hasLiked = false;

        if(currency){
          item.avgBaseSalary =  Math.floor(item.avgBaseSalary * currency.rate, 0);
        }

        item.displayCurrency = preferredCurrency;

        res.push(item);
        return res;
      }, [])


  } catch (e) {
    console.log('getCompanySalaries: Error', e);
  }

  res.json(new Pagination(result));
});


const getCompanyLatestSalaries = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = [];
  try {
    result = await companyService.getCompanyLatestSalaries(id);

    let listOfCurrencies = _.reduce(result, function(res, item){
      let preferredCurrency = currentParty && currentParty.preferredCurrency?currentParty.preferredCurrency:'USD';
      res.push({src: item.currency, target: preferredCurrency});
      return res;
    }, []);

    // let currencies = await findCurrencyRate(currentParty.preferredCurrency);
    let loadCurrencies = listOfCurrencies.map(currency => findCurrencyRate(currency.src, currency.target));
    let currencies = await Promise.all(loadCurrencies);

    result = _.reduce(result, function (res, item) {
      let currency = _.find(currencies, {currency: item.currency+currentParty.preferredCurrency});
      let avgBaseSalary = 0;

      /* temporary commenting out
      switch (item.basePayPeriod){
        case 'ANNUALLY':
          avgBaseSalary = item.avgBaseSalary * currency.rate;
          break;
        case 'MONTHLY':
          avgBaseSalary = item.avgBaseSalary * currency.rate;
          break;
        case 'WEEKLY':
          avgBaseSalary = item.avgBaseSalary * currency.rate;
          break;
      }
      */

      item.hasLiked = false;
      item.avgBaseSalary =  Math.floor(item.avgBaseSalary * currency.rate, 0);
      item.displayCurrency = currentParty.preferredCurrency;

      res.push(item);
      return res;
    }, [])

  } catch (e) {
    console.log('getCompanySalaries: Error', e);
  }

  res.json(result);
});


const getCompanyJobsJobFunctions = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;

  let result = null;
  try {

    result = await jobService.getCompanyJobsJobFunctions(companyId, locale);


  } catch (e) {
    console.log('getCompanySalaries: Error', e);
  }

  res.json(result);
});

const getCompanySalariesGroupByJobFunctions = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;
  let result = null;
  try {
    result = await companyService.groupSalaryByJobFunctions(id, locale);
  } catch (e) {
    console.log('getCompanySalariesGroupByJobFunctions: Error', e);
  }

  res.json(result);
});


async function getCompanySalariesGroupByLocations(companyId, locale) {
  if(!companyId){
    return null;
  }

  let result = null;
  try {

    result = await companyService.groupSalaryByLocations(companyId, locale);

  } catch (e) {
    console.log('getCompanySalariesGroupByLocations: Error', e);
  }

  return result;
}


const getCompanySalaryByEmploymentTitle = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id} = params;
  const {employmentTitle, city, state, country} = query;
  const currentUserId = parseInt(req.header('UserId'));

  let result = null;
  try {

    result = await companyService.findCompanySalaryByEmploymentTitle(id, employmentTitle, country);
    result.shareUrl = 'https://www.accessed.co/company/' + companyId + '/salary/' + employmentTitle.replace(' ', '-');

  } catch (e) {
    console.log('Error: getCompanySalaryByEmploymentTitle', e)
  }
  res.json(result);
});
const getCompanySalaryLocations = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id} = params;
  let result = null;
  try {
    result = await companyService.findAllCompanySalaryLocations(id);
  } catch (e) {
    console.log('Error: getCompanySalaryLocations', e)
  }
  res.json(result);
});


async function getCompanySalaryTop5Locations(companyId) {

  if(companyId==null){
    return null;
  }

  let result = null;
  try {
    console.log('getCompanySalaryTop5Locations')
    result = await companyService.findAllCompanySalaryTop5Locations(companyId);


  } catch (e) {
    console.log('Error: getCompanySalaryLocations', e)
  }
  return result;
}

const getCompanySalaryEmploymentTitles = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id} = params;
  let result = null;
  try {

    result = await companyService.findAllCompanySalaryEmploymentTitles(id);
    result = _.reduce(result, function(res, item){
      res.push(item.employmentTitle);
      return res;
    }, []);

  } catch (e) {
    console.log('Error: getCompanySalaryEmploymentTitles', e)
  }
  res.json(result);
});

const getCompanySalariesJobFunctions = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id, salaryId} = params;
  let result = null;

  try {

    result = await companyService.findAllCompanySalaryJobFunctions(id, locale);
    // result = _.reduce(result, function(res, item){
    //   if(item.jobFunction){
    //     res.push(item.jobFunction);
    //   }
    //
    //   return res;
    // }, []);

  } catch (e) {
    console.log('Error: getCompanySalariesJobFunctions', e)
  }
  res.json(result);
});


const getCompanySalaryGroupByGender = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id, salaryId} = params;
  let result = null;
  try {

    result = await companyService.groupSalaryByGender(salaryId);

  } catch (e) {
    console.log('Error: getCompanySalaryGender', e)
  }
  res.json(result);
});


const addSalaryReaction = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {id, salaryId} = params;
  let currentUserId = parseInt(req.header('UserId'));
  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      reaction.salaryHistoryId = salaryHistoryId;
      reaction.userId = currentUserId;
      result = await salaryReactionService.addReaction(reaction);
    }



  } catch (e) {
    console.log('Error: addSalaryReaction', e)
  }
  res.json(result);
});



async function getCompanySalaryById(filter, locale) {
  let result = null;
  let count = await findEmploymentTitlesCountByCompanyId(filter.company);
  result = await findSalariesByCompanyId(filter);


  result = _.reduce(result, function(res, item){
    item.hasLiked = false;
    res.push(item);
    return res;
  }, [])

  return new Pagination(result, filter, locale);
}


const addReview = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result = null;
  let user = await userService.findByUserId(currentUserId);
  if(!user) {
    const oUser = await feedService.findByUserId(currentUserId);
    if(oUser){
      user = await userService.add(oUser);
    }
  }
  console.log(user)
  body.user = user._id;
  body.company = parseInt(id);
  result = await companyReviewService.add(body);

  res.json(result);
});

// async function getCompanyReviews(filter, locale) {
//   let result = null;
//   result = await findCompanyReviewsByCompanyId(filter);
//
//   result = _.reduce(result, function(res, item){
//     item.hasLiked = false;
//     res.push(item);
//     return res;
//   }, [])
//
//   return new Pagination(result, filter, locale);
// }



const getCompanyTopReviews = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result = null;
  try {

    result = await companyService.getCompanyTopReviews();
    if(result && result.length){
      const ids = _.map(result, 'id');

      const companies = await feedService.lookupCompaniesIds(ids);
      console.log(companies)
      if(companies && companies.length){
        result = _.reduce(result, function(res, ele){
          let company = _.find(companies, c => {
            return c.id==ele.id;
          })

          if(company){
            ele = {...company, ...ele};
          }
          res.push(ele);
          return res;
        }, []);

      }
    }

  } catch (e) {
    console.log('Error: getCompanyTopReviews', e)
  }
  res.json(result);
});

const getCompanyReviewStats = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result = await findCompanyReviewHistoryByCompanyId(id);

  if(result) {
    let highlights = await findTop3Highlights(id);
    result.mostPopularReviews = highlights;
  }
  res.json(result);
});


const getCompanyReviews = catchAsync(async (req, res) => {
  const { params, query, body, locale } = req;
  const {id} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let select = '-description -qualifications -responsibilities';
  let limit = (query.size && query.size>0) ? query.size:20;
  let page = (query.page && query.page==0) ? query.page:1;
  let sortBy = {};

  switch(query.sortBy){
    case('createdDate'):
      query.sortBy='createdDate';
      break;
    case('popular'):
      query.sortBy='popular';
      break;
    case('rating'):
      query.sortBy='rating';
      break;
    default:
      query.sortBy='createdDate';

  }

  // filter.sortBy = (filter.sortBy!=null) ? filter.sortBy : 'createdDate';
  query.direction = (query.direction && query.direction=="ASC") ? "ASC" : 'DESC';
  sortBy[query.sortBy] = (query.direction == "DESC") ? -1 : 1;

  let options = {
    select:   select,
    populate: 'user',
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(query.page)+1
  };

  if(!body.employmentType){
    let employmentTypes = [];
    for(employmentType in employmentTypeEnum){
      employmentTypes.push(employmentType);

    }
    employmentTypes = employmentTypes.join(',');
    body.employmentType = employmentTypes;
  }

  let result = await CompanyReview.paginate(new SearchParam(body), options);
  if(result) {
    let partyIds = _.uniq(_.map(result.docs, 'user'));
    let reactions = await findCompanyReviewReactionByPartyId(currentUserId);

    // let results = await searchUsers(currentUserId, '', partyIds);
    // let foundUsers = results.content;

    let employments = await findListOfPartyEmploymentTitle(partyIds);

    result.docs = _.reduce(result.docs, function(res, item) {
      // let find = _.find(employments, {id: item.party.id});
      let hasLiked = _.find(reactions, {
        user: currentUserId,
        companyReviewId: item.companyReviewId,
        reactionType: 'LIKE'
      }) ? true : false;
      let hasLoved = _.find(reactions, {
        user: currentUserId,
        companyReviewId: item.companyReviewId,
        reactionType: 'LOVE'
      }) ? true : false;


      let user = new User(item.user);
      user = user.systemUser();
      console.log(user)
      item.user = user;
      item.noOfLikes = (item.likes) ? item.likes.length : 0;
      item.noOfLoves = (item.loves) ? item.loves.length : 0;
      item.hasLiked = hasLiked;
      item.hasLoved = hasLoved;
      item.likes = [];
      item.loves = [];
      res.push(item);
      return res;
    }, []);
  }

  res.json(new Pagination(result));
});

async function getCompanyReviewLocations(currentUserId, companyId) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let result = null;
  try {

    result = await findAllCompanyReviewLocations(companyId);


  } catch (e) {
    console.log('Error: getCompanyReviewLocations', e)
  }
  return result;
}

const reportCompanyReviewById = catchAsync(async (req, res) => {
  const { body, params } = req;
  const {id, companyReviewId} = params;
  const {reason, note} = body;
  const currentUserId = parseInt(req.header('UserId'));

  if(!currentUserId || !id || !companyReviewId || !reason || !note){
    return res.status(400).send({success: false, error: 'user id, review id, reason or note missing'});
  }

  let companyReview = await companyReviewService.findById(new ObjectId(companyReviewId));
  if(!companyReview){
    return res.status(400).send({success: false, error: 'company review not found'});
  }

  let currentParty = await feedService.findByUserId(currentUserId);

  if(!isPartyActive(currentParty, currentUserId)) {
    console.debug('User Not Active: ', currentUserId);
    return res.status(400).send({success: false, error: 'User not active'})
  }

  let report = await companyReviewReportService.findReportByReviewAndUserId(companyReview._id, currentUserId);
  if(report){
    return res.json(report);
  }

  try{
    report = await companyReviewReportService.createReport({
      companyReviewId: companyReview._id,
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

const reactionToCompanyReviewById = catchAsync(async (req, res) => {
  const { params, query, body, locale } = req;
  const {id, reviewId} = params;
  const currentUserId = parseInt(req.header('UserId'));
  let result;

  body.reviewId = reviewId;
  body.company = id;
  body.partyId = currentUserId;
  await companyReviewReactionSchema.validate(body, { abortEarly: false });

  try {

    let found = await CompanyReview.findById(reviewId);
    if(found){

      let reaction = await addCompanyReviewReaction(body);


      if(reaction){
        result = reaction;
        if(reaction.reactionType=='LIKE'){
          found.likes.push(reaction)

        } else if (reaction.reactionType=='LOVE') {
          found.loves.push(reaction)
        }

        found  = await found.save();
        found.noOfLikes = found.likes.length;
        found.noOfLoves = found.loves.length;
        found.loves=[];
        found.likes=[];

      }

    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const removeReactionToCompanyReviewById = catchAsync(async (req, res) => {
  const { params, query, body, locale } = req;
  const {id, reviewId} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result;
  try {

    let found = await CompanyReview.findById(reviewId);
    if(found) {

      const reaction = await CompanyReviewReaction.findOne({
        partyId: currentUserId,
        reviewId: reviewId
      });


      if (reaction) {
        let deleted = await CompanyReviewReaction.findByIdAndDelete(reaction._id)
        if (deleted) {

          if (reaction.reactionType == 'LIKE') {
            let index = _.indexOf(found.likes, reaction);
            found.likes.splice(index, 1);
          } else {
            let index = _.indexOf(found.loves, reaction);
            found.loves.splice(index, 1);
          }
          await found.save();
          result = {deleted: 1};
        }

      }
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});



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
  // form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!company || !currentUserId || !departmentId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      // let department = await CompanyDepartment.findById(departmentId);
      // console.log(department)
      // if(department){
      //   department.name = form.name;
      //   department.updatedBy = currentUserId;
      //   department.background = form.background;
      //   result = await department.save();
      // }
      console.log(form)
      result = await companyDepartmentService.update(form);
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
      let department = await CompanyDepartment.findById(departmentId);
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

async function getCompanyDepartments(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getDepartments(company);

  return result;

}



async function addCompanyPipeline(company, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await addPipeline(form);
    }
  } catch(e){
    console.log('addCompanyPipeline: Error', e);
  }


  return result
}

async function updateCompanyPipeline(company, pipelineId, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!company || !currentUserId || !pipelineId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let pipeline = await JobPipeline.findOne({pipelineId: pipelineId});
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

async function deleteCompanyPipeline(company, pipelineId, currentUserId) {
  if(!company || !currentUserId || !pipelineId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let pipeline = await JobPipeline.findOne({pipelineId: pipelineId});
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

async function getCompanyPipelines(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getPipelines(company);

  return result;

}




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




async function addCompanyLabel(company, currentUserId, form) {
  console.log('addCompanyRole', form)
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await labelService.add(form);
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
      let label = await Label.findById(labelId);
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

      let label = await Label.findById(labelId);
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

async function getCompanyLabels(company, type, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await labelService.getLabels(company, type);

  return result;

}


const addInterest = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result;
  try {
    result = await interestService.addInterest({company: id, user: currentUserId});
  } catch(e){
    console.log('getBenefits: Error', e);
  }

  res.json(result);
});


const getBenefits = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;

  let result = [];
  try {
    result = await benefitService.findByCompanyId(id);
    if(!result.length){
      result = await benefitService.getDefaultBenefits();
    }

  } catch(e){
    console.log('getBenefits: Error', e);
  }

  res.json(result);
});

const updateBenefits = catchAsync(async (req, res) => {
  const {params, body} = req;
  const {id} = params;
  const {benefits} = body;

  if(!id || !benefits){
    return res.status(400).send({ success: false, message: 'Invalid input' })
  }

  if ( !Array.isArray(benefits) || !benefits.length) {
    return res.status(400).json({ success: false, message: 'Invalid input. benefits should be an array' });
  }

  let result;

  try {
    //result = await companyService.updateBenefits(company, benefits);
    result = await benefitService.update(id, benefits);
  } catch(e){
    console.log('updateCompanyBenefits: Error', e);
    return res.status(500).send({ success: false, message: 'Internal server error' });
  }
  res.json(result);
});


const addQuestion = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {id} = params;
  let currentUserId = parseInt(req.header('UserId'));
  let result;

  try {
    body.companyId = id;
    body.userId = currentUserId;
    result = await userQuestionService.addQuestion(id, body);
    res.json(result);
  } catch(e){
    console.log('addQuestion: Error', e);
    res.status(500).send({success: false, error: 'Internal server error' });
  }

});



const getDefaultQuestions = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {id} = params;

  let result = [];

  try {
    result = await userQuestionService.getDefaultQuestions();
  } catch(e){
    console.log('getQuestions: Error', e);
  }

  res.json(result);
});


const getQuestions = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id} = params;
  const {page, size} = query;
  const pagination = {page, size};
  let result = [];
  try {
    result = await userQuestionService.findByCompanyId(id, pagination);
  } catch(e){
    console.log('getQuestions: Error', e);
  }

  res.json(new Pagination(result));
});


const getQuestion = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {id, questionId} = params;
  let result;

  try {
    result = await userQuestionService.findById(ObjectId(questionId));

  } catch(e){
    console.log('getQuestion: Error', e);
  }

  res.json(result);
});

async function getQuestionResponses(company, id, pagination) {
  if(!id || !pagination){
    return null;
  }

  let result;

  try {
    result = await userQuestionService.getQuestionResponses(id, pagination);

  } catch(e){
    console.log('getQuestionResponses: Error', e);
  }

  return new Pagination(result);
}

async function addQuestionResponse(company, response) {
  if(!company || !response){
    return null;
  }

  let result;

  try {
    result = await userQuestionService.addResponse(company, response);

  } catch(e){
    console.log('addQuestionResponse: Error', e);
  }

  return result;
}



module.exports = {
  sync,
  leaveCompany,
  register,
  getCompany,
  deactivateCompanyJobs,
  getCompanyLatestJobs,
  getCompanyJobs,
  addNewSalary,
  getCompanySalaries,
  getCompanyLatestSalaries,
  getCompanyJobsJobFunctions,
  getCompanySalariesGroupByJobFunctions,
  getCompanySalariesGroupByLocations,
  getCompanySalaryByEmploymentTitle,
  getCompanySalaryLocations,
  getCompanySalaryTop5Locations,
  getCompanySalaryEmploymentTitles,
  getCompanySalariesJobFunctions,
  getCompanySalaryGroupByGender,
  addSalaryReaction,
  addReview,
  getCompanyTopReviews,
  getCompanyReviewStats,
  getCompanyReviews,
  getCompanyReviewLocations,
  reportCompanyReviewById,
  reactionToCompanyReviewById,
  removeReactionToCompanyReviewById,
  addCompanyDepartment,
  updateCompanyDepartment,
  deleteCompanyDepartment,
  getCompanyDepartments,
  addCompanyPipeline,
  updateCompanyPipeline,
  deleteCompanyPipeline,
  getCompanyPipelines,
  addCompanyRole,
  getCompanyRoles,
  updateCompanyRole,
  deleteCompanyRole,
  addCompanyLabel,
  getCompanyLabels,
  updateCompanyLabel,
  deleteCompanyLabel,
  addInterest,
  getBenefits,
  updateBenefits,
  addQuestion,
  getDefaultQuestions,
  getQuestions,
  getQuestion,
  getQuestionResponses,
  addQuestionResponse
}
