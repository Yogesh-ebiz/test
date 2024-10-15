const _ = require('lodash');
const Joi = require('joi');
const fs = require('fs').promises;
const {upload, uploadFromBuffer} = require('../services/aws.service');

const ObjectID = require('mongodb').ObjectID;
const ObjectId = require('mongodb').ObjectId;

let ApplicationSearchParam = require('../const/applicationSearchParam');
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const actionEnum = require('../const/actionEnum');
const subjectType = require('../const/subjectType');
const notificationType = require('../const/notificationType');
const notificationEvent = require('../const/notificationEvent');
const emailCampaignStageType = require('../const/emailCampaignStageType');

let { myEmitter } = require('../config/eventemitter');

const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');
const User = require('../models/user.model');


const Pagination = require('../utils/job.pagination');
const jobService = require('./jobrequisition.service');
const applicationProgressService = require('../services/applicationprogress.service');
const questionSubmissionService = require('../services/questionsubmission.service');
const stageService = require('../services/stage.service');
const activityService = require('../services/activity.service');
const pipelineService = require('./jobpipeline.service');
const pipelineTemplateService = require('../services/pipelineTemplate.service');
const sourceService = require('../services/source.service');
const emailCampaignService = require('../services/emailcampaign.service');
const emailCampaignStageService = require('../services/emailcampaignstage.service');
const fileService = require('../services/file.service');
const companyService = require('../services/company.service');
const memberService = require('../services/member.service');
const userService = require('../services/user.service');
const messagingService = require('../services/api/messaging.service.api');


const feedService = require('../services/api/feed.service.api');
const calendarService = require('../services/api/calendar.service.api');

const {base64Decode, base64Encode, convertToAvatar} = require('../utils/helper');



const applicationSchema = Joi.object({
  jobTitle: Joi.string().allow(''),
  job: Joi.object().required(),
  jobId: Joi.object().required(),
  user: Joi.object().required(),
  partyId: Joi.number().optional(),
  phoneNumber: Joi.string(),
  email: Joi.string().required(),
  availableDate: Joi.number().allow(null).optional(),
  attachment: Joi.string().allow('').optional(),
  follow: Joi.boolean().optional(),
  resumeId: Joi.any().optional(),
  questionAnswers: Joi.array(),
  coverLetter: Joi.string().allow('').optional(),
  source: Joi.string().allow('').optional(),
  desiredSalary: Joi.number().allow(null).optional(),
  currency: Joi.string().allow('').optional(),
  applicationQuestions: Joi.object().allow(null).optional(),
  firstName: Joi.string().allow('').optional(),
  lastName: Joi.string().allow('').optional(),
  company: Joi.object(),
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



async function add_bak(form, member) {
  let data = null;

  if(!form || !member || !candidate){
    throw new Error("Invalid Input");
  }

  const {job, user, resume, photo} = application;
  delete application.resume;
  delete application.photo;

  if(!application || !member || !job.pipeline){
    return;
  }

  const {pipeline} = job;
  let candidate = application.user;
  application.job = job._id;
  application.user = candidate._id;
  await applicationSchema.validate(application, {abortEarly: false});


  let savedApplication = await new Application(application).save();
  if (savedApplication) {

    let applyStage = _.find(pipeline.stages, {type: 'APPLIED'});
    let progress = await applicationProgressService.add({applicationId: savedApplication.applicationId, stage: applyStage.type});
    job.noOfApplied+=1;
    // progress.stage = applyStage._id;

    if(pipeline.autoRejectBlackList && candidate.flag){
      savedApplication.status = applicationEnum.REJECTED;
    }

    savedApplication.progress.push(progress._id);
    savedApplication.currentProgress = progress._id;

    let taskMeta = {applicationId: savedApplication._id, applicationProgressId: progress._id};

    candidate.applications.push(savedApplication._id);
    await candidate.save();
    await job.save();
    savedApplication = await savedApplication.save();

    // ToDo: Need to create task(s) per stage.task list
    // await stageService.createTasksForStage(applyStage, job.title, taskMeta);

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

    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: savedApplication._id, action: actionEnum.ADDED, meta: {name: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, job: job._id, jobTitle: job.title}});
    if(pipeline.autoRejectBlackList && candidate.flag){
      await activityService.add({causer: null, causerType: subjectType.SYSTEM, subjectType: subjectType.APPLICATION, subject: savedApplication._id, action: actionEnum.AUTO_REJECTED, meta: {name: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, jobTitle: job.jobTitle, job: job._id}});
    }


  }


  return savedApplication;

}


