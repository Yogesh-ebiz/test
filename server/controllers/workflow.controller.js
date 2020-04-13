const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const Workflow = require('../models/workflow.model');
const partyEnum = require('../const/partyEnum');
const statusEnum = require('../const/statusEnum');


const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');


const {findWorkflowById, createWorkflow, findWorkflowByCompanyId, findWorkflowByUserId, findWorkflowByUserIdAndWorkflowId, removeWorkflowById, removeWorkflowByUserIdAndWorkflowId} = require('../services/workflow.service');

const workflowSchema = Joi.object({
  workflowId: Joi.number().optional(),
  partyId: Joi.number().required(),
  title: Joi.string(),
  workflow: Joi.array(),
  isPrimary: Joi.boolean(),
  department: Joi.string().optional(),
  companyId: Joi.number().optional()
});



module.exports = {
  addWorkflow,
  removeWorkflow,
  getWorkflowById,
  getWorkflowByUserId,
  getWorkflowByCompanyId
}



async function addWorkflow(currentUserId, workflow) {
  workflow = await Joi.validate(workflow, workflowSchema, { abortEarly: false });

  if(currentUserId==null || workflow==null){
    return null;
  }


  let result;
  try {

    let currentParty = await getPersonById(currentUserId);
    // console.log('currentParty', currentParty)

    //Security Check if user is part of meeting attendees that is ACTIVE.
    if (isPartyActive(currentParty)) {
      console.log('creating')
      result = await createWorkflow(workflow);

    }


  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function removeWorkflow(currentUserId, workflowId) {

  if(currentUserId==null || workflowId==null){
    return null;
  }


  let result;
  try {

    let currentParty = await getPersonById(currentUserId);

    //Security Check if user is part of meeting attendees that is ACTIVE.
    if (isPartyActive(currentParty)) {
      result = await findWorkflowByUserIdAndWorkflowId(currentParty.id, workflowId);

      if(result){
        let deleted = await removeWorkflowById(workflowId);

        if(deleted && deleted.deletedCount>0){
          console.log('deleted', deleted);
          result.status=statusEnum.DELETED;
        } else {
          result = null;
        }
      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function getWorkflowById(currentUserId, workflowId) {

  if(!workflowId || !currentUserId){
    return null;
  }
  let workflow;
  try {
    let currentParty = await getPersonById(currentUserId);

    if(isPartyActive(currentParty)) {
      workflow = await findWorkflowById(workflowId);

    }

  } catch (error) {
    console.log(error);
  }

  return workflow;
}


async function getWorkflowByUserId(currentUserId) {

  if(!currentUserId){
    return null;
  }
  let workflow;
  try {
    let currentParty = await getPersonById(currentUserId);


    if(isPartyActive(currentParty)) {
      workflow = await findWorkflowByUserId(currentUserId);

    }

  } catch (error) {
    console.log(error);
  }

  return workflow;
}





async function getWorkflowByCompanyId(currentUserId, companyId) {

  if(!companyId || !currentUserId){
    return null;
  }
  let workflows;
  try {
    let currentParty = await getPersonById(currentUserId);


    response = await getCompanyById(companyId);
    let company = response.data.data;


    if(isPartyActive(currentParty) && isPartyActive(company)) {
      workflows = await findWorkflowByCompanyId(companyId);

    }

  } catch (error) {
    console.log(error);
  }

  return workflows;
}

