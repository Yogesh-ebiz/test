const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const actionEnum = require('../const/actionEnum');
const subjectType = require('../const/subjectType');
const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');
const  ApplicationSearchParam = require('../const/applicationSearchParam');
const Pagination = require('../utils/job.pagination');
const jobService = require('../services/jobrequisition.service');
const activityService = require('../services/activity.service');
const pipelineService = require('../services/pipeline.service');
const feedService = require('../services/api/feed.service.api');


function findApplicationById(applicationId) {
  let data = null;

  if(applicationId==null){
    return;
  }

  return Application.findOne({applicationId: applicationId})
}

function findApplicationBy_Id(applicationId) {
  let data = null;

  if(applicationId==null){
    return;
  }

  return Application.findById(applicationId);
}


function findApplicationsByJobIds(listfJobIds) {
  let data = null;

  if(listfJobIds==null){
    return;
  }

  return Application.find({jobId: {$in: listfJobIds}});
}


async function findApplicationsByJobId(jobId, filter) {
  let data = null;

  if(jobId==null || !filter){
    return;
  }

  let select = '';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     {createdDate: -1},
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  filter.jobId=jobId;


  const aggregate = Application.aggregate([{
    $match: {
      jobId: ObjectID(jobId)
    }
  },
    {
      $lookup: {
        from: 'applicationprogresses',
        localField: 'currentProgress',
        foreignField: '_id',
        as: 'currentProgress',
      },
    },
    {$unwind: '$currentProgress'},
    {
      $lookup: {
        from: 'candidates',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {$unwind: '$user'}
  ]);

  //   (filter = {}, skip = 0, limit = 10, sort = {}) => [{
  //   $match: {
  //     jobId: 1
  //   }
  // },
  //   {
  //     $lookup: {
  //       from: 'applicationprogresses',
  //       localField: 'currentProgress',
  //       foreignField: '_id',
  //       as: 'currentProgress',
  //     },
  //   },
  //
  // ];
  let result = await Application.aggregatePaginate(aggregate, options);
  if(result.docs.length){
    let job = await jobService.findJob_Id(result.docs[0].jobId);
    let pipeline = await pipelineService.getPipelineByJobId(job._id);

    if(pipeline){
      result.docs.forEach(function(app){
        let stage = _.find(pipeline.stages, {_id: ObjectID(app.currentProgress.stage)});
        if(stage) {
          stage.members = [];
          stage.tasks = [];
          stage.evaluations = [];
          app.currentProgress.stage = stage;
        }
      })
    }

  }

  return result;

  // return await Application.find({jobId: jobId}).sort({createdDate: -1}).populate('currentProgress');
}


async function findAllApplications(companyId, filter) {
  let data = null;

  if(companyId==null || !filter){
    return;
  }

  let select = '';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };




  const aggregate = Application.aggregate([{
    $match: {
      jobId: ObjectID(jobId)
    }
  },
    {
      $lookup: {
        from: 'applicationprogresses',
        localField: 'currentProgress',
        foreignField: '_id',
        as: 'currentProgress',
      },
    },

  ]);

  //   (filter = {}, skip = 0, limit = 10, sort = {}) => [{
  //   $match: {
  //     jobId: 1
  //   }
  // },
  //   {
  //     $lookup: {
  //       from: 'applicationprogresses',
  //       localField: 'currentProgress',
  //       foreignField: '_id',
  //       as: 'currentProgress',
  //     },
  //   },
  //
  // ];
  let result = await Application.aggregatePaginate(aggregate, options);
  return result;

  // return await Application.find({jobId: jobId}).sort({createdDate: -1}).populate('currentProgress');
}


async function findCandidatesByCompanyId(company, filter) {
  let data = null;

  if(!company || !filter){
    return;
  }

  let select = '';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };



  let jobs = await jobService.findJobsByCompanyId(company);

  let match = {
    jobId: {$in: _.map(jobs, 'jobId')}
  };



  const aggregate = Application.aggregate([{
    $match: match
  },
  {
    $lookup: {
      from: 'applicationprogresses',
      localField: 'currentProgress',
      foreignField: '_id',
      as: 'currentProgress',
    },
  },
  {$group: {_id: '$user', applications: {$push: "$$ROOT"}}},
  {$project: {_id: 0, id: '$_id', applications: '$applications' }}
  ]);

  let result = await Application.aggregatePaginate(aggregate, options);

  return result;

}


