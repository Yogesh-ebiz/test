const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const Member = require('../models/member.model');
const MemberInvitation = require('../models/memberInvitation.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const memberInvitationSchema = Joi.object({
  createdBy: Joi.number().required(),
  company: Joi.number().optional(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('').optional(),
  lastName: Joi.string().required(),
  phone: Joi.string().allow('').required(),
  email: Joi.string().allow('').required(),
  status: Joi.string().optional(),
  language: Joi.string().allow('').optional(),
  timezone: Joi.string().allow('').optional(),
  preferTimeFormat: Joi.string().allow('').optional(),
  currency: Joi.string().allow('').optional(),
  userId: Joi.number().optional(),
  role: Joi.object().optional(),
  avatar: Joi.string().optional(),
  isOwner: Joi.boolean().optional(),
});

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return MemberInvitation.findById(id);
}


async function findByEmail(email) {
  let data = null;

  if(!email){
    return;
  }

  return MemberInvitation.findOne({email: email});
}


module.exports = {
  findById:findById,
  findByEmail:findByEmail
}
