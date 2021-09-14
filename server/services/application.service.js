const _ = require('lodash');
const Joi = require('joi');
const fs = require('fs').promises;
const {upload, uploadFromBuffer} = require('../services/aws.service');

const ObjectID = require('mongodb').ObjectID;

let ApplicationSearchParam = require('../const/applicationSearchParam');
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const actionEnum = require('../const/actionEnum');
const subjectType = require('../const/subjectType');
const notificationType = require('../const/notificationType');
const notificationEvent = require('../const/notificationEvent');
const emailCampaignStageType = require('../const/emailCampaignStageType');

const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');
const Pagination = require('../utils/job.pagination');
const jobService = require('../services/jobrequisition.service');
const applicationProgressService = require('../services/applicationprogress.service');
const questionSubmissionService = require('../services/questionsubmission.service');
const stageService = require('../services/stage.service');
const activityService = require('../services/activity.service');
const pipelineService = require('../services/pipeline.service');
const sourceService = require('../services/source.service');
const emailCampaignService = require('../services/emailcampaign.service');
const emailCampaignStageService = require('../services/emailcampaignstage.service');
const fileService = require('../services/file.service');
const memberService = require('../services/member.service');


const feedService = require('../services/api/feed.service.api');
const calendarService = require('../services/api/calendar.service.api');

const {base64Decode, base64Encode, convertToAvatar} = require('../utils/helper');



const applicationSchema = Joi.object({
  jobTitle: Joi.string().allow(''),
  job: Joi.object().required(),
  jobId: Joi.object().required(),
  user: Joi.object().required(),
  phoneNumber: Joi.string(),
  email: Joi.string().required(),
  availableDate: Joi.number().optional(),
  attachment: Joi.string().allow('').optional(),
  follow: Joi.boolean().optional(),
  resumeId: Joi.any().optional(),
  questionAnswers: Joi.array(),
  coverLetter: Joi.string().allow('').optional(),
  source: Joi.string().allow('').optional(),
  desiredSalary: Joi.number().optional(),
  currency: Joi.string().optional(),
  applicationQuestions: Joi.object().optional(),
  firstName: Joi.string().allow('').optional(),
  lastName: Joi.string().allow('').optional(),
  company: Joi.number(),
  token: Joi.string().allow('').optional()
});

async function uploadBase64(base64Str, src, dest){
  await base64Decode(base64Str, src);

  // let file = await fs.readFile(src);
  let file= src.split('/');
  let fileName = file[file.length-1].split('.');
  let fileExt = fileName[fileName.length - 1];
  // // let date = new Date();
  let timestamp = Date.now();
  let newName = fileName[0] + '_' + timestamp + '.' + fileExt;
  let path = dest + newName;
  let response = await upload(path, src);
  switch (fileExt) {
    case 'pdf':
      type = 'PDF';
      break;
    case 'doc':
      type = 'WORD';
      break;
    case 'docx':
      type = 'WORD';
      break;
    case 'jpg':
      type = 'JPG';
      break;
    case 'jpeg':
      type = 'JPG';
      break;
    case 'png':
      type = 'PNG';
      break;

  }

  return {filename: newName, fileType: type, path: path};


  // let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId});
  // application.resume = {filename: name, type: type};

  // if(file){
  //   application.resume = file._id;
  //   application.files.push(file._id);
  //
  //
  // }
}



