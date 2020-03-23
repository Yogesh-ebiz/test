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
      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (application && application.partyId==currentParty.id) {
        let job = await findJobId(application.jobId);
        response = await getCompanyById(job.company);
        job.company = response.data.data;

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
    application = await findApplicationById(applicationId);

    if(application && application.partyId==currentUserId) {
      console.debug('application', application.applicationId);

      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', response.data)

      // console.log('files', req.files);
      let file = files.file;
      let fileExt = file.originalFilename.split('.');
      let timestamp = Date.now();
      let name = application.applicationId + '_' + application.partyId + '_' + timestamp + '.' + fileExt[fileExt.length-1];

      let res = await upload(name, file, application.applicationId);

      application.attachment = name;
      await application.save();




      // fs.readFile(file.path, function (err, data) {
      //   if (err) throw err; // Something went wrong!
      //     var params = {
      //       Key: file.originalFilename, //file.name doesn't exist as a property
      //       Body: data
      //     };
      //     let res = s3bucket.upload(params, function (err, data) {
      //       // Whether there is an error or not, delete the temp file
      //       fs.unlink(file.path, function (err) {
      //         if (err) {
      //           console.error(err);
      //         }
      //         console.log('Temp File Delete');
      //       });
      //
      //       console.log("PRINT FILE:", file);
      //       if (err) {
      //         console.log('ERROR MSG: ', err);
      //         application = null;
      //       } else {
      //         application.attachment=file.originalFilename;
      //         application = application.save();
      //       }
      //     });
      //
      //
      //
      // });



      //
      // fs.readFile('contacts.csv', (err, data) => {
      //   if (err) throw err;
      //   const params = {
      //     Bucket: 'accessed', // pass your bucket name
      //     Key: 'contacts.csv', // file will be saved as testBucket/contacts.csv
      //     Body: JSON.stringify(data, null, 2)
      //   };
      //   s3.upload(params, function(s3Err, data) {
      //     if (s3Err) throw s3Err
      //     console.log(`File uploaded successfully at ${data.Location}`)
      //   });
      // });


    }



  } catch (error) {
    console.log(error);
  }

  return application;

}


