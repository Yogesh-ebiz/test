const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const emailType = require('../const/emailType');

const Email = require('../models/email.model');
const applicationService = require('../services/application.service');
const emailCampaignService = require('../services/emailcampaign.service');


const emailSchema = Joi.object({
  subject: Joi.string().allow('').optional(),
  body: Joi.string().required(),
  to: Joi.array(),
  cc: Joi.array().optional(),
  bcc: Joi.array().optional(),
  from: Joi.object(),
  threadId: Joi.object().allow('').optional(),
  whenToSend: Joi.string(),
  type: Joi.string(),
  meta: Joi.object().optional()
});



async function compose(form) {
  let data = null;

  if(form==null){
    return;
  }

  form.threadId = form.threadId?ObjectID(form.threadId):'';

  if(form.type===emailType.DEFAULT) {
    form = await Joi.validate(form, emailSchema, {abortEarly: false});
    let email = await new Email(form).save();

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
    console.log('INVITE')
    for(let [i, contact] of form.to.entries()){
      let email = form;
      email.to = [contact];

      email = await Joi.validate(email, emailSchema, {abortEarly: false});

      let jobLink = _.find(email.attachments, {type: 'JOBLINK'});
      if(jobLink){
        let token = new ObjectID();

        email = await new Email(email).save();
        if(emai){
          let campaign = await emailCampaignService.findByEmailAndJobId(contact.email, ObjectID(email.meta.jobId));
          let hasInvitation = campaing?_.find(campaign.stages, {type: 'INVITED'}):false;
          if(!hasInvitation){

          }
          console.log(campaign);
          console.log(hasInvitation)
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