async function add(form, job, candidate, member, createAppliedActivity = true) {


  if(!form || !job || !candidate || !member){
    throw new Error("Invalid Input");
  }

  console.log(job._id, job.pipeline)
  let newApplication = null;
  const application = await hasApplication(candidate._id, job._id);
  if(application){
    throw new Error("Application already exists by this Candidate for this job");
  }

  form.job = job._id;
  form.user = candidate._id;
  form.company = job.company;
  form.jobTitle = job.title;

  const { applicationQuestions } = form;
  const { company, hasQuestions, token } = job;
  const { user } = candidate;


  await applicationSchema.validate(form, { abortEarly: false });
  const pipeline = await pipelineService.findById(job.pipeline);
  if(pipeline) {

    newApplication = await new Application(form).save();
    if (newApplication) {
      candidate.applications.push(newApplication._id);
      const applyStage = _.find(pipeline.stages, { type: 'APPLIED' });
      const progress = await applicationProgressService.add({
        applicationId: newApplication.applicationId,
        stage: applyStage.type
      });

      // progress.stage = applyStage._id;

      if (pipeline.autoRejectBlackList && candidate.flag) {
        newApplication.status = applicationEnum.REJECTED;
      }

      newApplication.progress.push(progress._id);
      // newApplication.allProgress.push(progress._id)
      newApplication.currentProgress = progress._id;

      if (hasQuestions && applicationQuestions) {
        applicationQuestions.createdBy = candidate.userId;
        let questionSubmission = await questionSubmissionService.addSubmission(application.applicationQuestions);

        if (questionSubmission) {
          newApplication.questionSubmission = questionSubmission._id;
          newApplication.hasSubmittedQuestion = true;
        }
      }


      job.applications.push(newApplication._id);
      job.noOfApplied += 1;

      // ToDo: Need this to generate cron job for task automations
      // await stageService.createTasksForStage(applyStage, job.title, taskMeta);

      //Create a conversation in Messaging Service.
      if(candidate.messengerId){
        let applicationConversation = {
          type: 'GROUP',
          members: [candidate.messengerId.toString()],
          meta: { applicationId: newApplication._id, candidateId: candidate._id },
        }
        let newAppConvRes = await messagingService.createConversation(applicationConversation);
        newApplication.conversationId = newAppConvRes?.conversationId?newAppConvRes.conversationId:null;
      }

      newApplication = await newApplication.save();

      const source = await sourceService.findByJobIdAndCandidateId(job._id, candidate._id);
      if (source) {
        let campaign;
        if (token) {
          campaign = await emailCampaignService.findByToken(token);

          if (campaign) {
            const exists = _.find(campaign.stages, { type: emailCampaignStageType.APPLIED });
            if (!exists) {
              let stage = await emailCampaignStageService.add({
                type: emailCampaignStageType.APPLIED,
                organic: false
              });
              campaign.stages.push(campaign);
              campaign.currentStage = stage;
              campaign.application = newApplication;
              await campaign.save();
            }
          }
        }
      }


      await job.save();
      await candidate.save();
      //await user.save();

      const taskMeta = { applicationId: newApplication._id, applicationProgressId: progress._id };
      if (createAppliedActivity) {
        await activityService.add({
          causer: candidate._id,
          causerType: subjectType.CANDIDATE,
          subjectType: subjectType.APPLICATION,
          subject: newApplication._id,
          action: actionEnum.APPLIED,
          meta: {
            name: candidate.firstName + ' ' + candidate.lastName,
            candidate: candidate._id,
            job: job._id,
            jobTitle: job.title
          }
        });
      }
      if (pipeline.autoRejectBlackList && candidate.flag) {
        await activityService.add({
          causer: null,
          causerType: subjectType.SYSTEM,
          subjectType: subjectType.APPLICATION,
          subject: newApplication._id,
          action: actionEnum.AUTO_REJECTED,
          meta: {
            name: candidate.firstName + ' ' + candidate.lastName,
            candidate: candidate._id,
            jobTitle: job.jobTitle,
            job: job._id
          }
        });
      }

      //Create Notification
      let meta = {
        companyId: job.company.companyId,
        applicationId: newApplication._id,
        jobId: job._id,
        jobTitle: job.title,
        candidateId: candidate._id,
        name: candidate.firstName + ' ' + candidate.lastName,
        userId: candidate.userId,
        avatar: candidate.avatar
      };


      // ToDo: Move to Message Service
      // await await feedService.createNotification(job.createdBy.userId, newApplication.company, notificationType.APPLICATION, applicationEnum.APPLIED, meta);



      // ToDo : Follow company api call
      // if (form.follow) {
      //   if(job.company.partyType=='COMPANY') {
      //     await feedService.followCompany(job.companyId, candidate.userId);
      //   } else {
      //     await feedService.followInstitute(job.companyId, candidate.userId);
      //   }
      // }

    }
  }else{
    throw new Error("Job does not contain a pipeline");
  }
  return newApplication;

}
async function apply(form, job, candidate) {
  let data = null;

  if(!form || !job || !candidate){
    return;
  }

  form.job = job._id;
  form.user = candidate._id;

  const { resume, photo, applicationQuestions } = form;
  const { company, hasQuestions, pipeline, token } = job;
  const { user } = candidate;
  delete form.resume;
  delete form.photo;

  await applicationSchema.validate(form, {abortEarly: false});

  // let user = await User.findOneAndUpdate({ user_id: candidate.userId},
  //   {user_id: candidate?.userId, first_name: candidate.firstName, last_name: candidate.lastName, last_applied: Date.now()},
  //   {new: true,   upsert: true })

  let newApplication = await new Application(form).save();
  if (newApplication) {
    candidate.applications.push(newApplication._id);
    candidate.hasApplied = true;

    if(applicationQuestions && Object.keys(applicationQuestions).length > 0) {
      applicationQuestions.createdBy = candidate.userId;
      let questionSubmission = await questionSubmissionService.add(applicationQuestions);
      if (questionSubmission) {
        newApplication.questionSubmission = questionSubmission._id;
        newApplication.hasSubmittedQuestion = true;
      }
    }

    if (pipeline) {
      let applyStage = _.find(pipeline.stages, {type: 'APPLIED'});
      let progress = await applicationProgressService.add({applicationId: newApplication.applicationId, stage: applyStage.type});
      job.noOfApplied+=1;
      // progress.stage = applyStage._id;

      if(pipeline.autoRejectBlackList && candidate.flag){
        newApplication.status = applicationEnum.REJECTED;
      }

      newApplication.progress.push(progress._id);
      // newApplication.allProgress.push(progress._id)
      newApplication.currentProgress = progress._id;


      job.applications.push(newApplication._id);

      // ToDo: Need this to generate cron job for task automations
      // await stageService.createTasksForStage(applyStage, job.title, taskMeta);


      newApplication = await newApplication.save();

      let source = await sourceService.findByJobIdAndCandidateId(job._id, candidate._id);

      if(source) {
        let campaign;
        if (token) {
          campaign = await emailCampaignService.findByToken(token);

          if (campaign) {
            let exists = _.find(campaign.stages, {type: emailCampaignStageType.APPLIED});
            if (!exists) {
              let stage = await emailCampaignStageService.add({type: emailCampaignStageType.APPLIED, organic: false});
              campaign.stages.push(campaign);
              campaign.currentStage = stage;
              campaign.application = newApplication;
              await campaign.save();
            }
          }
        }
      }




      if(resume && resume.base64) {
        let uploaded = await uploadBase64(resume.base64, "/tmp/" + resume.name, 'user/' + candidate.userId + '/_resumes/');
        let file = await fileService.addFile({
          filename: uploaded.filename,
          fileType: uploaded.fileType,
          path: uploaded.path,
          createdBy: candidate.userId
        });
        if (file) {
          newApplication.resume = file._id;
          newApplication.files.push(file._id);

          user.resumes = user.resumes?user.resumes:[];
          user.resumes.push(file._id);
        }
      } else if(newApplication.resumeId) {
        let file = await fileService.findyByFileId(newApplication.resumeId);
        if(file){
          newApplication.resume = file._id;
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
          // newApplication.resume = file._id;
          newApplication.files.push(file._id);
        }
      }

      await job.save();
      await candidate.save();
      await user.save();

      let taskMeta = {applicationId: newApplication._id, applicationProgressId: progress._id};
      await activityService.add({causer: candidate._id, causerType: subjectType.CANDIDATE, subjectType: subjectType.APPLICATION, subject: newApplication._id, action: actionEnum.APPLIED, meta: {name: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, job: job._id, jobTitle: job.title}});
      if(pipeline.autoRejectBlackList && candidate.flag){
        await activityService.add({causer: null, causerType: subjectType.SYSTEM, subjectType: subjectType.APPLICATION, subject: newApplication._id, action: actionEnum.AUTO_REJECTED, meta: {name: candidate.firstName + ' ' + candidate.lastName, candidate: candidate._id, jobTitle: job.jobTitle, job: job._id}});
      }

      if(candidate && candidate.messengerId){
        let applicationConversation = {
          type: 'GROUP',
          members: [candidate.messengerId.toString()],
          meta: { applicationId: newApplication._id, candidateId: candidate._id },
        }
        let newAppConvRes = await messagingService.createConversation(applicationConversation);
        newApplication.conversationId = newAppConvRes?.conversationId?newAppConvRes.conversationId:null;
      }

    }

    //Create Notification
    let meta = {
      companyId: job.company.companyId,
      applicationId: newApplication._id,
      jobId: job._id,
      jobTitle: job.title,
      candidateId: candidate._id,
      name: candidate.firstName + ' ' + candidate.lastName,
      userId: candidate.userId,
      avatar: candidate.avatar
    };

    myEmitter.emit('create-notification', job.createdBy.messengerId, newApplication.company, notificationType.APPLICATION, notificationEvent.APPLIED, meta);
    // Notify each job member
    const members = await jobService.getJobMembers(job._id);
    if (members && members.length > 0) {
      for (const member of members) {
        if (member.messengerId && member.messengerId !== job.createdBy.messengerId) {
          myEmitter.emit('create-notification', member.messengerId, newApplication.company, notificationType.APPLICATION, notificationEvent.APPLIED, meta);
        }
      }
    }
    // ToDo : Follow company api call
    // if (form.follow) {
    //   if(job.company.partyType=='COMPANY') {
    //     await feedService.followCompany(job.companyId, candidate.userId);
    //   } else {
    //     await feedService.followInstitute(job.companyId, candidate.userId);
    //   }
    // }

  }


  return newApplication;

}

