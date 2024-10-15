const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const PartySkill = require('../models/partyskill.model');
const Endorsement = require('../models/endorsement.model');



async function add(partySkill) {
  if (!partySkill){
    return;
  }

  return new PartySkill(partySkill).save();
}

function findById(id) {
  if (!id){
    return;
  }

  return PartySkill.findById(id);
}
function findPartySkillById(partySkillId) {
  if (!partySkillId){
    return;
  }

  return PartySkill.findOne({partySkillId: partySkillId});
}

function findPartySkillWithEndorsementsById(partySkillId, filter) {
  let data = null;

  if(partySkillId==null || filter==null){
    return;
  }

  let page = filter.page;
  let size = filter.size;
  let skip = filter.size * filter.page;

  return PartySkill.findOne({partySkillId: partySkillId}).populate([
    {
      path: 'endorsements',
      model:'Endorsement',
      options: {
        sort:{ },
        skip: skip,
        limit : size
      }
    }
  ]);
}


function findPartySkillByUserIdAndSkill(partyId, skill) {
  if (!partyId || !skill){
    return;
  }

  return PartySkill.findOne({partyId, skill});
}

function findPartySkillByUserIdAndName(partyId, name) {
  if (!partyId || !name){
    return;
  }

  return PartySkill.findOne({partyId, name});
}


function findTop3PartySkillsByUserId(userId, viewerId) {
  let data = null;

  if(userId==null){
    return;
  }

  const result = PartySkill.aggregate([
    { $match: {partyId: userId, status: statusEnum.ACTIVE }},
    { $lookup: {
        from: 'endorsements',
        localField: 'endorsements',
        foreignField: '_id',
        as: 'endorsements',
      },
    },
    { $lookup: {
        from: 'skills',
        localField: 'skill',
        foreignField: '_id',
        as: 'skill',
      },
    },
    {$unwind: '$skill'},
    {
      $addFields: {
        noOfEndorsement: {$size: '$endorsements'},
        averageEndorsedRating: {$avg: '$endorsements.rating'},
        hasEndorsed:{
          $cond: [
            {$gt:[{$size: {$setIntersection:["$endorsements.endorserId", [viewerId]]}}, 0]},
            true,false
          ]
        },
        endorsements: []
      }
    },
    { $sort: {noOfEndorsement: -1} },
    { $limit: 3}
  ]);

  return result;
}

function findPartySkillsByUserId(userId) {
  if (!userId){
    return;
  }

  return PartySkill.find({partyId: userId}).sort({averageEndorsedRating: -1, selfRating: -1});
}

function getUserPartySkills(userId, viewerId) {
  if (!userId){
    return;
  }

  const result = PartySkill.aggregate([
    { $match: {partyId: userId, status: statusEnum.ACTIVE }},
    { $lookup: {
        from: 'endorsements',
        localField: 'endorsements',
        foreignField: '_id',
        as: 'endorsements',
      },
    },
    { $lookup: {
        from: 'skills',
        localField: 'skill',
        foreignField: '_id',
        as: 'skill',
      },
    },
    {$unwind: '$skill'},
    {
      $addFields: {
        noOfEndorsement: {$size: '$endorsements'},
        averageEndorsedRating: {$avg: '$endorsements.rating'},
        hasEndorsed:{
          $cond: [
            {$gt:[{$size: {$setIntersection:["$endorsements.endorserId", [viewerId]]}}, 0]},
            true,false
          ]
        },
        endorsements: []
      }
    }
  ]);

  return result;
}

function updatePartySkillByUserId(userId, skill) {
  let data = null;

  if(userId==null || skill==null){
    return;
  }

  return PartySkill.update({partyId: userId, skillTypeId: skill.skillTypeId}, {$set: {
        partyId: userId,
        skillTypeId: skill.skillTypeId,
        noOfMonths: skill.noOfMonths,
        selfRating: skill.selfRating?skill.selfRating:0
  }},
    {upsert: true, new: true});
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

function removePartySkillBySkillTypeIdAndUserId(userId, skillTypeId) {
  let data = null;

  if(userId==null || skillTypeId==null){
    return;
  }

  return PartySkill.remove({partyId: userId, skillTypeId: skillTypeId});
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
  add,
  findById,
  findPartySkillById,
  findPartySkillWithEndorsementsById,
  findPartySkillByUserIdAndSkill,
  findPartySkillByUserIdAndName,
  findPartySkillsByUserId,
  getUserPartySkills,
  findTop3PartySkillsByUserId,
  updatePartySkillByUserId,
  removePartySkillById,
  removePartySkillBySkillTypeIdAndUserId,
  getEndorsersHighlySkillBySkillTypeId
}
