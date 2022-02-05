const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const roleType = require('../const/roleType');

const Company = require('../models/company.model');
const CompanySalary = require('../models/companysalary.model');
const CompanySalaryHistory = require('../models/companysalaryhistory.model');

const CompanyReview = require('../models/companyreview.model');
const CompanyReviewHistory = require('../models/companyreviewhistory.model');
const CompanyReviewReport = require('../models/companyreviewreport.model');
const CompanyReviewReaction = require('../models/companyreviewreaction.model');
const JobFunction = require('../models/jobfunctions.model');

const feedService = require('../services/api/feed.service.api');
const memberService = require('../services/member.service');
const roleService = require('../services/role.service');



const companySchema = Joi.object({
  name: Joi.string(),
  legalName: Joi.string().allow('').optional(),
  companyId: Joi.number(),
  partyType: Joi.string(),
  type: Joi.string(),
  createdBy: Joi.number(),
  email: Joi.string(),
  primaryAddress: Joi.object(),
  partyType: Joi.string(),
  size: Joi.string(),
  about: Joi.string().allow('').optional(),
  mission: Joi.string().allow('').optional(),
  website: Joi.string().allow('').optional(),
  yearFounded: Joi.number().optional(),
});

const feedCompanySchema = Joi.object({
  name: Joi.string(),
  legalName: Joi.string(),
  partyType: Joi.string(),
  about: Joi.string().allow(''),
  mission: Joi.string().allow(''),
  size: Joi.string(),
  avatar: Joi.string().allow(''),
  type: Joi.string(),
  industry: Joi.array(),
  website: Joi.string().allow(''),
  yearFounded: Joi.number(),
  primaryAddress: Joi.object()
});

async function add(newCompany) {

  if(!newCompany){
    return;
  }
  let company = null;
  try{
    newCompany = await Joi.validate(newCompany, companySchema, {abortEarly: false});
    company = await new Company(newCompany).save();
  } catch (error) {
    console.log(error);
  }


  return company;

}

async function register(currentParty, form) {

  if(!currentParty || !form){
    return;
  }

  form = await Joi.validate(form, feedCompanySchema, {abortEarly: false});
  let company = null;

  if(form.partyType==='COMPANY'){
    company = await feedService.registerCompany(currentParty.id, form);
  } else {
    company = await feedService.registerInstitute(currentParty.id, form);
  }

  let savedCompany;
  if(company){

    savedCompany = await new Company({
      name: company.name,
      companyId: company.id,
      partyType: company.partyType,
      type: company.type,
      createdBy: currentParty.id,
      email:currentParty.primaryEmail?currentParty.primaryEmail.value:'',
      primaryAddress: {address1: company.primaryAddress.address1, address2: company.primaryAddress.address2, district: company.primaryAddress.district, city: company.primaryAddress.city, state: company.primaryAddress.state, country: company.primaryAddress.country }
    }).save();

    let role = await roleService.getRoleByRole(roleType.ADMIN);

    let member = {
      createdBy: currentParty.id,
      company: company.id,
      firstName: currentParty.firstName,
      middleName: currentParty.middleName,
      lastName: currentParty.lastName,
      phone: currentParty.primaryPhone?currentParty.primaryPhone.value:'',
      email: currentParty.primaryEmail?currentParty.primaryEmail.value:'',
      timezone: currentParty.timezone?currentParty.timezone:'',
      preferTimeFormat: '',
      userId: currentParty.id,
      role: role._id
    }

    member = await memberService.addMember(member);
    console.log(member)
  }

  return savedCompany;

}

async function update(companyId, currentUserId, form) {

  if(!companyId || !currentUserId || !form){
    return;
  }


  form = await Joi.validate(form, feedCompanySchema, {abortEarly: false});
  let company = await findByCompanyId(companyId);

  if(company){
    let savedCompany;

    if(company.partyType==='COMPANY'){
      savedCompany = await feedService.updateCompany(companyId, currentUserId, form);
    } else {
      savedCompany = await feedService.updateInstitute(companyId, currentUserId, form);
    }

    if(savedCompany){
      company.name = form.name;
      company.legalName = form.legalName;
      company.type = form.type;
      company = await company.save();
    }

  }

  return company;

}

async function findById(id) {

  if(!id){
    return;
  }

  let company = await Company.findById(id).populate('subscription');

  return company;

}


async function findByCompanyId(companyId) {

  if(!companyId){
    return;
  }

  let company = await Company.findOne({companyId: companyId}).populate('subscription');

  return company;

}