async function findApplicationsByUserId(userId) {
  let data = null;

  let result = await Application.find({user: userId});

  return result;

}


async function getLatestCandidates(company) {
  let data = null;

  if(!company){
    return;
  }

  let jobs = await jobService.findJobsByCompanyId(company);


  var from = new Date();
  from.setDate(from.getDate()-1);
  from.setMinutes(0);
  from.setHours(0)
  let now = Date.now();

  let result = await Application.find({$and: [ {createdDate: {$gte: from.getTime()}}, {createdDate: {$lte: now}}] }).populate('user').sort({createdDate: -1});

  return result;

}


function findAppliedCountByJobId(jobId) {
  let data = null;

  if(jobId==null){
    return;
  }

  return Application.find({jobId: jobId}).count();
}

function findApplicationByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }


  return Application.find({partyId: userId});
}


function findApplicationByIdAndUserId(applicationId, userId) {
  let data = null;

  if(applicationId==null || userId==null){
    return;
  }


  return Application.findOne({applicationId: applicationId, partyId: userId}).populate([
    {
      path: 'progress',
      model: 'ApplicationProgress',
      //select: 'id applicationId status',  //return all fields
      populate: {
        path: 'schedule',
        model: 'Event'
      }
    }
  ]);
}


async function findApplicationByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  let application = await Application.aggregate([
    //{user: ObjectID(userId), jobId: ObjectID(jobId)}
    { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user'},
    { $match: {'user.userId': userId, jobId: ObjectID(jobId)} },
    { $limit: 1 }
  ]);


  data = application.length?application[0]:null;

  return data;
}

function findAppliedCountByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return Application.find({partyId: userId, jobId: jobId}).count();
}




async function disqualifyApplication(applicationId, reason, member) {
  let result = null;

  if(!applicationId || !reason || !member){
    return;
  }

  let application = await Application.findById(applicationId).populate('user');

  if(application && application.status==statusEnum.ACTIVE){
    application.status = statusEnum.DISQUALIFIED;
    application = await application.save();

    if(application.status==statusEnum.DISQUALIFIED){
      result = {status: statusEnum.DISQUALIFIED};

      let job = await jobService.findJob_Id(ObjectID(application.jobId));
      //Add activity
      let activity = await activityService.addActivity({causerId: ''+member.userId, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subjectId: ''+application._id, action: actionEnum.DISQUALIFIED, meta: {candidate: application.user.firstName + ' ' + application.user.lastName, jobTitle: job.title, jobId: job._id, reason: reason}});
    }
  }
  return result;
}


async function revertApplication(applicationId, member) {
  let result = null;

  if(!applicationId || !member){
    return;
  }

  let application = await Application.findById(applicationId).populate('user');
  if(application.status==statusEnum.DISQUALIFIED){
    application.status = statusEnum.ACTIVE;
    application = await application.save();

    if(application.status==statusEnum.ACTIVE){
      result = {status: statusEnum.ACTIVE};

      let job = await jobService.findJob_Id(ObjectID(application.jobId));
      let activity = await activityService.addActivity({causerId: ''+member.userId, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subjectId: ''+application._id, action: actionEnum.REVERTED, meta: {candidate: application.user.firstName + ' ' + application.user.lastName, jobTitle: job.title, jobId: job._id}});
    }
  }
  return result;
}



async function followApplication(applicationId, member) {
  let result = null;

  if(!applicationId || !member){
    return;
  }

  let application = await Application.findById(applicationId);
  if(application){
    application = await application.save();

  }
  return result;
}



async function getApplicationActivities(applicationId) {
  let data = null;

  if(!applicationId){
    return;
  }

  result = activityService.findBySubjectTypeAndSubjectId(subjectType.APPLICATION, applicationId);

  return result;
}


