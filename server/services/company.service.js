const _ = require('lodash');
const CompanySalary = require('../models/companysalary.model');
const CompanySalaryHistory = require('../models/companysalaryhistory.model');

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

async function findCompanySalaryByEmploymentTitle(companyId, employmentTitle) {
  let data = null;

  if(!companyId || !employmentTitle){
    return [];
  }

  let history = await CompanySalaryHistory.findOne({company: companyId, employmentTitle: employmentTitle});

  if(history){
    data=history;
    data.lastUpdatedDate = data.lastUpdatedDate?data.lastUpdatedDate:data.createdDate;

  } else {

    let aggregate = await CompanySalary.aggregate([
      {$match: {company: companyId, employmentTitle: employmentTitle}},
      {
        $group: {
          _id: '$employmentTitle',
          avgTotalPay: {$avg: {$sum: ['$basePay', '$additionalIncome', '$cashBonus', '$stockBonus', '$profitSharing', '$tip', '$commision']}},
          minBaseSalary: {'$min': '$baseSalary'},
          maxBaseSalary: {'$max': '$baseSalary'},
          avgBaseSalary: {'$avg': '$baseSalary'},
          minAdditionalIncome: {'$min': '$additionalIncome'},
          maxAdditionalIncome: {'$max': '$additionalIncome'},
          avgAdditionalPay: {'$avg': '$additionalIncome'},
          minCashBonus: {'$min': '$cashBonus'},
          maxCashBonus: {'$max': '$cashBonus'},
          minStockBonus: {'$min': '$stockBonus'},
          maxStockBonus: {'$max': '$stockBonus'},
          minProfitSharing: {'$min': '$profitSharing'},
          maxProfitSharing: {'$max': '$profitSharing'},
          count: {'$sum': 1}
        }
      },
      {
        $project: {
          _id: 0,
          employmentTitle: '$_id', avgTotalPay: {$floor: '$avgTotalPay'},
          minBaseSalary: 1, maxBaseSalary: 1, avgBaseSalary: {$floor: '$avgBaseSalary'},
          minAdditionalIncome: 1, maxAdditionalIncome: 1, avgAdditionalPay: {$floor: '$avgBasePay'},
          minCashBonus: 1, maxCashBonus: 1,
          minStockBonus: 1, maxStockBonus: 1,
          minProfitSharing: 1, maxProfitSharing: 1,
          count: '$count'
        }
      }
    ]);

    if(aggregate[0].count>0){
      data = await new CompanySalaryHistory({
        company: companyId,
        employmentTitle: aggregate[0].employmentTitle,
        minBaseSalary: aggregate[0].minBaseSalary,
        maxBaseSalary: aggregate[0].maxBaseSalary,
        avgBaseSalary: aggregate[0].avgBaseSalary,
        minAdditionalIncome: aggregate[0].minAdditionalIncome,
        maxAdditionalIncome: aggregate[0].maxAdditionalIncome,
        avgAdditionalPay: aggregate[0].avgAdditionalPay,
        minCashBonus: aggregate[0].minCashBonus,
        maxCashBonus: aggregate[0].maxCashBonus,
        minStockBonus: aggregate[0].minStockBonus,
        maxStockBonus: aggregate[0].maxStockBonus,
        minProfitSharing: aggregate[0].minProfitSharing,
        maxProfitSharing: aggregate[0].maxProfitSharing,
        count: aggregate[0].count
      }).save();

      data.lastUpdatedDate = data.lastUpdatedDate?data.lastUpdatedDate:data.createdDate;

    }


  }



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
