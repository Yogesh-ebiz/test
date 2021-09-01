const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Joi = require('joi');

const Role = require('../models/role.model');
const memberService = require('../services/member.service');


const roleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  privileges: Joi.array().required(),
  company: Joi.number().optional(),
  updatedBy: Joi.number().optional(),
  createdBy: Joi.number().optional()
});

async function add(form) {
  if(!form){
    return;
  }

  form = await Joi.validate(form, roleSchema, { abortEarly: false });
  form.default = false;

  let role = new Role(form).save();
  return role;

}

async function update(id, form) {
  let data = null;

  if(!id || !form){
    return;
  }

  form = await Joi.validate(form, roleSchema, { abortEarly: false });

  let role = await Role.findById(id);
  if(role && !role.default){
    role.updatedDate = Date.now();
    role.name = form.name;
    role.privileges=form.privileges;
    role.description=form.description;
    result = await role.save();
  }
  return role;

}


async function remove(id) {
  let data = null;

  if(!id){
    return;
  }

  let result;
  let role = await Role.findById(id);
  if(role && !role.default){
    result = await role.delete();
    await memberService.removeRole(id);
  }
  return result;

}


async function disable(id) {
  let data = null;

  if(!id){
    return;
  }

  let role = await Role.findById(id);
  if(role && !role.default){
    role.updatedDate = Date.now();
    role.status = statusEnum.DISABLED;
    result = await role.save();

    await memberService.removeRole(id);
  }
  return role;

}


async function enable(id) {
  let data = null;

  if(!id){
    return;
  }


  let role = await Role.findById(id);
  if(role && !role.default){
    role.updatedDate = Date.now();
    role.status = statusEnum.ACTIVE;
    result = await role.save();
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
  add:add,
  update:update,
  remove:remove,
  disable:disable,
  enable:enable,
  getRoles:getRoles,
  getAdminRole:getAdminRole,
  getRoleByRole:getRoleByRole,
  getRoleByName:getRoleByName

}
