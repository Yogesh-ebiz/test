const bcrypt = require('bcrypt');
const Joi = require('joi');
const Skill = require('../models/skill.model');
const filterService = require('../services/filter.service');


const skillSchema = Joi.object({
  name: Joi.string().required(),
  parent: Joi.number().required(),
  description: Joi.string().required(),
})


module.exports = {
  insert,
  getSkills,
  getSkillById
}

async function insert(skilltype) {
  return await new Skill(skilltype).save();
}

async function getSkills(filter, locale) {
  return await filterService.getAllSkills(filter, locale);
}


async function getSkillById(id, locale) {

  id=(typeof id !== 'undefined') ? id : 0;
  return await Skill.aggregate([ { $lookup: { from: "skills", localField: "skillId", foreignField: "parent", as: "children" } }, { $match: { skillId: parseInt(id) } } ])
}
