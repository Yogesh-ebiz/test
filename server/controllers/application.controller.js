const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');

const fs = require('fs');
const AWS = require('aws-sdk');

const partyEnum = require('../const/partyEnum');
const applicationEnum = require('../const/applicationEnum');

const Application = require('../models/application.model');
const ApplicationProgress = require('../models/applicationprogress.model');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {findJobId} = require('../services/jobrequisition.service');
const {upload} = require('../services/aws.service');
const {findApplicationByIdAndUserId, findApplicationByUserId, findApplicationById} = require('../services/application.service');
const {findWorkflowById} = require('../services/workflow.service');



module.exports = {
  getApplicationById,
  uploadCV,
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
    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;


    console.log('currentUserId', currentParty.id)
    if(isPartyActive(currentParty)) {
      application = await findApplicationById(applicationId);
      if (application && application.partyId==currentParty.id) {
        // let job = await findJobId(application.jobId);

        response = await getCompanyById(application.job.company);
        application.job.company = response.data.data;
        application.job.responsibilities=[];
        application.job.qualifications = [];
        application.job.skills = []

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

  let application = null;
  try {
    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;


    if (isPartyActive(currentParty)) {

      application = await findApplicationById(applicationId);
      if (application && application.partyId == currentUserId) {

        let progress = application.progress[0];
        let file = files.file;
        let fileName = file.originalFilename.split('.');
        let fileExt = fileName[fileName.length - 1];
        let timestamp = Date.now();
        let name = application.jobId + '_' + application.partyId + '_' + application.applicationId + '_' + timestamp + '.' + fileExt;

        let path = 'applications/' + application.jobId + '/' + name;
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

        progress.candidateAttachment = { url: name, type: type};
        await progress.save();

        await application.save();

      }

    }

  } catch (error) {
    console.log(error);
  }

  return application;

}



async function accept(currentUserId, applicationId, applicationProgressId, action) {

  if(!applicationId || !applicationProgressId || !currentUserId || !action){
    return null;
  }

  let result;
  try {
    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    if(isPartyActive(currentParty)) {
      application = await findApplicationByIdAndUserId(applicationId, currentParty.id);
      if (application) {

        let progresses = application.progress;

        if(progresses){
          let currentProgress = progresses[progresses.length -1 ];
          if(currentProgress && currentProgress.applicationProgressId==applicationProgressId && action.accept && currentProgress.requiredAction){

            if(_.includes(['PHONE_SCREEN', 'TEST', 'INTERVIEW', 'SECOND_INTERVIEW', 'OFFER'], action.type)){
              currentProgress.status = applicationEnum.ACCEPTED;
              currentProgress.candidateComment = action.candidateComment;
              currentProgress.requiredAction = false;
              currentProgress.lastUpdatedDate = Date.now();
              currentProgress = await currentProgress.save()
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
    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    if(isPartyActive(currentParty)) {
      application = await findApplicationByIdAndUserId(applicationId, currentParty.id);
      if (application) {

        let progresses = application.progress;
        console.log('all', progresses)
        if(progresses){
          let currentProgress = progresses[progresses.length -1 ];
          console.log('current', currentProgress)
          if(currentProgress && currentProgress.applicationProgressId==applicationProgressId && !action.accept && currentProgress.requiredAction){

            if(_.includes(['PHONE_SCREEN', 'TEST', 'INTERVIEW', 'SECOND_INTERVIEW', 'OFFER'], action.type)){
              currentProgress.status = applicationEnum.DECLINED;
              currentProgress.requiredAction = false;
              currentProgress.candidateComment = action.candidateComment;
              currentProgress.lastUpdatedDate = Date.now();
              currentProgress = await currentProgress.save()
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
    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    if(isPartyActive(currentParty)) {
      let application = await findApplicationByIdAndUserId(applicationId, currentParty.id);
      let workflow = await findWorkflowById(application.job.workflowId);
      workflow = workflow.workflow

      if (application) {

        let progresses = application.progress;
        if(progresses) {
          let currentProgress = progresses[progresses.length - 1];
          let nextProgress = workflow[_.indexOf(workflow, currentProgress.type)+1];


          if(nextProgress && nextProgress!='OFFER'){
            nextProgress = await new ApplicationProgress({type: nextProgress, applicationId: applicationId, requiredAction: true, status: "SCHEDULED"}).save();
            application.progress.push(nextProgress);
            result = await application.save();
          } else if (nextProgress && nextProgress=='OFFER') {
            nextProgress = await new ApplicationProgress({type: nextProgress, applicationId: applicationId, requiredAction: true, status: "OFFER"}).save();
            application.progress.push(nextProgress);
            result = await application.save();
          }




        }


      }
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}
