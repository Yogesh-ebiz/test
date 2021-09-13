const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const actionEnum = require('../const/actionEnum');
const subjectType = require('../const/subjectType');
const emailType = require('../const/emailType');

const Email = require('../models/email.model');
const applicationService = require('../services/application.service');
const emailCampaignService = require('../services/emailcampaign.service');
const sourceService = require('../services/source.service');
const activityService = require('../services/activity.service');
const jobService = require('../services/jobrequisition.service');
const candidateService = require('../services/candidate.service');
const companyService = require('../services/company.service');

const feedService = require('../services/api/feed.service.api');


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



async function compose(form, companyId) {
  let data = null;

  if(!form){
    return;
  }



  form.threadId = form.threadId?ObjectID(form.threadId):'';
  form = await Joi.validate(form, emailSchema, {abortEarly: false});

  let email, inmailCredit = 0;
  let result = {threadId: null, emails: []};

  let company = await companyService.findByCompanyId(companyId);
  let contacts = _.reduce(form.to, function(res, contact){
    if(!contact.email){
      res.push(contact.id)
      inmailCredit++;
    }
    return res;
  }, []);

  if(inmailCredit>company.credit){
    result = {success: false, message: "Only " + company.credit + " remains"}
  }

  contacts = await feedService.lookupContacts(contacts, 'EMAIL_ADDRESS');

  form.to = _.reduce(form.to, function(res, contact){

    if(!contact.email){
      let found = _.find(contacts, {id: contact.id});
      if(found){
        contact.email = found.value;
      }
    }
    res.push(contact);
    return res;
  }, []);

  let sentDate = Date.now();
  let threadId = new ObjectID;
  form.threadId = threadId;
  result.threadId = threadId;
  if(form.type===emailType.JOB_INVITE) {
    let jobLink = _.find(form.attachments, {type: 'JOBLINK'});
    let job = await jobService.findJob_Id(form.meta.jobId);
    if(job) {
      for (let [i, contact] of form.to.entries()) {
        let nMail = _.clone(form);
        if (!contact.email) {

        }
        nMail.sentDate = sentDate;
        nMail.to = [contact];
        let token;
        if (jobLink) {
          token = new ObjectID;
          let link = `${jobLink.url}?tracking=${token}`;
          nMail.attachments[0].url = link;

          nMail = await new Email(nMail).save();

          if (nMail) {
            result.emails.push(nMail._id);
            let candidate = null;
            if (contact.candidateId) {
              candidate = await candidateService.findById(ObjectID(contact.candidateId));
            } else {
              if (contact.id && !contact.candidateId) {
                candidate = await candidateService.findByUserIdAndCompanyId(contact.id, companyId);
                // console.log(contact.id, companyId, candidate);
                if (!candidate) {
                  let user = await feedService.findCandidateById(contact.id);
                  if (user) {
                    user.skills = null;
                    user.experiences = null;
                    user.educations = null;
                    candidate = await candidateService.addCandidate(companyId, user, false, false);
                  }
                }
              } else {
                candidate = await candidateService.findByEmailAndCompanyId(contact.email, companyId);
                if(!candidate) {
                  await feedService.addContact({type: 'EMAIL_ADDRESS', value: contact.email});
                  let user = {
                    email: contact.email,
                    primaryAddress: {city: job.city, state: job.state, country: job.country}
                  };
                  candidate = await candidateService.addCandidate(companyId, user, false, false);
                }
              }
            }

            if (candidate) {
              let source = await sourceService.findByJobIdAndCandidateId(ObjectID(form.meta.jobId), candidate._id);

              let campaign = {
                token: token.toString(),
                createdBy: ObjectID(form.from.memberId),
                candidate: candidate._id,
                job: ObjectID(form.meta.jobId),
                emailAddress: contact.email,
                email: nMail._id,
                meta: form.meta,
              };

              campaign.userId = candidate.userId;
              campaign = await emailCampaignService.add(campaign);

              if (!source) {
                source = {
                  job: ObjectID(form.meta.jobId),
                  candidate: candidate._id,
                  createdBy: ObjectID(form.from.memberId)
                };
                source = await sourceService.add(source);
              }

              source.campaigns.push(campaign);
              await source.save();

              /*
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

                campaign = await emailCampaignService.add(campaign);

                if(contact.sourceId){
                  let source = await sourceService.findById(ObjectID(contact.sourceId));
                  if(source) {
                    source.campaign = campaign;
                    await source.save();
                  }
                }

              }
              */

              let meta = {
                candidateName: candidate.firstName + " " + candidate.lastName,
                candidate: candidate._id,
                jobTitle: job.title,
                job: job._id
              };
              await activityService.addActivity({
                causer: ObjectID(form.from.memberId),
                causerType: subjectType.MEMBER,
                subjectType: subjectType.CANDIDATE,
                subject: candidate._id,
                action: actionEnum.INVITED,
                meta: meta
              });

            }


          }
        }
      }
    }
  } else{
    form.sentDate = sentDate;
    email = await new Email(form).save();
    if(email) {
      result.emails.push(email._id);
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
  }

  company.credit = company.credit - inmailCredit;
  await company.save();

  return result;

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
