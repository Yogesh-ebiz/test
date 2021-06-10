const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const AWS = require('aws-sdk');
const {convertToAvatar, convertToCompany, jobMinimal} = require('../utils/helper');

const {upload} = require('../services/aws.service');

const feedService = require('../services/api/feed.service.api');
const emailService = require('../services/email.service');



module.exports = {
  composeEmail,
  getEmailById,
  uploadEmailAttachmentById
}



/************************** EMAIL *****************************/

async function composeEmail(currentUserId, form)  {

  if(!currentUserId ||  !form){
    return null;
  }

  let result = await emailService.compose(form);

  return result;

}


async function getEmailById(currentUserId, emailId)  {

  if(!currentUserId ||  !emailId){
    return null;
  }

  let email = await emailService.findById(emailId);
  if(email){
    if(email.from.id){
      let user = await feedService.lookupPeopleIds([email.from.id]);
      if(user.length){
        email.from = convertToAvatar(user[0]);
      }

    }

    email.attachments = _.reduce(email.attachments, function(res, file){
      res.push(`https://accessed.s3-us-west-2.amazonaws.com/emails/${email._id}/attachment/${file}`);
      return res;
    }, []);
  }

  return email;

}



async function uploadEmailAttachmentById(currentUserId, emailId, files)  {
  if(!currentUserId ||  !emailId || !files){
    return null;
  }


  let result = null;
  let basePath = 'emails/';
  try {
    let email = await emailService.findById(emailId);
    if (email && email.from.id === currentUserId && (files)) {
      let type;
      //------------Upload CV----------------

      let attachments = (files.file instanceof Array)?files.file:[files.file];
      for (let [i, file] of attachments.entries()) {
        let fileName = file.originalFilename.split('.');
        let fileExt = fileName[fileName.length - 1];
        // let date = new Date();
        let timestamp = Date.now();
        let name = fileName[0] + '-' + timestamp + '.' + fileExt;
        let path = basePath + email._id + '/files/' + name;
        let response = await upload(path, file);
        switch (fileExt.toLowerCase()) {
          case 'pdf':
            type = 'PDF';
            break;
          case 'doc':
            type = 'WORD';
            break;
          case 'docx':
            type = 'WORD';
            break;
          case 'png':
            type = 'PNG';
            break;
          case 'jpg':
            type = 'JPG';
            break;
          case 'jpeg':
            type = 'JPG';
            break;
        }

        email.attachments.push(name);

      }


      result = await email.save();
    }

  } catch (error) {
    console.log(error);
  }

  return result;

}
