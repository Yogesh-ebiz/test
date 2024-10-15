const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const { ObjectId } = require('mongodb');
const _ = require('lodash');

let statusEnum = require('../const/statusEnum');
const webhookService = require('../services/webhook.service');
const catchAsync = require("../utils/catchAsync");
const applicationService = require('../services/application.service');
const candidateService = require('../services/candidate.service');

/*async function webscraperio(data) {


  let result;
  try {
    result = await webhookService.webscraperio(data);
  } catch (error) {
    console.log(error);
  }

  return result;
}*/

const updateApplicationEmails = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  let currentUserId = parseInt(req.header('UserId'));
  const {applicationId} = params;
  let application = await applicationService.findById(new ObjectId(applicationId));
  if(application){
    application.emails.push(new ObjectId(body.emailId));
  }
  await application.save();

  res.json({application});
});

const updateApplicationConversation = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {applicationId} = params;
  let application = await applicationService.findById(new ObjectId(applicationId));
  if(application && !application.conversationId){
    application.conversationId = body.conversationId;
    await application.save();
  }

  res.json(application);
});

const updateCandidateConversation = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {candidateId} = params;
  let candidate = await candidateService.findById(new ObjectId(candidateId));
  if(candidate && !candidate.conversationId){
    candidate.conversationId = body.conversationId;
    await candidate.save();
  }

  res.json(candidate);
});

module.exports = {
  //webscraperio,
  updateApplicationEmails,
  updateApplicationConversation,
  updateCandidateConversation,
}