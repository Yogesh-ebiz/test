const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const actionEnum = require('../const/actionEnum');
const subjectType = require('../const/subjectType');
const emailType = require('../const/emailType');

const EmailSignature = require('../models/emailsignature.model');

const emailSignatureSchema = Joi.object({
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

async function add(body){
  return await new EmailSignature(body).save();
}

function findById(id) {
  let data = null;

  if(id==null){
    return;
  }

  return EmailSignature.findById(id);
}


function findByMemberId(createdBy) {
  let data = null;

  if(!createdBy){
    return;
  }

  return EmailSignature.find({createdBy});
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
  add,
  findById,
  findByMemberId
}
