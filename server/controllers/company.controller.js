const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/job.pagination');
let SearchParam = require('../const/searchParam');
let employmentTypeEnum = require('../const/employmentTypeEnum');
const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');

const {addCompanySalary, findCompanySalaryByEmploymentTitle, findEmploymentTitlesCountByCompanyId, findSalariesByCompanyId, addCompanyReview, findCompanyReviewHistoryByCompanyId} = require('../services/company.service');


const CompanyReview = require('../models/companyreview.model');
// const CompanyReviewReport = require('../models/companyreviewreport.model');


const salarySchema = Joi.object({
  partyId: Joi.number().required(),
  company: Joi.number().required(),
  employmentTitle: Joi.string().required(),
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
  partyId: Joi.number().required(),
  company: Joi.number().required(),
  rating: Joi.number().required(),
  employmentType: Joi.string().required(),
  recommendCompany: Joi.boolean().required(),
  approveCEO: Joi.boolean(),
  isCurrentEmployee: Joi.boolean(),
  reviewTitle: Joi.string(),
  pros: Joi.array(),
  cons: Joi.array(),
  advices: Joi.array()
})


module.exports = {
  addNewSalary,
  getCompanySalaries,
  getCompanySalaryByEmploymentTitle,
  addNewReview,
  getCompanyReviewStats,
  getCompanyReviews,
  reportCompanyReviewById
}

async function addNewSalary(currentUserId, salary) {
  salary = await Joi.validate(salary, salarySchema, { abortEarly: false });
  if(currentUserId==null || salary==null){
    return null;
  }

  let result = null;
  try {
    console.log('salary', salary)
    result = await addCompanySalary(salary);
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
    let total = await findEmploymentTitlesCountByCompanyId(filter.company);
    result = await findSalariesByCompanyId(filter);


    result = _.reduce(result, function(res, item){
      item.hasLiked = false;
      res.push(item);
      return res;
    }, [])

    result = new CustomPagination({count: total[0].count, result: result}, filter, locale);

  } catch (e) {
    console.log('getCompanySalaries: Error', e);
  }

  return result;
}


async function getCompanySalaryByEmploymentTitle(currentUserId, companyId, employmentTitle) {

  console.log('getCompanySalaryByEmploymentTitle', currentUserId, companyId, employmentTitle)
  if(currentUserId==null || companyId==null || employmentTitle==null){
    return null;
  }

  let result = null;
  try {

    console.log('get', companyId, employmentTitle)
    result = await findCompanySalaryByEmploymentTitle(companyId, employmentTitle);


  } catch (e) {
    console.log('getCompanySalaryByEmploymentTitle: Error', e)
  }
  console.log('res', result)
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


async function addNewReview(review) {
  console.log('review', review)
  salary = await Joi.validate(review, reviewSchema, { abortEarly: false });
  return await addCompanyReview(review);
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

  return await findCompanyReviewHistoryByCompanyId(company)
}


async function getCompanyReviews(filter, locale) {
  let result = null;

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

  if(!filter.employmentType){
    let employmentTypes = [];
    for(employmentType in employmentTypeEnum){
      employmentTypes.push(employmentType);

    }
    employmentTypes = employmentTypes.join(',');
    filter.employmentType = employmentTypes;
  }
  console.log('filter', filter)

  result = await CompanyReview.paginate(new SearchParam(filter), options);

  return new Pagination(result);
}




async function reportCompanyReviewById(currentUserId, companyReviewId, report) {


  if(!currentUserId || !companyReviewId || !report){
    return null;
  }

  let result;
  try {

    let found = await CompanyReview.findOne({companyReviewId: companyReviewId});
    if(found){

      let response = await getPartyById(currentUserId);
      let currentParty = response.data.data;

      console.log('party', currentParty)
      if(!isPartyActive(currentParty)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }

      report = await Joi.validate(report, eventReportSchema, { abortEarly: false });
      report = await new CompanyReviewReport(report).save();

      if(report){

        found.status=statusEnum.REPORTED;
        result  = await foundEvent.save();
      }


    }


  } catch (error) {
    console.log(error);
  }

  return result;
}
