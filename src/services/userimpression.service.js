const _ = require('lodash');
const {ObjectId} = require('mongodb');
const config = require('../config/config');
const subjectTypeEnum = require('../const/subjectType');
const sourceType = require('../const/sourceType');

const UserImpression = require('../models/userimpression.model');
const AdImpression = require('../models/adimpression.model');
const Ad = require('../models/ad.model');
const adService = require('./ad.service');
const JobImpression = require('../models/jobimpression.model');


async function add(userId, subject, subjectType, token, viewSource, viewType) {
  let data = null;
  let company;
  let job;

  if(!userId || !subject || !subjectType){
    return;
  }

  if(subjectType === subjectTypeEnum.JOB){
    company = subject.company;
    job = subject;
  }else{
     company = subject._id;
  }


  console.log(viewSource, viewType, token);
  let userImpression = await findViewByUserIdSubjectIdAndType(userId, subject._id, viewType);
  if(!userImpression) {
    userImpression = await new UserImpression({partyId: userId, company: company, subject: subject._id, subjectType: subjectType, token: token, source: viewSource, type: viewType}).save();
  } else {
    userImpression.viewCount++;
    await userImpression.save();
  }

  if(subjectType === subjectTypeEnum.JOB){
    const jobImpression = await updateJobImpressionCount(subject._id, viewType, 1);
    if(!subject.impression){
      subject.impression = jobImpression._id;
      await subject.save();
    }
  }

  if((_.includes([sourceType.JOB_SEARCH, sourceType.JOB_DETAIL, sourceType.EMAIL], viewSource)) && (ObjectId.isValid(token)) && viewType === "VIEWED"){
    let ad = await adService.findById(new ObjectId(token));

    if(ad && !_.isEmpty(ad)){
      const millisecondsInADay = 86400000;
      let currentDate = new Date();
      let startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
      const costPerClick = parseFloat(config.ads.cost_per_click) || 0.50;
      console.log('ad', ad)
      const adimpression = await AdImpression.findOneAndUpdate(
        { adId: ad._id, timestamp: { $gte: startOfDay, $lt: startOfDay + millisecondsInADay } },
        {
          $inc: { clicks: 1, spend: costPerClick },
          $setOnInsert: { timestamp: new Date() }
        },
        { upsert: true, new: true }
      );

      console.log('adimpression', adimpression);
      await Ad.findByIdAndUpdate(
        ad._id,
        { $inc: { totalSpend: costPerClick } },
        { new: true }
      );
    }
  }


  return userImpression;
}

async function removeImpression(partyId, subject, subjectType, type){
  let userSaves = await findViewByUserIdSubjectIdAndType(partyId, subject, type);
  let result;
  if(userSaves) {
    result = await UserImpression.findByIdAndDelete(userSaves._id);
    if(subjectType === 'JOB'){
      await updateJobImpressionCount(subject, type, -1);
    }
  }

  return result;
}

async function updateJobImpressionCount(jobId, type, incrementBy) {
  const jobImpression = await JobImpression.findOneAndUpdate(
    { jobId: jobId },
    { $inc: { [`${type.toLowerCase()}`]: incrementBy } },
    { new: true, upsert: true }
  );
  return jobImpression;
}

async function findJobViewByUserId(userId, size) {
  let data = null;

  if(!userId){
    return;
  }

  const limit = size ? size : 4;

  const result = await UserImpression.aggregate([
    { $match: { partyId: userId } },
    {$lookup:{
        from:"jobrequisitions",
        let:{id:"$subject"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$id"]}}},
          {
            $lookup: {
              from: 'companies',
              localField: 'company',
              foreignField: '_id',
              as: 'company',
            },
          },
          { $unwind: {path: '$company', preserveNullAndEmptyArrays: true} },
        ],
        as: 'job'
      }},
    { $unwind: {path: '$job', preserveNullAndEmptyArrays: true} },
    { $project: { token: 1, job: 1} },
    { $sort: { createdDate: 1} },
    { $limit: limit }
  ]);


  return _.reduce(result, function(res, o){
    if(o.job){
      const {_id, title, token, company, city, state, country, noOfApplied, noOfViews, jobId} = o.job;
      res.push({_id, title, jobId, token, company: {_id: company?._id, name: company?.name, avatar: company?.avatar || ''}, city, state, country, noOfViews, noOfApplied});
    }

    return res;
  }, []);
}

