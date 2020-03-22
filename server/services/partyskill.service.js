const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartySkill = require('../models/partyskill.model');



function findPartySkillsById(partySkillId) {
  let data = null;

  if(partySkillId==null){
    return;
  }

  return PartySkill.find({partySkillId: partySkillId});
}


function findPartySkillByUserIdAndSkillTypeId(userId, skillTypeId) {
  let data = null;

  if(userId==null || skillTypeId==null){
    return;
  }

  return PartySkill.findOne({partyId: userId, skillTypeId: skillTypeId});
}

function findPartySkillsByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartySkill.find({partyId: userId});
}

function addUserPartySkill(partySKill) {
  let data = null;

  if(partySKill==null){
    return;
  }

  return new PartySkill(partySKill).save();
}


function removePartySkillById(partySkillId) {
  let data = null;

  if(partySkillId==null){
    return;
  }
  console.log(partySkillId)

  return PartySkill.remove({partySkillId: partySkillId});
}

module.exports = {
  findPartySkillsById: findPartySkillsById,
  findPartySkillByUserIdAndSkillTypeId: findPartySkillByUserIdAndSkillTypeId,
  findPartySkillsByUserId: findPartySkillsByUserId,
  addUserPartySkill: addUserPartySkill,
  removePartySkillById: removePartySkillById
}
