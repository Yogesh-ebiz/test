const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');

const fs = require('fs');
const AWS = require('aws-sdk');

//const pagination = require('../const/pagination');
const Application = require('../models/application.model');
const partyEnum = require('../const/partyEnum');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {findJobId} = require('../services/jobrequisition.service');
const {upload} = require('../services/aws.service');



const {findApplicationByUserId, findApplicationById} = require('../services/application.service');



module.exports = {
  getApplicationById,
  uploadCV
}



const BUCKET_NAME = "accessed";
// const IAM_USER_KEY = "AKIASNQAGO5FTKNYNQYC";
// const IAM_USER_SECRET = "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";
//
//
// const s3bucket = new AWS.S3({
//   accessKeyId: IAM_USER_KEY,
//   secretAccessKey: IAM_USER_SECRET
// });

const s3bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});



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
        let job = await findJobId(application.jobId);

        response = await getCompanyById(job.company);
        application.job.company = response.data.data;

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
      console.log(applicationId, application)
      if (application && application.partyId == currentUserId) {
        console.debug('application', application.applicationId);

        let file = files.file;
        let fileExt = file.originalFilename.split('.');
        let timestamp = Date.now();
        let name = application.jobId + '_' + application.partyId + '_' + application.applicationId + '_' + timestamp + '.' + fileExt[fileExt.length - 1];

        let path = 'applications/' + application.jobId + '/' + name;
        let res = await upload(path, file);

        application.attachment = name;
        await application.save();

      }

    }

  } catch (error) {
    console.log(error);
  }

  return application;

}