async function findUniqueJobsViewedByUserId(userId, options){
  const aggregate = UserImpression.aggregate([
    { $match: { partyId: parseInt(userId), subjectType: 'JOB' } },
    {
      $sort: { createdDate: -1 }
    },
    {
      $group: {
        _id: '$subject',
        latestEntry: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: { newRoot: '$latestEntry' }
    },
    {
      $lookup: {
        from: "jobrequisitions",
        let: { job: '$subject' },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$job"] } } },
          {
            $lookup: {
              from: 'companies',
              localField: "company",
              foreignField: "_id",
              as: "company"
            }
          },
          { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "userimpressions",
              let: { jobId: "$_id" },
              pipeline: [
                { $match: { $expr: { $and: [
                  { $eq: ["$partyId", parseInt(userId)] },
                  { $eq: ["$subject", "$$jobId"] },
                  { $eq: ["$type", "SAVED"] }
                ] } } }
              ],
              as: "savedImpression"
            }
          },
          {
            $addFields: {
              hasSaved: { $gt: [{ $size: "$savedImpression" }, 0] }
            }
          }
        ],
        as: 'job'
      }
    },
    { $unwind: '$job' }
  ]);

  return await UserImpression.aggregatePaginate(aggregate, options);
}

function findJobViewByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(!userId || !jobId){
    return;
  }

  return UserImpression.findOne({partyId: userId, job: jobId});
}

function findViewByUserIdSubjectIdAndType(userId, subjectId, type) {
  let data = null;

  if(!userId || !subjectId){
    return;
  }
  // Get the current date and set the time to the start of the day (00:00:00)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Get the end of the current day (23:59:59)
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);


  return UserImpression.findOne({partyId: userId, subject: subjectId, createdDate: {$gte: startOfDay, $lte: endOfDay}, type: type});
}

function findByUserIdSubjectIdAndType(userId, subjectId, type) {
  return UserImpression.findOne({
    partyId: userId,
    subject: subjectId,
    type: type
  })
  .sort({ createdDate: -1 })
  .exec();
}

function findByUserIdSubjectTypeAndType(userId, subjectType, type){
  return UserImpression.find({
    partyId: userId,
    subjectType: subjectType,
    type: type
  })
  .sort({ createdDate: -1 })
  .exec();
}

async function findMostViewed() {
  let data = null;


  let group = {
    _id: {
      _id: '$job._id',
      job: '$job.job',
      title: '$job.title',
      department: '$job.department', city: '$jobId.city', state: '$jobId.state', country: '$jobId.country', company: '$jobId.company',
      status: '$job.status', description: '$jobId.description',
      minMonthExperience: '$job.minMonthExperience',
      maxMonthExperience: '$job.maxMonthExperience',
      expirationDate: '$job.expirationDate',
      salaryRangeLow: '$job.salaryRangeLow',
      salaryRangeHigh: '$job.salaryRangeHigh',
      salaryFixed: '$job.salaryFixed',
      jobFunction: '$job.jobFunction',
      responsibilities:'$job.responsibilities',
      qualifications: '$job.qualifications',
      minimumQualifications: '$job.minimumQualifications',
      skills: '$job.skills',
      industry: '$job.industry',
      createdDate: '$job.createdDate',
      hasSaved: '$job.hasSaved',
    },
    count: {'$sum': 1}
  };

  data = await UserImpression.aggregate([
    { $lookup:{
        from:"jobrequisitions",
        let:{job: '$job'},
        pipeline:[
          {$match:{$expr:{$eq:["$$job","$_id"]}}},
          {
            $lookup: {
              from: 'departments',
              localField: "department",
              foreignField: "_id",
              as: "department"
            }
          },
          // { $unwind: '$department'}
        ],
        as: 'job'
      }},
    { $unwind: '$job'},
    // { $lookup: {from: 'departments', localField: 'department', foreignField: '_id', as: 'department' } },
    // { $unwind: '$department'},
    { $group: group },

    { $limit: 10 },
    {
      $project: {
        _id: 0,
        _id: '$_id._id',
        jobId: '$_id.jobId',
        title: '$_id.title',
        department: '$_id.department',
        city: '$_id.city',
        state: '$_id.state',
        country: '$_id.country',
        company: '$_id.company',
        noOfViews: '$count',
        status: '$_id.status',
        hasSaved: '$_id.hasSaved',
        createdDate: '$_id.createdDate',
        description: '',
        minMonthExperience: '',
        maxMonthExperience: '',
        expirationDate: '',
        salaryRangeLow: '',
        salaryRangeHigh: '',
        salaryFixed: '',
        jobFunction: '',
        responsibilities: '',
        qualifications: [],
        minimumQualifications: [],
        skills: [],
        industry: []
      }
    }
  ]);

  return _.orderBy(data, ['noOfViews'], ['desc']);
}


