const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const emailCampaignStageType = require('../const/emailCampaignStageType');

const JobView = require('../models/jobview.model');
const jobService = require('../services/jobrequisition.service');
const sourceService = require('../services/source.service');
const emailCampaignService = require('../services/emailcampaign.service');
const emailCampaignStageService = require('../services/emailcampaignstage.service');


async function add(userId, jobId, token) {
  let data = null;

  if(!userId || !jobId){
    return;
  }

  let job = await jobService.findJobId(jobId);
  let jobView;
  if(job) {

    console.log(userId, jobId)
    jobView = await findJobViewByUserIdAndJobId(userId, jobId);
    if(!jobView) {
      jobView = await new JobView({partyId: userId, company: job.company, jobId: job._id, token: token}).save();
    } else {
      jobView.viewCount++;
      await jobView.save();
    }

    job.noOfViews++;
    await job.save();


    // if(token) {
    //   let campaign = await emailCampaignService.findByToken(token);
    //   if(campaign) {
    //     let exists = _.find(campaign.stages, {type: emailCampaignStageType.VIEWED});
    //     if (!exists) {
    //       let stage = await emailCampaignServiceStage.add({type: emailCampaignStageType.VIEWED, organic: false});
    //       campaign.stages.push(campaign);
    //       campaign.currentStage = stage;
    //       await campaign.save();
    //     }
    //   }
    // }

    let source = await sourceService.findByJobIdAndUserId(jobId, userId);
    source = source?source[0]:null;
    console.log(source)
    if(source) {
      await sourceService.updateViewed(source._id, true);
      if (token) {
        let campaign = await emailCampaignService.findByToken(token);
        let exists = _.find(campaign.stages, {type: emailCampaignStageType.VIEWED});
        if (!exists) {

          let invitedStageIndex = _.findIndex(campaign.stages, {type: emailCampaignStageType.INVITED});
          let stage = await emailCampaignStageService.add({type: emailCampaignStageType.VIEWED, organic: false});
          campaign.stages.splice((invitedStageIndex), 0, stage._id);

          let appliedStageIndex = _.findIndex(campaign.stages, {type: emailCampaignStageType.APPLIED});
          if (appliedStageIndex < 0) {
            campaign.currentStage = stage._id;
          }
          console.log(campaign)
          await campaign.save();
        }
      }
    }
  }



  return jobView;
}



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
      hasSaved: '$jobId.hasSaved',
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
    var Difference_In_Time = date.getTime() - job.originalPublishedDate;

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

    if (result.length) {
        date = new Date();
        for (var i = 0; i < maxDays; i++) {
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

  const aggregate = JobView.aggregate([{
    $match: match
  },

  ]);


  result = await JobView.aggregatePaginate(aggregate, options);
  return result;
}



module.exports = {
  add: add,
  findJobViewByUserId: findJobViewByUserId,
  findJobViewByUserIdAndJobId:findJobViewByUserIdAndJobId,

  findMostViewed:findMostViewed,
  findMostViewedByCompany:findMostViewedByCompany,
  getCompanyInsight: getCompanyInsight,
  getJobInsight:getJobInsight,
  getInsightCandidates:getInsightCandidates
}