async function add(application, member) {
  let data = null;

  if(!application || !member){
    return;
  }


  let job = application.job;
  let candidate = application.user;
  application.job = job._id;
  application.user = candidate._id;

  let resume = application.resume;
  delete application.resume;

  let photo = application.photo;
  delete application.photo;

  application = await Joi.validate(application, applicationSchema, {abortEarly: false});

  let savedApplication = await new Application(application).save();
  if (savedApplication) {

    let jobPipeline = await pipelineService.findById(job.pipeline);
    if (jobPipeline) {

      let applyStage = _.find(jobPipeline.stages, {type: 'APPLIED'});
      let progress = await applicationProgressService.addApplicationProgress({applicationId: savedApplication.applicationId, stage: applyStage._id});
      job.noOfApplied+=1;
      // progress.stage = applyStage._id;

      if(jobPipeline.autoRejectBlackList && candidate.flag){
        savedApplication.status = applicationEnum.REJECTED;
      }

      savedApplication.progress.push(progress._id);
      savedApplication.allProgress.push(progress._id)
      savedApplication.currentProgress = progress._id;

      let taskMeta = {applicationId: savedApplication._id, applicationProgressId: progress._id};

      candidate.applications.push(savedApplication._id);
      await candidate.save();
      await job.save();

      await stageService.createTasksForStage(applyStage, job.title, taskMeta);

      savedApplication = await savedApplication.save();

      let source = await sourceService.findByJobIdAndCandidateId(job._id, candidate._id);
      if(source) {
        let campaign;
        if (application.token) {
          campaign = await emailCampaignService.findByToken(application.token);

          if (campaign) {
            let exists = _.find(campaign.stages, {type: emailCampaignStageType.APPLIED});
            if (!exists) {
              let stage = await emailCampaignStageService.add({type: emailCampaignStageType.APPLIED, organic: false});
              campaign.stages.push(campaign);
              campaign.currentStage = stage;
              campaign.application = savedApplication;
              await campaign.save();
            }
          }
        }
      }

      await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: savedApplication._id, action: actionEnum.ADDED, meta: {name: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, job: job._id, jobTitle: job.title}});
      if(jobPipeline.autoRejectBlackList && candidate.flag){
        await activityService.addActivity({causer: null, causerType: subjectType.SYSTEM, subjectType: subjectType.APPLICATION, subject: savedApplication._id, action: actionEnum.AUTO_REJECTED, meta: {name: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, jobTitle: job.jobTitle, job: job._id}});
      }
    }

  }


  return savedApplication;

}





async function apply(application) {
  let data = null;

  if(!application){
    return;
  }


  let job = application.job;
  let candidate = application.user;
  application.job = job._id;
  application.user = candidate._id;

  let resume = application.resume;
  delete application.resume;

  let photo = application.photo;
  delete application.photo;

  application = await Joi.validate(application, applicationSchema, {abortEarly: false});

  let savedApplication = await new Application(application).save();
  if (savedApplication) {

    if(resume && resume.base64) {
      let uploaded = await uploadBase64(resume.base64, "/tmp/" + resume.name, 'user/' + candidate.userId + '/_resumes/');
      let file = await fileService.addFile({
        filename: uploaded.filename,
        fileType: uploaded.fileType,
        path: uploaded.path,
        createdBy: candidate.userId
      });
      if (file) {
        savedApplication.resume = file._id;
        savedApplication.files.push(file._id);

      }
    }

    if(photo && photo.base64) {
      let uploaded = await uploadBase64(photo.base64, "/tmp/" + photo.name, 'applications/' + '/photos/');
      let file = await fileService.addFile({
        filename: uploaded.filename,
        fileType: uploaded.fileType,
        path: uploaded.path,
        createdBy: candidate.userId
      });
      if (file) {
        savedApplication.resume = file._id;
        savedApplication.files.push(file._id);
      }
    }

    let jobPipeline = await pipelineService.findById(job.pipeline);
    if (jobPipeline) {

      let applyStage = _.find(jobPipeline.stages, {type: 'APPLIED'});
      let progress = await applicationProgressService.addApplicationProgress({applicationId: savedApplication.applicationId, stage: applyStage._id});
      job.noOfApplied+=1;
      // progress.stage = applyStage._id;

      if(jobPipeline.autoRejectBlackList && candidate.flag){
        savedApplication.status = applicationEnum.REJECTED;
      }

      savedApplication.progress.push(progress._id);
      savedApplication.allProgress.push(progress._id)
      savedApplication.currentProgress = progress._id;

      if(application.applicationQuestions) {
        application.applicationQuestions.createdBy = candidate.userId;
        let questionSubmission = await questionSubmissionService.addSubmission(application.applicationQuestions);

        if (questionSubmission) {
          savedApplication.questionSubmission = questionSubmission._id;
          savedApplication.hasSubmittedQuestion = true;
        }
      }

      let taskMeta = {applicationId: savedApplication._id, applicationProgressId: progress._id};

      candidate.applications.push(savedApplication._id);
      await candidate.save();
      await job.save();

      await stageService.createTasksForStage(applyStage, job.title, taskMeta);



      savedApplication = await savedApplication.save();

      let source = await sourceService.findByJobIdAndCandidateId(job._id, candidate._id);

      if(source) {
        let campaign;
        if (application.token) {
          campaign = await emailCampaignService.findByToken(application.token);

          if (campaign) {
            let exists = _.find(campaign.stages, {type: emailCampaignStageType.APPLIED});
            if (!exists) {
              let stage = await emailCampaignStageService.add({type: emailCampaignStageType.APPLIED, organic: false});
              campaign.stages.push(campaign);
              campaign.currentStage = stage;
              campaign.application = savedApplication;
              await campaign.save();
            }
          }
        }
      }

      await activityService.addActivity({causer: candidate._id, causerType: subjectType.CANDIDATE, subjectType: subjectType.APPLICATION, subject: savedApplication._id, action: actionEnum.APPLIED, meta: {name: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, job: job._id, jobTitle: job.title}});
      if(jobPipeline.autoRejectBlackList && candidate.flag){
        await activityService.addActivity({causer: null, causerType: subjectType.SYSTEM, subjectType: subjectType.APPLICATION, subject: savedApplication._id, action: actionEnum.AUTO_REJECTED, meta: {name: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, jobTitle: job.jobTitle, job: job._id}});
      }

      //Create Notification
      let meta = {
        companyId: job.company.companyId,
        applicationId: savedApplication._id,
        jobId: job._id,
        jobTitle: job.title,
        candidateId: candidate._id,
        name: candidate.firstName + ' ' + candidate.lastName,
        userId: candidate.userId,
        avatar: candidate.avatar
      };

      await await feedService.createNotification(job.createdBy.userId, savedApplication.company, notificationType.APPLICATION, applicationEnum.APPLIED, meta);

    }




    if (application.follow) {
      if(job.company.partyType=='COMPANY') {
        await feedService.followCompany(application.company, candidate.userId);
      } else {
        await feedService.followInstitute(application.company, candidate.userId);
      }
    }

  }


  return savedApplication;

}