async function findByCompanyIds(companyIds, needSubscription) {

  if(!companyIds){
    return;
  }

  let companies = null;
  if(needSubscription){

    companies = await Company.aggregate([
      { $match: {companyId: {$in: companyIds}}},
      // { $lookup: {
      //   from:"subscriptions",
      //   let:{subscription: '$subscription'},
      //   pipeline:[
      //     {$match:{$expr:{$eq:["$$subscription","$_id"]}}}
      //   ],
      //   as: 'subscription'
      // }},
      // { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'jobrequisitions',
          localField: '_id',
          foreignField: 'company',
          as: 'jobs',
        },
      },
      // { $unwind: { path: '$jobs' }},
      { $addFields:
          {
            noOfJobs: {$size: '$jobs'},
            jobs: []
          }
      },
      ]);
  } else {
    companies = await Company.find({companyId: {$in: companyIds}});
  }

  return companies;

}


async function getCreditRemaining(companyId) {

  if(!companyId){
    return;
  }

  let company = await Company.findOne({companyId: companyId});

  return company.credit;

}


function addCompanySalary(salary) {

  if(!salary){
    return null;
  }
  return new CompanySalary(salary).save();
}


async function findEmploymentTitlesCountByCompanyId(filter) {
  let data = null;

  if(!filter){
    return [];
  }

  let match = {};
  let and = [];
  let page = filter.page;
  let size = filter.size;
  let skip = filter.size * filter.page;
  let sort = {};
  sort[filter.sortBy] = filter.direction=='DESC'?-1:1;

  if(filter.company) {
    and.push({company: filter.company});
  }
  //
  // if(filter.employmentTitle) {
  //   and.push({employmentTitle: filter.employmentTitle});
  // }
  //
  // if(filter.country){
  //   let country = _.reduce(filter.country.split(','), function(res, item){
  //     res.push(item.trim());
  //     return res;
  //   }, [])
  //   and.push({country: {$in: country}});
  // }
  //
  // if(filter.state){
  //   let state = _.reduce(filter.state.split(','), function(res, item){
  //     res.push(item.trim());
  //     return res;
  //   }, [])
  //   and.push({state: {$in: state}});
  // }
  //
  // if(filter.city){
  //   let city = _.reduce(filter.city.split(','), function(res, item){
  //     res.push(item.trim());
  //     return res;
  //   }, [])
  //   and.push({city: {$in: city}});
  // }
  //
  // if(filter.jobFunction){
  //   let jobFunction = _.reduce(filter.jobFunction.split(','), function(result, value, key) {
  //     result.push(value.trim());
  //     return result;
  //   }, []);
  //
  //   and.push({jobFunction: {$in: jobFunction}});
  // }
  //
  //
  // if(filter.yearsExperience){
  //   let years = filter.yearsExperience.trim().split(',');
  //
  //   years = _.reduce(years, function(res, item){
  //     let criteria = item.split('-')
  //
  //     if(criteria.length==1){
  //       res.push({yearsExperience: parseInt(criteria[0])})
  //     }
  //     else if(criteria.length>1){
  //       res.push({$and: [{yearsExperience: {$gte: parseInt(criteria[0])}}, {yearsExperience: {$lte: parseInt(criteria[1])}}]});
  //     }
  //
  //     return res;
  //   }, []);
  //   and.push({$or: years});
  // }


  data = await CompanySalary.aggregate([
    {$match: {$and: and}},
    {$group: {_id: {employmentTitle: '$employmentTitle', country: '$country'}, count: {'$sum': 1}}}
  ]);

  data = data.length;
  return data;
}

