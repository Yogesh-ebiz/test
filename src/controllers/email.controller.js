const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const AWS = require('aws-sdk');
const he = require('he');
const emailType = require('../const/emailType');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');
const emailSourceTypeEnum = require('../const/emailSourceTypeEnum');
const {convertToAvatar, convertToCompany, jobMinimal} = require('../utils/helper');
const catchAsync = require("../utils/catchAsync");

const {upload} = require('../services/aws.service');

const feedService = require('../services/api/feed.service.api');
const messagingService = require('../services/api/messaging.service.api');
const applicationService = require('../services/application.service');
const jobService = require('../services/jobrequisition.service');
const candidateService = require('../services/candidate.service');
const sourceService = require('../services/source.service');
const activityService = require('../services/activity.service');
const companyService = require('../services/company.service');
const emailCampaignService = require('../services/emailcampaign.service');
const fileService = require('../services/file.service');
let { myEmitter } = require('../config/eventemitter');
const awsService = require('../services/aws.service');
const memberService = require('../services/member.service');
const emailSignatureService = require('../services/emailsignature.service');
const handlebars = require('handlebars');
const {buildFileUrl, buildJobURL, buildCalendarURL} = require('../utils/helper');
const { describe } = require('pm2');



/************************** EMAIL *****************************/
const composeEmail = catchAsync(async (req, res) => {
  let {user, params, body} = req;
  let currentUserId = parseInt(req.header('UserId'));
  body.message = he.decode(body.message);
  //let result = await emailService.compose(form, companyId);
  let inmailCredit = 0;
  let result = { emails: [] };
  let emailMeta = {};

  body.threadId = body.threadId?new ObjectId(body.threadId):new ObjectId();
  result.threadId = body.threadId;

  let application;
  let job;

  let contacts = _.reduce(body.to, function(res, contact){
    if(!contact.email){
      res.push(contact.id)
      inmailCredit++;
    }
    return res;
  }, []);
  contacts = await feedService.lookupContacts(contacts, 'EMAIL_ADDRESS');
  body.to = _.reduce(body.to, function(res, contact){
    if(!contact.email){
      let found = _.find(contacts, {id: contact.id});
      if(found){
        contact.email = found.value;
      }
    }
    res.push(contact);
    return res;
  }, []);

  let toEmails = body.to.map(recipient => ({name: recipient.name, email: recipient.email}));
  let ccEmails = body.cc.map(recipient => ({name: recipient.name, email: recipient.email}));

  let placeHolderData = {};

  let recruiter = await memberService.findById(new ObjectId(body.from.memberId));

  let company = user.company;

  //ToDo: Call Message Service to get credit count
  if(toEmails.length > company.credit){
    console.log(`Insufficient credit in the company. Onle has ${application.company.credit} but require ${toEmails.length} inmail credit.`)
    result = {success: false, message: "Insufficient credit available. Only " + application.company.credit + " remains"}
  }

  placeHolderData.recruiter = {
    firstName: recruiter.firstName,
    lastName: recruiter.lastName,
    jobTitle: recruiter.jobTitle,
    email: recruiter.email,
    phone: recruiter.phone,
    id: recruiter._id.toString(),
  };

  placeHolderData.company = {
    name: company.name,
    address: company.primaryAddress,
  }

  if (body.meta.applicationId){
    application = await applicationService.findById(new ObjectId(body.meta?.applicationId)).populate([
      { path: 'currentProgress', model: 'ApplicationProgress' },
      { path: 'progress', model: 'ApplicationProgress' },
      { path: 'user', model: 'Candidate' },
      { path: 'company', model: 'Company' },
      { path: 'job', model: 'JobRequisition' }
    ]);
    job = await jobService.findById(application.job._id).populate('createdBy');

  }else if(body.meta.jobId){
    job = await jobService.findById(new ObjectId(body.meta.jobId)).populate('createdBy').populate('company');
    if (!job) {
      return res.status(400).send({ success: false, error: 'Job not found' });
    }
  }

  if(job){
    placeHolderData.job = {
      jobTitle: job.title
    }
  }
  if(application){
    placeHolderData.application = {
      id: application._id.toString()
    }
  }

  let signatureHtml = '';
  if (body.signatureId) {
    const signature = await emailSignatureService.findById(new ObjectId(body.signatureId));
    if (signature) {
      signatureHtml = `<br><hr>${signature.bodyHtml}`;
    }
  }
  let emailMessage = body.message + signatureHtml;

  if(body.meta.schedule){
    let scheduleLink = body.meta.schedule
        .replace('{{recruiter.id}}', placeHolderData.recruiter?.id)
        .replace('{{candidate.id}}', placeHolderData.candidate?.id)
        .replace('{{application.id}}', placeHolderData.application?.id || '');
    scheduleLink = buildCalendarURL(scheduleLink);
    emailMessage = `${emailMessage}<p><a href="${scheduleLink}">SCHEDULE MEETING</a></p>`;
  }
  if(body.type === emailType.JOB_INVITE){
    
    for(let element of body.to){
      let foundMember = await memberService.findByEmail(element.email)
      if(foundMember){
        element.messengerId = foundMember.messengerId
      }
    }
    for(let element of body.to){
      let foundCandidate = await candidateService.findByEmailAndCompanyId(element.email, company._id)
      if(foundCandidate){
        element.messengerId = foundCandidate.messengerId;
      }
    }
    let bodyTemplate = handlebars.compile(emailMessage);
    let subjectTemplate = handlebars.compile(body.subject);
    body.subject = subjectTemplate(placeHolderData);
    emailMessage = bodyTemplate(placeHolderData);
    const campaignData = {
      name: body.subject,
      description: body.subject,
      goal: emailType.JOB_INVITE,
      content: [
        { type: 'EMAIL', content: emailMessage },
      ],
      contacts: body.to.map(contact => ({
        user: contact.messengerId,
        name: contact.name,
        email: contact.email,
        meta: {
          candidateId: contact.candidateId ? contact.candidateId : null
        }
      })),
      settings: {
        automatic: true,
        cc: [],
        bcc: [],
        tracking: { open: body.tracking?.open || false, click: body.tracking?.click || false },
      },
      meta: { 
        link: `${buildJobURL(job._id.toString())}`,
        attachmentId: body.attachmentId || null,
        schedule: body.meta?.schedule || null,
      },
    };
    const campaign = await messagingService.addCampaign(campaignData, user.messengerId);
    if(campaign){
      await messagingService.activateCampaign(campaign._id, user.messengerId);
    }else{
      return res.status(500).send({success: false, error: 'Error in creating campaign'})
    }
    
    
  }else{
    for (let contact of body.to) {
      let candidate;
      if (contact.candidateId){
        candidate = await candidateService.findById(new ObjectId(contact.candidateId));
      }else{
        if (contact.id && !contact.candidateId) {
          candidate = await candidateService.findByUserIdAndCompanyId(contact.id, application.company._id);
          if (!candidate) {
            let user = await feedService.findCandidateById(contact.id);
            if (user) {
              user.skills = null;
              user.experiences = null;
              user.educations = null;
              candidate = await candidateService.addCandidate(company._id, user, false, false);
            }
          }
        }else {
          candidate = await candidateService.findByEmailAndCompanyId(contact.email, company._id);
          if(!candidate) {
            await feedService.addContact({type: 'EMAIL_ADDRESS', value: contact.email});
            let user = {
              email: contact.email,
              company: application.company._id,
              companyId: application.company.companyId,
              firstName: contact.name.split(' ')[0],
              lastName: contact.name.split(' ')[1],
              primaryAddress: {city: job?.city, state: job?.state, country: job?.country}
            };
            candidate = await candidateService.addCandidate(application.company._id, user, false, false);
          }
        }
      }
  
      let token;
      let emailMessage = body.message + signatureHtml;
  
      placeHolderData.candidate = {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        id: candidate._id.toString(),
      };
  
      let email = await prepareAndSendEmail(placeHolderData, {...body,message: emailMessage}, [{name: contact.name, email: contact.email}], ccEmails, job, recruiter);
      result.emails.push(email);
  
    }
  }

  //ToDo: Update Message Service to deduct credit only if its not a connection yet.
  company.credit = company.credit - inmailCredit;
  await company.save();

  res.json({emails: result.emails, threadId: result.threadId});
});


