const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const Industry = require('../models/industry.model');
const memberService = require('../services/member.service');
const memberInvitationService = require('../services/memberinvitation.service');

const industrySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  sequence: Joi.string().required()
})

module.exports = {
  getInvitationById
}


async function getInvitationById(id, locale) {
  let result, member;
  const data = await memberInvitationService.findById(id);

  if(data){
    member = await memberService.findByEmail(data.email);
    result = _.clone(data.toJSON());
    result.memberId = member._id;
    result.userId = member.userId;
  }
  return result;
}
