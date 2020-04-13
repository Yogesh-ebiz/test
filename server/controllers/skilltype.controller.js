const bcrypt = require('bcrypt');
const Joi = require('joi');
const SkillType = require('../models/skilltype.model');
const filterService = require('../services/filter.service');


const skillTypeSchema = Joi.object({
  name: Joi.string().required(),
  parent: Joi.number().required(),
  description: Joi.string().required(),
})


module.exports = {
  insert,
  getSkillTypes,
  getSkillTypeById
}

async function insert(skilltype) {
  return await new SkillType(skilltype).save();
}

async function getSkillTypes(filter, locale) {
  return await filterService.getAllSkillTypes(filter, locale);
}


async function getSkillTypeById(id, locale) {

  id=(typeof id !== 'undefined') ? id : 0;
  return await SkillType.aggregate([ { $lookup: { from: "skilltypes", localField: "skillTypeId", foreignField: "parent", as: "children" } }, { $match: { skillTypeId: parseInt(id) } } ])
}
