const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const _ = require('lodash');
const Industry = require('../models/industry.model');
const memberService = require('../services/member.service');
const memberInvitationService = require('../services/memberinvitation.service');
const roleService = require('../services/role.service');

const industrySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  sequence: Joi.string().required()
})

module.exports = {
  getInvitationById,
  acceptInvitation
}


async function getInvitationById(id, locale) {
  let result, member;
  const data = await memberInvitationService.findById(id).populate('company');

  if(data){
    member = await memberService.findByEmail(data.email);
    result = _.clone(data.toJSON());
    result.memberId = member._id;
    result.userId = member.userId;
  }
  return result;
}


async function acceptInvitation(id, locale) {
  let result, member;
  if(!id){
    return null;
  }

  const invitation = await memberInvitationService.findById(id).populate('company');
  if(invitation){

    console.log(invitation.company)
    member = await memberService.findByEmail(invitation.email);
    const alreadyMember = _.find(invitation.company.members, function(o){ return o.equals(member._id)});
    if(!member || alreadyMember) {
      return null;
    }

    member.roles.push(invitation.role);
    member = await member.save();
    invitation.company.members.push(member._id);
    await invitation.company.save();
    await invitation.delete();

  }
  return member;
}
