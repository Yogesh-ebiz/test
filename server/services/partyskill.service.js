const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartySkill = require('../models/partyskill.model');
const Endorsement = require('../models/endorsement.model');



function findPartySkillById(partySkillId) {
  let data = null;

  if(partySkillId==null){
    return;
  }

  return PartySkill.findOne({partySkillId: partySkillId});
}


function findPartySkillByUserIdAndSkillTypeId(userId, skillTypeId) {
  let data = null;

  if(userId==null || skillTypeId==null){
    return;
  }

  return PartySkill.findOne({partyId: userId, skillTypeId: skillTypeId});
}



function findTop3PartySkillsByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return PartySkill.find({partyId: userId});
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


function addUserPartySkillEndorsement(endorsement) {
  let data = null;

  if(endorsement==null){
    return;
  }

  return new Endorsement(endorsement).save();
}



function removePartySkillById(partySkillId) {
  let data = null;

  if(partySkillId==null){
    return;
  }

  return PartySkill.remove({partySkillId: partySkillId});
}

function getEndorsersHighlySkillBySkillTypeId(skillTypeId, listOfUserId) {
  let data = null;

  if(skillTypeId==null || listOfUserId==null){
    return;
  }

  return PartySkill.aggregate([
    {$match: {skillTypeId: skillTypeId, partyId: {$in: listOfUserId}, averageEndorsedRating: {$gte: 4}}},
    {$group: {_id: null, noOfHighlySkillEndorsers: {$sum: 1}, partyId: {$first: '$partyId'}, skillTypeId: {$first: '$skillTypeId'}}},
    {$project: {_id: 0, noOfHighlySkillEndorsers: '$noOfHighlySkillEndorsers', partyId: '$partyId', skillTypeId: '$skillTypeId'}}
  ]);
}

module.exports = {
  findPartySkillById: findPartySkillById,
  findPartySkillByUserIdAndSkillTypeId: findPartySkillByUserIdAndSkillTypeId,
  findPartySkillsByUserId: findPartySkillsByUserId,
  addUserPartySkill: addUserPartySkill,
  removePartySkillById: removePartySkillById,
  getEndorsersHighlySkillBySkillTypeId:getEndorsersHighlySkillBySkillTypeId
}
