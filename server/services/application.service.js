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


function findApplicationByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  console.log(userId, jobId)
  return Application.findOne({user: ObjectID(userId), jobId: ObjectID(jobId)});
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

  let application = await Application.findById(applicationId);
  if(application && application.status==statusEnum.ACTIVE){
    application.status = statusEnum.DISQUALIFIED;
    application = await application.save();

    if(application.status==statusEnum.DISQUALIFIED){
      result = {status: statusEnum.DISQUALIFIED};

      let user = await feedService.lookupUserIds([application.user]);

      let job = await jobService.findJobId(application.jobId);
      //Add activity
      let activity = await activityService.addActivity({causerId: ''+member.userId, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subjectId: ''+application._id, action: actionEnum.DISQUALIFIED, meta: {candidate: user[0].firstName + ' ' + user[0].lastName, jobTitle: job.title, jobId: job._id, reason: reason}});
    }
  }
  return result;
}


async function revertApplication(applicationId, member) {
  let result = null;

  if(!applicationId || !member){
    return;
  }

  let application = await Application.findById(applicationId);
  if(application.status==statusEnum.DISQUALIFIED){
    application.status = statusEnum.ACTIVE;
    application = await application.save();

    if(application.status==statusEnum.ACTIVE){
      result = {status: statusEnum.ACTIVE};

      let user = await feedService.lookupUserIds([application.user]);
      let job = await jobService.findJobId(application.jobId);
      let activity = await activityService.addActivity({causerId: ''+member.userId, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subjectId: ''+application._id, action: actionEnum.REVERTED, meta: {candidate: user[0].firstName + ' ' + user[0].lastName, jobTitle: job.title, jobId: job._id}});
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
  applyJob: applyJob
}
