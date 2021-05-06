const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Member = require('../models/member.model');


async function getMembers(company, query) {
  let data = null;

  if(company==null){
    return;
  }

  let members = Member.find({company: company}).populate('role');
  return members
}


function addMember(member) {
  let data = null;

  if(member==null){
    return;
  }

  member = new Member(member).save();
  return member;

}



module.exports = {
  getMembers:getMembers,
  addMember:addMember
}