async function getApplicationActivities(applicationId) {
  let data = null;

  if(!applicationId){
    return;
  }

  result = activityService.findBySubjectTypeAndSubjectId(subjectType.APPLICATION, applicationId);

  return result;
}



function applyJob(application) {
  let data = null;

  if(application==null){
    return;
  }

  application.attachment = '';
  application.status = applicationEnum.ACTIVE;

  // return new Application(application).save();

  // let saveApplication = new Application(application).save(function (err) {
  //   if (err) return handleError(err);
  //
  //   console.log('saved', this._id);
  //   const applicationProgress = new ApplicationProgress({
  //     status: applicationEnum.APPLIED,
  //     application: this._id
  //   });
  //
  //   applicationProgress.save(function (err) {
  //     if (err) return handleError(err);
  //   });
  //
  //
  // });
  // return saveApplication;

  // return new Application(application).save();

  application = new Application(application).save();

  // const applicationProgress = await new ApplicationProgress({
  //   status: applicationEnum.APPLIED,
  //   application: application._id
  // });

  // console.log('progress', applicationProgress)


  return application;

}



async function getCompanyInsight(company, duration) {

  if(!company || !duration){
    return;
  }

  let maxDays = 30;
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

  let data=[], total=0, change=0;
  let result  = await Application.aggregate([
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
      for(var i=1; i<=noOfItems; i++){
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



  return {type: 'APPLIED', total: total, change: change?change:0, data: data.reverse()};
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
    var Difference_In_Time = date.getTime() - job.createdDate;

    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

    if(Difference_In_Days<maxDays){
      maxDays = Difference_In_Days;
    }

    date.setDate(date.getDate() - Difference_In_Days);
    date.setMinutes(0);
    date.setHours(0)
    group._id = {day: {$dayOfMonth: '$createdDate'}, month: {$month: "$createdDate"}};

    let result = await Application.aggregate([
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
          item = {date: date.getDate() + '/' + (parseInt(date.getMonth()) + 1), data: {paid: 0, free: 0}};
        }
        data.push(item);
        date.setDate(date.getDate() - 1);
      }
      let current = data[0];
      let previous = data[1];
      total = _.sum(_.reduce(data, function (res, item) {
        res.push(item.data.paid + item.data.free);
        return res;
      }, []));
      if (data.length == 0 || data.length == 1) {
        change = 0;
      } else {
        change = ((current.data.paid + current.data.free) - (previous.data.paid + previous.data.free)) / (current.data.paid + current.data.free) * 100.0;
      }
    }
  }

  return {type: 'APPLIED', total: total, change: change, data: data.reverse()};
}


async function getCandidatesSourceByCompanyId(company, duration) {

  if(!company || !duration){
    return;
  }

  let result= {}, date;

  if(duration=='1M'){
    date = new Date();
    date.setDate(date.getDate()-30);
    date.setMinutes(0);
    date.setHours(0)
  } else if(duration=='3M'){
    date = new Date();
    date.setMonth(date.getMonth()-3);
    date.setDate(1);
  } else if(duration=='6M'){
    date = new Date();
    date.setMonth(date.getMonth()-6);
    date.setDate(1);
  }


  let groupCandidateSources  = await Application.aggregate([
    { $match: {company: company, createdDate: {$gt: date}}},
    {$lookup:{
        from:"candidates",
        let:{user: '$user'},
        pipeline:[
          {$match:{$expr:{$eq:["$$user","$_id"]}}},
          {
            $lookup: {
              from: 'labels',
              localField: "sources",
              foreignField: "_id",
              as: "sources"
            }
          },
        ],
        as: 'user'
      }},
    {$unwind: '$user'},
    { $group:{_id: { _id: '$user._id', sources: '$user.sources'}, applications: {$push: '$$ROOT'}, count:{$sum:1} }},
    { $project:{_id: 0, sources: '$_id.sources'}},
  ]);

  if(groupCandidateSources){
    let total = 0;
    let data = {};
    for(i in groupCandidateSources){
      for(j in groupCandidateSources[i].sources) {
        if (data[groupCandidateSources[i].sources[j].labelId]) {
          data[groupCandidateSources[i].sources[j].labelId].count += 1;
        } else {
          data[groupCandidateSources[i].sources[j].labelId] = {name: groupCandidateSources[i].sources[j].name, count: 1};
        }
        total++;
      }
    }
    result = {total: total, data: data};
  }

  return result;
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


  const aggregate = Application.aggregate([{
    $match: match
  },

  ]);

  result = await Application.aggregatePaginate(aggregate, options);
  return result;
}



async function getCandidatesSourceByJobId(jobId) {

  if(!jobId){
    return;
  }

  let result= {}, date;

  let groupCandidateSources  = await Application.aggregate([
    { $match: {jobId:jobId}},
    {$lookup:{
        from:"candidates",
        let:{user: '$user'},
        pipeline:[
          {$match:{$expr:{$eq:["$$user","$_id"]}}},
          {
            $lookup: {
              from: 'labels',
              localField: "sources",
              foreignField: "_id",
              as: "sources"
            }
          },
        ],
        as: 'user'
      }},
    {$unwind: '$user'},
    { $group:{_id: { _id: '$user._id', sources: '$user.sources'}, applications: {$push: '$$ROOT'}, count:{$sum:1} }},
    { $project:{_id: 0, sources: '$_id.sources'}}
  ]);


  if(groupCandidateSources){
    let total = 0;
    let data = {};
    for(i in groupCandidateSources){
      for(j in groupCandidateSources[i].sources) {
        if (data[groupCandidateSources[i].sources[j].labelId]) {
          data.id.count += 1;
        } else {
          data[groupCandidateSources[i].sources[j].labelId] = {name: groupCandidateSources[i].sources[j].name, count: 1};
        }
        total++;
      }
    }
    result = {total: total, data: data};
  }

  return result;
}



async function applicationsEndingSoon(company) {
  let result = null;

  if(!company){
    return;
  }


  let applications = await Application.aggregate([
    { $match: {company: company} },
    { $lookup:{
        from:"applicationprogresses",
        let:{currentProgress: '$currentProgress'},
        pipeline:[
          {$match:{$expr:{$eq:["$$currentProgress","$_id"]}}},
          {
            $lookup: {
              from: 'stages',
              localField: "stage",
              foreignField: "_id",
              as: "stage"
            }
          },
          { $unwind: '$stage' },
          { $addFields:
              {
                timeLeft: {$round: [ {$divide : [{$subtract: [{ $add:[ {$toDate: "$createdDate"}, {$multiply: ['$stage.timeLimit', 1*24*60*60000] } ] }, "$$NOW"]}, 86400000]}, 0 ] }
              }
          },

        ],
        as: 'currentProgress'
      }},
    { $unwind: '$currentProgress'},
    { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $match: {'currentProgress.timeLeft': {$lte: 1}}
    }
  ])








  return applications;
}


module.exports = {
  findApplicationById: findApplicationById,
  findApplicationBy_Id:findApplicationBy_Id,
  findApplicationsByJobIds:findApplicationsByJobIds,
  findApplicationByUserId: findApplicationByUserId,
  findApplicationByUserIdAndJobId: findApplicationByUserIdAndJobId,
  findApplicationByIdAndUserId:findApplicationByIdAndUserId,
  findAppliedCountByJobId: findAppliedCountByJobId,
  findApplicationsByJobId:findApplicationsByJobId,
  findCandidatesByCompanyId:findCandidatesByCompanyId,
  findApplicationsByUserId:findApplicationsByUserId,
  getLatestCandidates:getLatestCandidates,
  disqualifyApplication:disqualifyApplication,
  revertApplication:revertApplication,
  getApplicationActivities:getApplicationActivities,
  applyJob: applyJob,
  getCompanyInsight: getCompanyInsight,
  getJobInsight:getJobInsight,
  getCandidatesSourceByCompanyId:getCandidatesSourceByCompanyId,
  getInsightCandidates:getInsightCandidates,
  getCandidatesSourceByJobId:getCandidatesSourceByJobId,
  applicationsEndingSoon:applicationsEndingSoon
}
