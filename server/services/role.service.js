const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Role = require('../models/role.model');


function getRoleByRoleName(roleName) {
  let data = null;

  if(roleName==null){
    return;
  }

  return Role.findOne({roleName: roleName});
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
  getRoleByRoleName:getRoleByRoleName,
  addRole:addRole,
  getRoles:getRoles
}