async function findMostViewedByCompany(company) {
  let data = null;

  if(!company){
    return;
  }

  let group = {
    _id: {
      _id: '$jobId._id',
      jobId: '$jobId.jobId',
      title: '$jobId.title',
      department: '$jobId.department', city: '$jobId.city', state: '$jobId.state', country: '$jobId.country', company: '$jobId.company',
      status: '$jobId.status', description: '$jobId.description',
      minMonthExperience: '$jobId.minMonthExperience',
      maxMonthExperience: '$jobId.maxMonthExperience',
      expirationDate: '$jobId.expirationDate',
      salaryRangeLow: '$jobId.salaryRangeLow',
      salaryRangeHigh: '$jobId.salaryRangeHigh',
      salaryFixed: '$jobId.salaryFixed',
      jobFunction: '$jobId.jobFunction',
      responsibilities:'$jobId.responsibilities',
      qualifications: '$jobId.qualifications',
      minimumQualifications: '$jobId.minimumQualifications',
      skills: '$jobId.skills',
      industry: '$jobId.industry',
      createdDate: '$jobId.createdDate',
      hasSaved: '$jobId.hasSaved'
    },
    count: {'$sum': '$viewCount'}
  };

  data = await UserImpression.aggregate([
    { $match: {company: company, subjectType: subjectTypeEnum.JOB, type: 'VIEWED'} },
    { $lookup:{
        from:"jobrequisitions",
        let:{jobId: '$subject'},
        pipeline:[
          {$match:{$expr:{$eq:["$$jobId","$_id"]}}},
          {$match: {endDate: {$gt: Date.now()}}},
          { $match: { status: { $eq: 'ACTIVE' } } },
          {
            $lookup: {
              from: 'departments',
              localField: "department",
              foreignField: "_id",
              as: "department"
            }
          },
          // { $unwind: '$department'}
        ],
        as: 'jobId'
      }},
    { $unwind: '$jobId'},
    // { $lookup: {from: 'departments', localField: 'department', foreignField: '_id', as: 'department' } },
    // { $unwind: '$department'},
    { $group: group },

    { $limit: 10 },
    {
      $project: {
        _id: 0,
        _id: '$_id._id',
        jobId: '$_id.jobId',
        title: '$_id.title',
        department: '$_id.department',
        city: '$_id.city',
        state: '$_id.state',
        country: '$_id.country',
        company: '$_id.company',
        noOfViews: '$count',
        status: '$_id.status',
        hasSaved: '$_id.hasSaved',
        createdDate: '$_id.createdDate',
        description: '',
        minMonthExperience: '',
        maxMonthExperience: '',
        expirationDate: '',
        salaryRangeLow: '',
        salaryRangeHigh: '',
        salaryFixed: '',
        jobFunction: '',
        responsibilities: '',
        qualifications: [],
        minimumQualifications: [],
        skills: [],
        industry: []
      }
    }
  ]);

  return _.orderBy(data, ['noOfViews'], ['desc']);
}

