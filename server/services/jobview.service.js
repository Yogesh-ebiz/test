const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobView = require('../models/jobview.model');
const jobService = require('../services/jobrequisition.service');


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

  let jobView = {partyId: userId, company: company, jobId: jobId}
  return new JobView(jobView).save();
}


async function findMostViewed() {
  let data = null;


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
    count: {'$sum': 1}
  };

  data = await JobView.aggregate([
    { $lookup:{
        from:"jobrequisitions",
        let:{jobId: '$jobId'},
        pipeline:[
          {$match:{$expr:{$eq:["$$jobId","$_id"]}}},
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
    count: {'$sum': 1}
  };

  data = await JobView.aggregate([
    { $match: {company: company} },
    { $lookup:{
        from:"jobrequisitions",
        let:{jobId: '$jobId'},
        pipeline:[
          {$match:{$expr:{$eq:["$$jobId","$_id"]}}},
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

async function getCompanyInsight(company, duration) {

  if(!company || !duration){
    return;
  }
  let maxDays = 30;
  let data=[], total=0, change=0;
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

  let result  = await JobView.aggregate([
    {$match: {company: company, createdDate: {$gt: date}}},
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
          item = {date: date.getDate()+'/'+(parseInt(date.getMonth())+1), data: {paid: 0, free: found.count}};
        } else {
          item = {date: date.getDate()+'/'+(parseInt(date.getMonth())+1), data: {paid: 0, free: 0}};
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
        if(found){
          item = {date: parseInt(date.getMonth())+1+'/'+date.getFullYear(), data: {paid: 0, free: found.count}};
        } else {
          item = {date: parseInt(date.getMonth())+1+'/'+date.getFullYear(), data: {paid: 0, free: 0}};
        }
        data.push(item);
        date.setMonth(date.getMonth()-1);
      }
    }

    let current = data[0];
    let previous = data[1];
    total = _.sum(_.reduce(data, function (res, item) {
      res.push(item.data.paid + item.data.free);
      return res;
    }, []));
    if(data.length==0 || data.length==1) {
      change = 0;
    } else {
      change = ((current.data.paid + current.data.free) - (previous.data.paid + previous.data.free)) / (current.data.paid + current.data.free) * 100.0;
    }

  }


  return {type: 'VIEWED', total: total, change: change, data: data.reverse()};
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
    var Difference_In_Time = date.getTime() - job.publishedDate;

    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

    if(Difference_In_Days<maxDays){
      maxDays = Difference_In_Days;
    }

    date.setDate(date.getDate() - maxDays);
    date.setMinutes(0);
    date.setHours(0)
    group._id = {day: {$dayOfMonth: '$createdDate'}, month: {$month: "$createdDate"}};

    let result = await JobView.aggregate([
      {$match: {jobId: jobId, createdDate: {$gt: date}}},
      {
        $group: group
      }
    ]);

    console.log(result)
    if (result.length) {
        date = new Date();
        for (var i = 0; i < maxDays; i++) {
          let item = {};
          console.log(date.getDate(),date.getMonth()+1)
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

  return {type: 'VIEWED', total: total, change: change, data: data.reverse()};
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
  findMostViewedByCompany:findMostViewedByCompany,
  getCompanyInsight: getCompanyInsight,
  getJobInsight:getJobInsight,
  getInsightCandidates:getInsightCandidates
}
