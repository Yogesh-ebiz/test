const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const Pagination = require('../utils/custompagination');
const {addCompanySalary, findCompanySalaryByEmploymentTitle, findEmploymentTitlesCountByCompanyId, findSalariesByCompanyId, addCompanyReview, findReviewsByCompanyId} = require('../services/company.service');


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
  getCompanyReviews
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
  if(currentUserId==null || employmentTitle==null){
    return null;
  }

  let result = null;
  try {
    let count = await findEmploymentTitlesCountByCompanyId(filter.company);
    result = await findSalariesByCompanyId(filter);


    result = _.reduce(result, function(res, item){
      item.hasLiked = false;
      res.push(item);
      return res;
    }, [])

    result = new Pagination(result, filter, locale);

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

  salary = await Joi.validate(review, reviewSchema, { abortEarly: false });
  return await addCompanyReview(review);
}

async function getCompanyReviews(filter, locale) {
  let result = null;
  result = await findReviewsByCompanyId(filter);

  result = _.reduce(result, function(res, item){
    item.hasLiked = false;
    res.push(item);
    return res;
  }, [])

  return new Pagination(result, filter, locale);
}
