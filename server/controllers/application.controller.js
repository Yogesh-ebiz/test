const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const AWS = require('aws-sdk');
const config = require('../config/config');

const {convertToCompany, jobMinimal} = require('../utils/helper');

const partyEnum = require('../const/partyEnum');
const applicationEnum = require('../const/applicationEnum');
const workflowEnum = require('../const/workflowEnum');


const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');
const {addUserResume, syncExperiences, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findByUserId, findCompanyById, findEmployeeById, searchCompany} = require('../services/api/feed.service.api');
const {getCompanyById,  isPartyActive} = require('../services/party.service');

const questionSubmissionService = require('../services/questionsubmission.service');
const candidateService = require('../services/candidate.service');
const jobService = require('../services/jobrequisition.service');
const fileService = require('../services/file.service');

const {upload} = require('../services/aws.service');
const {findApplicationByIdAndUserId, findApplicationByUserId, findById, findByApplicationId} = require('../services/application.service');
const {findWorkflowById} = require('../services/workflow.service');

const {createEvent, acceptEvent, declineEvent} = require('../services/api/calendar.service.api');



module.exports = {
  getById,
  getByApplicationId,
  uploadCV,
  uploadOffer,
  accept,
  decline,
  addProgress,
  updateProgress,
  submitApplicationQuestions,
  getFiles
}



async function getById(currentUserId, id) {

  if(!id || !currentUserId){
    return null;
  }

  let application;
  try {
    let currentParty = await findByUserId(currentUserId);


    if(isPartyActive(currentParty)) {
      application = await findById(id).populate([
        {
          path: 'progress',
          model: 'ApplicationProgress',
          populate: [
            {
              path: 'stage',
              model: 'Stage'
            },
            {
              path: 'attachment',
              model: 'File'
            },
            {
              path: 'candidateAttachment',
              model: 'File'
            }
          ]
        },
        {
          path: 'job',
          model: 'JobRequisition',
          populate: {
            path: 'company',
            model: 'Company'
          }
        },
        {
          path: 'resume',
          model: 'File'
        }
      ]);

      if (application) {
        // let job = await jobService.findJob_Id(application.jobId);
        // let company = await findCompanyById(job.company, currentUserId);
        // application.job.company = company;
        // application.job.responsibilities=[];
        // application.job.qualifications = [];
        // application.job.skills = []
        // job.company = convertToCompany(company);
        application.job = jobMinimal(application.job);
        application.progress = _.reduce(application.progress, function(res, progress){

          progress.stage.evaluations = [];
          progress.stage.members = [];
          progress.stage.tasks = [];


          if(progress.attachment){
            progress.attachment.path = config.cdn + progress.attachment.path;
          }

          if(progress.candidateAttachment){
            progress.candidateAttachment.path = config.cdn + progress.candidateAttachment.path;
          }

          if(progress._id.equals(application.currentProgress)){
            application.currentProgress = progress
          }

          res.push(progress);
          return res;
        }, [])

        // application.job = job;

      } else {
        application=null;
      }
    }

  } catch (error) {
    console.log(error);
  }

  return application;
}



async function getByApplicationId(currentUserId, applicationId) {

  if(!applicationId || !currentUserId){
    return null;
  }

  let application;
  try {
    let currentParty = await findByUserId(currentUserId);


    if(isPartyActive(currentParty)) {
      application = await findByApplicationId(applicationId).populate([

        {
          path: 'progress',
          model: 'ApplicationProgress',
          populate: [
            {
              path: 'stage',
              model: 'Stage'
            },
            {
              path: 'attachment',
              model: 'File'
            },
            {
              path: 'candidateAttachment',
              model: 'File'
            }
          ]
        }
      ]);
      if (application) {
        let job = await jobService.findJob_Id(application.jobId);
        let company = await findCompanyById(job.company, currentUserId);
        // application.job.company = company;
        // application.job.responsibilities=[];
        // application.job.qualifications = [];
        // application.job.skills = []
        job.company = convertToCompany(company);
        application.job = jobMinimal(job);
        application.progress = _.reduce(application.progress, function(res, progress){

          progress.stage.evaluations = [];
          progress.stage.members = [];
          progress.stage.tasks = [];
          res.push(progress);
          return res;
        }, [])

        // application.job = job;

      } else {
        application=null;
      }
    }

  } catch (error) {
    console.log(error);
  }

  return application;
}