function findById(applicationId) {
  let data = null;

  if(!applicationId){
    return;
  }
  return Application.findById(applicationId);
}


function findByApplicationId(applicationId) {
  let data = null;

  if(!applicationId){
    return;
  }

  return Application.findOne({applicationId: applicationId})
}

function findApplicationBy_Id(applicationId) {
  let data = null;

  if(!applicationId){
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

  // let jobs = await jobService.findJobsByCompanyId(company);

  var from = new Date();
  from.setDate(from.getDate()-1);
  from.setMinutes(0);
  from.setHours(0)
  let now = Date.now();

  let result = await Application.find({$and: [ {company: company}, {status:statusEnum.ACTIVE}, {createdDate: {$gte: from.getTime()}}, {createdDate: {$lte: now}}] }).populate('user').sort({createdDate: -1});
  return result;

}


async function findByJobId(jobId) {
  let data = null;

  if(!jobId){
    return;
  }
  console.log(jobId)
  let applications = await Application.find({jobId:jobId});


  return applications;

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


async function findApplicationByCandidateIdAndJobId(candidateId, jobId) {
  let data = null;

  if(candidateId==null || jobId==null){
    return;
  }

  let application = await Application.aggregate([
    { $match: {user: candidateId, jobId: jobId} },
    { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user '},
    { $limit: 1 }
  ]);


  data = application.length?application[0]:null;

  return data;
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




async function disqualify(applicationId, reason, member) {
  let result = null;

  if(!applicationId || !reason || !member){
    return;
  }

  let application = await Application.findById(applicationId).populate([
    {
      path: 'user',
      model: 'Candidate'
    },
    {
      path: 'job',
      model: 'JobRequisition',
      populate: [
        {
          path: 'createdBy',
          model: 'Member'
        }
      ]
    },
    {
      path: 'currentProgress',
      model: 'ApplicationProgress'
    },
  ])


  if(application && application.status==statusEnum.ACTIVE){
    application.status = statusEnum.DISQUALIFIED;
    application.reason = reason;
    application = await application.save();


    if(application.currentProgress.event) {
      await calendarService.cancelEvent(application.company, member.userId, application.currentProgress.event);
      application.currentProgress.event = null;
      await application.currentProgress.save();
    }
    let job = await application.job;
    //Add activity
    await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.DISQUALIFIED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: job.title, job: job._id, reason: reason}});

    //Create Notification
    let meta = {
      causer: member.userId,
      applicationId: application._id,
      jobId: job._id,
      jobTitle: job.title,
      candidateId: application.user._id,
      userId: application.user.userId,
      name: application.user.firstName + ' ' + application.user.lastName,
      avatar: application.user.avatar
    };

    await await feedService.createNotification(application.job.createdBy.userId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_DISQUALIFIED, meta);

    result = {status: statusEnum.DISQUALIFIED};
  }
  return result;
}


async function revert(applicationId, member) {
  let result = null;

  if(!applicationId || !member){
    return;
  }

  let application = await Application.findById(applicationId).populate('user');
  if(application.status==statusEnum.DISQUALIFIED){
    application.reason = null;
    application.status = statusEnum.ACTIVE;
    application = await application.save();

    if(application.status==statusEnum.ACTIVE){
      result = {status: statusEnum.ACTIVE};

      let job = await jobService.findJob_Id(ObjectID(application.jobId));
      await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.REVERTED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: job.title, job: job._id}});

      //Create Notification
      let meta = {
        causer: member.userId,
        applicationId: application._id,
        jobId: job._id,
        jobTitle: job.title,
        candidateId: application.user._id,
        userId: application.user.userId,
        name: application.user.firstName + ' ' + application.user.lastName,
        avatar: application.user.avatar
      };

      await await feedService.createNotification(job.createdBy.userId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_REVERTED, meta);

    }
  }
  return result;
}