async function addTaskToApplication(id, task) {
  let data = null;

  if(!id || !task){
    return;
  }
  const application = await


  Application.findById(id).populate('currentProgress');
  if(application) {
    application.tasks.push(task._id);
    application.currentProgress.tasks.push(task._id);

    await application.save();
    await application.currentProgress.save();
  }
}

function findById(id) {
  let data = null;

  if(!id){
    return;
  }
  return Application.findById(id);
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


function findApplicationsByUserId(userId) {
  let data = null;

  return Application.find({user: userId});
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

  let result = await Application.find({$and: [ {company: company}, {status:statusEnum.ACTIVE}, {createdDate: {$gte: from.getTime()}}, {createdDate: {$lte: now}}] }).populate('user').sort({createdDate: -1}).limit(10
  );
  return result;

}


async function findByJobId(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  let applications = await Application.find({jobId:jobId});


  return applications;

}

function findAppliedCountByJob(job) {
  let data = null;

  if(job==null){
    return;
  }

  return Application.find({job: job}).count();
}

function findAppliedCountByJobId(jobId) {
  let data = null;

  if(jobId==null){
    return;
  }

  return Application.find({job: jobId}).count();
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

  if(!applicationId || !userId){
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

async function hasApplication(user, job) {

  if(!user || !job){
    return;
  }

  const application = await Application.findOne({user, job, status: { $ne: 'DELETED' } });

  return application?true:false;
}

async function findApplicationByCandidateIdAndJobId(candidateId, job) {
  let data = null;

  if(!candidateId || !job){
    return;
  }

  let application = await Application.aggregate([
    { $match: {user: candidateId, job: job} },
    { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user '},
    { $limit: 1 }
  ]);


  data = application.length?application[0]:null;

  return data;
}

async function findApplicationByJobIdAndUserId(userId, jobId) {
  let data = null;

  if(!userId || !jobId){
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


async function findApplicationByJobIdAndEmail(email, jobId) {
  console.log(email, jobId)

  if(!email || !jobId){
    return;
  }

  let application = await Application.findOne({email: email.toLowerCase(), job: jobId});
  console.log(application)
  return application;
}

function findAppliedCountByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(!userId || !jobId){
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
    const {job} = application;

    application.status = statusEnum.DISQUALIFIED;
    application.reason = reason;
    application = await application.save();


    if(application.currentProgress?.event) {
      await calendarService.cancelEvent(application.company, member.userId, application.currentProgress.event);
      application.currentProgress.event = null;
      await application.currentProgress.save();
    }
    //Add activity
    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.DISQUALIFIED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: job.title, job: job._id, reason: reason}});

    let meta = {
      companyId: job.companyId,
      applicationId: application._id,
      jobId: job._id,
      jobTitle: job.title,
      candidateId: application.user._id,
      name: application.user.firstName + ' ' + application.user.lastName,
      userId: application.user.userId,
      avatar: application.user.avatar,
      reason: reason,
      stage: application.currentProgress?.stage,
    };
    myEmitter.emit('create-notification', job.createdBy.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_DISQUALIFIED, meta);
    // Notify each job member
    const members = await jobService.getJobMembers(job._id);
    if (members && members.length > 0) {
      for (const member of members) {
        if (member.messengerId && member.messengerId !== job.createdBy.messengerId) {
          myEmitter.emit('create-notification', member.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_DISQUALIFIED, meta);
        }
      }
    }
    result = {status: statusEnum.DISQUALIFIED};
  }
  return result;
}

async function disqualifyApplications(job, form, member) {
  let result = null;

  if(!job || !form || !member){
    return;
  }

  const {reason} = form;

  const applications = await Application.find({_id: { $in: form.applications}, job: job}).populate('user').populate({path: 'job', populate: { path: 'createdBy' }}).populate('currentProgress');
  if (applications.length === 0) {
    return null;
  }
  const disqualifiedApplications = [];
  if(applications && applications.length){

    for(let application of applications){
      const {job} = application;

      console.log(application)
      application.status = statusEnum.DISQUALIFIED;
      application.reason = reason;
      application = await application.save();
      disqualifiedApplications.push(application);
      await activityService.add({
        causer: member._id,
        causerType: subjectType.MEMBER,
        subjectType: subjectType.APPLICATION,
        subject: application._id,
        action: actionEnum.DISQUALIFIED,
        meta: {
          name: `${application.user.firstName} ${application.user.lastName}`,
          candidate: application.user._id,
          job: job._id,
          jobTitle: job.title,
          reason: reason
        }
      });

      let meta = {
        companyId: job.companyId,
        applicationId: application._id,
        jobId: job._id,
        jobTitle: job.title,
        candidateId: application.user._id,
        name: application.user.firstName + ' ' + application.user.lastName,
        userId: application.user.userId,
        avatar: application.user.avatar,
        reason: reason,
        stage: application.currentProgress?.stage,
      };
      myEmitter.emit('create-notification', job.createdBy.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_DISQUALIFIED, meta);
      // Notify each job member
      const members = await jobService.getJobMembers(job._id);
      if (members && members.length > 0) {
        for (const member of members) {
          if (member.messengerId && member.messengerId !== job.createdBy.messengerId) {
            myEmitter.emit('create-notification', member.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_DISQUALIFIED, meta);
          }
        }
      }
      //
  //
  //     if(application.currentProgress?.event) {
  //       await calendarService.cancelEvent(application.company, member.userId, application.currentProgress.event);
  //       application.currentProgress.event = null;
  //       await application.currentProgress.save();
  //     }
    }
  }
  return disqualifiedApplications;
}

async function revertApplications(jobId, form, member){
  if (!jobId || !form || !member) {
    return null;
  }
  const applications = await Application.find({
    _id: { $in: form.applications },
    job: jobId,
    status: { $in: [statusEnum.DISQUALIFIED, statusEnum.DELETED] }
  }).populate([
    { path: 'user', model: 'Candidate' },
    { path: 'job', model: 'JobRequisition', populate: { path: 'createdBy', model: 'Member' } }
  ]);

  if (applications.length === 0) {
    return null;
  }

  const revertedApplications = [];
  for (let application of applications) {
    application.status = statusEnum.ACTIVE;
    application.reason = null;
    await application.save();

    revertedApplications.push(application);
    await activityService.add({
      causer: member._id,
      causerType: subjectType.MEMBER,
      subjectType: subjectType.APPLICATION,
      subject: application._id,
      action: actionEnum.REVERTED,
      meta: {
        name: `${application.user.firstName} ${application.user.lastName}`,
        candidate: application.user._id,
        job: application.job._id,
        jobTitle: application.job.title
      }
    });
    let meta = {
      companyId: application.job.companyId,
      applicationId: application._id,
      jobId: application.job._id,
      jobTitle: application.job.title,
      candidateId: application.user._id,
      name: application.user.firstName + ' ' + application.user.lastName,
      userId: application.user.userId,
      avatar: application.user.avatar
    };
    myEmitter.emit('create-notification', application.job.createdBy.messengerId, application.job.company, notificationType.APPLICATION, notificationEvent.APPLICATION_REVERTED, meta);
    // Notify each job member
    const members = await jobService.getJobMembers(application.job._id);
    if (members && members.length > 0) {
      for (const member of members) {
        if (member.messengerId && member.messengerId !== application.job.createdBy.messengerId) {
          myEmitter.emit('create-notification', member.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_REVERTED, meta);
        }
      }
    }
  }

  return revertedApplications;

}

async function revert(applicationId, member) {
  let result = null;

  if(!applicationId || !member){
    return;
  }

  let application = await Application.findById(applicationId).populate('user').populate({path: 'job', model: 'JobRequisition', populate: { path: 'createdBy', model: 'Member' }});
  if(application && (application.status==statusEnum.DISQUALIFIED || application.status==statusEnum.DELETED)){
    const {job} = application;
    application.reason = null;
    application.status = statusEnum.ACTIVE;
    application = await application.save();

    if(application){
      result = {status: statusEnum.ACTIVE};

      await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.REVERTED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: job.title, job: job._id}});
      //Create Notification
      let meta = {
        companyId: application.job.companyId,
        applicationId: application._id,
        jobId: application.job._id,
        jobTitle: application.job.title,
        candidateId: application.user._id,
        name: application.user.firstName + ' ' + application.user.lastName,
        userId: application.user.userId,
        avatar: application.user.avatar
      };

      myEmitter.emit('create-notification', application.job.createdBy.messengerId, application.job.company, notificationType.APPLICATION, notificationEvent.APPLICATION_REVERTED, meta);
      // Notify each job member
      const members = await jobService.getJobMembers(application.job._id);
      if (members && members.length > 0) {
        for (const member of members) {
          if (member.messengerId && member.messengerId !== application.job.createdBy.messengerId) {
            myEmitter.emit('create-notification', member.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_REVERTED, meta);
          }
        }
      }
    }
  }
  return result;
}
async function deleteById(id, member) {
  let result = null;

  if(!id || !member){
    return;
  }


  let application = await Application.findById(id).populate('user').populate('job');
  if(application){
    const {job} = application;
    application.status = statusEnum.DELETED;
    application = await application.save();
    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.DELETED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: job.title, job: job._id}});
    result = {status: statusEnum.DELETED};
  }
  return result;
}

