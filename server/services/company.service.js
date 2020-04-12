const _ = require('lodash');
const CompanySalary = require('../models/companysalary.model');
const CompanySalaryHistory = require('../models/companysalaryhistory.model');

const CompanyReview = require('../models/companyreview.model');
const CompanyReviewHistory = require('../models/companyReviewhistory.model');



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
  return new CompanySalary(salary).save();
}



async function findCompanyReviewHistoryByCompanyId(company) {
  let data = null;

  if(!company){
    return [];
  }

  data = await CompanyReviewHistory.findOne({company: company});

  if(data){

  } else {
    data = await CompanyReview.aggregate([
      {$match: {company: company}},
      {
        $group: {
          _id: '$company', totalReviews: {$sum: 1},
          avgRating: {$avg: '$rating'},
          approveCEO: {
            $avg: {$multiply: [{$toInt: '$approveCEO'}, 100]}
          },
          recommendCompany: {
            $avg: {$multiply: [{$toInt: '$recommendCompany'}, 100]}
          },
          noOf5Stars: {
            $sum: {$cond: {if: {$eq: ['$rating', 5]}, then: 1, else: 0}}
          },
          noOf4Stars: {
            $sum: {$cond: {if: {$eq: ['$rating', 4]}, then: 1, else: 0}}
          },
          noOf3Stars: {
            $sum: {$cond: {if: {$eq: ['$rating', 3]}, then: 1, else: 0}}
          },
          noOf2Stars: {
            $sum: {$cond: {if: {$eq: ['$rating', 2]}, then: 1, else: 0}}
          },
          noOf1Stars: {
            $sum: {$cond: {if: {$eq: ['$rating', 1]}, then: 1, else: 0}}
          }
        }
      },
      {
        $project: {
          _id: 0,
          company: '$_id', totalReviews: 1, avgRating: 1,
          noOf5Stars: '$noOf5Stars',
          noOf4Stars: '$noOf4Stars',
          noOf3Stars: '$noOf3Stars',
          noOf2Stars: '$noOf2Stars',
          noOf1Stars: '$noOf1Stars',
          approveCEO: {$round: ['$approveCEO', 1]},
          recommendCompany: {$round: ['$recommendCompany', 1]}
        }
      }]);


    if (data.totalReviews > 0) {
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

    }
  }
  return data;
}


function findCompanyReviewsByCompanyId(filter) {
  let data = null;

  if(!filter){
    return [];
  }

  let size = filter.size?parseInt(filter.size): 20;
  let sort = {};

  let match = {};

  if(filter.query){
    match.isCurrentEmployee = true;
  }

  if(filter.isCurrentEmployee){
    match.isCurrentEmployee = true;
  }

  if(filter.employmentType){
    match.employmentType = {$in:  filter.employmentType.split(',')};
  }

  sort[filter.sortBy] = filter.direction=='DESC'?-1:1;
  data = CompanyReview.find({company: filter.company}).limit(size).sort(sort);

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
  findCompanyReviewHistoryByCompanyId:findCompanyReviewHistoryByCompanyId,
  findCompanyReviewsByCompanyId: findCompanyReviewsByCompanyId,
  addCompanyReview:addCompanyReview
}
