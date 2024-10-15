const bcrypt = require('bcrypt');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const _ = require('lodash');
var path = require('path');
var FormData = require('form-data');
const he = require('he');


const config = require('../config/config');
let Pagination = require('../utils/pagination');
let SearchParam = require('../const/searchParam');
const statusEnum = require('../const/statusEnum');
const awsService = require('../services/aws.service');
const {buildFileUrl, buildCompanyUrl, buildUserUrl, buildCandidateUrl, jobMinimal, categoryMinimal, roleMinimal, convertToCandidate, convertToTalentUser, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');
const userService = require('../services/user.service');

const companyService = require('../services/company.service');
const memberService = require('../services/member.service');
const signatureService = require("../services/signature.service");
const catchAsync = require('../utils/catchAsync');
const taskService = require('../services/task.service');
const emailTemplateService = require('../services/emailtemplate.service');

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


const getSignatures = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {id} = params;

  try{
    const signatures = await signatureService.findByUserId(user._id);
    res.status(200).json(signatures);

  } catch(error){
    console.error('Error fetching signatures:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }

});

const addSignature = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {id} = params;

  let result = null;
  try {
    body.createdBy = user._id;
    body.bodyHtml = he.decode(body.bodyHtml);
    result = await signatureService.add(body);
  } catch(e){
    console.log('addSignature: Error', e);
  }

  res.json(result);
});

const getSignature = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {id, templateId} = params;

  let result = null;
  try {
    result = await signatureService.findById(new ObjectId(templateId));
  } catch(e){
    console.log('updateSignature: Error', e);
  }

  res.json(result);
});

const updateSignature = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {id, templateId} = params;

  console.log('updateSignature', params);
  let result = null;
  try {
    result = await signatureService.update(new ObjectId(templateId), body, user);
  } catch(e){
    console.log('updateSignature: Error', e);
  }

  res.json(result);
});

const removeSignature = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {id, templateId} = params;

  let result = null;
  try {
    result = await signatureService.remove(new ObjectId(templateId), user._id);
  } catch(e){
    console.log('removeSignature: Error', e);
  }

  res.json(result);
});

module.exports = {
  getMember,
  updateMember,
  removeMember,
  getMemberTasks,
  getSignatures,
  addSignature,
  getSignature,
  updateSignature,
  removeSignature
}
