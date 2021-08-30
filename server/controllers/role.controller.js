const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const ISO6391 = require('iso-639-1');

const skillTypeEnum = require('../const/skillTypeEnum');
const partyEnum = require('../const/partyEnum');
const statusEnum = require('../const/statusEnum');
const alertEnum = require('../const/alertEnum');
const Role = require('../models/role.model');
const Privilege = require('../models/privilege.model');


const {syncExperiences, getUserEmployers, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findByUserId, findCompanyById, searchCompany} = require('../services/api/feed.service.api');
const {getPartyById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populateParties, populatePerson, populateParty, populateCompany, populateInstitute} = require('../services/party.service');
const {getFieldOfStudyListByShortCode, getAllJobFunctions} = require('../services/filter.service');
const {addCompanySalary} = require('../services/company.service');

const roleService = require('../services/role.service');



const roleSchema = Joi.object({
  createdBy: Joi.number().required(),
  company: Joi.number().required(),
  roleName: Joi.string().required(),
  name: Joi.string(),
  privileges: Joi.array().required(),
  description: Joi.string()
});





module.exports = {
  addRole,
  getAllRoles,
  updateRole,
  deleteRole,
  getAllPrivileges
}



async function addRole(currentUserId, form) {
  form = await Joi.validate(form, policySchema, { abortEarly: false });
  if(!currentUserId || !form){
    return null;
  }

  let result = null;

  try {
    result = await policyService.addPolicy(form);

  } catch(e){
    console.log('addPolicy: Error', e);
  }


  return result
}

async function getAllRoles(currentUserId, company, locale) {

  if(!currentUserId || !company || !locale){
    return null;
  }

  let obj = {};
  obj['description.'+locale] = { $exists: true, $ne: null };
  let defaultEn = {};
  defaultEn['description.'+'en'] = { $exists: true, $ne: null };

  let result = await Policy.aggregate([
    {$match: {company: company}},
    {$project: {id: 1, role: 1, roleName: 1, company:1, description: { $cond: { if: { $gte: [ "$qty", 250 ] }, then: '', else: '$description.en' }}}}
  ]);

  return result;

}


async function updateRole(roleId, currentUserId, form) {
  form = await Joi.validate(form, roleSchema, { abortEarly: false });
  if(!currentUserId || !roleId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let role = await Role.findById(roleId);
      if(role){
        role.name = form.name;
        role.updatedBy = currentUserId;
        role.description=form.description;
        role.privileges=form.privileges;
        result = await policy.save();
      }

    }
  } catch(e){
    console.log('updatePolicy: Error', e);
  }


  return result
}


async function deleteRole(roleId, currentUserId) {
  if(!currentUserId || !roleId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let role = await Role.findById(roleId);
      if(role){
        result = await role.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteRole: Error', e);
  }


  return result
}

async function getAllPrivileges(currentUserId, company, locale) {


  let result = await Privilege.find();
  return _.chain(result)
    .groupBy("type")
    .map((value, key) => ({ type: key, privileges: value }))
    .orderBy('type')
    .value();

}