async function getCompanyInsight(company, duration, type) {

  if(!company || !duration || !type){
    return;
  }

  let change=0;
  let currentStartDate, previousStartDate, previousEndDate;
  let group = {
    _id: null,
    free: { $sum: { $cond: [{ $or: [{ $eq: ["$token", null] }, { $eq: ["$token", ""] }] }, 1, 0] } },
    paid: { $sum: { $cond: [{ $and: [{ $ne: ["$token", null] }, { $ne: ["$token", ""] }] }, 1, 0] } }
  };

  if(duration=='1W'){
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 7);

    group._id= {day: {$dayOfMonth: '$createdDate'}, month: { $month: "$createdDate" } };
  }else if(duration=='1M'){
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 30);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 30);

    group._id= {day: {$dayOfMonth: '$createdDate'}, month: { $month: "$createdDate" } };
  } else if(duration=='3M'){
    currentStartDate = new Date();
    currentStartDate.setMonth(currentStartDate.getMonth() - 3);
    currentStartDate.setDate(1);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setMonth(previousStartDate.getMonth() - 3);

    group._id= {month: { $month: "$createdDate" } };
  } else if(duration=='6M'){
    currentStartDate = new Date();
    currentStartDate.setMonth(currentStartDate.getMonth() - 6);
    currentStartDate.setDate(1);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setMonth(previousStartDate.getMonth() - 6);

    group._id= {month: { $month: "$createdDate" } };
  }
  previousEndDate = new Date(currentStartDate);

  let currentResult  = await UserImpression.aggregate([
    {$match: {company: company, createdDate: {$gt: currentStartDate, $lt: new Date()}, type: type}},
    {
      $group: group
    }
  ]);

  let previousResult = await UserImpression.aggregate([
    { $match: { company: company, createdDate: { $gte: previousStartDate, $lt: previousEndDate }, type: type } },
    { $group: group }
  ]);

  let currentData = processResult(currentResult, currentStartDate, new Date(), duration);
  let previousData = processResult(previousResult, previousStartDate, previousEndDate, duration);

  let currentTotal = _.sumBy(currentData, item => item.data.paid + item.data.free);
  let previousTotal = _.sumBy(previousData, item => item.data.paid + item.data.free);

  if (currentTotal > 0 && previousTotal>= 0) {
    change = ((currentTotal - previousTotal) / currentTotal) * 100;
  }

  return { type, total: currentTotal, change: change.toFixed(2), data: currentData.reverse() };
}

const processResult = (result, startDate, endDate, duration) => {
  let data = [];
  let date = new Date(endDate);

  if (duration === '1M') {
    for (let i = 1; i <= 30; i++) {
      let item = {};
      let found = _.find(result, { _id: { day: date.getDate(), month: date.getMonth() + 1 } });
      item = {
        date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1),
        data: {
          paid: found ? found.paid : 0,
          free: found ? found.free : 0,
          total: found? found.free + found.paid : 0
        }
      };
      data.push(item);
      date.setDate(date.getDate() - 1);
    }
  }else if(duration === '1W'){
    for (let i = 1; i <= 7; i++) {
      let item = {};
      let found = _.find(result, { _id: { day: date.getDate(), month: date.getMonth() + 1 } });
      item = {
        date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1),
        data: {
          paid: found ? found.paid : 0,
          free: found ? found.free : 0,
          total: found? found.free + found.paid : 0
        }
      };
      data.push(item);
      date.setDate(date.getDate() - 1);
    }
  } else {
    let noOfItems = duration === '3M' ? 3 : duration === '6M' ? 6 : 0;
    for (let i = 0; i <= noOfItems; i++) {
      let item = {};
      let found = _.find(result, { _id: { month: date.getMonth() + 1 } });
      item = {
        date: parseInt(date.getMonth()) + 1 + '/' + date.getFullYear(),
        data: {
          paid: found ? found.paid : 0,
          free: found ? found.free : 0,
          total: found? found.free + found.paid : 0
        }
      };
      data.push(item);
      date.setMonth(date.getMonth() - 1);
    }
  }
  return data;
};

