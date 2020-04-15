const _ = require('lodash');
const CompanySalary = require('../models/companysalary.model');
const CompanySalaryHistory = require('../models/companysalaryhistory.model');

const CompanyReview = require('../models/companyreview.model');
const CompanyReviewHistory = require('../models/companyreviewhistory.model');
const CompanyReviewReport = require('../models/companyreviewreport.model');
const CompanyReviewReaction = require('../models/companyreviewreaction.model');



function addCompanySalary(salary) {

  if(!salary){
    return null;
  }
  return new CompanySalary(salary).save();
}


async function findEmploymentTitlesCountByCompanyId(company) {
  let data = null;

  if(!company){
    return [];
  }

  let result = CompanySalary.aggregate([
    {$match: {company: company} },
    {$group: {_id: '$employmentTitle'}},
    {$count: 'count'}
  ]);

  data = result.length?result[0].count:0;
  return data;
}

function findSalariesByCompanyId(filter) {
  let data = null;

  if(!filter){
    return [];
  }

  let match = {};
  let page = filter.page;
  let size = filter.size;
  let skip = filter.size * filter.page;
  let sort = {};
  sort[filter.sortBy] = filter.direction=='DESC'?-1:1;

  match.company = filter.company;

  if(filter.country && filter.state && filter.city){
    match.country = {$in: filter.country.trim().split(',')};
    match.state = {$in: filter.state.trim().split(',')};
    match.city = {$in: filter.city.trim().split(',')};
  }

  // console.log('skip', skip, page)

  data = CompanySalary.aggregate([
    {$match: match},
    {$group: {_id: {employmentTitle: '$employmentTitle', country: '$country'}, basePayPeriod: {$first: '$basePayPeriod'}, currency: {$first: '$currency'}, average: {'$avg': '$baseSalary'}, count: {'$sum': 1}}},
    {$project: {_id: 0, employmentTitle: '$_id.employmentTitle', country: '$_id.country', basePayPeriod: '$basePayPeriod', currency: '$currency', count: 1, average: 1}},
    {$sort: sort},
    {$skip: skip},
    {$limit: size}
  ]);

  return data;
}

async function findCompanySalaryByEmploymentTitle(companyId, employmentTitle, country) {
  let data = null;

  if(!companyId || !employmentTitle){
    return [];
  }

  // data = await CompanySalaryHistory.findOne({company: companyId, employmentTitle: employmentTitle, country: country});
  //
  // if(data){
  //   // data.lastUpdatedDate = data.lastUpdatedDate?data.lastUpdatedDate:data.createdDate;
  //
  // } else {

    let rates = {
      'USD': 1,
      'VND': 0.000001
    }

    let group = {
      _id: {employmentTitle: '$employmentTitle', country: '$country'},
      avgTotalPay: {$avg: {$sum: ['$baseSalary', '$additionalIncome', '$cashBonus', '$stockBonus', '$profitSharing', '$tip', '$commision']}},
      minBaseSalary: {'$min': '$baseSalary'},
      maxBaseSalary: {'$max': '$baseSalary'},
      avgBaseSalary: {'$avg': '$baseSalary'},
      minAdditionalIncome: {'$min': '$additionalIncome'},
      maxAdditionalIncome: {'$max': '$additionalIncome'},
      avgAdditionalIncome: {'$avg': '$additionalIncome'},
      minCashBonus: {'$min': '$cashBonus'},
      maxCashBonus: {'$max': '$cashBonus'},
      minStockBonus: {'$min': '$stockBonus'},
      maxStockBonus: {'$max': '$stockBonus'},
      minProfitSharing: {'$min': '$profitSharing'},
      maxProfitSharing: {'$max': '$profitSharing'},
      minTip: {'$min': '$tip'},
      maxTip: {'$max': '$tip'},
      minCommision: {'$min': '$commision'},
      maxCommision: {'$max': '$commision'},
      count: {'$sum': 1}
    };

    data = await CompanySalary.aggregate([
      {$match: {company: companyId, employmentTitle: employmentTitle}},
      {
        $group: group
      },
      {
        $project: {
          _id: 0,
          employmentTitle: '$_id.employmentTitle', country: '$_id.country', baseSalary: '$baseSalary',
          avgTotalPay: {$floor: '$avgTotalPay'},
          minBaseSalary: 1, maxBaseSalary: 1, avgBaseSalary: {$floor: '$avgBaseSalary'},
          minAdditionalIncome: 1, maxAdditionalIncome: 1, avgAdditionalIncome: {$floor: '$avgAdditionalIncome'},
          minCashBonus: 1, maxCashBonus: 1,
          minStockBonus: 1, maxStockBonus: 1,
          minProfitSharing: 1, maxProfitSharing: 1,
          minTip: 1, maxTip: 1,
          minCommision: 1, maxCommision: 1,
          count: '$count'
        }
      }
    ]);


    if(data.length){
      for(item of data){
        await CompanySalaryHistory.update({company: companyId, employmentTitle: employmentTitle, country: country},
          {$set: {
              company: companyId,
              avgTotalPay: item.avgTotalPay,
              employmentTitle: item.employmentTitle,
              minBaseSalary: item.minBaseSalary,
              maxBaseSalary: item.maxBaseSalary,
              avgBaseSalary: item.avgBaseSalary,
              minAdditionalIncome: item.minAdditionalIncome,
              maxAdditionalIncome: item.maxAdditionalIncome,
              avgAdditionalIncome: item.avgAdditionalIncome,
              minCashBonus: item.minCashBonus,
              maxCashBonus: item.maxCashBonus,
              minStockBonus: item.minStockBonus,
              maxStockBonus: item.maxStockBonus,
              minProfitSharing: item.minProfitSharing,
              maxProfitSharing: item.maxProfitSharing,
              count: item.count,
              lastUpdatedDate: Date.now()
            }
        }, {upsert:true});
      }

      data = _.find(data, {country: country});
    }
  //
  // }



  return data;
}


