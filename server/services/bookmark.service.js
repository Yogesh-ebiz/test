const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const emailCampaignStageType = require('../const/emailCampaignStageType');

const BookMark = require('../models/bookmark.model');
const jobService = require('../services/jobrequisition.service');
const sourceService = require('../services/source.service');
const candidateService = require('../services/candidate.service');
const emailCampaignService = require('../services/emailcampaign.service');
const emailCampaignStageService = require('../services/emailcampaignstage.service');



async function add(userId, jobId, token) {
  let data = null;

  if(!userId || !jobId){
    return;
  }

  let job = await jobService.findById(jobId);
  let bookmark = await findBookById(userId, jobId);

  if(!bookmark) {
    bookmark = await new BookMark({partyId: userId, company: job.company, jobId: job._id, token: token}).save();
  }

  let source = await sourceService.findByJobIdAndUserId(jobId, userId);
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


function removeBookById(userId, jobId) {
  let data = null;
  if(!userId || !jobId){
    return;
  }


  return BookMark.remove({partyId: userId, jobId: jobId});
}

function findBookById(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return BookMark.findOne({partyId: userId, jobId: jobId});
}

function findBookByUserId(userId, size) {
  let data = null;

  if(!userId){
    return;
  }

  return size?BookMark.find({partyId: userId}).sort({createdDate: -1}).limit(size):BookMark.find({partyId: userId}).sort({createdDate: -1});
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
  let group = {
    _id: null,
    viewers: {$push: '$$ROOT.partyId'},
    count: {'$sum': 1}
  };

  if(duration=='1M'){
    date = new Date();
    date.setDate(date.getDate()-30);
    date.setMinutes(0);
    date.setHours(0)
    group._id= {day: {$dayOfMonth: '$createdDate'}, month: { $month: "$createdDate" } };
  } else if(duration=='3M'){
    date = new Date();
    date.setMonth(date.getMonth()-3);
    date.setDate(1);
    group._id= {month: { $month: "$createdDate" } };
  } else if(duration=='6M'){
    date = new Date();
    date.setMonth(date.getMonth()-6);
    date.setDate(1);
    group._id= {month: { $month: "$createdDate" } };
  }

  let result  = await BookMark.aggregate([
    {$match: {createdDate: {$gt: date}}},
    {
      $group: group
    }
  ]);

  if(result){
    if(duration=='1M'){
      date = new Date();
      for(var i=1; i<=30; i++){
        let item = {};

        let found = _.find(result, {_id: {day: date.getDate(), month: date.getMonth()+1}});
        if (found) {
          item = {date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: {paid: 0, free: found.count}};
        } else {
          item = {date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: {paid: 0, free: 0} };
        }
        data.push(item);
        date.setDate(date.getDate()-1);
      }
    } else {
      date = new Date();
      var noOfItems =  duration=='3M'?3:duration=='6M'?6:duration=='12M'?12:0;
      for(var i=0; i<=noOfItems; i++){
        let item = {};

        let found = _.find(result, {_id: {month: date.getMonth()+1}});
        if (found) {
          item = {date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: {paid: 0, free: found.count}};
        } else {
          item = {date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: {paid: 0, free: 0} };
        }
        data.push(item);
        date.setMonth(date.getMonth()-1);
      }
    }


    let current = data[0];
    let previous = data[1];
    total = _.sum(_.reduce(data, function(res, item) {
      res.push(item.data.paid+item.data.free);
      return res;
    }, []));
    if(data.length==0 || data.length==1) {
      change = 0;
    } else {
      change = ((current.data.paid + current.data.free) - (previous.data.paid + previous.data.free)) / (current.data.paid + current.data.free) * 100.0;
    }
  }


  return {type: 'SAVED', total: total, change: change?change:0, data: data.reverse()};
}


async function getJobInsight(jobId) {

  if(!jobId){
    return;
  }

  let job = await jobService.findJob_Id(jobId);

  let data=[], total=0, change=0;
  if(job) {

    let group = {
      _id: null,
      viewers: {$push: '$$ROOT.partyId'},
      count: {'$sum': 1}
    };

    let maxDays = 30;
    let date = new Date();
    // To calculate the time difference of two dates
    var Difference_In_Time = date.getTime() - job.originalPublishedDate;

    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

    if(Difference_In_Days<maxDays){
      maxDays = Difference_In_Days;
    }

    date.setDate(date.getDate() - Difference_In_Days);
    date.setMinutes(0);
    date.setHours(0)
    group._id = {day: {$dayOfMonth: '$createdDate'}, month: {$month: "$createdDate"}};

    let result = await BookMark.aggregate([
      {$match: {jobId: jobId, createdDate: {$gt: date}}},
      {
        $group: group
      }
    ]);


    if (result.length) {
      date = new Date();
      for (var i = 0; i <= Difference_In_Days; i++) {
        let item = {};

        let found = _.find(result, {_id: {day: date.getDate(), month: date.getMonth() + 1}});
        if (found) {
          item = {date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: {paid: 0, free: found.count}};
        } else {
          item = {date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: {paid: 0, free: 0} };
        }
        data.push(item);
        date.setDate(date.getDate() - 1);
      }
      let current = data[0];
      let previous = data[1];
      total = _.sum(_.reduce(data, function(res, item) {
        res.push(item.data.paid+item.data.free);
        return res;
      }, []));
      if(data.length==0 || data.length==1) {
        change = 0;
      } else {
        change = ((current.data.paid + current.data.free) - (previous.data.paid + previous.data.free)) / (current.data.paid + current.data.free) * 100.0;
      }
    }

  }

  return {type: 'SAVED', total: total, change: change, data: data.reverse()};
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
  add: add,
  removeBookById: removeBookById,
  findBookById: findBookById,
  findBookByUserId: findBookByUserId,
  findMostBookmarked:findMostBookmarked,
  getCompanyInsight:getCompanyInsight,
  getJobInsight:getJobInsight,
  getInsightCandidates:getInsightCandidates
}
