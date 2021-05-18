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
const JobService = require('../services/jobrequisition.service');
const activityService = require('../services/activity.service');


function findApplicationById(applicationId) {
  let data = null;

  if(applicationId==null){
    return;
  }

  return Application.findOne({applicationId: applicationId}).populate([
    {
      path: 'currentProgress',
      model: 'ApplicationProgress',
      populate: {
        path: 'stage',
        model: 'Stage'
      }
    },
    {
      path: 'progress',
      model: 'ApplicationProgress',
      // populate: {
      //   path: 'schedule',
      //   model: 'Event'
      // }
    }
  ]);
}

function findApplicationBy_Id(applicationId) {
  let data = null;

  if(applicationId==null){
    return;
  }

  return Application.findById(applicationId);
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
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  filter.jobId=jobId;


  const aggregate = Application.aggregate([{
    $match: {
      jobId: jobId
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
  return new Pagination(result);

  // return await Application.find({jobId: jobId}).sort({createdDate: -1}).populate('currentProgress');
}


async function findCandidatesByCompanyId(company, filter) {
  let data = null;

  if(company==null || !filter){
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



  let jobs = await JobService.findJobsByCompanyId(company);

  const aggregate = Application.aggregate([{
    $match: {
      jobId: {$in: _.map(jobs, 'jobId')}
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
  {$group: {_id: '$user', applications: {$push: "$$ROOT"}}},
  {$project: {_id: 0, id: '$_id', applications: '$applications' }}
  ]);

  let result = await Application.aggregatePaginate(aggregate, options);

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

  return Application.findOne({partyId: userId, jobId: jobId});
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

  if(application.status==statusEnum.ACTIVE){
    application.status = statusEnum.DISQUALIFIED;
    application = await application.save();

    if(application.status==statusEnum.DISQUALIFIED){
      result = {status: statusEnum.DISQUALIFIED};

      let job = await JobService.findJobId(application.jobId);
      //Add activity
      let activity = await activityService.addActivity({causerId: ''+member.userId, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subjectId: applicationId, action: actionEnum.DISQUALIFIED, meta: {name: job.title, jobId: application.jobId, reason: reason}});
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

      let job = await JobService.findJobId(application.jobId);
      await activityService.addActivity({causerId: ''+member.userId, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subjectId: applicationId, action: actionEnum.REVERTED, meta: {name: job.title, jobId: application.jobId}});
    }
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
  application.status = applicationEnum.APPLIED;

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
  findApplicationByUserId: findApplicationByUserId,
  findApplicationByUserIdAndJobId: findApplicationByUserIdAndJobId,
  findApplicationByIdAndUserId:findApplicationByIdAndUserId,
  findAppliedCountByJobId: findAppliedCountByJobId,
  findApplicationsByJobId:findApplicationsByJobId,
  findCandidatesByCompanyId:findCandidatesByCompanyId,
  disqualifyApplication:disqualifyApplication,
  revertApplication:revertApplication,
  getApplicationActivities:getApplicationActivities,
  applyJob: applyJob
}
