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

  form.threadId = form.threadId?ObjectID(form.threadId):'';
  form = await Joi.validate(form, emailSchema, {abortEarly: false});
  if(form.type===emailType.DEFAULT) {
    email = await new Email(form).save();

    if(email) {
      if (form.meta && form.meta.applicationId) {
        let application = await applicationService.findById(ObjectID(form.meta.applicationId));
        if (application) {
          application.emails.push(email._id);
          await application.save();
        }
      }
    }
  } else if(form.type===emailType.JOB_INVITE) {


    let jobLink = _.find(form.attachments, {type: 'JOBLINK'});
    if(jobLink) {
      for (let [i, contact] of form.to.entries()) {
        let nMail = form;
        nMail.to = [contact];

        let token = new ObjectID();
        let link = `${jobLink.url}?tracking=${token}`;
        nMail.attachments[0].url = link;
        nMail = await new Email(nMail).save();
        if (nMail) {
          let campaign = await emailCampaignService.findByEmailAndJobId(contact.email, ObjectID(form.meta.jobId));
          let hasInvitation = campaign ? _.find(campaign.stages, {type: 'INVITED'}) : false;

          console.log(hasInvitation);
          console.log(campaign);
          if (!hasInvitation) {
            await emailCampaignService.add({
              token: token.toString(),
              createdBy: form.createdBy,
              jobId: ObjectID(form.meta.jobId),
              // user: Joi.object().optional(),
              userId: contact.id ? contact.id : null,
              emailAddress: contact.email,
              email: nMail._id,
              meta: form.meta,
            });
          }

        }

      }
    }
  }


  return {success:true};

}

function findById(id) {
  let data = null;

  if(id==null){
    return;
  }

  return Email.findById(id);
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
  findById:findById
}
