const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobView = require('../models/jobview.model');


function findJobViewByUserId(userId, size) {
  let data = null;

  if(userId==null){
    return;
  }

  return size?JobView.find({partyId: userId}).sort({createdDate: -1}).limit(size):JobView.find({partyId: userId}).sort({createdDate: -1});
}

function findJobViewByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobView.findOne({partyId: userId, jobId: jobId});
}

function addJobViewByUserId(userId, company, jobId) {
  let data = null;

  if(!userId || !company || !jobId){
    return;
  }


  let timestamp = Date.now();

  let jobView = {partyId: userId, company: company, jobId: jobId, createdDate: timestamp}
  return new JobView(jobView).save();
}


async function findMostViewed() {
  let data = null;

  let group = {
    _id: {jobId: '$jobId'},
    count: {'$sum': 1}
  };

  data = await JobView.aggregate([
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

async function getInsight(duration) {
  let data = [];

  if(!duration){
    return;
  }

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
    console.log(date)
    group._id= {month: { $month: "$createdDate" } };
  } else if(duration=='6M'){
    date = new Date();
    date.setMonth(date.getMonth()-6);
    date.setDate(1);
    group._id= {month: { $month: "$createdDate" } };
  }

  let result  = await JobView.aggregate([
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
        if(found){
          item = {date: date.getDate()+'/'+(parseInt(date.getMonth())+1), value: found.count};
        } else {
          item = {date: date.getDate()+'/'+(parseInt(date.getMonth())+1), value: 0};
        }
        data.push(item);
        date.setDate(date.getDate()-1);
      }
    } else {
      date = new Date();
      var noOfItems =  duration=='3M'?3:duration=='6M'?6:duration=='12M'?12:0;
      for(var i=1; i<=noOfItems; i++){
        let item = {};

        let found = _.find(result, {_id: {month: date.getMonth()+1}});
        if(found){
          item = {date: parseInt(date.getMonth())+1+'/'+date.getFullYear(), value: found.count};
        } else {
          item = {date: parseInt(date.getMonth())+1+'/'+date.getFullYear(), value: 0};
        }
        data.push(item);
        date.setMonth(date.getMonth()-1);
      }
    }
  }

  let current = data[0];
  let previous = data[1];
  let total = _.sum(_.map(data, 'value'));
  var change=(current.value-previous.value)/current.value*100.0;


  return {type: 'VIEWED', total: total, change: change, data: data};
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


  console.log(match)
  const aggregate = JobView.aggregate([{
    $match: match
  },

  ]);


  result = await JobView.aggregatePaginate(aggregate, options);
  return result;
}

module.exports = {
  findJobViewByUserId: findJobViewByUserId,
  findJobViewByUserIdAndJobId:findJobViewByUserIdAndJobId,
  addJobViewByUserId: addJobViewByUserId,
  findMostViewed:findMostViewed,
  getInsight: getInsight,
  getInsightCandidates:getInsightCandidates
}
