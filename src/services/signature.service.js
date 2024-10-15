const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const EmailSignature = require('../models/emailsignature.model');

const emailSignatureSchema = Joi.object({
  name: Joi.string(),
  bodyHtml: Joi.string(),
});


async function add(form) {
  if(!form){
    return;
  }

  await emailSignatureSchema.validate(form, { abortEarly: false });

  const template = await new EmailSignature(form).save();
  return template;
}



function findById(id) {
  if(!id){
    return;
  }

  return EmailSignature.findById(id);
}

function findByUserId(createdBy) {
  if(!createdBy){
    return;
  }

  return EmailSignature.find({createdBy});
}

async function activate(id, member) {
  if(!id ||  !member){
    return;
  }

  let template = await EmailSignature.findByIdAndUpdate({_id: id}, {$set: {status: statusEnum.ACTIVE, updatedBy: member._id, updatedAt: Date.now()}});
  if(template){
    template.status = statusEnum.ACTIVE;
  }

  return template;
}

async function deactivate(id, member) {
  if(!id || !member){
    return;
  }
  let template = null;
  template = await EmailSignature.findByIdAndUpdate({_id: id}, {$set: {status: statusEnum.DISABLED, updatedBy: member._id, updatedAt: Date.now()}});
  if(template){
    template.status = statusEnum.DISABLED;
  }
  return template;
}




async function remove(_id, createdBy) {
  if(!_id || !createdBy){
    return;
  }

  const template = await EmailSignature.findOneAndDelete({ _id, createdBy });
  return template;
}



function search(company, filter) {
  if(!company || !filter){
    return;
  }
  let $or = [];

  if(filter.all){
    $or.push({company: company}, {default: true, status: {$ne: statusEnum.DISABLED}});
  } else {
    $or.push({company: company,  status: {$ne: statusEnum.DISABLED}}, {default: true, status: {$ne: statusEnum.DISABLED}});
  }


  return EmailSignature.aggregate([
    {$match: {$or: $or}},
    {$sort: {name: 1}}
  ]);
}

async function update(id, form, user) {
  if(!id || !form || !user){
    return;
  }

  await emailSignatureSchema.validate(form, { abortEarly: false });
  let template = await findById(id);

  if(!template || template._id===id || template.createdBy===user._id){
    throw new Error('Not Found');
  }

  template.name = form.name;
  template.bodyHtml = form.bodyHtml;
  template.updatedDate = new Date();
  template = await template.save();

  return template;
}


module.exports = {
  add,
  activate,
  deactivate,
  findById,
  findByUserId,
  remove,
  search,
  update,
}