async function deleteById(id, member) {
  let result = null;

  if(!id || !member){
    return;
  }


  let application = await Application.findById(id).populate('user');
  if(application){
    application.status = statusEnum.DELETED;
    application = await application.save();
    let job = await jobService.findJob_Id(ObjectID(application.jobId));
    await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.DELETED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: job.title, job: job._id}});
    result = {status: statusEnum.DELETED};
  }
  return result;
}


async function deleteByList(ids) {
  let result = null;

  if(!ids){
    return;
  }

  let applications = await Application.find({_id: {$in: ids}});
  if(applications) {
    let progresses = _.reduce(applications, function(res, app){
      let list = res.concat(app.progress);
      return list;
    }, []);
    await applicationProgressService.deleteByList(progresses);
    await Application.updateMany({_id: {$in: ids}}, {$set: {status: statusEnum.DELETED}});
  }

}

async function removeByList(ids) {
  let result = null;

  if(!ids){
    return;
  }

  let applications = await Application.find({_id: {$in: ids}});
  let progresses = _.reduce(applications, function(res, item){return res.concat(item.progress);}, []);
  await applicationProgressService.removeByList(progresses);
  await Application.remove({_id: {$in: ids}});

}



async function accept(applicationId, member) {
  let result = null;

  if(!applicationId || !member){
    return;
  }


  let application = await Application.findById(applicationId).populate([
    {
      path: 'user',
      model: 'Candidate'
    },
    {
      path: 'job',
      model: 'JobRequisition',
      populate: [
        {
          path: 'createdBy',
          model: 'Member'
        }
      ]
    }
  ])

  if(application){
    application.status = statusEnum.ACTIVE;
    application = await application.save();
    await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.ACCEPTED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: application.jobTitle, job: application.job}});
    result = {status: statusEnum.ACTIVE};

    //Create Notification
    let meta = {
      causer: member.userId,
      applicationId: application._id,
      jobId: application.job._id,
      jobTitle: application.job.title,
      candidateId: application.user._id,
      userId: application.user.userId,
      name: application.user.firstName + ' ' + application.user.lastName,
      avatar: application.user.avatar
    };

    await await feedService.createNotification(application.job.createdBy.userId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_ACCEPTED, meta);

  }
  return result;
}


