const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const emailCampaignStageType = require('../const/emailCampaignStageType');

const BookMark = require('../models/bookmark.model');
const sourceService = require('./source.service');
const candidateService = require('./candidate.service');
const emailCampaignService = require('./emailcampaign.service');
const emailCampaignStageService = require('./emailcampaignstage.service');
const Bookmark = require("../models/bookmark.model");



async function add(user, job, token) {
  let data = null;

  if(!user || !job){
    return;
  }

  let bookmark = await BookMark.findOne({user: user._id, job: job._id});
  if(!bookmark) {
    bookmark = await new BookMark({partyId: user.userId, user: user._id, company: job.company, job: job._id, token: token}).save();
  }

  let source = await sourceService.findByJobIdAndUserId(job._id, user.user_id);
  source = source?source[0]:null;

  if(source) {
    await sourceService.updateSaved(source._id, true);


    if(token){
      let campaign = await emailCampaignService.findByToken(token);
      let exists = _.find(campaign.stages, {type: emailCampaignStageType.SAVED});
      if(!exists){

        let currentStageIndex = _.findIndex(campaign.stages, {type: emailCampaignStageType.APPLIED});
        let stage = await emailCampaignStageService.add({type: emailCampaignStageType.SAVED, organic: false});
        if(currentStageIndex>0){
          campaign.stages.splice((currentStageIndex-1), 0, stage._id);

        } else {
          campaign.stages.push(stage._id);
          campaign.currentStage = stage._id;
        }
        await campaign.save();
      }
    }
  }

  return bookmark;
}
function findById(id) {
  if(!id){
    return;
  }

  return BookMark.findById(id);
}

function removeBookById(id) {
  let data = null;
  if(!id){
    return;
  }

  return BookMark.remove({_id: id});
}

function removeBookByJobId(job, userId) {
  let data = null;
  if(!job){
    return;
  }

  return BookMark.findOneAndDelete({job: job, partyId: userId});
}

function findByPartyIdAndJob(partyId, job) {
  let data = null;

  if(!partyId || !job){
    return;
  }
  return BookMark.findOne({partyId, job});
}

// function findBookByUserId(userId, size) {
//   let data = null;
//
//   if(!userId){
//     return;
//   }
//   return size?BookMark.find({partyId: userId}).sort({createdDate: -1}).limit(size):BookMark.find({partyId: userId}).sort({createdDate: -1});
// }

