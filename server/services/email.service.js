const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const emailType = require('../const/emailType');

const Email = require('../models/email.model');
const applicationService = require('../services/application.service');
const emailCampaignService = require('../services/emailcampaign.service');


const emailSchema = Joi.object({
  type: Joi.string(),
  subject: Joi.string().allow('').optional(),
  body: Joi.string().required(),
  to: Joi.array(),
  cc: Joi.array().optional(),
  bcc: Joi.array().optional(),
  from: Joi.object(),
  attachments: Joi.array().optional(),
  threadId: Joi.object().allow('').optional(),
  whenToSend: Joi.string(),
  meta: Joi.object().optional()
});



async function compose(form) {
  let data = null;

  if(!form){
    return;
  }

  let email;
  form.threadId = form.threadId?ObjectID(form.threadId):'';
  form = await Joi.validate(form, emailSchema, {abortEarly: false});

  let threadId = new ObjectID;
  form.threadId = threadId;
  if(form.type===emailType.DEFAULT) {
    email = await new Email(form).save();


    if(email) {
      if (form.meta && form.meta.applicationId) {
        let application = await applicationService.findById(ObjectID(form.meta.applicationId)).populate('currentProgress');
        if (application) {
          application.currentProgress.emails.push(email._id);
          await application.currentProgress.save();

          application.emails.push(email._id);
          await application.save();
        }
      }
    }
  } else if(form.type===emailType.JOB_INVITE) {
    let jobLink = _.find(form.attachments, {type: 'JOBLINK'});

    for (let [i, contact] of form.to.entries()) {
      let nMail = _.clone(form);
      nMail.to = [contact];
      console.log(contact)
      let token;
      if(jobLink) {
        token = new ObjectID;
        let link = `${jobLink.url}?tracking=${token}`;
        nMail.attachments[0].url = link;

        nMail = await new Email(nMail).save();
        if (nMail) {
          let campaign = await emailCampaignService.findByEmailAndJobId(contact.email, ObjectID(form.meta.jobId));
          let hasInvitation = campaign ? _.find(campaign.stages, {type: 'INVITED'}) : false;

          if (!hasInvitation) {
            let campaign = {
              token: token.toString(),
              createdBy: form.createdBy,
              jobId: ObjectID(form.meta.jobId),
              emailAddress: contact.email,
              email: nMail._id,
              meta: form.meta,
            };

            if(contact.id){
              campaign.userId = contact.id;
            }

            await emailCampaignService.add(campaign);
          }

        }
      }
    }

  }


  return {threadId: threadId};

}

function findById(id) {
  let data = null;

  if(id==null){
    return;
  }

  return Email.findById(id);
}

function findByThreadId(threadId) {
  let data = null;

  if(threadId==null){
    return;
  }

  return Email.findOne({threadId: threadId});
}


function search(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  return Email.find({company: company});
}

async function archive(id) {
  let data = null;

  if(!id){
    return;
  }

  let email = await findById(id);

  if(email){
    email.name = form.name;
    template = await template.save();
  }

  return template;

}


module.exports = {
  compose:compose,
  archive:archive,
  search: search,
  findById:findById,
  findByThreadId:findByThreadId
}
