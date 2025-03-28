const _ = require('lodash');
const {ObjectId} = require('mongodb');
const Joi = require('joi');

const roleType = require('../const/roleType');

const Company = require('../models/company.model');
const CompanySalary = require('../models/companysalary.model');
const CompanySalaryHistory = require('../models/companysalaryhistory.model');
const SalaryReaction = require('../models/salaryreaction.model');
const Salary = require('../models/salary.model');
const JobRequisition = require('../models/jobrequisition.model');

const CompanyReview = require('../models/companyreview.model');
const CompanyReviewHistory = require('../models/companyreviewhistory.model');
const CompanyReviewReport = require('../models/companyreviewreport.model');
const CompanyReviewReaction = require('../models/companyreviewreaction.model');
const JobFunction = require('../models/jobfunction.model');

const feedService = require('../services/api/feed.service.api');
const memberService = require('../services/member.service');
const roleService = require('../services/role.service');
const messagingService = require('../services/api/messaging.service.api');
const industryService = require('../services/industry.service');
const calendarService = require('../services/api/calendar.service.api');
const paymentService = require('../services/api/payment.service.api');

const  {generateWelcomeEmail} = require('../utils/emailHelper');


const companySchema = Joi.object({
  name: Joi.string(),
  legalName: Joi.string().allow('').optional(),
  companyId: Joi.number(),
  partyType: Joi.string(),
  type: Joi.string(),
  createdBy: Joi.number(),
  email: Joi.string(),
  phoneNumber: Joi.string(),
  primaryAddress: Joi.object(),
  size: Joi.string(),
  about: Joi.string().allow('').optional(),
  mission: Joi.string().allow('').optional(),
  website: Joi.string().allow('').optional(),
  yearFounded: Joi.number().optional(),
  industry: Joi.array().optional(),
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
  primaryAddress: Joi.object(),
  industry: Joi.array()
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

async function register(user, form, member) {
  if(!user || !form){
    return;
  }

  await companySchema.validate(form, {abortEarly: false});
  let company = null;

  if(form.partyType==='COMPANY'){
    company = await feedService.registerCompany(user.id, form);
  } else {
    company = await feedService.registerInstitute(user.id, form);
  }
  console.log('feed company', company);

  let savedCompany;
  if(company){
    const industries = await industryService.findByIds(form.industry);
    savedCompany = await new Company({
      name: company.name,
      legalName: company.legalName,
      companyId: company.id,
      partyType: company.partyType,
      type: company.type,
      createdBy: user.id,
      email: form.email ? form.email : (user.primaryEmail && user.primaryEmail.value ? user.primaryEmail.value : ''),
      countryCode: form.countryCode,
      phoneNumber: form.phoneNumber,
      primaryAddress: form.primaryAddress,
      about: form.about,
      yearFounded: form.yearFounded,
      mission: form.mission,
      website: form.website,
      size: form.size,
      industry: industries,
    }).save();
    console.log('saved company', savedCompany);

    if(savedCompany){

      const role = await roleService.getDefaultAdminRole();
      let memberForm = {
        createdBy: user.id,
        company: savedCompany._id,
        companyId: company.id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        countryCode: form.countryCode,
        phone: form.phoneNumber,
        email: form.email ? form.email : (user.primaryEmail && user.primaryEmail.value ? user.primaryEmail.value : ''),
        timezone: user.timezone?user.timezone:'',
        preferTimeFormat: '',
        userId: user.id,
        role: role._id,
        isOwner: true
      }

      console.log('form', form)
      console.log('memberForm', memberForm)
      member = await memberService.add(memberForm);
      console.log('member', member);

      if(member) {
        //ToDo: Move to EventEmitter
        try {
          const messagingUser = await messagingService.createUser({
            firstName: memberForm.firstName,
            lastName: memberForm.lastName,
            email: memberForm.email,
            userId: memberForm.userId
          });
          if (messagingUser) {
            member.messengerId = messagingUser._id;
            member.save();
          }
        } catch (err) {
          console.lg('CREATE MESSAGE USER: ', err.message)
        }

        //ToDo: Move to EventEmitter
        try {
          const calendarUser = await calendarService.createUser({
            firstName: memberForm.firstName,
            lastName: memberForm.lastName,
            email: memberForm.email,
            userId: memberForm.userId,
            messengerId: member.messengerId || null
          });
          if (calendarUser) {
            member.calendarUserId = calendarUser._id;
            const newCalendar = await calendarService.createCalendar({
              userId: member.userId,
              timezone: member.timezone
            });
            if (newCalendar) {
              member.calendarId = newCalendar._id;
            }
            member.save();
          }
        } catch (err) {
          console.log('CREATE CALENDAR: ', err.message)
        }
      }
      //ToDo: Move to EventEmitter
      try {
        const customerForm = {
          partyId: company.id,
          partyType: company.partyType,
          name: company.name,
          phone: form.phoneNumber,
          email: form.email,
          address: {
            address1: form.primaryAddress?.address1,
            address2: form.primaryAddress?.address2,
            city: form.primaryAddress?.city,
            state: form.primaryAddress?.state,
            country: form.primaryAddress?.country,
            postalCode: form.primaryAddress?.postalCode,
          }
        }
        const customer = await paymentService.addCustomer(customerForm);

        if (customer) {
          savedCompany.customerId = customer.id;
        }

      } catch (err) {
        console.log();
      }

      await savedCompany.save();


      //ToDo: Move to EventEmitter
      // Generate welcome and send email
      const emailContent = await generateWelcomeEmail({name:member.firstName + " " + member.lastName, email:member.email}, savedCompany);
      await messagingService.sendMail(user.messengerId, user.userId, emailContent);
      console.log('member', member)
    }
  }

  return savedCompany;
}

async function update(companyId, member, form) {
  console.log(form)
  if(!companyId || !member || !form){
    return;
  }

  const {error} = await feedCompanySchema.validate(form);
  let company = await findByCompanyId(companyId);


  if(company){
    let savedCompany;

    if(company.partyType==='COMPANY'){
      savedCompany = await feedService.updateCompany(companyId, member.userId, form);
    } else {
      savedCompany = await feedService.updateInstitute(companyId, member.userId, form);
    }

    if(savedCompany){
      company.name = form.name;
      company.legalName = form.legalName;
      company.type = form.type;
      company.primaryAddress = form.primaryAddress;
      company.website = form.website;
      company.updatedBy = member._id;
      company.updatedDate = Date.now();
      company.industry = form.industry;
      company.email = form.email;
      company.countryCode = form.countryCode,
      company.phoneNumber = form.phoneNumber;
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


function findByCompanyId(companyId) {
  if(!companyId){
    return;
  }

  let company = Company.findOne({companyId});

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


async function findEmploymentTitlesCountByCompanyId(companyId, filter, query) {
  let data = null;

  if(!filter){
    return [];
  }

  let match = {};
  let and = [];
  let page = query.page;
  let size = query.size;
  let skip = query.size * query.page;
  let sort = {};
  sort[query.sortBy] = query.direction=='DESC'?-1:1;

  if(companyId) {
    and.push({company: companyId});
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

function findSalariesByCompanyId(companyId, filter, query) {
  let data = null;

  if(!companyId || !query){
    return [];
  }

  let match = {};
  let and = [];
  let page = query.page;
  let size = query.size;
  let skip = query.size * query.page;
  let sort = {};
  sort[query.sortBy] = query.direction=='DESC'?-1:1;

  if(companyId) {
    and.push({company: companyId});
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

  data = Salary.aggregate([
    {$match: {$and: and}},
    {$group: {_id: {employmentTitle: '$employmentTitle', basePayPeriod: '$basePayPeriod', country: '$country'}, basePayPeriod: {$first: '$basePayPeriod'}, currency: {$first: '$currency'}, avgBaseSalary: {'$avg': '$baseSalary'}, minBaseSalary: {'$min': '$baseSalary'}, maxBaseSalary: {'$max': '$baseSalary'}, avgAdditionalIncome: {'$avg': {'$add': ["$cashBonus", "$stockBonus", "$profitSharing", "$commission", "$tip"]}}, count: {'$sum': 1}}},
    {$project: {_id: 0, employmentTitle: '$_id.employmentTitle', country: '$_id.country', basePayPeriod: '$basePayPeriod', currency: '$currency', count: 1, avgTotalSalary:{'$avg': {'$add': ['$avgBaseSalary', '$avgAdditionalIncome']}}, avgBaseSalary: 1, minBaseSalary: 1, maxBaseSalary: 1, avgAdditionalIncome: 1}},
    {$sort: sort},
    {$skip: skip},
    {$limit: size}
  ]);

  return data;
}


//TODO: Refactor
async function findCompanySalaryByEmploymentTitle(companyId, employmentTitle, country) {
  let result = null;

  if (!companyId || !employmentTitle) {
    return null;
  }

  country = country ? country : 'US';

  result = await CompanySalaryHistory.findOne({
    company: companyId,
    employmentTitle: {$regex: new RegExp("^" + employmentTitle.toLowerCase(), "i")},
    country: country
  });
  var diffDays = 0;

  if (result){
    let date = new Date();
    var differenceTime = date.getTime() - result.createdDate;
    diffDays = differenceTime / (1000 * 3600 * 24);
  }

  if(!result || diffDays>7){
    let group = {
      _id: {employmentTitle: '$employmentTitle', country: '$country', company: '$company', gender: '$gender'},
      avgTotalPay: {$avg: {$sum: ['$baseSalary', '$additionalIncome', '$cashBonus', '$stockBonus', '$profitSharing', '$tip', '$commision']}},
      minBaseSalary: {'$min': '$baseSalary'},
      maxBaseSalary: {'$max': '$baseSalary'},
      avgBaseSalary: {'$avg': '$baseSalary'},
      minCashBonus: {'$min': '$cashBonus'},
      maxCashBonus: {'$max': '$cashBonus'},
      avgCashBonus: {'$avg': '$cashBonus'},
      noCashBonus: {$sum: {$cond: {if: {$gt: ['$cashBonus', 0]}, then: 1, else: 0}}},
      minStockBonus: {'$min': '$stockBonus'},
      maxStockBonus: {'$max': '$stockBonus'},
      avgStockBonus: {'$avg': '$stockBonus'},
      noStockBonus: {$sum: {$cond: {if: {$gt: ['$stockBonus', 0]}, then: 1, else: 0}}},
      minProfitSharing: {'$min': '$profitSharing'},
      maxProfitSharing: {'$max': '$profitSharing'},
      avgProfitSharing: {'$avg': '$profitSharing'},
      noOfProfitSharing: {$sum: {$cond: {if: {$gt: ['$profitSharing', 0]}, then: 1, else: 0}}},
      minTip: {'$min': '$tip'},
      maxTip: {'$max': '$tip'},
      avgTip: {'$avg': '$tip'},
      noOfTip: {$sum: {$cond: {if: {$gt: ['$tip', 0]}, then: 1, else: 0}}},
      minCommision: {'$min': '$commision'},
      maxCommision: {'$max': '$commision'},
      avgCommision: {'$avg': '$commision'},
      noOfCommision: {$sum: {$cond: {if: {$gt: ['$commision', 0]}, then: 1, else: 0}}},
      count: {'$sum': 1}
    };

    let group2 = {
      _id: {gender: '$_id.gender'},
      avgTotalPay: {$first: '$avgTotalPay'},
      avgBaseSalary: {$first: '$avgBaseSalary'},
      count: { $first: '$count' },
      genders: {
        $push: {
          gender: '$_id.gender'
        }
      }
    };

    let data = await CompanySalary.aggregate([
      {$match: {company: companyId, employmentTitle: {$regex: new RegExp("^" + employmentTitle.toLowerCase(), "i")}}},
      {
        $group: group
      },
      {
        $project: {
          _id: 0,
          company: '$_id.company',
          employmentTitle: '$_id.employmentTitle',
          city: '$_id.city',
          state: '$_id.state',
          country: '$_id.country',
          baseSalary: '$baseSalary',
          avgTotalPay: {$floor: '$avgTotalPay'},
          minBaseSalary: 1,
          maxBaseSalary: 1,
          avgBaseSalary: {$floor: '$avgBaseSalary'},
          minAdditionalIncome: 1,
          maxAdditionalIncome: 1,
          avgAdditionalIncome: {$floor: '$avgAdditionalIncome'},
          minCashBonus: 1,
          maxCashBonus: 1,
          avgCashBonus: {$floor: '$avgCashBonus'},
          noCashBonus: 1,
          minStockBonus: 1,
          maxStockBonus: 1,
          avgStockBonus: {$floor: '$avgStockBonus'},
          noStockBonus: 1,
          minProfitSharing: 1,
          maxProfitSharing: 1,
          avgProfitSharing: {$floor: '$avgProfitSharing'},
          noOfProfitSharing: 1,
          minTip: 1,
          maxTip: 1,
          avgTip: {$floor: '$avgTip'},
          noOfTip: 1,
          minCommision: 1,
          maxCommision: 1,
          avgCommision: {$floor: '$avgCommision'},
          noOfCommision: 1,
          genders: 1,
          count: '$count'
        }
      }
    ]);

    if (data.length) {
      data = data[0];
      data.createdDate = Date.now();
      data.lastUpdatedDate = Date.now();

      if(result){
        result = _.merge(result, data);
        result = result.save();
      } else {
        result = await new CompanySalaryHistory(data).save();
      }


    } else {
      result = null;
    }

  }


  return result;
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


function findAllCompanySalaryTop5Locations(company) {
  let data = null;

  if(!company){
    return;
  }

  data = CompanySalary.aggregate([
    {$match: {company: company} },
    {$group: {_id: {city: '$city', state: '$state', country: '$country'}, count:{$sum:1}}},
    {$project: {_id: 0, city: '$_id.city', state: '$_id.state', country: '$_id.country', count: 1}}
  ]).sort({count: -1});

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



async function findAllCompanyByMemberId(memberId) {
  let data = null;

  if(!memberId){
    return;
  }

  data = await Company.aggregate([
    { $match: {'members.member': { $in: [memberId] }}},
    {
      $lookup: {
        from: 'roles',
        localField: 'members.role',
        foreignField: '_id',
        as: 'role',
      },
    },
    {$unwind: {path: '$role', preserveNullAndEmptyArrays: true} },
  ]);

  return data;
}


async function getMembers(companyId) {
  let data = null;
  if(!companyId){
    return;
  }
  let members = [];
  const company = await Company.findOne({companyId}).populate({
    path: 'members.member',
    model: 'Member'
  }).populate({
    path: 'members.role',
    model: 'Role'
  });

  members = _.reduce(company.members, function (res, o){
    o.member.role = o.role;
    res.push(o.member);
    return res;
  }, []);

  return  members;
}


async function getNoOfJobs(company) {
  let count = 0;
  if(!company){
    return count;
  }

  const result = await JobRequisition.aggregate([
    { $match: {company} },
    { $group: { _id: "$company", count: { $sum: 1 } } },
    { $project: {_id: 0, count: 1}}
  ]);

  if(result && result.length > 0){
    count = result[0].count;
  }
  return  count;
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

async function getCompanyTopReviews(size=9) {
  let data = [];
  data = await CompanyReview.aggregate([
    {$group: {_id: '$company', count: {$sum: 1}, rating: {$avg: '$rating'}}},
    {$project: {_id: 0, id: '$_id', rating: 1, count: 1}}
  ]).sort({rating: -1}).limit(size);

  return data;
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


  //ToDo: Temporary commenting out to get other api working.  Stat is calling this
  // if(reactions){
  //   let reviews = [];
  //   for(react of reactions){
  //     console.log(react)
  //     let review = await CompanyReview.findOne({companyReviewId: react.companyReviewId}, {reviewTitle: 1, rating:1});
  //     if(review){
  //       reviews.push({isPositive: review.rating>2?true:false, comment: review.reviewTitle, count: react.count});
  //     }
  //
  //   }
  //   data = reviews;
  // }

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
        from:"userimpressions",
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
    {$group: {_id: {employmentTitle: '$employmentTitle', jobFunction: '$jobFunction'}, jobFunction: {$first: '$jobFunction'}, avgBaseSalary: {'$avg': '$baseSalary'}, count: {'$sum': 1}}},
    {$project: {_id: 0, employmentTitle: '$_id.employmentTitle', avgBaseSalary: 1, jobFunction: 1,count: 1}}
  ]);

  data = _.groupBy(data, 'jobFunction');

  let jobFunctions = await feedService.findJobfunction('', [],  locale);

  jobFunctions = _.reduce(jobFunctions, function(res, val, key) {

    let item = {id: val.id, name: val.name, shortCode: val.shortCode, count: 0, avgBaseSalary:0, list: []};
    let jobFunction = data[val.shortCode];

    if(jobFunction){
      item.count = _.sumBy(jobFunction, 'count');
      let total = 0;
      for(let i = 0; i< jobFunction.length; i++){
        total+=jobFunction[i].avgBaseSalary;
      }

      item.avgBaseSalary = total/jobFunction.length;
      item.list = jobFunction;

    }



    res.push(item);
    return res;
  }, []);
  return jobFunctions;
}


async function groupSalaryByLocations(company, locale) {
  let data = null;

  if(!company){
    return [];
  }

  let match = {};
  data = await CompanySalary.aggregate([
    {$match: {company: company}},
    {$group: {_id: {city: '$city', state: '$state', country: '$country'}, count: {'$sum': 1}}},
    {$project: {_id: 0, city: '$_id.city', state: '$_id.state', country: '$_id.country', count: 1}}
  ]);

  data = _.groupBy(data, 'country');

  data = _.reduce(data, function(res, val, key) {

    res[key] = _.groupBy(val, function(item) {
      return item.state?item.state:'UNKNOWN';
    });

    return res;
  }, {});
  return data;
}


async function groupSalaryByGender(company, locale) {
  let data = null;

  if(!company){
    return [];
  }

  let match = {};
  data = await CompanySalary.aggregate([
    {$match: {company: company}},
    {$group: {_id: {employmentTitle: '$employmentTitle', gender: '$gender'}, avgBaseSalary: {'$avg': '$baseSalary'}, count: {'$sum': 1}}},
    {$project: {_id: 0, gender: '$_id.gender', employmentTitle: '$_id.employmentTitle', avgBaseSalary: 1,count: 1}}
  ]);

  data = _.groupBy(data, 'jobFunction');

  let jobFunctions = await feedService.findJobfunction('', [],  locale);

  jobFunctions = _.reduce(jobFunctions, function(res, val, key) {

    let item = {id: val.id, name: val.name, shortCode: val.shortCode, count: 0, avgBaseSalary:0, list: []};
    let jobFunction = data[val.shortCode];

    if(jobFunction){
      item.count = _.sumBy(jobFunction, 'count');
      let total = 0;
      for(let i = 0; i< jobFunction.length; i++){
        total+=jobFunction[i].avgBaseSalary;
      }

      item.avgBaseSalary = total/jobFunction.length;
      item.list = jobFunction;

    }



    res.push(item);
    return res;
  }, []);
  return jobFunctions;
}

function getCompanyLatestSalaries(company) {
  let data = null;

  if(!company){
    return [];
  }


  data = CompanySalary.aggregate([
    {$match: {company: company}},
    {$group: {_id: {employmentTitle: '$employmentTitle', basePayPeriod: '$basePayPeriod', country: '$country'}, basePayPeriod: {$first: '$basePayPeriod'}, currency: {$first: '$currency'}, avgTotalSalary: {'$avg': {'$add': ['$baseSalary', '$additionalIncome', '$cashBonus', '$commision', '$profitSharing', '$stockBonus']}}, avgBaseSalary: {'$avg': '$baseSalary'}, minBaseSalary: {'$min': '$baseSalary'}, maxBaseSalary: {'$max': '$baseSalary'}, avgAdditionalIncome: {'$avg': '$additionalIncome'}, count: {'$sum': 1}}},
    {$project: {_id: 0, employmentTitle: '$_id.employmentTitle', country: '$_id.country', basePayPeriod: '$basePayPeriod', currency: '$currency', count: 1, avgTotalSalary:1, avgBaseSalary: 1, minBaseSalary: 1, maxBaseSalary: 1, avgAdditionalIncome: 1}},
    {$sort: {createdDate: 1}},
    {$limit: 3}
  ]);

  return data;
}

async function updateBenefits(companyId, benefits) {
  let data = null;

  if(!companyId){
    return [];
  }


  let company = await Company.findOne({companyId: companyId});
  company.benefits = benefits;
  company = await company.save();
  data = { benefits: benefits };

  return data;
}


module.exports = {
  add:add,
  register,
  update,
  findById,
  findByCompanyId,
  findByCompanyIds,
  getMembers,
  getNoOfJobs,
  getCreditRemaining,
  addCompanySalary,
  findEmploymentTitlesCountByCompanyId,
  findSalariesByCompanyId,
  findCompanySalaryByEmploymentTitle,
  findAllCompanySalaryLocations,
  findAllCompanySalaryTop5Locations,
  findAllCompanySalaryEmploymentTitles,
  findAllCompanySalaryJobFunctions,
  findAllCompanyByMemberId,
  addCompanyReview,
  getCompanyTopReviews,
  findAllCompanyReviewLocations,
  findCompanyReviewHistoryByCompanyId,
  findCompanyReviewsByCompanyId,
  findTop3Highlights,
  addCompanyReviewReport,
  getCompanyCandidateInsights,
  groupSalaryByJobFunctions,
  groupSalaryByLocations,
  groupSalaryByGender,
  getCompanyLatestSalaries,
  updateBenefits
}
