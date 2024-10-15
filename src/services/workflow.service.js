const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Workflow = require('../models/workflow.model');




function findWorkflowById(workflowId) {
  let data = null;

  if(workflowId==null){
    return;
  }

  return Workflow.findOne({workflowId: workflowId});
}

function findWorkflowByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return Workflow.find({partyId: userId});
}

function findWorkflowByUserIdAndWorkflowId(userId, workflowId) {
  let data = null;

  if(userId==null || workflowId==null){
    return;
  }

  return Workflow.findOne({partyId: userId, workflowId: workflowId});
}


function findWorkflowByCompanyId(companyId) {
  let data = null;

  if(companyId==null){
    return;
  }

  return Workflow.find({companyId: companyId});
}

function createWorkflow(workflow) {
  let data = null;

  if( workflow==null){
    return;
  }

  return new Workflow(workflow).save();
}


function removeWorkflowByUserIdAndWorkflowId(userId, workflowId) {
  let data = null;

  if(userId==null || workflowId==null){
    return;
  }

  return Workflow.remove({partyId: userId, workflowId: workflowId});
}


function removeWorkflowById(workflowId) {
  let data = null;

  if(workflowId==null){
    return;
  }

  return Workflow.remove({workflowId: workflowId});
}




module.exports = {
  findWorkflowById: findWorkflowById,
  findWorkflowByUserId: findWorkflowByUserId,
  findWorkflowByUserIdAndWorkflowId: findWorkflowByUserIdAndWorkflowId,
  findWorkflowByCompanyId: findWorkflowByCompanyId,
  createWorkflow: createWorkflow,
  removeWorkflowByUserIdAndWorkflowId: removeWorkflowByUserIdAndWorkflowId,
  removeWorkflowById: removeWorkflowById
}