const processResult2 = (result, startDate, endDate, duration) => {
  let data = [];
  let date = new Date(endDate);

  if (duration === '1M') {
    for (let i = 1; i <= 30; i++) {
      let item = {};
      let found = _.find(result, { _id: { day: date.getDate(), month: date.getMonth() + 1 } });
      item = { date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: { paid: 0, free: found ? found.count : 0 } };
      data.push(item);
      date.setDate(date.getDate() - 1);
    }
  }else if(duration === '1W'){
    for (let i = 1; i <= 7; i++) {
      let item = {};
      let found = _.find(result, { _id: { day: date.getDate(), month: date.getMonth() + 1 } });
      item = { date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: { paid: 0, free: found ? found.count : 0 } };
      data.push(item);
      date.setDate(date.getDate() - 1);
    }
  } else {
    let noOfItems = duration === '3M' ? 3 : duration === '6M' ? 6 : 0;
    for (let i = 0; i <= noOfItems; i++) {
      let item = {};
      let found = _.find(result, { _id: { month: date.getMonth() + 1 } });
      item = { date: parseInt(date.getMonth()) + 1 + '/' + date.getFullYear(), data: { paid: 0, free: found ? found.count : 0 } };
      data.push(item);
      date.setMonth(date.getMonth() - 1);
    }
  }
  return data;
};
async function getJobInsight(company, job, duration, type) {

  if(!company || !job || !duration || !type){
    return;
  }

  let change=0;
  let currentStartDate, previousStartDate, previousEndDate;
  let group = {
    _id: null,
    free: { $sum: { $cond: [{ $or: [{ $eq: ["$token", null] }, { $eq: ["$token", ""] }] }, 1, 0] } },
    paid: { $sum: { $cond: [{ $and: [{ $ne: ["$token", null] }, { $ne: ["$token", ""] }] }, 1, 0] } }
  };

  if(duration=='1W'){
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 7);

    group._id= {day: {$dayOfMonth: '$createdDate'}, month: { $month: "$createdDate" } };
  }else if(duration=='1M'){
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 30);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 30);

    group._id= {day: {$dayOfMonth: '$createdDate'}, month: { $month: "$createdDate" } };
  } else if(duration=='3M'){
    currentStartDate = new Date();
    currentStartDate.setMonth(currentStartDate.getMonth() - 3);
    currentStartDate.setDate(1);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setMonth(previousStartDate.getMonth() - 3);

    group._id= {month: { $month: "$createdDate" } };
  } else if(duration=='6M'){
    currentStartDate = new Date();
    currentStartDate.setMonth(currentStartDate.getMonth() - 6);
    currentStartDate.setDate(1);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setMonth(previousStartDate.getMonth() - 6);

    group._id= {month: { $month: "$createdDate" } };
  }
  previousEndDate = new Date(currentStartDate);

  let currentResult  = await UserImpression.aggregate([
    {$match: {company: company, subject: job, createdDate: {$gt: currentStartDate, $lt: new Date()}, type: type}},
    {
      $group: group
    }
  ]);

  let previousResult = await UserImpression.aggregate([
    { $match: { company: company, subject: job, createdDate: { $gte: previousStartDate, $lt: previousEndDate }, type: type } },
    { $group: group }
  ]);

  let currentData = processResult(currentResult, currentStartDate, new Date(), duration);
  let previousData = processResult(previousResult, previousStartDate, previousEndDate, duration);

  let currentTotal = _.sumBy(currentData, item => item.data.paid + item.data.free);
  let previousTotal = _.sumBy(previousData, item => item.data.paid + item.data.free);

  if (currentTotal > 0 && previousTotal>= 0) {
    change = ((currentTotal - previousTotal) / currentTotal) * 100;
  }

  return { type, total: currentTotal, change: change.toFixed(2), data: currentData.reverse() };
}