async function deleteByUser(candidateId) {
  let result = null;

  if(!candidateId){
    return;
  }


  await Application.findById(id).populate('user').populate('job');
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
    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.ACCEPTED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: application.jobTitle, job: application.job}});
    result = {status: statusEnum.ACTIVE};

    //Create Notification
    let meta = {
      companyId: application.job.companyId,
      applicationId: application._id,
      jobId: application.job._id,
      jobTitle: application.job.title,
      candidateId: application.user._id,
      name: application.user.firstName + ' ' + application.user.lastName,
      userId: application.user.userId,
      avatar: application.user.avatar
    };

    myEmitter.emit('create-notification', application.job.createdBy.messengerId, application.job.company, notificationType.APPLICATION, notificationEvent.APPLICATION_ACCEPTED, meta);
    // Notify each job member
    const members = await jobService.getJobMembers(application.job._id);
    if (members && members.length > 0) {
      for (const member of members) {
        if (member.messengerId && member.messengerId !== application.job.createdBy.messengerId) {
          myEmitter.emit('create-notification', member.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_ACCEPTED, meta);
        }
      }
    }
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
    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.APPLICATION, subject: application._id, action: actionEnum.REJECTED, meta: {name: application.user.firstName + ' ' + application.user.lastName, candidate: application.user._id, jobTitle: application.jobTitle, job: application.job}});

    //Create Notification
    let meta = {
      companyId: application.job.companyId,
      applicationId: application._id,
      jobId: application.job._id,
      jobTitle: application.job.title,
      candidateId: application.user._id,
      name: application.user.firstName + ' ' + application.user.lastName,
      userId: application.user.userId,
      avatar: application.user.avatar
    };

    myEmitter.emit('create-notification', application.job.createdBy.messengerId, application.job.company, notificationType.APPLICATION, notificationEvent.APPLICATION_REJECTED, meta);
    // Notify each job member
    const members = await jobService.getJobMembers(application.job._id);
    if (members && members.length > 0) {
      for (const member of members) {
        console.log(`member: ${member.messengerId}`);
        if (member.messengerId && member.messengerId !== application.job.createdBy.messengerId) {
          myEmitter.emit('create-notification', member.messengerId, application.company, notificationType.APPLICATION, notificationEvent.APPLICATION_REJECTED, meta);
        }
      }
    }
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

  return result;
}



