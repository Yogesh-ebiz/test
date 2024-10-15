const bcrypt = require('bcrypt');
const {ObjectId} = require('mongodb');
const Joi = require('joi');
const _ = require('lodash');
const Industry = require('../models/industry.model');
const memberService = require('../services/member.service');
const memberInvitationService = require('../services/memberinvitation.service');
const roleService = require('../services/role.service');
const messagingService = require('../services/api/messaging.service.api');
const calendarService = require('../services/api/calendar.service.api');
const catchAsync = require("../utils/catchAsync");


const getInvitationById = catchAsync(async (req, res) => {
  const {params} = req;
  const {id} = params;

  let result = await memberInvitationService.findById(id).populate('company');

  if(result){
    result.company = result.company.transform();
  }
  res.json(result);
});

const acceptInvitation = catchAsync(async (req, res) => {
  const {params} = req;
  const {id} = params;

  let member = null;
  try {
    const invitation = await memberInvitationService.findById(new ObjectId(id)).populate('company');
    if(invitation){
      console.log(invitation.company)
      member = await memberService.findByEmail(invitation.email);
      const alreadyMember = _.find(invitation.company.members, function(o){ return o.equals(member._id)});
      if(!member || alreadyMember) {
        return null;
      }

      member.roles.push(invitation.role);
      //Save as user in messaging_service.
      const messagingUser = await messagingService.createUser({firstName: member.firstName, lastName: member.lastName, email: member.email, userId: member.userId});
      if(messagingUser){
        member.messengerId = messagingUser._id;
      }
      const calendarUser = await calendarService.createUser({firstName: member.firstName, lastName: member.lastName, email: member.email, userId: member.userId, messengerId: member.messengerId || null});
      if(calendarUser){
        member.calendarUserId = calendarUser._id;
        const newCalendar = await calendarService.createCalendar({userId: member.userId});
        if(newCalendar){
          member.calendarId = newCalendar._id;
        }
      }
      member = await member.save();
      invitation.company.members.push(member._id);
      await invitation.company.save();
      await invitation.delete();

    }

  } catch(e){
    console.log('acceptInvitation: Error', e);
  }

  res.json(member);
});

module.exports = {
  getInvitationById,
  acceptInvitation
}