async function reject(applicationId, member) {
  let result = null;

  if(!applicationId || !member){
    return;
  }

  let application = await Application.findById(applicationId).populate([
    {
      path: 'user',
      model: 'Candidate'
    },
    {
      path: 'job',
      model: 'JobRequisition',
      populate: [
        {
          path: 'createdBy',
          model: 'Member'
        }
      ]
    }
  ])

  if(application){
    application.status = statusEnum.REJECTED;
    application = await application.save();
    await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.REJECTED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: application.jobTitle, job: application.job}});

    //Create Notification
    let meta = {
      causer: member.userId,
      applicationId: application._id,
      jobId: application.job._id,
      jobTitle: application.job.title,
      candidateId: application.user._id,
      userId: application.user.userId,
      name: application.user.firstName + ' ' + application.user.lastName,
      avatar: application.user.avatar
    };

    await await feedService.createNotification(application.job.createdBy.userId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_REJECTED, meta);


    result = {status: statusEnum.REJECTED};
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
  console.log(result)
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


  let candidateSources  = await Application.aggregate([
    {$match: {company: company}},
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
    { $project:{_id: 0, user: '$user.userId', sources: '$user.sources'}},
  ]);

  console.log(candidateSources)
  if(candidateSources){
    let total = 0;
    let data = {};
    for(i in candidateSources){
      if(candidateSources[i].sources.length) {
        for (const [j, source] of candidateSources[i].sources.entries()) {
          if (data[source._id]) {
            data[source._id].count += 1;
          } else {
            data[source._id] = {name: source.name, count: 1};
          }
          total++;
        }
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

  let candidateSources  = await Application.aggregate([
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
    { $project:{_id: 0, sources: '$user.sources'}}
  ]);


  if(candidateSources){
    let total = 0;
    let data = {};
    for(i in candidateSources){
      if(candidateSources[i].sources.length) {
        for (const [j, source] of candidateSources[i].sources.entries()) {
          if (data[source._id]) {
            data[source._id].count += 1;
          } else {
            data[source._id] = {name: source.name, count: 1};
          }
          total++;
        }
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


async function getAllApplicationsEndingSoon(company, sort) {
  let result = null;

  if(!company){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };


  let aList = [];
  let aMatch = { $match: {company: company} };
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);
  aList.push(
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

  );


  aList.push(aSort);

  let aggregate = Application.aggregate(aList)

  let applications = await Application.aggregatePaginate(aggregate, options);

  return applications;
}


async function getApplicationsStagesByJobId(jobId) {
  let result = null;

  if(!jobId){
    return;
  }


  let applications = await Application.aggregate([
    { $match: {jobId: jobId} },
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
    { $group: {_id: { _id: '$currentProgress.stage', stageId: '$currentProgress.stage._id', name: '$currentProgress.stage.name', type: '$currentProgress.stage.type'}, count: {$sum: 1}}},
    { $project: {_id: 0, stageId: '$_id.stageId', name: '$_id.name', type: '$_id.type', count: '$count'}}
  ])

  if(applications){
    let total = 0;
    let data = {};
    for(i in applications){

      data[applications[i].stageId] = applications[i];
      total+=applications[i].count;

    }
    result = {total: total, data: data};
  }
  return result;
}


async function search(jobId, filter, sort) {
  let data = null;

  if(jobId==null || !filter || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;
  let aSort = { $sort: {createdDate: direction} };

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  let aList = [];
  let aLookup = [];
  let aMatch = {};

  aList.push({ $match: {jobId: jobId, status: {$in: filter.status} } });
  aList.push(
    {$lookup:{
        from:"applicationprogresses",
        let:{currentProgress:"$currentProgress"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$currentProgress"]}}},
          {
            $lookup: {
              from: 'stages',
              localField: 'stage',
              foreignField: '_id',
              as: 'stage',
            },
          },
          {$unwind: '$stage'}
        ],
        as: 'currentProgress'
      }},
    {$unwind: '$currentProgress'}
    );

  aList.push(
    {$lookup:{
        from:"candidates",
        let:{user:"$user"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$user"]}}},
          {
            $lookup: {
                from: 'labels',
                localField: 'sources',
                foreignField: '_id',
                as: 'sources',
            },
          },
          {
            $lookup: {
              from: 'evaluations',
              localField: 'userId',
              foreignField: 'partyId',
              as: 'evaluations',
            },
          },
          { $addFields:
              {
                rating: {$round: [{$avg: "$evaluations.rating"}, 1]},
                evaluations: [],
                applications: []
              }
          },
        ],
        as: 'user'
      }},
    {$unwind: '$user'}
  );


  let params = new ApplicationSearchParam(filter);
  aList.push({ $match: params});

  const aggregate = Application.aggregate(aList);

  let result = await Application.aggregatePaginate(aggregate, options);
  if(result.docs.length){
    let job = await jobService.findJob_Id(result.docs[0].jobId);
    let pipeline = await pipelineService.findByJobId(job._id);

    if(pipeline){
      result.docs.forEach(function(app){
        let stage = _.find(pipeline.stages, {_id: app.currentProgress.stage._id});
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


async function searchEmails(companyId, member, applicationId, sort) {
  let data = null;


  if(!companyId || !member || applicationId==null || !sort){
    return;
  }

  let result;
  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;
  let aSort = { $sort: {createdDate: direction} };

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  let aList = [];
  let aLookup = [];
  let aMatch = {};

  aList.push({ $match: {_id: applicationId} });
  aList.push(
    {
      $lookup: {
        from: 'emails',
        localField: 'emails',
        foreignField: '_id',
        as: 'emails',
      },
    },
  );


  aList.push(
    {
      $project: {
        emails: '$emails'
      }
    }
  );
  aList.push(
    {
      $unwind: '$emails'
    }
  );
  aList.push(
    {
      $project: {
        _id: '$emails._id',
        from: '$emails.from',
        to: '$emails.to',
        cc: '$emails.c',
        attachments: '$emails.attachments',
        subject: '$emails.subject',
        // body: '$emails.body',
        status: '$emails.status',
        hasSent: '$emails.hasSent',
        hasRead: '$emails.hasRend',
        sentDate: '$emails.sentDate'
      }
    }
  );
  const aggregate = Application.aggregate(aList);

  result = await Application.aggregatePaginate(aggregate, options);


  let members = [];
  if(result.docs.length){
    members = await memberService.getMembers(companyId);
  }

  result.docs = _.reduce(result.docs, function(res, email){
    if(email) {

      // email.hasRead = ((email.from.memberId && email.from.memberId.equals(member._id)) || email.hasRead) ? email.hasRead : false;

      let member = _.find(members, {_id: ObjectID(email.from.memberId)});
      email.from = convertToAvatar(member);
      res.push(email);
    }
    return res;
  }, []);

  return result;

}






module.exports = {
  add:add,
  apply: apply,
  findById: findById,
  findByApplicationId: findByApplicationId,
  findApplicationBy_Id:findApplicationBy_Id,
  findApplicationsByJobIds:findApplicationsByJobIds,
  findApplicationByUserId: findApplicationByUserId,
  findApplicationByCandidateIdAndJobId: findApplicationByCandidateIdAndJobId,
  findApplicationByUserIdAndJobId: findApplicationByUserIdAndJobId,
  findApplicationByIdAndUserId:findApplicationByIdAndUserId,
  findAppliedCountByJobId: findAppliedCountByJobId,
  findCandidatesByCompanyId:findCandidatesByCompanyId,
  findApplicationsByUserId:findApplicationsByUserId,
  findByJobId: findByJobId,
  getLatestCandidates:getLatestCandidates,
  disqualify:disqualify,
  revert:revert,
  deleteById:deleteById,
  deleteByList:deleteByList,
  removeByList:removeByList,
  accept:accept,
  reject:reject,
  getApplicationActivities:getApplicationActivities,
  getCompanyInsight: getCompanyInsight,
  getJobInsight:getJobInsight,
  getCandidatesSourceByCompanyId:getCandidatesSourceByCompanyId,
  getInsightCandidates:getInsightCandidates,
  getCandidatesSourceByJobId:getCandidatesSourceByJobId,
  applicationsEndingSoon:applicationsEndingSoon,
  getAllApplicationsEndingSoon:getAllApplicationsEndingSoon,
  getApplicationsStagesByJobId:getApplicationsStagesByJobId,
  search:search,
  searchEmails:searchEmails

}