async function prepareAndSendEmail(placeHolderData, body, to, ccEmails, job, recruiter){

  let bodyTemplate = handlebars.compile(body.message);
  let subjectTemplate = handlebars.compile(body.subject);
  body.subject = subjectTemplate(placeHolderData);
  if (body.meta.test) {
    body.subject = `[TEST] ${body.subject}`;
  }
  body.message = bodyTemplate(placeHolderData);
  let senderId = job?.createdBy?.messengerId || recruiter?.messengerId;
  let emailMeta = {
    from: {name: body.from.name, email: body.from.email},
    to: to,
    cc: ccEmails,
    bcc: null,
    message: body.message,
    isHtml: body.isHtml,
    subject: body.subject,
    applicationId: body.meta.applicationId,
    applicationProgressId: body.meta.applicationProgressId,
    test: body.meta.test ? body.meta.test : false,
    senderId: senderId,
    threadId: body.threadId,
    source: emailSourceTypeEnum.JOB,
    type: body.type,
    attachmentId: body.attachmentId,
    tracking: {
      send: body.tracking?.send || false,
      open: body.tracking?.open || false,
      click: body.tracking?.click || false,
    }
  };

  myEmitter.emit('create-task-for-automation', new Date(body.whenToSend), new Date(), 'EMAIL', emailMeta);
  return emailMeta;

};