function findSalariesByCompanyId(filter) {
  let data = null;

  if(!filter){
    return [];
  }

  let match = {};
  let and = [];
  let page = filter.page;
  let size = filter.size;
  let skip = filter.size * filter.page;
  let sort = {};
  sort[filter.sortBy] = filter.direction=='DESC'?-1:1;

  if(filter.company) {
    and.push({company: filter.company});
  }

  if(filter.employmentTitle) {
    and.push({employmentTitle: filter.employmentTitle});
  }

  if(filter.country){
    let country = _.reduce(filter.country.split(','), function(res, item){
      res.push(item.trim());
      return res;
    }, [])
    and.push({country: {$in: country}});
  }

  if(filter.state){
    let state = _.reduce(filter.state.split(','), function(res, item){
      res.push(item.trim());
      return res;
    }, [])
    and.push({state: {$in: state}});
  }

  if(filter.city){
    let city = _.reduce(filter.city.split(','), function(res, item){
      res.push(item.trim());
      return res;
    }, [])
    and.push({city: {$in: city}});
  }

  if(filter.jobFunction){
    let jobFunction = _.reduce(filter.jobFunction.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);

    and.push({jobFunction: {$in: jobFunction}});
  }


  if(filter.yearsExperience){
    let years = filter.yearsExperience.trim().split(',');
    years = _.reduce(years, function(res, item){
      let criteria = item.split('-')

      if(criteria.length==1){
        if(criteria[0].indexOf('>')>-1){
          res.push({yearsExperience: {$gt: parseInt(criteria[0].replace('>', ''))}});
        }else {
          res.push({yearsExperience: parseInt(criteria[0])})
        }

      }
      else if(criteria.length>1){
        res.push({$and: [{yearsExperience: {$gte: parseInt(criteria[0])}}, {yearsExperience: {$lte: parseInt(criteria[1])}}]});
      }

      return res;
    }, []);
    and.push({$or: years});
  }


  data = CompanySalary.aggregate([
    {$match: {$and: and}},
    {$group: {_id: {employmentTitle: '$employmentTitle', basePayPeriod: '$basePayPeriod', country: '$country'}, basePayPeriod: {$first: '$basePayPeriod'}, currency: {$first: '$currency'}, avgTotalSalary: {'$avg': {'$add': ['$baseSalary', '$additionalIncome', '$cashBonus', '$commision', '$profitSharing', '$stockBonus']}}, avgBaseSalary: {'$avg': '$baseSalary'}, minBaseSalary: {'$min': '$baseSalary'}, maxBaseSalary: {'$max': '$baseSalary'}, avgAdditionalIncome: {'$avg': '$additionalIncome'}, count: {'$sum': 1}}},
    {$project: {_id: 0, employmentTitle: '$_id.employmentTitle', country: '$_id.country', basePayPeriod: '$basePayPeriod', currency: '$currency', count: 1, avgTotalSalary:1, avgBaseSalary: 1, minBaseSalary: 1, maxBaseSalary: 1, avgAdditionalIncome: 1}},
    {$sort: sort},
    {$skip: skip},
    {$limit: size}
  ]);
 
  return data;
}


//TODO: Refactor
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
      noCashBonus: {$sum: {$cond: {if: {$gt: ['$cashBonus', 0]}, then: 1, else: 0}}},
      minStockBonus: {'$min': '$stockBonus'},
      maxStockBonus: {'$max': '$stockBonus'},
      noStockBonus: {$sum: {$cond: {if: {$gt: ['$stockBonus', 0]}, then: 1, else: 0}}},
      minProfitSharing: {'$min': '$profitSharing'},
      maxProfitSharing: {'$max': '$profitSharing'},
      noOfProfitSharing: {$sum: {$cond: {if: {$gt: ['$profitSharing', 0]}, then: 1, else: 0}}},
      minTip: {'$min': '$tip'},
      maxTip: {'$max': '$tip'},
      noOfTip: {$sum: {$cond: {if: {$gt: ['$tip', 0]}, then: 1, else: 0}}},
      minCommision: {'$min': '$commision'},
      maxCommision: {'$max': '$commision'},
      noOfCommision: {$sum: {$cond: {if: {$gt: ['$commision', 0]}, then: 1, else: 0}}},
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
          minCashBonus: 1, maxCashBonus: 1, noCashBonus: 1,
          minStockBonus: 1, maxStockBonus: 1, noStockBonus: 1,
          minProfitSharing: 1, maxProfitSharing: 1, noOfProfitSharing: 1,
          minTip: 1, maxTip: 1, noOfTip: 1,
          minCommision: 1, maxCommision: 1, noOfCommision: 1,
          count: '$count'
        }
      }
    ]);

    if(data.length){
      data=data[0];
      data.createdDate = Date.now();
      data.lastUpdatedDate = Date.now();
    } else {
      data=null;
    }


    // console.log('data', data)
    // if(data.length){
    //   // for(data[0] of data){
    //     data = await CompanySalaryHistory.findOneAndUpdate({company: companyId, employmentTitle: employmentTitle, country: country},
    //       {$set: {
    //           company: companyId,
    //           avgTotalPay: data[0].avgTotalPay,
    //           employmentTitle: data[0].employmentTitle,
    //           minBaseSalary: data[0].minBaseSalary,
    //           maxBaseSalary: data[0].maxBaseSalary,
    //           avgBaseSalary: data[0].avgBaseSalary,
    //           minAdditionalIncome: data[0].minAdditionalIncome,
    //           maxAdditionalIncome: data[0].maxAdditionalIncome,
    //           avgAdditionalIncome: data[0].avgAdditionalIncome,
    //           minCashBonus: data[0].minCashBonus,
    //           maxCashBonus: data[0].maxCashBonus,
    //           minStockBonus: data[0].minStockBonus,
    //           maxStockBonus: data[0].maxStockBonus,
    //           minProfitSharing: data[0].minProfitSharing,
    //           maxProfitSharing: data[0].maxProfitSharing,
    //           count: data[0].count,
    //           lastUpdatedDate: Date.now()
    //         }
    //     }, {upsert:true, new: true});
    //   // }
    //
    //   // data = _.find(data, {country: country});
    // }
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


