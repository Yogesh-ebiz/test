const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Joi = require('joi');

const Role = require('../models/role.model');
const memberService = require('../services/member.service');
const Member = require("../models/member.model");


const roleSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.object(),
  privileges: Joi.array().required(),
  description: Joi.string().allow('').optional(),
  updatedBy: Joi.object().optional(),
  createdBy: Joi.object().optional()
});


function findById(id) {
  if(!id){
    return;
  }

  return Role.findById(id);
}

async function add(form) {
  if(!form){
    return;
  }

  await roleSchema.validate(form, { abortEarly: false });
  form.default = false;

  let role = new Role(form).save();
  return role;

}

async function update(id, form) {
  if(!id || !form){
    return;
  }

  await roleSchema.validate(form, { abortEarly: false });

  let role = await Role.findById(id);
  if(role && !role.default){
    role.updatedDate = Date.now();
    role.name = form.name;
    role.privileges=form.privileges;
    role.description=form.description;
    role = await role.save();
  }
  return role;

}


async function remove(id) {
  if(!id){
    return;
  }

  let result;
  let role = await Role.findById(id);
  if(role && !role.default){
    result = await Role.findByIdAndDelete(id);
    if(result){
      await Member.updateMany({role: id}, {$set: {role: null}});
    }

  }
  return result;

}


async function disable(id, memberId) {
  if(!id || !memberId){
    return;
  }

  let role = await Role.findById(id);
  if(role && !role.default){
    role.updatedDate = Date.now();
    role.updatedBy = memberId;
    role.status = statusEnum.DISABLED;
    role = await role.save();

    // await memberService.removeRole(id);
  }
  return role;

}


async function enable(id, memberId) {
  if(!id || !memberId){
    return;
  }


  let role = await Role.findById(id);
  if(role && !role.default){
    role.updatedDate = Date.now();
    role.updatedBy = memberId
    role.status = statusEnum.ACTIVE;
    role = await role.save();
  }
  return role;

}

function getRoles(company, all) {
  let data = null;

  if(!company){
    return;
  }

  let status = [];
  if(all){
    status.push(statusEnum.ACTIVE);
    status.push(statusEnum.DISABLED);
  } else {
    status.push(statusEnum.ACTIVE);
  }

  return Role.find({$or: [{company:company}, {default: true}], status: {$in: status}});

}


function getDefaultAdminRole() {
  return Role.findOne({default: true, company: {$exists: false}});
}

function getAdminRole() {
  let data = null;

  return Role.findOne({default: true});
}


function getRoleByRole(role) {
  let data = null;

  if(!role){
    return;
  }

  return Role.findOne({default: true});
}


function getRoleByName(name) {
  let data = null;

  if(name==null){
    return;
  }

  return Role.findOne({name: name});
}




module.exports = {
  add,
  findById,
  update,
  remove,
  disable,
  enable,
  getRoles,
  getDefaultAdminRole,
  getAdminRole,
  getRoleByRole,
  getRoleByName

}