async function getCompanyInsight(company, duration) {

  if(!company || !duration){
    return;
  }

  let maxDays = 30;
  let date;
  let currentStartDate, previousStartDate, previousEndDate;
  let group = {
    _id: null,
    viewers: {$push: '$$ROOT.user'},
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

  let data=[], total=0, change=0;
  let currentResult  = await Application.aggregate([
    {$match: {company: company, createdDate: {$gt: currentStartDate, $lt: new Date()}}},
    {
      $group: group
    }
  ]);

  let previousResult = await Application.aggregate([
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

  return { type: 'APPLIED', total: currentTotal, change: change.toFixed(2), data: currentData.reverse() };

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
  }else if (duration === '1W') {
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

  let currentStartDate, previousStartDate, previousEndDate;
  let change=0, changeNew=0, changeFailed=0;
  let group = {
    _id: null,
    viewers: {$push: '$$ROOT.user'},
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

  let currentResult  = await Application.aggregate([
    {$match: {job: jobId, createdDate: {$gt: currentStartDate, $lt: new Date()}}},
    {
      $group: group
    }
  ]);
  console.log(`currentResult: ${currentResult}`)

  let previousResult = await Application.aggregate([
    { $match: { job: jobId, createdDate: { $gte: previousStartDate, $lt: previousEndDate } } },
    { $group: group }
  ]);

  // Aggregate data for new applications
  let currentNewResult = await Application.aggregate([
    { $match: { job: jobId, status: 'ACTIVE', createdDate: { $gt: currentStartDate, $lt: new Date() } } },
    { $group: group }
  ]);

  let previousNewResult = await Application.aggregate([
    { $match: { job: jobId, status: 'ACTIVE', createdDate: { $gte: previousStartDate, $lt: previousEndDate } } },
    { $group: group }
  ]);

  // Aggregate data for failed applications
  let currentFailedResult = await Application.aggregate([
    { $match: { job: jobId, status: { $in: ['DISQUALIFIED', 'REJECTED'] }, createdDate: { $gt: currentStartDate, $lt: new Date() } } },
    { $group: group }
  ]);

  let previousFailedResult = await Application.aggregate([
    { $match: { job: jobId, status: { $in: ['DISQUALIFIED', 'REJECTED'] }, createdDate: { $gte: previousStartDate, $lt: previousEndDate } } },
    { $group: group }
  ]);

  let currentData = processResult(currentResult, currentStartDate, new Date(), duration);
  let previousData = processResult(previousResult, previousStartDate, previousEndDate, duration);
  let currentNewData = processResult(currentNewResult, currentStartDate, new Date(), duration);
  let previousNewData = processResult(previousNewResult, previousStartDate, previousEndDate, duration);
  let currentFailedData = processResult(currentFailedResult, currentStartDate, new Date(), duration);
  let previousFailedData = processResult(previousFailedResult, previousStartDate, previousEndDate, duration);

  let currentTotal = _.sumBy(currentData, item => item.data.paid + item.data.free);
  let previousTotal = _.sumBy(previousData, item => item.data.paid + item.data.free);
  let currentNewTotal = _.sumBy(currentNewData, item => item.data.paid + item.data.free);
  let previousNewTotal = _.sumBy(previousNewData, item => item.data.paid + item.data.free);
  let currentFailedTotal = _.sumBy(currentFailedData, item => item.data.paid + item.data.free);
  let previousFailedTotal = _.sumBy(previousFailedData, item => item.data.paid + item.data.free);

  if (currentTotal > 0 && previousTotal>= 0) {
    change = ((currentTotal - previousTotal) / currentTotal) * 100;
  }

  if (currentNewTotal > 0 && previousNewTotal >= 0) {
    changeNew = ((currentNewTotal - previousNewTotal) / currentNewTotal) * 100;
  }

  if (currentFailedTotal > 0 && previousFailedTotal >= 0) {
    changeFailed = ((currentFailedTotal - previousFailedTotal) / currentFailedTotal) * 100;
  }

  //return {type: 'APPLIED', total: currentTotal, change: change.toFixed(2), data: currentData.reverse()};
  return {
    allApplication: {
      type: 'APPLIED',
      total: currentTotal,
      change: change.toFixed(2),
      data: currentData.reverse(),
    },
    newApplications: {
      type: 'NEW_APPLICATION',
      total: currentNewTotal,
      change: changeNew.toFixed(2),
      data: currentNewData.reverse()
    },
    failedApplications: {
      type: 'FAILED_APPLICATION',
      total: currentFailedTotal,
      change: changeFailed.toFixed(2),
      data: currentFailedData.reverse()
    }
  }
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

  if(candidateSources){
    let total = 0;
    let data = {};
    for(const i in candidateSources){
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

    let sourcesArray = Object.keys(data).map(key => ({
      _id: key,
      name: data[key].name,
      count: data[key].count,
      percentage: (data[key].count / total) * 100
    }));

    // Sort sources by count in descending order
    sourcesArray.sort((a, b) => b.count - a.count);
    // Case 1: If total sources are less than or equal to 20, return the top 20
    let topSources = sourcesArray.slice(0, 20);
    // Case 2: If total sources are more than 20, filter sources with >5% share and get the top 20
    if (sourcesArray.length > 20) {
      let sourcesAboveFivePercent = sourcesArray.filter(source => source.percentage > 5);
      if (sourcesAboveFivePercent.length < 20) {
        let remainingSources = sourcesArray.filter(source => source.percentage <= 5).slice(0, 20 - sourcesAboveFivePercent.length);
        topSources = sourcesAboveFivePercent.concat(remainingSources);
      } else {
        topSources = sourcesAboveFivePercent.slice(0, 20);
      }
    }
    // Convert back to the original format for the response
    let finalData = {};
    topSources.forEach(source => {
      finalData[source._id] = {
        name: source.name,
        count: source.count,
        percentage: source.percentage.toFixed(2)
      };
    });
    result = {total: total, data: finalData};
  }

  return result;
}

async function getCandidateImpressionByRoles(company, duration) {
  if (!company || !duration) {
    return;
  }
  let date;

  if (duration === '1M') {
    date = new Date();
    date.setDate(date.getDate() - 30);
    date.setMinutes(0);
    date.setHours(0);
  } else if (duration === '3M') {
    date = new Date();
    date.setMonth(date.getMonth() - 3);
    date.setDate(1);
  } else if (duration === '6M') {
    date = new Date();
    date.setMonth(date.getMonth() - 6);
    date.setDate(1);
  }

  let roleImpressions = await Application.aggregate([
    { $match: { company: company, createdDate: { $gte: date } } },
    {
      $lookup: {
        from: 'candidates',
        let: { candidateId: '$user' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$candidateId'] } } },
          { $project: { level: 1 } }
        ],
        as: 'candidate'
      }
    },
    { $unwind: '$candidate' },
    {
      $group: {
        _id: { $toUpper: '$candidate.level' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ['$_id', 'OTHERS'] },
        count: 1
      }
    },
    { $sort: { count: -1 } }  // Sort by count in descending order
  ]);

  // Calculate total applications and percentage for each role
  const total = roleImpressions.reduce((sum, role) => sum + role.count, 0);

  roleImpressions = roleImpressions.map(role => ({
    name: role.name === "" ? "OTHERS" : role.name,
    count: role.count,
    percentage: ((role.count / total) * 100).toFixed(2)
  }));

  return roleImpressions;
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



async function getCandidatesSourceByJobId(jobId, duration) {

  if(!jobId){
    return;
  }

  if(!duration){
    duration = '1M';
  }

  let result= {}, date;
  let currentStartDate;
  if (duration == '1M') {
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 30);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);
  } else if (duration == '1W') {
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);
  }

  let candidateSources  = await Application.aggregate([
    { $match: {job: new ObjectId(jobId), createdDate: { $gt: currentStartDate, $lt: new Date() }}},
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
    for(let i = 0; i < candidateSources.length; i++){
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

    let sourcesArray = Object.keys(data).map(key => ({
      _id: key,
      name: data[key].name,
      count: data[key].count,
      percentage: (data[key].count / total) * 100
    }));

    // Apply sorting and select top sources logic
    sourcesArray.sort((a, b) => b.count - a.count);
    let topSources = sourcesArray.slice(0, 20);

    let finalData = {};
    topSources.forEach(source => {
      finalData[source._id] = {
        name: source.name,
        count: source.count,
        percentage: source.percentage.toFixed(2)
      };
    });
    result = { total, data: finalData };
  }
  return result;
}

async function getCandidatesLevelByJobId(jobId, duration) {
  if(!jobId){
    return;
  }

  if(!duration){
    duration = '1M'
  }
  let currentStartDate;

  if (duration == '1M') {
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 30);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);
  } else if (duration == '1W') {
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);
  }

  let result= {};

  let candidateLevels = await Application.aggregate([
    { $match: { job: new ObjectId(jobId), createdDate: { $gt: currentStartDate, $lt: new Date() } } },
    {
      $lookup: {
        from: "candidates",
        localField: "user",
        foreignField: "_id",
        as: "candidate"
      }
    },
    { $unwind: "$candidate" },
    { $group: { _id: "$candidate.level", count: { $sum: 1 } } }
  ]);


  if (candidateLevels) {
    let total = candidateLevels.reduce((acc, curr) => acc + curr.count, 0);

    result = candidateLevels.map(level => ({
      name: level._id || "OTHERS",
      count: level.count,
      percentage: total > 0 ? ((level.count / total) * 100).toFixed(2) : "0.00"
    }));
  }

  return result;
}


async function getApplicationsEndingSoon(company, limit = null) {
  const result = { data: [], count: 0 };

  if(!company){
    return;
  }


  let pipeline = [
    { $match: {company: company, status: statusEnum.ACTIVE} },
    { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $lookup:{
        from:"jobrequisitions",
        let:{job: '$job'},
        pipeline:[
          {$match:{$expr:{$eq:["$$job","$_id"]}}},
          { $lookup:{
              from:"jobpipelines",
              let:{pipeline: '$pipeline'},
              pipeline:[
                {$match:{$expr:{$eq:["$$pipeline","$_id"]}}},
              ],
              as: 'pipeline'
            }},
          { $unwind: '$pipeline'},
        ],
        as: 'job'
      }},
    { $unwind: '$job'},
    { $lookup:{
        from:"applicationprogresses",
        let:{currentProgress: '$currentProgress'},
        pipeline:[
          {$match:{$expr:{$eq:["$$currentProgress","$_id"]}}},
        ],
        as: 'currentProgress'
      }},
    { $unwind: '$currentProgress'},
    {
      $addFields: {
        "currentProgress.stage": {
            $filter: {
              input: "$job.pipeline.stages",
              as: "stage",
              cond: { $eq: ["$$stage.type", "$currentProgress.stage"] }
            }

        }
      }
    },
    { $unwind: '$currentProgress.stage'},
    { $addFields:
        {
          "currentProgress.timeLeft": {$round: [ {$divide : [{$subtract: [{ $add:[ {$toDate: "$createdDate"}, {$multiply: [{ $toDouble: "$currentProgress.stage.timeLimit" }, 1*24*60*60000] } ] }, "$$NOW"]}, 86400000]}, 0 ] },
          "job": "$job._id"
        }
    },
    {
      $match: {'currentProgress.timeLeft': {$gte: 0, $lte: 5}}
    },
    {
      $facet: {
          data: [
              { $sort: { "currentProgress.timeLeft": 1 } }, // Sorting by timeLeft
              ...(limit ? [{ $limit: limit }] : []) // Applying limit if provided
          ],
          count: [
              { $count: "totalCount" }
          ]
      }
    },
    {
      $addFields: {
          count: { $arrayElemAt: ["$count.totalCount", 0] }
      }
    },
    {
      $project: {
          data: 1,
          count: { $ifNull: ["$count", 0] }
      }
    }
  ];

  const applications = await Application.aggregate(pipeline);
  if(applications && applications.length){
    result.data = applications[0].data || [];
    result.count = applications[0].count || 0;
  }
  return result;
}
async function getNewApplications(company, limit = null) {
  const result = { data: [], count: 0 };

  if(!company){
    return;
  }

  let threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  let pipeline = [
    { $match: {company: company, status: statusEnum.ACTIVE, createdDate: { $gte: new Date(threeDaysAgo) } } },
    { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $lookup:{
        from:"jobrequisitions",
        let:{job: '$job'},
        pipeline:[
          {$match:{$expr:{$eq:["$$job","$_id"]}}},
          { $lookup:{
              from:"jobpipelines",
              let:{pipeline: '$pipeline'},
              pipeline:[
                {$match:{$expr:{$eq:["$$pipeline","$_id"]}}},
              ],
              as: 'pipeline'
            }},
          { $unwind: '$pipeline'},
        ],
        as: 'job'
      }},
    { $unwind: '$job'},
    { $lookup:{
        from:"applicationprogresses",
        let:{currentProgress: '$currentProgress'},
        pipeline:[
          {$match:{$expr:{$eq:["$$currentProgress","$_id"]}}},
        ],
        as: 'currentProgress'
      }},
    { $unwind: '$currentProgress'},
    {
      $addFields: {
        "currentProgress.stage": {
          $filter: {
            input: "$job.pipeline.stages",
            as: "stage",
            cond: { $eq: ["$$stage.type", "$currentProgress.stage"] }
          }

        }
      }
    },
    { $unwind: '$currentProgress.stage'},
    { $addFields:
        {
          "currentProgress.timeLeft": {$round: [ {$divide : [{$subtract: [{ $add:[ {$toDate: "$createdDate"}, {$multiply: [{ $toDouble: "$currentProgress.stage.timeLimit" }, 1*24*60*60000] } ] }, "$$NOW"]}, 86400000]}, 0 ] },
          "job": "$job._id"
        }
    },
    {
      $facet: {
        data: [
            { $sort: { createdDate: -1 } }, // Sort by createdDate asc
            ...(limit ? [{ $limit: limit }] : [])
        ],
        count: [
          { $count: "totalCount" }
        ]
      }
    },
    {
      $addFields: {
          count: { $arrayElemAt: ["$count.totalCount", 0] }
      }
    },
    {
      $project: {
          data: 1,
          count: { $ifNull: ["$count", 0] }
      }
    }
  ];

  const applications = await Application.aggregate(pipeline);
  if(applications && applications.length){
    result.data = applications[0].data || [];
    result.count = applications[0].count || 0;
  }
  return result;
}


async function getAllApplicationsEndingSoon(company, sort) {
  let result = null;

  if(!company || !sort){
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
  aList.push({ $match: { status: statusEnum.ACTIVE } });
  aList.push(
    { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $lookup:{
        from:"jobrequisitions",
        let:{job: '$job'},
        pipeline:[
          {$match:{$expr:{$eq:["$$job","$_id"]}}},
          { $lookup:{
              from:"jobpipelines",
              let:{pipeline: '$pipeline'},
              pipeline:[
                {$match:{$expr:{$eq:["$$pipeline","$_id"]}}},
              ],
              as: 'pipeline'
            }},
          { $unwind: '$pipeline'},
        ],
        as: 'job'
      }},
    { $unwind: '$job'},
    { $lookup:{
        from:"applicationprogresses",
        let:{currentProgress: '$currentProgress'},
        pipeline:[
          {$match:{$expr:{$eq:["$$currentProgress","$_id"]}}},
          // { $addFields:
          //     {
          //       timeLeft: {$round: [ {$divide : [{$subtract: [{ $add:[ {$toDate: "$createdDate"}, {$multiply: ['$stage.timeLimit', 1*24*60*60000] } ] }, "$$NOW"]}, 86400000]}, 0 ] }
          //     }
          // },

        ],
        as: 'currentProgress'
      }},
    { $unwind: '$currentProgress'},
    {
      $addFields: {
        "currentProgress.stage": {
            $filter: {
              input: "$job.pipeline.stages",
              as: "stage",
              cond: { $eq: ["$$stage.type", "$currentProgress.stage"] }
            }

        }
      }
    },
    { $unwind: '$currentProgress.stage'},
    { $addFields:
        {
          "currentProgress.timeLeft": {$round: [ {$divide : [{$subtract: [{ $add:[ {$toDate: "$createdDate"}, {$multiply: [{ $toDouble: "$currentProgress.stage.timeLimit" }, 1*24*60*60000] } ] }, "$$NOW"]}, 86400000]}, 0 ] },
          "job": "$job._id"
        }
    },
    {
      $match: {'currentProgress.timeLeft': {$gte: 0, $lte: 5}}
    }

  );


  aList.push(aSort);

  let aggregate = Application.aggregate(aList)

  let applications = await Application.aggregatePaginate(aggregate, options);

  return applications;
}

async function getAllApplicationsNewlyCreated(company, sort) {
  let result = null;
  if(!company || !sort){
    return;
  }

  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page)+1
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    lean:     true,
    limit:    limit,
    page: page
  };

  let aList = [];

  let aSort = { $sort: {createdDate: direction} };

  // Get the date 3 days ago
  let threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  aList.push(
    { $match: { company: company } },
    { $match: { status: { $ne: statusEnum.DELETED } }},
    { $match: { createdDate: { $gte: new Date(threeDaysAgo) } } },
    { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $lookup:{
        from:"jobrequisitions",
        let:{job: '$job'},
        pipeline:[
          {$match:{$expr:{$eq:["$$job","$_id"]}}},
          { $lookup:{
              from:"jobpipelines",
              let:{pipeline: '$pipeline'},
              pipeline:[
                {$match:{$expr:{$eq:["$$pipeline","$_id"]}}},
              ],
              as: 'pipeline'
            }},
          { $unwind: '$pipeline'},
        ],
        as: 'job'
      }},
    { $unwind: '$job'},
    { $lookup:{
        from:"applicationprogresses",
        let:{currentProgress: '$currentProgress'},
        pipeline:[
          {$match:{$expr:{$eq:["$$currentProgress","$_id"]}}},
        ],
        as: 'currentProgress'
      }},
    { $unwind: '$currentProgress'},
    {
      $addFields: {
        "currentProgress.stage": {
            $filter: {
              input: "$job.pipeline.stages",
              as: "stage",
              cond: { $eq: ["$$stage.type", "$currentProgress.stage"] }
            }
        }
      }
    },
    { $unwind: '$currentProgress.stage'},
    {
      $addFields: {
        "currentProgress.timeLeft": {
          $round: [{$divide: [{$subtract: [{$add:[{ $toDate: "$createdDate" }, { $multiply: [ { $toDouble: "$currentProgress.stage.timeLimit" }, 1 * 24 * 60 * 60000 ] }]}, "$$NOW" ]}, 86400000 ]}, 0]
        },
        "job": "$job._id"
      }
    },
    // {
    //   $match: { 'currentProgress.timeLeft': { $gte: 0, $lte: 3 } }
    // },
    { $addFields:
        {
          "newlyCreated": {$round: [ {$divide : [{$subtract: ["$$NOW", { $toDate: "$createdDate" }]}, 86400000]}, 0 ] }
        }
    }
  );


  aList.push(aSort);

  let aggregate = Application.aggregate(aList)

  let applications = await Application.aggregatePaginate(aggregate, options);

  return applications;
}


async function getApplicationsStagesByJobId(jobId, duration) {
  let result = null;

  if(!jobId){
    return;
  }

  if(!duration){
    duration = '1M'
  }

  let currentStartDate;
  if (duration == '1M') {
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 30);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);
  } else if (duration == '1W') {
    currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    currentStartDate.setMinutes(0);
    currentStartDate.setHours(0);
  }

  let applications = await Application.aggregate([
    { $match: {job: new ObjectId(jobId), createdDate: { $gt: currentStartDate, $lt: new Date() }} },
    { $lookup:{
        from:"applicationprogresses",
        let:{currentProgress: '$currentProgress'},
        pipeline:[
          {$match:{$expr:{$eq:["$$currentProgress","$_id"]}}},
          { $addFields: { name: "$stage" } }
        ],
        as: 'currentProgress'
      }},
    { $unwind: '$currentProgress'},
    { $group: { _id: "$currentProgress.name", count: { $sum: 1 } } },
    { $project: {_id: 0, name: '$_id', count: 1}}
  ])

  if(applications && applications.length > 0){
    let total = 0;
    let data = {};
    for (let i = 0; i < applications.length; i++) {
      total += applications[i].count;
    }
    applications.forEach(app => {
      data[app.name] = {
        name: app.name,
        count: app.count,
        percentage: ((app.count / total) * 100).toFixed(2)
      };
    });
    result = {total: total, data: data};
  }
  return result;
}
async function search(filter, sort, subscribedApplicationIds) {
  let data = null;

  if(!filter || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction==="DESC") ? -1:1;
  let sortBy = {};
  if (sort.sortBy === 'firstName') {
    sortBy['user.firstName'] = direction;
  } else if (sort.sortBy === 'level') {
    sortBy['user.level'] = direction;
  } else if(sort.sortBy === 'stage'){
    sortBy['currentProgress.stage'] = direction;
  } else if(sort.sortBy === 'rating'){
    sortBy['user.rating'] = direction;
  } else if(sort.sortBy === 'match'){
    sortBy['user.match'] = direction;
  }else if(sort.sortBy === 'noOfMonthExperiences'){
    sortBy['user.noOfMonthExperiences'] = direction;
  } else {
    sortBy[sort.sortBy] = direction;
  }

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

  let params = new ApplicationSearchParam(filter, subscribedApplicationIds);

  // aList.push({ $match: {jobId: jobId, status: {$in: filter.status} } });
  aList.push(
    {
      $lookup: {
        from: 'jobrequisitions',
        let: { job: '$job' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$job'] } } },
          {
            $lookup: {
              from: 'jobpipelines',
              let: { pipeline: '$pipeline' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pipeline'] } } }],
              as: 'pipeline',
            },
          },
          { $unwind: '$pipeline' },
        ],
        as: 'job',
      },
    },
    { $unwind: '$job' }
  );
  aList.push(
    {$lookup:{
        from:"applicationprogresses",
        let:{currentProgress:"$currentProgress"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$currentProgress"]}}},
        ],
        as: 'currentProgress'
      }},
    {$unwind: '$currentProgress'},
    {
      $addFields: {
        'currentProgress.stage': {
          $filter: {
            input: '$job.pipeline.stages',
            as: 'stage',
            cond: { $eq: ['$$stage.type', '$currentProgress.stage'] },
          },
        },
      },
    },
    { $unwind: '$currentProgress.stage' },
    {
      $addFields: {
        'currentProgress.timeLeft': {
          $round: [{$divide: [{ $subtract: [{ $add: [{ $toDate: '$createdDate' }, { $multiply: [{ $toDouble: '$currentProgress.stage.timeLimit' }, 1 * 24 * 60 * 60000] }] },'$$NOW']}, 86400000]}, 0]
        },
        "job": "$job._id",
        'currentProgress.stage': '$currentProgress.stage.type'
      },
    }
  );

  aList.push(
    {$lookup:{
        from:"evaluations",
        let:{evaluations:"evaluations"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$evaluations"]}}},
        ],
        as: 'evaluations'
      }},
    // { $unwind: '$evaluations' },
    { $unwind: {path: '$evaluations', preserveNullAndEmptyArrays: true} },
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
              from: 'experiences',
              let: { experiences: '$experiences' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$experiences'] } } },
                { $sort: { isCurrent: -1, thruDate: -1 } }, // Sort experiences by isCurrent first and then thruDate in descending order to get the latest experience
                { $limit: 1 }, // Limit the result to the latest experience
              ],
              as: 'current',
            },
          },
          {
            $addFields: {
              current: { $arrayElemAt: ['$current', 0] },
            },
          },
          {
            $lookup: {
              from: 'companies',
              localField: 'company',
              foreignField: '_id',
              as: 'company'
            }
          },
        ],
        as: 'user'
      }},
    {$unwind: '$user'}
  );

  // Lookup comments and add the count
  aList.push(
    {
      $lookup: {
        from: 'comments',
        let: { applicationId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$subject", "$$applicationId"] } } },
          { $count: "noOfComments" }
        ],
        as: 'comments'
      }
    },
    {
      $addFields: {
        noOfComments: { $arrayElemAt: ["$comments.noOfComments", 0] }
      }
    }
  );

  // Add noOfEmails
  aList.push(
    {
      $addFields: {
        noOfEmails: { $size: "$emails" }
      }
    }
  );

  // Lookup application progresses and sum the number of events
  aList.push(
    {
      $lookup: {
        from: 'applicationprogresses',
        let: { progresses: "$progress" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$progresses"] } } },
          { $unwind: "$event" },
          { $count: "totalEvents" }
        ],
        as: 'progresses'
      }
    },
    {
      $addFields: {
        noOfEvents: { $ifNull: [{ $arrayElemAt: ["$progresses.totalEvents", 0] }, 0] }
      }
    },
    {
      $project: {
        progresses: 0
      }
    }
  );

  console.log(params)
  aList.push({ $match: params});
  const aggregate = Application.aggregate(aList);

  let result = await Application.aggregatePaginate(aggregate, options);
  // if(result.docs.length){
  //   let job = await jobService.findJob_Id(result.docs[0].jobId);
  //   let pipeline = await pipelineService.findByJobId(job._id);
  //
  //   if(pipeline){
  //     result.docs.forEach(function(app){
  //       let stage = _.find(pipeline.stages, {_id: app.currentProgress.stage._id});
  //       if(stage) {
  //         stage.members = [];
  //         stage.tasks = [];
  //         stage.evaluations = [];
  //         app.currentProgress.stage = stage;
  //       }
  //     })
  //   }
  //
  // }

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
    members = await companyService.getMembers(companyId);
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