const uploadEmailAttachmentById = catchAsync(async (req, res) => {
  const {user, params, body, files} = req;
  const {emailId} = params;

  if(!emailId || !files){
    return null;
  }

  let result = [];
  let attachments = [];
  let basePath = 'emails/';
  let timestamp = Date.now();

  try{
    let emailResult = await messagingService.getMailById(emailId);
    let email = emailResult.data;
    if(email && files.file.length > 0){
      for (const file of files.file){
        let fileName = file.originalname.split('.');
        let fileExt = fileName[fileName.length - 1];
        let name = Date.now() + '.' + fileExt;
        let path = basePath + emailId + '/files/' + name;

        let response = await awsService.upload(path, file.path);

        let type;
        switch (fileExt.toLowerCase()) {
          case 'pdf':
            type = 'PDF';
            break;
          case 'doc':
          case 'docx':
            type = 'WORD';
            break;
          case 'png':
            type = 'PNG';
            break;
          case 'jpg':
          case 'jpeg':
            type = 'JPG';
            break;
        }
        if (!Array.isArray(email.attachments)) {
          email.attachments = [];
        }
        email.attachments.push({type: type, url: path});
        if(email.type===emailType.JOB_OFFER){
          let application = await applicationService.findById(new ObjectId(email.meta.applicationId)).populate([
            {
              path: 'files',
              model: 'File'
            },
            {
              path: 'currentProgress',
              model: 'ApplicationProgress'
            }
          ]);
          if(application){
            let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: user.userId});
            application.files.push(file._id);
            application.currentProgress.attachment = file._id;
            await application.save();
            await application.currentProgress.save();
          }
        }

        //result = await email.save();
        result = await messagingService.updateMailAttachments(emailId, {attachments: email.attachments})
      }
    }
    res.json(result);

  }catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while uploading attachments');
  }

});
/*
async function getEmailById(currentUserId, emailId)  {

  if(!currentUserId ||  !emailId){
    return null;
  }

  let email = await emailService.findById(emailId);
  if(email){

    let userIds = _.map(email.to, 'id').concat(_.map(email.cc, 'id'));
    userIds.push(email.from.id);

    let users = await feedService.lookupCandidateIds(userIds)
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

    email.hasRead = true;
    await email.save();
  }

  return email;

}
*/
module.exports = {
  composeEmail,
  //getEmailById,
  uploadEmailAttachmentById
}
