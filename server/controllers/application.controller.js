const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
//const pagination = require('../const/pagination');
const Application = require('../models/application.model');
const partyEnum = require('../const/partyEnum');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {findJobId} = require('../services/jobrequisition.service');


const {findApplicationByUserId, findApplicationById} = require('../services/application.service');



module.exports = {
  getApplicationById,
  uploadCV
}



async function getApplicationById(currentUserId, applicationId) {

  if(!applicationId || !currentUserId){
    return null;
  }

  let application;
  try {
    application = await findApplicationById(applicationId);

    if(application) {

      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', response.data)

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {
        let job = await findJobId(application.jobId);

        response = await getCompanyById(job.company);
        job.company = response.data.data;

      }
    }

  } catch (error) {
    console.log(error);
  }

  return application;
}


async function uploadCV(currentUserId, applicationId, req) {

  if(currentUserId==null || applicationId==null){
    return null;
  }

  let result = null;
  try {
    let application = await findApplicationById(applicationId);

    if(application && application.partyId==currentUserId) {

      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      console.log('currentParty', response.data)

      var file = req.files.file;
      fs.readFile(file.path, function (err, data) {
        if (err) throw err; // Something went wrong!
        var s3bucket = new AWS.S3({params: {Bucket: 'mybucketname'}});
        s3bucket.createBucket(function () {
          var params = {
            Key: file.originalFilename, //file.name doesn't exist as a property
            Body: data
          };
          s3bucket.upload(params, function (err, data) {
            // Whether there is an error or not, delete the temp file
            fs.unlink(file.path, function (err) {
              if (err) {
                console.error(err);
              }
              console.log('Temp File Delete');
            });

            console.log("PRINT FILE:", file);
            if (err) {
              console.log('ERROR MSG: ', err);
              res.status(500).send(err);
            } else {
              console.log('Successfully uploaded data');
              res.status(200).end();
            }
          });
        });
      });


      console.log(application);
    }



  } catch (error) {
    console.log(error);
  }

  return result;

}