async function findAllCompanySalaryJobFunctions(company, locale) {
  let data = null;

  if(!company){
    return;
  }

  data = await CompanySalary.aggregate([
    {$match: {company: company} },
    {$group: {_id: {jobFunction: '$jobFunction'}}},
    {$project: {_id: 0, jobFunction: '$_id.jobFunction'}}
  ]).sort({jobFunction: 1});

  data = _.reduce(data, function(res, item){
    if(item.jobFunction) {
      res.push(item.jobFunction);
    }
    return res;
  }, []);

  let localeStr = locale? locale.toLowerCase() : 'en';
  let propLocale = '$name.'+localeStr;
  data = JobFunction.aggregate([
    { $match: {shortCode: {$in: data}} },
    { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: propLocale } }
  ]);

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
      let review = await CompanyReview.findOne({companyReviewId: react.companyReviewId}, {reviewTitle: 1, rating:1});
      if(review){
        reviews.push({isPositive: review.rating>2?true:false, comment: review.reviewTitle, count: react.count});
      }

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

async function getCompanyCandidateInsights(companyId, options) {

  if(!companyId || !options){
    return null;
  }

  let aList = [
    {$match: {companyId: companyId}},
    { $lookup:{
        from:"jobviews",
        let:{company: '$_id'},
        pipeline:[
          {$match:{$expr:{$eq:["$$company","$company"]}}}
        ],
        as: 'viewers'
      }},
    { $lookup:{
        from:"bookmarks",
        let:{company: '$_id'},
        pipeline:[
          {$match:{$expr:{$eq:["$$company","$company"]}}}
        ],
        as: 'savers'
      }},
    { $lookup:{
        from:"applications",
        let:{company: '$companyId'},
        pipeline:[
          {$match:{$expr:{$eq:["$$company","$company"]}}}
        ],
        as: 'applicants'
      }},
    { $project: { union: { $concatArrays: ["$viewers", "$savers", "$applicants"] } } },

    // 6. Unwind and replace root so you end up with a result set.
    { $unwind: '$union' },
    { $replaceRoot: { newRoot: '$union' } },
    {$group: {_id: '$partyId'}},
    {$project: {partyId: '$_id'}}
  ];

  const aggregate = Company.aggregate(aList);
  return await Company.aggregatePaginate(aggregate, options);
}

async function groupSalaryByJobFunctions(company, locale) {
  let data = null;

  if(!company){
    return [];
  }

  let match = {};
  data = await CompanySalary.aggregate([
    {$match: {company: company}},
    {$group: {_id: {employmentTitle: '$employmentTitle', jobFunction: '$jobFunction'}, jobFunction: {$first: '$jobFunction'}, count: {'$sum': 1}}},
    {$project: {_id: 0, employmentTitle: '$_id.employmentTitle', jobFunction: 1,count: 1}}
  ]);

  let jobFunctions = await feedService.findJobfunction('', _.map(data, 'jobFunction'), locale);
  data = _.reduce(_.groupBy(data, 'jobFunction'), function(res, val, key) {
    let jobFunction = _.find(jobFunctions, {shortCode: key});
    let item = {id: jobFunction.id, name: jobFunction.name, shortCode: key, count: _.sumBy(val, 'count'), list: val}
    res.push(item);
    return res;
  }, []);
  return data;
}


module.exports = {
  add:add,
  register:register,
  update:update,
  findById:findById,
  findByCompanyId:findByCompanyId,
  findByCompanyIds:findByCompanyIds,
  getCreditRemaining:getCreditRemaining,
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
  addCompanyReviewReport:addCompanyReviewReport,
  getCompanyCandidateInsights:getCompanyCandidateInsights,
  groupSalaryByJobFunctions:groupSalaryByJobFunctions
}
