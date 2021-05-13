const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Member = require('../models/member.model');
const MemberInvitation = require('../models/memberInvitation.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const feedService = require('../services/api/feed.service.api');


const memberSchema = Joi.object({
  createdBy: Joi.number().required(),
  company: Joi.number().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('').optional(),
  lastName: Joi.string().required(),
  phone: Joi.number().required(),
  email: Joi.string().required(),
  status: Joi.string().optional(),
  language: Joi.string().allow('').optional(),
  timezone: Joi.string().allow('').optional(),
  preferTimeFormat: Joi.string().allow('').optional(),
  userId: Joi.number()
});


async function inviteMembers(company, currentUserId, emails, role) {
  let data = null;

  if(!company || !emails || !role){
    return;
  }

  let newMembers = [];
  emails.forEach(function(email){
    let member = {};
    member.email = email;
    member.createdBy = currentUserId;
    member.company = company;
    member.role = role;
    newMembers.push(member);
  });

  let invitations = await MemberInvitation.insertMany(newMembers);
  return invitations;
}

async function getMemberInvitations(company) {
  let data = null;

  if(!company){
    return;
  }

  let invitations = await MemberInvitation.find({company: company}).populate('role');
  return invitations
}


async function getMembers(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  let members = Member.find({company: company}).populate('role');
  return members
}

async function findMemberBy_Id(memberId) {
  let data = null;

  if(memberId==null){
    return;
  }

  let member = Member.findById(memberId);
  return member
}

async function findMemberByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  let allAccounts = Member.find({userId: userId}).populate('role')
  return allAccounts
}


async function addMember(member, role, invitationId) {
  if(!member || !role || !invitationId){
    return;
  }


  let result;
  let invitation = await MemberInvitation.findById(invitationId);
  if(invitation) {
    member = await Joi.validate(member, memberSchema, {abortEarly: false});

    let user = await feedService.register(member);

    if(user) {
      member.userId = user.id;
      member.role = role;

      result = new Member(member).save();
      if (result) {
        await invitation.delete();
      }
    }
  }
  return result;

}

async function updateMember(memberId, form) {
  if(!memberId || !form){
    return;
  }


  form = await Joi.validate(form, memberSchema, {abortEarly: false});
  let member = await findMemberBy_Id(memberId);

  if(member){
    member.firstName = form.firstName;
    member.middleName = form.firstName;
    member.lastName = form.lastName;
    member.email = form.email;
    member.phone = form.phone;
    member.language = form.language;
    member.timezone = form.timezone;
    member.preferTimeFormat = form.preferTimeFormat;
    result = await member.save();
  }
  return member;

}


async function updateMemberRole(memberId, role) {
  if(!memberId || !role){
    return;
  }


  let member = await findMemberBy_Id(memberId);

  if(member){
    member.role = role;
    result = await member.save();
  }
  return member;

}



module.exports = {
  inviteMembers:inviteMembers,
  getMemberInvitations:getMemberInvitations,
  getMembers:getMembers,
  findMemberBy_Id:findMemberBy_Id,
  findMemberByUserId:findMemberByUserId,
  addMember:addMember,
  updateMember:updateMember,
  updateMemberRole:updateMemberRole
}