async function uploadCV(currentUserId, applicationId, files, name) {
  if(currentUserId==null || applicationId==null || files==null){
    return null;
  }

  let result = null;
  let basePath = 'user/';
  try {
    let currentParty = await findByUserId(currentUserId);
    if (isPartyActive(currentParty)) {

      let application = await findByApplicationId(applicationId).populate('user');

      if (application && application.user.userId == currentUserId) {
        let type;
        let progress = application.currentProress;
        //------------Upload CV----------------

        if(files.file) {

          let cv = files.file[0];
          let fileName = name ? name.split('.') : cv.originalname.split('.');
          let fileExt = fileName[fileName.length - 1];
          // let date = new Date();
          let timestamp = Date.now();
          name = (!name) ? currentParty.firstName + '_' + currentParty.lastName + '_' + application.user._id + '-' + timestamp + '.' + fileExt : fileName[0] + '-' + timestamp + '.' + fileExt;
          let path = basePath + currentUserId + '/_resumes/' + name;
          let response = await upload(path, cv);
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

          }

          let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId});
          // application.resume = {filename: name, type: type};

          if(file){
            application.resume = file._id;
            application.files.push(file._id);
          }
        }

        //------------Upload Photo----------------
        applicationBasePath = 'applications/';

        if(files.photo) {
          let photo = files.photo[0];
          fileName = photo.originalname.split('.');
          fileExt = fileName[fileName.length - 1];
          timestamp = Date.now();
          name = currentParty.firstName + '_' + currentParty.lastName + '_' + application.user._id + '_' + applicationId + '-' + timestamp + '.' + fileExt;
          path = applicationBasePath + applicationId + '/photos/' + name;
          response = await upload(path, photo);
          switch (fileExt) {
            case 'png':
              type = 'PNG';
              break;
            case 'jpeg':
              type = 'JPG';
              break;
            case 'jpg':
              type = 'JPG';
              break;

          }
          // application.photo = {filename: path, type: type};
          let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId});
          if(file){
            application.photo = file_id;
            application.files.push(file._id);
          }
        }

        result = await application.save();
        await addUserResume(currentUserId, name, type);

      }

    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function uploadOffer(currentUserId, applicationId, files) {

  if(currentUserId==null || applicationId==null || files==null){
    return null;
  }

  let result = null;
  let basePath = 'applications/';

  try {
    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {

      let application = await findByApplicationId(applicationId).populate('currentProgress');

      if (application) {

        // application = await Application.populate(application, 'job').populate('currentProgress');
        let job = application.job;
        if(files.file && (application.partyId == currentUserId || job.partyId==currentParty.id)) {

          let offerLetter = files.file[0];
          let fileName = offerLetter.originalname.split('.');
          let fileExt = fileName[fileName.length - 1];
          // let date = new Date();
          let timestamp = Date.now();
          let name = 'Offer_' + application.applicationId + '_' + application.partyId + '_' + timestamp + '.' + fileExt;
          let path = basePath + application.applicationId + '/' + 'JOB_' + application.jobId + '/offers/' + name;
          let response = await upload(path, offerLetter);
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

          }

          let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId});
          if(file){
            if(currentParty.id==application.partyId){
              application.currentProgress.candidateAttachment = file._id;
            } else {
              application.currentProgress.attachment = file._id;
            }

            application.files.push(file._id);
            await application.save();
            result = await application.currentProgress.save();

          }
        }
        //
        // if(application.partyId == currentUserId || job.partyId==currentParty.id){
        //   let cv = files.file[0];
        //   let fileName = file.originalFilename.split('.');
        //   let fileExt = fileName[fileName.length - 1];
        //   let timestamp = Date.now();
        //   let name = 'Offer_' + application.applicationId + '_' + application.partyId + '_' + timestamp + '.' + fileExt;
        //
        //   let path = basePath + 'JOB_' + application.jobId + '/offers/' + name;
        //   let res = await upload(path, file);
        //
        //
        //   let type;
        //   switch(fileExt){
        //     case 'pdf':
        //       type='PDF';
        //       break;
        //     case 'doc':
        //       type='WORD';
        //       break;
        //     case 'docx':
        //       type='WORD';
        //       break;
        //
        //   }
        //
        //   if(currentParty.id==application.partyId){
        //     currentProgress.candidateAttachment = { url: name, type: type, createdDate: Date.now()};
        //   } else if(currentParty.id==job.partyId){
        //     currentProgress.attachment = { url: name, type: type, createdDate: Date.now()};
        //   }
        //   result = await currentProgress.save();
        // }

      }

    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function accept(currentUserId, applicationId, applicationProgressId, action) {

  if(!applicationId || !applicationProgressId || !currentUserId || !action){
    return null;
  }

  let result;
  try {
    let currentParty = await findByUserId(currentUserId);

    if(isPartyActive(currentParty)) {
      application = await findApplicationByIdAndUserId(applicationId, currentParty.id);
      if (application) {

        // let workflow = await findWorkflowById(application.job.workflowId);
        // console.log('workflow', workflow)

        let progresses = application.progress;

        if(progresses){

          let currentProgress = progresses[progresses.length -1 ];

          if(currentProgress && currentProgress.applicationProgressId==applicationProgressId && currentProgress.type==action.type && action.accept && currentProgress.requiredAction){

            currentProgress.status = applicationEnum.ACCEPTED;
            currentProgress.candidateComment = action.candidateComment;
            currentProgress.requiredAction = false;
            currentProgress.lastUpdatedDate = Date.now();
            let saved = await currentProgress.save();
            if(saved){
              result = saved;
              let event = acceptEvent(currentParty.id, currentProgress.event.eventId);
            }


          }
        }
      }
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function decline(currentUserId, applicationId, applicationProgressId, action) {

  if(!applicationId || !applicationProgressId || !currentUserId || !action){
    return null;
  }

  let result;
  try {
    let currentParty = await findByUserId(currentUserId);

    if(isPartyActive(currentParty)) {
      application = await findApplicationByIdAndUserId(applicationId, currentParty.id);
      if (application) {

        let progresses = application.progress;
        if(progresses){
          let currentProgress = progresses[progresses.length -1 ];
          if(currentProgress && currentProgress.applicationProgressId==applicationProgressId && currentProgress.type==action.type && !action.accept && currentProgress.requiredAction){
            currentProgress.status = applicationEnum.DECLINED;
            currentProgress.requiredAction = false;
            currentProgress.candidateComment = action.candidateComment;
            currentProgress.lastUpdatedDate = Date.now();
            let saved = await currentProgress.save();
            if(saved){
              result = saved;
              let event = declineEvent(currentParty.id, currentProgress.event.eventId);
            }

          }
        }
      }
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addProgress(currentUserId, applicationId, progress) {

  if(!applicationId || !currentUserId || !progress){
    return null;
  }

  let result;
  try {
    let currentParty = await findByUserId(currentUserId);

    if(isPartyActive(currentParty)) {
      let application = await findByApplicationId(applicationId);

      if (application) {
        // application = await Application.populate(application, 'job');


        let workflow = await findWorkflowById(application.job.workflowId);
        workflow = workflow.workflow

        let organizer = application.job.partyId;

        let progresses = application.progress;

        if(progresses) {
          let currentProgress = progresses[progresses.length - 1];
          let nextProgress = workflow[_.indexOf(workflow, currentProgress.type)+1];

          if(nextProgress && nextProgress!='OFFER'){

            let dayAway = Math.floor(Math.random() * Math.floor(10));

            let start = new Date();
            start.setDate(start.getDate() + dayAway);
            start.setHours(9,0,0,0);

            let end = new Date();
            end.setDate(end.getDate() + dayAway);
            end.setHours(10,0,0.0)


            let event = {
              eventTopic: {name: "WORK", background: "#BC9EC1"},
              summary: workflowEnum[nextProgress] + ' Scheduled',
              description: 'Scheduled Event',
              organizer: organizer,
              attendees: [application.partyId],
              start: start.toISOString(),
              end: end.toISOString(),
              phoneNumber: "+84 123456789",
              meetingUrl: "http://skype.com"
            }

            let response = await createEvent(event);
            event = response.data.data;


            nextProgress = await new ApplicationProgress({type: nextProgress, applicationId: applicationId, requiredAction: true, status: "SCHEDULED", event: {eventId: event.eventId, start: event.start}}).save();
            application.progress.push(nextProgress);
            await application.save();
          } else if (nextProgress && nextProgress=='OFFER') {
            nextProgress = await new ApplicationProgress({type: nextProgress, applicationId: applicationId, requiredAction: true, status: "OFFERED"}).save();
            application.progress.push(nextProgress);
            await application.save();
          }
          result = nextProgress;




        }


      }
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function updateProgress(currentUserId, applicationId, progress) {

  if(!applicationId || !currentUserId || !progress){
    return null;
  }

  let result;
  try {
    let currentParty = await findEmployeeById(currentUserId);

    if(isPartyActive(currentParty)) {
      let application = await findByApplicationId(applicationId);

      if (application) {
        // application = await Application.populate(application, 'job');
        let workflow = await findWorkflowById(application.job.workflowId);
        workflow = workflow.workflow

        let organizer = application.job.partyId;

        let progresses = application.progress;

        if(progresses) {
          let currentProgress = progresses[progresses.length - 1];
          let nextProgress = workflow[_.indexOf(workflow, currentProgress.type)+1];

          if(nextProgress && nextProgress!='OFFER'){

            let dayAway = Math.floor(Math.random() * Math.floor(10));

            let start = new Date();
            start.setDate(start.getDate() + dayAway);
            start.setHours(9,0,0,0);

            let end = new Date();
            end.setDate(end.getDate() + dayAway);
            end.setHours(10,0,0.0)

            let event = {
              eventTopic: {name: "WORK", background: "#BC9EC1"},
              summary: workflowEnum[nextProgress] + ' Scheduled',
              description: 'Scheduled Event',
              organizer: organizer,
              attendees: [application.partyId],
              start: start.toISOString(),
              end: end.toISOString(),
              phoneNumber: "+84 123456789",
              meetingUrl: "http://skype.com"
            }

            let response = await createEvent(event);
            event = response.data.data;


            nextProgress = await new ApplicationProgress({type: nextProgress, applicationId: applicationId, requiredAction: true, status: "SCHEDULED", event: {eventId: event.eventId, start: event.start}}).save();
            application.progress.push(nextProgress);
            await application.save();
          } else if (nextProgress && nextProgress=='OFFER') {
            nextProgress = await new ApplicationProgress({type: nextProgress, applicationId: applicationId, requiredAction: true, status: "OFFERED"}).save();
            application.progress.push(nextProgress);
            await application.save();
          }
          result = nextProgress;

        }

      }
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}




async function submitApplicationQuestions(currentUserId, applicationId, form) {

  console.log(form)
  if(!currentUserId || !applicationId || !form){
    return null;
  }

  let result = false;
  try {
    let currentParty = await findByUserId(currentUserId);
    let application;

    if(isPartyActive(currentParty)) {
      application = await findByApplicationId(applicationId);
      let candidate = await candidateService.findByUserIdAndCompanyId(currentUserId, application.company);
      if (application && !application.hasSubmittedQuestion && application.user.equals(candidate._id)) {
        form.createdBy = currentUserId;
        let questionSubmission = await questionSubmissionService.addSubmission(form);

        if(questionSubmission){
          application.questionSubmission=questionSubmission._id;
          application.hasSubmittedQuestion = true;
          application = await application.save();
          result = application.hasSubmittedQuestion;
        }




      }
    }

  } catch (error) {
    console.log(error);
  }

  return {hasSubmittedQuestion: result};
}



async function getFiles(company, currentUserId, applicationId) {

  if(!company || !currentUserId || !applicationId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  let application;
  try {
    let currentParty = await findByUserId(currentUserId);


    if(isPartyActive(currentParty)) {
      application = await findByApplicationId(applicationId).populate([
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
          populate: {
            path: 'stage',
            model: 'Stage'
          }
        }
      ]);
      if (application) {
        let job = await jobService.findJob_Id(application.jobId);
        let company = await findCompanyById(job.company, currentUserId);
        // application.job.company = company;
        // application.job.responsibilities=[];
        // application.job.qualifications = [];
        // application.job.skills = []
        job.company = convertToCompany(company);
        application.job = jobMinimal(job);
        application.progress = _.reduce(application.progress, function(res, progress){

          progress.stage.evaluations = [];
          progress.stage.members = [];
          progress.stage.tasks = [];
          res.push(progress);
          return res;
        }, [])

        // application.job = job;

      } else {
        application=null;
      }
    }

  } catch (error) {
    console.log(error);
  }

  return application;
}
