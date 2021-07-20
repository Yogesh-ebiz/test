const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const AWS = require('aws-sdk');
const emailType = require('../const/emailType');
const {convertToAvatar, convertToCompany, jobMinimal} = require('../utils/helper');

const {upload} = require('../services/aws.service');

const feedService = require('../services/api/feed.service.api');
const emailService = require('../services/email.service');
const applicationService = require('../services/application.service');
const fileService = require('../services/file.service');



module.exports = {
  composeEmail,
  getEmailById,
  uploadEmailAttachmentById
}



/************************** EMAIL *****************************/

async function composeEmail(currentUserId, form, companyId)  {

  if(!currentUserId ||  !form){
    return null;
  }

  let result = await emailService.compose(form, companyId);

  return result;

}


async function getEmailById(currentUserId, emailId)  {

  if(!currentUserId ||  !emailId){
    return null;
  }

  let email = await emailService.findById(emailId);
  if(email){

    let userIds = _.map(email.to, 'id').concat(_.map(email.cc, 'id'));
    userIds.push(email.from.id);

    let users = await feedService.lookupPeopleIds(userIds)
    if(email.from.id){
      if(users.length){
        email.to = _.reduce(email.to, function(res, contact){
          let found = _.find(users, {id: contact.id});
          if(found){
            contact = found;
          }
          res.push(convertToAvatar(contact));
          return res;
        }, []);

        email.cc = _.reduce(email.cc, function(res, contact){
          let found = _.find(users, {id: contact.id});
          if(found){
            contact = found;
          }

          res.push(convertToAvatar(contact));
          return res;
        }, []);

        email.from = convertToAvatar(_.find(users, {id: email.from.id}));
      }

    }

    email.attachments = _.reduce(email.attachments, function(res, file){
      if(file.type==='JOBLINK'){
        file.url = `${file.url.toString()}`;
      } else {
        file.url = `https://accessed.s3-us-west-2.amazonaws.com/${file.url}`;
      }
      res.push(file);
      return res;
    }, []);
  }

  return email;

}



async function uploadEmailAttachmentById(currentUserId, threadId, files)  {
  if(!currentUserId ||  !threadId || !files){
    return null;
  }


  let result = null;
  let basePath = 'emails/';
  try {
    let email = await emailService.findByThreadId(threadId);
    if (email && email.from.id === currentUserId && (files)) {
      let type;
      //------------Upload CV----------------

      // let attachments = (files.file instanceof Array)?files.file:[files.file];
      for (let [i, file] of files.entries()) {
        let fileName = file.filename.split('.');
        let fileExt = fileName[fileName.length - 1];
        // let date = new Date();
        let name = Date.now() + '.' + fileExt;
        let path = basePath + email.threadId + '/files/' + name;
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

        email.attachments.push({type: type, url: path});
        if(email.type===emailType.JOB_OFFER){
          let application = await applicationService.findById(ObjectID(email.meta.applicationId)).populate([
            {
              path: 'files',
              model: 'File'
            }
          ]);

          if(application){
            let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId});
            application.files.push(file._id);
            application.offerLetter = file._id;
            await application.save();
          }
        }

      }


      result = await email.save();
    }

  } catch (error) {
    console.log(error);
  }

  return result;

}