function findAllCompanySalaryLocations(company) {
  let data = null;

  if(!company){
    return;
  }

  data = CompanySalary.aggregate([
    {$match: {company: company} },
    {$group: {_id: {city: '$city', state: '$state', country: '$country'}}},
    {$project: {_id: 0, city: '$_id.city', state: '$_id.state', country: '$_id.country'}}
  ]).sort({country: 1});

  return data;
}

function findAllCompanySalaryEmploymentTitles(company) {
  let data = null;

  if(!company){
    return;
  }

  data = CompanySalary.aggregate([
    {$match: {company: company} },
    {$group: {_id: {employmentTitle: '$employmentTitle'}}},
    {$project: {_id: 0, employmentTitle: '$_id.employmentTitle'}}
  ]).sort({employmentTitle: 1});

  return data;
}


function findAllCompanySalaryJobFunctions(company) {
  let data = null;

  if(!company){
    return;
  }

  data = CompanySalary.aggregate([
    {$match: {company: company} },
    {$group: {_id: {jobFunction: '$jobFunction'}}},
    {$project: {_id: 0, jobFunction: '$_id.jobFunction'}}
  ]).sort({jobFunction: 1});

  return data;
}



function addCompanyReview(review) {

  if(!review){
    return null;
  }
  return new CompanyReview(review).save();
}

function findAllCompanyReviewLocations(company) {
  let data = null;

  if(!company){
    return;
  }

  data = CompanyReview.aggregate([
    {$match: {company: company} },
    {$group: {_id: {city: '$city', state: '$state', country: '$country'}}},
    {$project: {_id: 0, city: '$_id.city', state: '$_id.state', country: '$_id.country'}}
  ]).sort({country: 1});

  return data;
}


async function findCompanyReviewHistoryByCompanyId(company) {
  let data = null;

  if(!company){
    return [];
  }

  // data = await CompanyReviewHistory.findOne({company: company});

  // if(data){
  //   let today = new Date();
  //   let lastReviewStatDate = new Date(data.createdDate);
  //   let daysAgo = Math.floor( (Math.abs(today - lastReviewStatDate) / 1000) / 86400);
  // } else {
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

    if (data.length) {

      // for(item of data) {
      //   await CompanyReviewHistory({company: company},
      //     {
      //       $set: {
      //         company: item.company,
      //         avgRating: item.avgRating,
      //         approveCEO: item.approveCEO,
      //         recommendCompany: item.recommendCompany,
      //         noOf5Stars: item.noOf5Stars,
      //         noOf4Stars: item.noOf4Stars,
      //         noOf3Stars: item.noOf3Stars,
      //         noOf2Stars: item.noOf2Stars,
      //         noOf1Stars: item.noOf1Stars,
      //         totalReviews: item.totalReviews
      //       }
      //     }, {upsert: true});
      // }
      data = _.find(data, {company: company});
    } else {
      return null;
    }
  // }
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

  if(!review){
    return null;
  }
  return new CompanyReview(review).save();
}

async function findTop3Highlights(company) {
  let data = null;

  if(!company){
    return;
  }

  let reactions = await CompanyReviewReaction.aggregate([
    {$match: {company: company} },
    {$group: {_id: '$companyReviewId', count: {$sum: 1}}},
    {$project: {_id: 0, companyReviewId: '$_id', count: 1}}
  ]).sort({count: -1}).limit(3);

  if(reactions){
    let reviews = [];
    for(react of reactions){
      let review = await CompanyReview.findOne({companyReviewId: react.companyReviewId}, {reviewTitle: 1, rating :1});
      reviews.push({isPositive: review.rating>2?true:false, comment: review.reviewTitle, count: react.count})
    }
    data = reviews;
  }

  return data;
}



function addCompanyReviewReport(report) {

  if(!report){
    return null;
  }
  return new CompanyReviewReport(report).save();
}


module.exports = {
  addCompanySalary:addCompanySalary,
  findEmploymentTitlesCountByCompanyId:findEmploymentTitlesCountByCompanyId,
  findSalariesByCompanyId: findSalariesByCompanyId,
  findCompanySalaryByEmploymentTitle:findCompanySalaryByEmploymentTitle,
  findAllCompanySalaryLocations:findAllCompanySalaryLocations,
  findAllCompanySalaryEmploymentTitles:findAllCompanySalaryEmploymentTitles,
  findAllCompanySalaryJobFunctions:findAllCompanySalaryJobFunctions,
  addCompanyReview:addCompanyReview,
  findAllCompanyReviewLocations:findAllCompanyReviewLocations,
  findCompanyReviewHistoryByCompanyId:findCompanyReviewHistoryByCompanyId,
  findCompanyReviewsByCompanyId: findCompanyReviewsByCompanyId,
  findTop3Highlights:findTop3Highlights,
  addCompanyReviewReport:addCompanyReviewReport
}
