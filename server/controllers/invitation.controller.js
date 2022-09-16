const bcrypt = require('bcrypt');
const Joi = require('joi');
const Industry = require('../models/industry.model');
const memberService = require('../services/memberinvitation.service');

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
  let data = await memberService.findById(id)
  return data;
}
