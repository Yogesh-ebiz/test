const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const workflowCtl = require('../controllers/workflow.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/').post(asyncHandler(addWorkflow));
router.route('/:id').get(asyncHandler(getWorkflowById));
router.route('/:id').delete(asyncHandler(removeWorkflow));
router.route('/user/:userId').get(asyncHandler(getWorkflowByUserId));
router.route('/company/:companyId').get(asyncHandler(getWorkflowByCompanyId));


async function addWorkflow(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let workflow = req.body;
  workflow.partyId=currentUserId;

  let data = await workflowCtl.addWorkflow(currentUserId, workflow);

  res.json(new Response(data, data?'workflow_added_successful':'not_found', res));
}


async function removeWorkflow(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let workflowId = parseInt(req.params.id);

  let data = await workflowCtl.removeWorkflow(currentUserId, workflowId);

  res.json(new Response(data, data?'workflow_removed_successful':'not_found', res));
}


async function getWorkflowById(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let workflowId = parseInt(req.params.id);
  let data = await workflowCtl.getWorkflowById(currentUserId, workflowId);

  res.json(new Response(data, data?'workflow_retrieved_successful':'not_found', res));
}

async function getWorkflowByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await workflowCtl.getWorkflowByUserId(currentUserId);

  res.json(new Response(data, data?'workflows_retrieved_successful':'not_found', res));
}


async function getWorkflowByCompanyId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.companyId);

  let data = await workflowCtl.getWorkflowByCompanyId(currentUserId, companyId);

  res.json(new Response(data, data?'workflows_retrieved_successful':'not_found', res));
}