async function findBookByUserId(userId, size) {
  let data = null;

  if(!userId){
    return;
  }

  const limit = size ? size : 4;

  const result = await BookMark.aggregate([
    { $match: { partyId: userId } },
    {$lookup:{
        from:"jobrequisitions",
        let:{id:"$job"},
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


async function findBookByPartyId(partyId, sort) {
  let data = null;

  if(!partyId || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size > 0) ? sort.size : 20;
  let page = (sort.page && sort.page == 0) ? sort.page : 1;
  let sortBy = {};
  sort.sortBy = (sort.sortBy) ? sort.sortBy : 'createdDate';
  sort.direction = (sort.direction && sort.direction=="ASC") ? "ASC" : 'DESC';
  sortBy[sort.sortBy] = (sort.direction == "DESC") ? -1 : 1;

  let options = {
    select: select,
    sort: sortBy,
    lean: true,
    limit: limit,
    page: parseInt(sort.page) + 1
  };

  const aggregate = Bookmark.aggregate([
    { $match: {partyId}},
    { $lookup:{
        from:"jobrequisitions",
        let:{job: '$job'},
        pipeline:[
          {$match:{$expr:{$eq:["$$job","$_id"]}}},
          {
            $lookup: {
              from: 'companies',
              localField: "company",
              foreignField: "_id",
              as: "company"
            }
          },
          { $unwind: '$company' },
          {
            $lookup: {
              from: 'jobimpressions',
              localField: "impression",
              foreignField: "_id",
              as: "impression"
            }
          },
          { $unwind: { path: '$impression', preserveNullAndEmptyArrays: true } }
        ],
        as: 'job'
      }},
    { $unwind: '$job'}
  ]);

  return Bookmark.aggregatePaginate(aggregate, options);
}


async function findMostBookmarked() {
  let data = null;

  let group = {
    _id: {jobId: '$jobId'},
    count: {'$sum': 1}
  };

  data = await BookMark.aggregate([
    {$match: {}},
    {
      $group: group
    },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        jobId: '$_id.jobId',
        count: '$count'
      }
    }
  ]);

  return data;
}


async function getCompanyInsight(company , duration) {


  if(!company || !duration){
    return;
  }

  let maxDays = 30;
  let data = [], total=0, change=0;
  let date;
  let currentStartDate, previousStartDate, previousEndDate;
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

  let currentResult  = await BookMark.aggregate([
    {$match: {company: company, createdDate: {$gt: currentStartDate, $lt: new Date()}}},
    {
      $group: group
    }
  ]);

  let previousResult = await BookMark.aggregate([
    { $match: { company: company, createdDate: { $gte: previousStartDate, $lt: previousEndDate } } },
    { $group: group }
  ]);

  let currentData = processResult(currentResult, currentStartDate, new Date(), duration);
  let previousData = processResult(previousResult, previousStartDate, previousEndDate, duration);

  let currentTotal = _.sumBy(currentData, item => item.data.paid + item.data.free);
  let previousTotal = _.sumBy(previousData, item => item.data.paid + item.data.free);

  if (currentTotal > 0 && previousTotal>= 0) {
    change = ((currentTotal - previousTotal) / currentTotal) * 100;
  }

  return { type: 'SAVED', total: currentTotal, change: change.toFixed(2), data: currentData.reverse() };
}

const processResult = (result, startDate, endDate, duration) => {
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

async function getJobInsight(jobId, duration) {

  if(!jobId){
    return;
  }

  if(!duration){
    duration = '1M';
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
  }else if(duration == '1W'){
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 7);
    group._id= {day: {$dayOfMonth: '$createdDate'}, month: { $month: "$createdDate" } };
  }

  previousEndDate = new Date(currentStartDate);

  let currentResult  = await BookMark.aggregate([
    {$match: {job: jobId, createdDate: {$gt: currentStartDate, $lt: new Date()}}},
    {
      $group: group
    }
  ]);

  let previousResult = await BookMark.aggregate([
    { $match: { job: jobId, createdDate: { $gte: previousStartDate, $lt: previousEndDate } } },
    { $group: group }
  ]);

  let currentData = processResult(currentResult, currentStartDate, new Date(), duration);
  let previousData = processResult(previousResult, previousStartDate, previousEndDate, duration);

  let currentTotal = _.sumBy(currentData, item => item.data.paid + item.data.free);
  let previousTotal = _.sumBy(previousData, item => item.data.paid + item.data.free);

  if (currentTotal > 0 && previousTotal>= 0) {
    change = ((currentTotal - previousTotal) / currentTotal) * 100;
  }

  return {type: 'SAVED', total: currentTotal, change: change.toFixed(2), data: currentData.reverse()};
}

async function getInsightCandidates(from, to, companyId, jobId, options) {

  if(!from || !to || !companyId || !options){
    return;
  }

  let result;
  let match = {$and: [{company: companyId}] } ;

  if(jobId){
    match.$and.push({jobId: jobId});
  }

  const aggregate = BookMark.aggregate([{
    $match: match
  },
  ]);


  result = await BookMark.aggregatePaginate(aggregate, options);
  return result;
}


module.exports = {
  add,
  findById,
  removeBookById,
  removeBookByJobId,
  findByPartyIdAndJob,
  findBookByUserId,
  findBookByPartyId,
  findMostBookmarked,
  getCompanyInsight,
  getJobInsight,
  getInsightCandidates
}
