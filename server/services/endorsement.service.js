const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Endorsement = require('../models/endorsement.model');




function findEndorsementById(userId, endorsementId) {
  let data = null;

  if(userId==null || educationId==null){
    return;
  }

  return Endorsement.findOne({partyId: userId, educationId: educationId});
}

function findEndorseementByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return Endorsement.find({partyId: userId}).sort({fromDate: -1});
}

function findEndorsementsByEndorseId(endorser) {
  let data = null;

  if(endorser==null){
    return;
  }

  return Endorsement.find({endorser: endorser}).sort({fromDate: -1});
}

function findEndorsementsByEndorserIdAndListOfPartySkillIds(endorserId, listOfPartySKills) {
  let data = null;

  if(endorserId==null || listOfPartySKills==null){
    return;
  }

  return Endorsement.find({endorser: endorserId, partySkillId: {$in: listOfPartySKills}});
}

function findEndorsementByEndorserIdAndPartySkillId(endorserId, partySkillId) {
  let data = null;

  if(endorserId==null || partySkillId==null){
    return;
  }

  return Endorsement.findOne({endorser: endorserId, partySkillId: partySkillId});
}

function addEndorsementByUserId(endorsement) {
  let data = null;

  if(endorsement==null){
    return;
  }

  // return new Endorsement(endorsement).save();
  return new Endorsement(endorsement).save();
}


function removeEndorsementById(endorserId, endorsementId) {
  let data = null;

  if(endorserId==null || endorsementId==null){
    return;
  }

  return Endorsement.remove({endorse: userId, endorsementId: endorsementId});
}

function removeEndorsementByEndorserIdAndPartySkillId(endorserId, partySkillId) {
  let data = null;

  if(endorserId==null || partySkillId==null){
    return;
  }

  return Endorsement.remove({endorse: userId, partySkillId: partySkillId});
}

function getEndorsementCount(partySkillIds) {
  let data = null;

  if(getEndorsementCount==null){
    return;
  }
  return Endorsement.aggregate([
    {$match: {partySkillId: {$in: partySkillIds}}},
    {$group: {_id: {partySkillId: '$partySkillId'}, count: {$sum: 1}, endorsers: {$push: '$endorserId'}, averageEndorsedRating: {$avg: '$rating'} }},
    {$project: {_id: 0, partySkillId: '$_id.partySkillId', count: 1, endorsers: '$endorsers', averageEndorsedRating: '$averageEndorsedRating'}},
    {$sort: {count: -1}}
    ])
}

function getTop3SkillsEndorsement(partySkillIds) {
  let data = null;

  if(getEndorsementCount==null){
    return;
  }
  return Endorsement.aggregate([
    {$match: {partySkillId: {$in: partySkillIds}}},
    {$group: {_id: {partySkillId: '$partySkillId'}, count: {$sum: 1}, endorsers: {$push: {endorserId: '$endorserId', endorseDate: '$createdDate'}}, averageEndorsedRating: {$avg: '$rating'}  }},
    {$project: {_id: 0, partySkillId: '$_id.partySkillId', count: 1, endorsers: '$endorsers', endorseDate: '$endorseDate', averageEndorsedRating: '$averageEndorsedRating'}},
    {$sort: {count: -1}},
    {$limit: 3}
  ])
}



module.exports = {
  findEndorsementById: findEndorsementById,
  findEndorseementByUserId: findEndorseementByUserId,
  findEndorsementByEndorserIdAndPartySkillId: findEndorsementByEndorserIdAndPartySkillId,
  findEndorsementsByEndorserIdAndListOfPartySkillIds:findEndorsementsByEndorserIdAndListOfPartySkillIds,
  addEndorsementByUserId: addEndorsementByUserId,
  removeEndorsementById: removeEndorsementById,
  removeEndorsementByEndorserIdAndPartySkillId:removeEndorsementByEndorserIdAndPartySkillId,
  getEndorsementCount:getEndorsementCount,
  getTop3SkillsEndorsement: getTop3SkillsEndorsement,
  findEndorsementsByEndorseId:findEndorsementsByEndorseId,
  findEndorsementByEndorserIdAndPartySkillId:findEndorsementByEndorserIdAndPartySkillId
}
