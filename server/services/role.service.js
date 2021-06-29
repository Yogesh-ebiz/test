const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Role = require('../models/role.model');



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


function addRole(role) {
  let data = null;

  if(role==null){
    return;
  }

  role = new Role(role).save();
  return role;

}


function getRoles(company) {
  let data = null;

  if(company==null){
    return;
  }


  return Role.find({company:company});

}



module.exports = {
  getRoleByRole:getRoleByRole,
  getRoleByName:getRoleByName,
  addRole:addRole,
  getRoles:getRoles
}
