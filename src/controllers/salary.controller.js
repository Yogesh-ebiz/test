const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const {isUserActive} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');
const salaryReactionService = require('../services/salaryreaction.service');
const catchAsync = require("../utils/catchAsync");
const { findEmploymentTitlesCountByCompanyId, findSalariesByCompanyId } = require("../services/company.service");
const { findCurrencyRate } = require("../services/currency.service");
const salaryService = require("../services/salary.service");
const CustomPagination = require("../utils/custompagination");



const getSalaryByJobTitle = catchAsync(async (req, res) => {
  const { body, query, locale } = req;

  let result = null;
  try {
    if(query.query){
      result = await salaryService.getSalaryByTitle(query.query);

      if(result.companyResults){
        const companies = await feedService.lookupCompaniesIds(_.map(result.companyResults, 'company'));
        result.companyResults = _.reduce(result.companyResults, function(res, item){
          const company = _.find(companies, {id: item.company});
          if(company){
            item.company = _.pick(company, ['id', 'name', 'avatar', 'tagname']);
          }


          res.push(item);
          return res;
        }, []);
      }
    }
  } catch (e) {
    console.log('getSalaryByJobTitle: Error', e);
  }

  res.json(result);
});


const getTopPayingCompanies = catchAsync(async (req, res) => {
  const { query, locale } = req;

  let result = null;
  try {
    result = await salaryService.getTopPayingCompanies(query.query);

    if(result){
      const companies = await feedService.lookupCompaniesIds(_.map(result, 'company'));
      result = _.reduce(result, function(res, item){
        const company = _.find(companies, {id: item.company});
        if(company){
          res.push(_.pick(company, ['id', 'name', 'avatar', 'tagname', 'rating']));
        }

        return res;
      }, []);
    }

  } catch (e) {
    console.log('getSalaryByJobTitle: Error', e);
  }

  res.json(result);
});

const search = catchAsync(async (req, res) => {
  const { body, query, locale } = req;
  let currentUserId = parseInt(req.header('UserId'));

  let result=[];
  try {
    result = await salaryService.search(query.title);
  } catch (e) {
    console.log('search: Error', e);
  }

  res.json(result);
});


async function addSalaryReaction(currentUserId, salaryHistoryId, reaction) {

  if(!currentUserId || !salaryHistoryId || !reaction){
    return null;
  }

  let result = null;
  try {
    let currentParty = await feedService.findByUserId(currentUserId);

    if (isUserActive(currentParty)) {
      reaction.salaryHistoryId = salaryHistoryId;
      reaction.userId = currentUserId;
      result = await salaryReactionService.addReaction(reaction);
    }



  } catch (e) {
    console.log('Error: addSalaryReaction', e)
  }
  return result;
}



async function getSalaryReactionCount(salaryHistoryId) {

  if(!salaryHistoryId){
    return null;
  }

  let result = null;
  try {

    result = await salaryReactionService.getReactionsCountBySalaryHistoryId(salaryHistoryId);

  } catch (e) {
    console.log('Error: getSalaryReactionCount', e)
  }
  return result;
}



module.exports = {
  getSalaryByJobTitle,
  getTopPayingCompanies,
  search,
  addSalaryReaction,
  getSalaryReactionCount
}
