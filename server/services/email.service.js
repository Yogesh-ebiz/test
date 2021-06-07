const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Email = require('../models/email.model');
const applicationService = require('../services/application.service');


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

  form = await Joi.validate(form, emailSchema, { abortEarly: false });

  let email = await new Email(form).save();

  if(email) {
    if (form.meta.applicationId) {
      let application = await applicationService.findById(ObjectID(form.meta.applicationId));
      if (application) {
        application.emails.push(email._id);
        await application.save();
      }
    }
  }
  return email;

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