async function shortlistApplications(applications) {
  let result = null;

  if(!applications){
    return;
  }

  result = await Application.updateMany({_id: {$in: applications}}, {shortlist: true})
  return result;
}
async function removeShortlistApplications(applications) {
  let result = null;

  if(!applications){
    return;
  }

  result = await Application.updateMany({_id: {$in: applications}}, {shortlist: false})
  return result;
}



async function exists(job, email, userId) {

  if(!job && (!email || !userId)){
    return;
  }
  let result = await Application.findOne({job:job, $or: [ {email: email}, {partyId: userId} ]})
  return result?true:false;
}







module.exports = {
  add,
  apply,
  addTaskToApplication,
  findById,
  findByApplicationId,
  findApplicationBy_Id,
  findApplicationsByJobIds,
  findApplicationByUserId,
  findApplicationByCandidateIdAndJobId,
  findApplicationByJobIdAndUserId,
  findApplicationByJobIdAndEmail,
  findApplicationByIdAndUserId,
  findAppliedCountByJob,
  findAppliedCountByJobId,
  findCandidatesByCompanyId,
  findApplicationsByUserId,
  findByJobId,
  getLatestCandidates,
  hasApplication,
  disqualify,
  disqualifyApplications,
  revertApplications,
  revert,
  deleteById,
  deleteByList,
  removeByList,
  accept,
  reject,
  getApplicationActivities,
  getCompanyInsight,
  getJobInsight,
  getCandidatesSourceByCompanyId,
  getCandidateImpressionByRoles,
  getInsightCandidates,
  getCandidatesSourceByJobId,
  getCandidatesLevelByJobId,
  getApplicationsEndingSoon,
  getNewApplications,
  getAllApplicationsEndingSoon,
  getAllApplicationsNewlyCreated,
  getApplicationsStagesByJobId,
  search,
  searchEmails,
  shortlistApplications,
  removeShortlistApplications,
  exists

}