async function getJobInsightByType(jobId, type, duration) {

  if(!jobId && !type && !duration){
    return;
  }

  let currentStartDate, previousStartDate, previousEndDate;

  let change=0;
  let group = {
    _id: null,
    viewers: {$push: '$$ROOT.partyId'},
    count: {'$sum': 1}
  };

  if(duration=='1M'){
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 30);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 30);

    group._id= {day: {$dayOfMonth: '$createdDate'}, month: { $month: "$createdDate" } };
  }else if(duration=='1W'){
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 7);

    group._id= {day: {$dayOfMonth: '$createdDate'}, month: { $month: "$createdDate" } };
  }
  previousEndDate = new Date(currentStartDate);

  let currentResult = await UserImpression.aggregate([
    {$match: {type, subject: jobId, createdDate: {$gt: currentStartDate, $lt: new Date()}}},
    {
      $group: group
    }
  ]);

  let previousResult = await UserImpression.aggregate([
    { $match: {type, subject: jobId, createdDate: { $gte: previousStartDate, $lt: previousEndDate } } },
    { $group: group }
  ]);

  let currentData = processResult(currentResult, currentStartDate, new Date(), duration);
  let previousData = processResult(previousResult, previousStartDate, previousEndDate, duration);

  let currentTotal = _.sumBy(currentData, item => item.data.paid + item.data.free);
  let previousTotal = _.sumBy(previousData, item => item.data.paid + item.data.free);

  if (currentTotal > 0 && previousTotal>= 0) {
    change = ((currentTotal - previousTotal) / currentTotal) * 100;
  }

  return {type, total: currentTotal, change: change.toFixed(2), data: currentData.reverse()};
}


async function getInsightCandidates(from, to, companyId, jobId, options) {

  if(!from || !to || !companyId || !options){
    return;
  }

  let result;
  let match = {$and: [{company: companyId}, {subjectType: subjectTypeEnum.JOB}] } ;

  if(jobId){
    match.$and.push({subject: new ObjectId(jobId)});
  }

  const aggregate = UserImpression.aggregate([{
    $match: match
  },

  ]);


  result = await UserImpression.aggregatePaginate(aggregate, options);
  return result;
}

async function getImpressionBySubject(subjectId){
  if(!subjectId){
    return;
  }
  if (typeof subjectId === "string") {
    subjectId = new ObjectId(subjectId);
  }
  const pipeline = [
    {
      $match: { subject: subjectId }
    },
    {
      $group: {
        _id: null,
        noOfLikes: {
          $sum: {
            $cond: [{ $eq: ['$type', 'LIKED'] }, 1, 0]
          }
        },
        noOfSaves: {
          $sum: {
            $cond: [{ $eq: ['$type', 'SAVED'] }, 1, 0]
          }
        },
        noOfShares: {
          $sum: {
            $cond: [{ $eq: ['$type', 'SHARED'] }, 1, 0]
          }
        },
        noOfViews: {
          $sum: {
            $cond: [{ $eq: ['$type', 'VIEWED'] }, 1, 0]
          }
        },
        noOfApplied: {
          $sum: {
            $cond: [{ $eq: ['$type', 'APPLIED'] }, 1, 0]
          }
        },
      }
    }
  ];

  const impressions = await UserImpression.aggregate(pipeline);
  console.log(impressions);
  return impressions;
}


module.exports = {
  add,
  removeImpression,
  findJobViewByUserId,
  findUniqueJobsViewedByUserId,
  findJobViewByUserIdAndJobId,
  findViewByUserIdSubjectIdAndType,
  findByUserIdSubjectIdAndType,
  findByUserIdSubjectTypeAndType,

  findMostViewed,
  findMostViewedByCompany,
  getCompanyInsight,
  getJobInsight,
  getInsightCandidates,

  getImpressionBySubject,
}
