const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/job.pagination');
let SearchParam = require('../const/searchParam');
const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
let employmentTypeEnum = require('../const/employmentTypeEnum');

const {convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const {createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findCompanyById, searchUsers, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');
const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populatePerson} = require('../services/party.service');
const {findListOfPartyEmploymentTitle} = require('../services/partyemployment.service');
const {findCompanyReviewReactionByPartyId, addCompanyReviewReaction} = require('../services/companyreviewreaction.service');
const {findCurrencyRate} = require('../services/currency.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');

const {addCompanySalary, findCompanySalaryByEmploymentTitle, findEmploymentTitlesCountByCompanyId, findSalariesByCompanyId, addCompanyReview,
  findCompanyReviewHistoryByCompanyId, addCompanyReviewReport, findAllCompanySalaryLocations, findAllCompanyReviewLocations, findAllCompanySalaryEmploymentTitles, findAllCompanySalaryJobFunctions, findTop3Highlights} = require('../services/company.service');
const {findBookById, addBookById, removeBookById, findBookByUserId, findMostBookmarked} = require('../services/bookmark.service');

const JobRequisition = require('../models/jobrequisition.model');
const CompanyReview = require('../models/companyreview.model');
// const CompanyReviewReport = require('../models/companyreviewreport.model');
const CompanyReviewReaction = require('../models/companyreviewreaction.model');


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
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string()
})


const reviewSchema = Joi.object({
  user: Joi.number().required(),
  company: Joi.number().required(),
  employmentTitle: Joi.string().allow('').optional(),
  rating: Joi.number().required(),
  employmentType: Joi.string().required(),
  recommendCompany: Joi.boolean().required(),
  approveCEO: Joi.boolean(),
  isCurrentEmployee: Joi.boolean(),
  reviewTitle: Joi.string(),
  pros: Joi.array(),
  cons: Joi.array(),
  advices: Joi.array(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional()
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


module.exports = {
  getCompanyJobs,
  addNewSalary,
  getCompanySalaries,
  getCompanySalaryByEmploymentTitle,
  getCompanySalaryLocations,
  getCompanySalaryEmploymentTitles,
  getCompanySalaryJobFunctions,
  addNewReview,
  getCompanyReviewStats,
  getCompanyReviews,
  getCompanyReviewLocations,
  reportCompanyReviewById,
  reactionToCompanyReviewById,
  removeReactionToCompanyReviewById
}


async function getCompanyJobs(currentUserId, filter, locale) {

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

  let result = await JobRequisition.paginate(new SearchParam(filter), options);
  let docs = [];

  let employmentTypes = await getEmploymentTypes(_.uniq(_.map(result.docs, 'employmentType')), locale);
  // let experienceLevels = await getExperienceLevels(_.uniq(_.map(result.docs, 'level')), locale);
  // let industries = await findIndustry('', _.uniq(_.flatten(_.map(result.docs, 'industry'))), locale);
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
    job.company = convertToCompany(_.find(foundCompanies, {id: job.company}));
    job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});

    job.promotion = _.find(promotions, {promotionId: job.promotion});



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


async function addNewSalary(currentUserId, salary) {
  salary = await Joi.validate(salary, salarySchema, { abortEarly: false });
  if(currentUserId==null || salary==null){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await addCompanySalary(salary);
    }
  } catch(e){
    console.log('addNewSalary: Error', e);
  }


  return result
}

async function getCompanySalaries(currentUserId, filter, locale) {
  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {
      let total = await findEmploymentTitlesCountByCompanyId(filter);
      result = await findSalariesByCompanyId(filter);

      let listOfCurrencies = _.reduce(result, function(res, item){
        let preferredCurrency = currentParty.preferredCurrency?currentParty.preferredCurrency:'USD';
        res.push({src: item.currency, target: preferredCurrency});
        return res;
      }, []);

      // let currencies = await findCurrencyRate(currentParty.preferredCurrency);
      let loadCurrencies = listOfCurrencies.map(currency => findCurrencyRate(currency.src, currency.target));
      let currencies = await Promise.all(loadCurrencies);

      result = _.reduce(result, function (res, item) {
        let currency = _.find(currencies, {currency: item.currency+currentParty.preferredCurrency});
        let avgBaseSalary = 0;
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

        item.hasLiked = false;
        item.avgBaseSalary = avgBaseSalary //Math.floor(item.avgBaseSalary * currency.rate, 0);
        item.displayCurrency = currentParty.preferredCurrency;

        res.push(item);
        return res;
      }, [])

      let pagination = new CustomPagination({count: total, result: result}, filter, locale);
      result = pagination;
    }
  } catch (e) {
    console.log('getCompanySalaries: Error', e);
  }

  return result;
}

async function getCompanySalaryByEmploymentTitle(currentUserId, companyId, employmentTitle, country) {

  if(currentUserId==null || companyId==null || employmentTitle==null || country==null){
    return null;
  }

  let result = null;
  try {

    result = await findCompanySalaryByEmploymentTitle(companyId, employmentTitle, country);
    result.shareUrl = 'http://www.accessed.com/company/' + companyId + '/salary/' + employmentTitle.replace(' ', '-');

  } catch (e) {
    console.log('Error: getCompanySalaryByEmploymentTitle', e)
  }
  return result;
}

async function getCompanySalaryLocations(currentUserId, companyId) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let result = null;
  try {

    result = await findAllCompanySalaryLocations(companyId);


  } catch (e) {
    console.log('Error: getCompanySalaryLocations', e)
  }
  return result;
}

