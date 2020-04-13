const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');

const fs = require('fs');
const AWS = require('aws-sdk');

const partyEnum = require('../const/partyEnum');
const applicationEnum = require('../const/applicationEnum');
const workflowEnum = require('../const/workflowEnum');


const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {findJobId} = require('../services/jobrequisition.service');
const {upload} = require('../services/aws.service');
const {findApplicationByIdAndUserId, findApplicationByUserId, findApplicationById} = require('../services/application.service');
const {findWorkflowById} = require('../services/workflow.service');

const {createEvent, acceptEvent, declineEvent} = require('../services/calendar.service');



module.exports = {
  getApplicationById,
  uploadCV,
  uploadOffer,
  accept,
  decline,
  addProgress
}



async function getApplicationById(currentUserId, applicationId) {

  if(!applicationId || !currentUserId){
    return null;
  }

  let application;
  try {
    let currentParty = await getPersonById(currentUserId);


    if(isPartyActive(currentParty)) {
      application = await findApplicationById(applicationId);
      if (application && application.partyId==currentParty.id) {
        // let job = await findJobId(application.jobId);

        response = await getCompanyById(application.job.company);
        application.job.company = response.data.data;
        application.job.responsibilities=[];
        application.job.qualifications = [];
        application.job.skills = []

        application.progress = _.reduce(application.progress, function(res, item){
          item.label = workflowEnum[item.type]['en'];
          res.push(item);
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



async function uploadCV(currentUserId, applicationId, files) {

  if(currentUserId==null || applicationId==null || files==null){
    return null;
  }

  let result = null;
  let basePath = 'applications/';
  try {
    let currentParty = await getPersonById(currentUserId);


    if (isPartyActive(currentParty)) {

      let application = await findApplicationById(applicationId);
      if (application && application.partyId == currentUserId) {

        let progress = application.progress[0];
        let file = files.file;
        let fileName = file.originalFilename.split('.');
        let fileExt = fileName[fileName.length - 1];
        let timestamp = Date.now();
        let name = 'Resume_' + application.applicationId + '_' + application.partyId + '_' + timestamp + '.' + fileExt;

        let path = basePath + 'JOB_' +application.jobId + '/resumes/' + name;

        let response = await upload(path, file);
        console.log('uploading')
        let type;
        switch(fileExt){
          case 'pdf':
            type='PDF';
            break;
          case 'doc':
            type='WORD';
            break;
          case 'docx':
            type='WORD';
            break;

        }

        progress.candidateAttachment = { url: name, type: type};
        result = await progress.save();


      }

    }

  } catch (error) {
    console.log(error);
  }

  return result;

}


async function uploadOffer(currentUserId, applicationId, file) {

  if(currentUserId==null || applicationId==null || file==null){
    return null;
  }

  let result = null;
  let basePath = 'applications/';

  try {
    let currentParty = await getPersonById(currentUserId);

    if (isPartyActive(currentParty)) {

      let application = await findApplicationById(applicationId);

      if (application) {

        application = await Application.populate(application, 'job');
        let job = application.job;
        let currentProgress = _.find(application.progress, {type: 'OFFER'});

        console.log('file', file);
        if(application.partyId == currentUserId || job.partyId==currentParty.id){
          let fileName = file.originalFilename.split('.');
          let fileExt = fileName[fileName.length - 1];
          let timestamp = Date.now();
          let name = 'Offer_' + application.applicationId + '_' + application.partyId + '_' + timestamp + '.' + fileExt;

          let path = basePath + 'JOB_' + application.jobId + '/offers/' + name;
          let res = await upload(path, file);


          let type;
          switch(fileExt){
            case 'pdf':
              type='PDF';
              break;
            case 'doc':
              type='WORD';
              break;
            case 'docx':
              type='WORD';
              break;

          }

          if(currentParty.id==application.partyId){
            currentProgress.candidateAttachment = { url: name, type: type, createdDate: Date.now()};
          } else if(currentParty.id==job.partyId){
            currentProgress.attachment = { url: name, type: type, createdDate: Date.now()};
          }
          result = await currentProgress.save();
        }

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
    let currentParty = await getPersonById(currentUserId);

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
    let currentParty = await getPersonById(currentUserId);

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
    let currentParty = await getPersonById(currentUserId);

    if(isPartyActive(currentParty)) {
      let application = await findApplicationById(applicationId);

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
