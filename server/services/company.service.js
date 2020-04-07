const _ = require('lodash');
const CompanySalary = require('../models/companysalary.model');
const CompanyReview = require('../models/companyreview.model');



function findEmploymentTitlesCountByCompanyId(company) {
  let data = null;

  if(!company){
    return [];
  }

  data = CompanySalary.aggregate([
    {$match: {company: company} },
    {$group: {_id: '$employmentTitle'}},
    {$count: 'count'}
  ]);

  return data;
}

function findSalariesByCompanyId(filter) {
  let data = null;

  if(!filter){
    return [];
  }

  let sort = {};
  sort[filter.sortBy] = filter.direction=='DESC'?-1:1;
  data = CompanySalary.aggregate([
    {$match: {company: filter.company} },
    {$group: {_id: '$employmentTitle', average: {'$avg': '$baseSalary'}, count: {'$sum': 1}}},
    {$project: {_id: 0, employmentTitle: '$_id', count: 1, average: 1}}
  ]).limit(filter.size).sort(sort);

  return data;
}

function findCompanySalaryByEmploymentTitle(companyId, employmentTitle) {
  let data = null;

  if(!companyId || !employmentTitle){
    return [];
  }

  console.log(companyId, employmentTitle)
  data = CompanySalary.aggregate([
    {$match: {company: companyId, employmentTitle: employmentTitle} },
    {$group: {_id: '$employmentTitle',
        minBasePay: {'$min': '$baseSalary'}, maxBasePay: {'$max': '$baseSalary'}, avgBasePay: {'$avg': '$baseSalary'},
        minAdditionalIncome: {'$min': '$baseSalary'}, maxAdditionalIncome: {'$max': '$baseSalary'}, avgAdditionalPay: {'$avg': '$additionalIncome'},
        minCashBonus: {'$min': '$cashBonus'}, maxCashBonus: {'$max': '$cashBonus'},
        minStockBonus: {'$min': '$stockBonus'}, maxStockBonus: {'$max': '$stockBonus'},
        minProfitSharing: {'$min': '$profitSharing'}, maxProfitSharing: {'$max': '$profitSharing'},
        count: {'$sum': 1}}},
    {$project: {_id: 0, employmentTitle: '$_id',
        minBasePay: 1, maxBasePay: 1, avgBasePay: 1,
        minAdditionalIncome: 1, maxAdditionalIncome: 1, avgAdditionalPay: 1,
        minCashBonus: 1, maxCashBonus: 1,
        minStockBonus: 1, maxStockBonus: 1,
        minProfitSharing: 1, maxProfitSharing: 1
      }}
  ]);

  return data;
}

function addCompanySalary(salary) {

  if(!salary){
    return null;
  }
  console.log('salary', salary)
  return new CompanySalary(salary).save();
}



function findReviewsByCompanyId(filter) {
  let data = null;

  if(!filter){
    return [];
  }

  data = CompanyReview.find({company: filter.company});

  return data;
}


function addCompanyReview(review) {

  if(!salary){
    return null;
  }
  return new CompanyReview(review).save();
}


module.exports = {
  findEmploymentTitlesCountByCompanyId:findEmploymentTitlesCountByCompanyId,
  findSalariesByCompanyId: findSalariesByCompanyId,
  findCompanySalaryByEmploymentTitle:findCompanySalaryByEmploymentTitle,
  addCompanySalary:addCompanySalary,
  findReviewsByCompanyId: findReviewsByCompanyId,
  addCompanyReview:addCompanyReview
}