async function getCompanySalaryEmploymentTitles(currentUserId, companyId) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let result = null;
  try {

    result = await findAllCompanySalaryEmploymentTitles(companyId);
    result = _.reduce(result, function(res, item){
      res.push(item.employmentTitle);
      return res;
    }, []);

  } catch (e) {
    console.log('Error: getCompanySalaryEmploymentTitles', e)
  }
  return result;
}

async function getCompanySalaryJobFunctions(currentUserId, companyId, locale) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let result = null;
  try {

    result = await findAllCompanySalaryJobFunctions(companyId, locale);
    // result = _.reduce(result, function(res, item){
    //   if(item.jobFunction){
    //     res.push(item.jobFunction);
    //   }
    //
    //   return res;
    // }, []);

  } catch (e) {
    console.log('Error: getCompanySalaryEmploymentTitles', e)
  }
  return result;
}

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

async function addNewReview(currentUserId, review) {
  if (currentUserId==null || review==null){
    return null;
  }
  review = await Joi.validate(review, reviewSchema, {abortEarly: false});

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  if (isPartyActive(currentParty)) {

    result = await addCompanyReview(review);
  }

  return result;
}

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

async function getCompanyReviewStats(userId, company, locale) {
  let result = null;

  result = await findCompanyReviewHistoryByCompanyId(company);

  if(result) {
    let highlights = await findTop3Highlights(company);
    result.mostPopularReviews = highlights;
  }
  return result;
}

async function getCompanyReviews(currentUserId, filter, locale) {
  let result = null;
  let select = '-description -qualifications -responsibilities';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};

  switch(filter.sortBy){
    case('createdDate'):
      filter.sortBy='createdDate';
      break;
    case('popular'):
      filter.sortBy='popular';
      break;
    case('rating'):
      filter.sortBy='rating';
      break;
    default:
      filter.sortBy='createdDate';

  }

  // filter.sortBy = (filter.sortBy!=null) ? filter.sortBy : 'createdDate';
  filter.direction = (filter.direction && filter.direction=="ASC") ? "ASC" : 'DESC';
  sortBy[filter.sortBy] = (filter.direction == "DESC") ? -1 : 1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  if(!filter.employmentType){
    let employmentTypes = [];
    for(employmentType in employmentTypeEnum){
      employmentTypes.push(employmentType);

    }
    employmentTypes = employmentTypes.join(',');
    filter.employmentType = employmentTypes;
  }

  result = await CompanyReview.paginate(new SearchParam(filter), options);

  let partyIds = _.uniq(_.map(result.docs, 'user'));
  let reactions = await findCompanyReviewReactionByPartyId(currentUserId);

  let results = await searchUsers(currentUserId, '', partyIds);
  let foundUsers = results.content;

  let employments = await findListOfPartyEmploymentTitle(partyIds);

  result.docs = _.reduce(result.docs, function(res, item){
    // let find = _.find(employments, {id: item.party.id});
    let hasLiked = _.find(reactions, {user: currentUserId, companyReviewId: item.companyReviewId, reactionType: 'LIKE'})?true:false;
    let hasLoved = _.find(reactions, {user: currentUserId, companyReviewId: item.companyReviewId, reactionType: 'LOVE'})?true:false;


    item.user = convertToAvatar(_.find(foundUsers, {id: item.user}));
    item.noOfLikes =  (item.likes)? item.likes.length: 0;
    item.noOfLoves = (item.loves)? item.loves.length : 0;
    item.hasLiked = hasLiked;
    item.hasLoved = hasLoved;
    item.likes = [];
    item.loves = [];
    res.push(item);
    return res;
  }, []);

  return new Pagination(result);
}

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

async function reportCompanyReviewById(currentUserId, companyReviewId, report) {

  report = await Joi.validate(report, companyReviewReportSchema, { abortEarly: false });

  if(!currentUserId || !companyReviewId || !report){
    return null;
  }

  let result;
  try {

    let found = await CompanyReview.findOne({companyReviewId: companyReviewId});
    if(found){

      let currentParty = await findByUserId(currentUserId);

      if(!isPartyActive(currentParty)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }


      report = await addCompanyReviewReport(report);


      if(report){

        found.status=statusEnum.REPORTED;
        result  = await found.save();
      }
    }
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function reactionToCompanyReviewById(currentUserId, companyReviewId, reaction) {

  reaction = await Joi.validate(reaction, companyReviewReactionSchema, { abortEarly: false });

  if(!currentUserId || !companyReviewId || !reaction){
    return null;
  }

  let result;
  try {

    let found = await CompanyReview.findOne({companyReviewId: companyReviewId});
    if(found){

      let currentParty = await findByUserId(currentUserId);

      if(!isPartyActive(currentParty)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }


      reaction = await addCompanyReviewReaction(reaction);


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

  return result;
}

async function removeReactionToCompanyReviewById(currentUserId, companyReviewId, reaction) {

  reaction = await Joi.validate(reaction, companyReviewReactionSchema, { abortEarly: false });

  if(!currentUserId || !companyReviewId || !reaction){
    return null;
  }

  let result;
  try {

    let found = await CompanyReview.findOne({companyReviewId: companyReviewId});
    if(found) {


      let currentParty = await findByUserId(currentUserId);

      if (!isPartyActive(currentParty)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }


      reaction = await CompanyReviewReaction.findOne({
        partyId: currentParty.id,
        companyReviewId: companyReviewId,
        reactionType: reaction.reactionType
      });


      if (reaction) {
        let deleted = await reaction.delete();

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

  return result;
}



