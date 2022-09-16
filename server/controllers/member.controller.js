const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
var path = require('path');
var FormData = require('form-data');


const config = require('../config/config');
let Pagination = require('../utils/pagination');
let SearchParam = require('../const/searchParam');

const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');
const taskType = require('../const/taskType');
const stageType = require('../const/stageType');
const notificationType = require('../const/notificationType');
const notificationEvent = require('../const/notificationEvent');


const awsService = require('../services/aws.service');
const {buildFileUrl, buildCompanyUrl, buildUserUrl, buildCandidateUrl, jobMinimal, categoryMinimal, roleMinimal, convertToCandidate, convertToTalentUser, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');
const userService = require('../services/user.service');

const companyService = require('../services/company.service');
const memberService = require('../services/member.service');
const taskService = require("../services/task.service");

module.exports = {
  getMember,
  updateMember,
  removeMember,
  getMemberTasks
}


async function getMember(id, currentUserId) {
  if(!currentUserId || !id){
    return null;
  }

  let member = null

  try {
    member = await memberService.findById(id);
    if(member) {
      member.avatar = buildUserUrl(member);
    }
  } catch(e){
    console.log('getMember: Error', e);
  }

  return member
}



async function updateMember(id, currentUserId, form) {
  if(!currentUserId || !id || !form){
    return null;
  }

  let member = null;
  try {
    member = await memberService.findById(id);
    console.log(member, currentUserId)
    if(member.userId===currentUserId) {
      member = await memberService.updateMember(id, form);
    }
  } catch(e){
    console.log('updateMember: Error', e);
  }


  return member;
}

async function removeMember(currentUserId, id) {
  if(!currentUserId || !id){
    return null;
  }

  let member = null;
  let result = null;
  try {
      member = await memberService.findById(id);
      if(member.userId===currentUserId){
        result = await memberService.removeMember(id)
        if(result){
          result = {deleted: 1};
        }

      }

  } catch(e){
    console.log('removeMember: Error', e);
  }

  return result
}


async function getMemberTasks(currentUserId, id, filter, sort, query) {
  if(!currentUserId || !id || !filter || !sort){
    return null;
  }

  let result = null;
  try {
    filter.members = [id];
    result = await taskService.search(filter, sort, query);
  } catch(e){
    console.log('getMemberTasks: Error', e);
  }

  return result
}


