const ApiClient = require('../apiManager');
const _ = require('lodash');
const config = require('../../config/config')

const options = { headers: {'userId': null } };
let client = new ApiClient(config.services.messaging);

async function getMailById(mailId) {
    try {
      let response = await client.get('/mails/'+mailId, options);
      return response.data;
    } catch (error) {
      console.error(`Failed to get Mail by Id. Error: ${error}`);
      return null;
    }
}

async function updateMailAttachments(mailId,attchments){
  try {
    let response = await client.put('/mails/'+mailId+'/addAttachments', attchments, options);
    return response.data;
  } catch (error) {
    console.error(`Failed to update mail attachments by Id. Error: ${error}`);
    return null;
  }
}

async function searchMail(filter, query){
  try {
    const queryParams = new URLSearchParams(query).toString();
    let response = await client.post(`/mails/search?${queryParams}`, filter);
    return response.data;
  } catch (error) {
    console.error(`Failed to search mail. Error: ${error}`);
    return null;
  }
}

async function createUser(user){
  try {
    let response = await client.post(`/users/`, user);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to create user in messaging service. Error: ${error}`);
    return null;
  }
}

async function updateUser(userId, body){
  try {
    let response = await client.put(`/users/${userId}`, body);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update user in messaging service. Error: ${error}`);
    return null;
  }
}

async function createConversation(conversation) {
  try {
    let response = await client.post(`/sys/conversations`, conversation, options);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to create conversation in messaging service. Error: ${error}`);
    return null;
  }
}

async function sendMail(messengerId, userId,emailBody){
  try {
    let response;
    if(emailBody.from.email !== config.email.from){
      let options = { headers: {'userId': userId } };
      response = await client.post('/users/'+messengerId+'/mails',emailBody, options);
    }else {
      response = await client.post('/sys/mails',emailBody, options);
    }
    return response.data;
  } catch (error) {
    console.error(`Failed to create Mail. Error: ${error}`);
    return null;
  }
}

async function getCompany(companyId){
  try {
    let response = await client.get('/company/'+companyId, options);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to get Company. Error: ${error}`);
    return null;
  }
}

async function createCompany(company){
  try {
    let response = await client.post('/company/',company, options);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to create Company. Error: ${error}`);
    return null;
  }
}

async function updateCompanyCredit(companyId, credits){
  try {
    let response = await client.put('/sys/company/'+ companyId+'/credit',credits, options);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to Update Company Credit. Error: ${error}`);
    return null;
  }
}

async function addCampaign(campaignData, messengerId){
  try {
    let options = { headers: {'messengerId': messengerId } };
    let response = await client.post('/campaigns',campaignData, options);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to add campaign. Error: ${error}`);
    return null;
  }
}

async function activateCampaign(campaignId, messengerId){
  try {
    let options = { headers: {'messengerId': messengerId } };
    let response = await client.post('/campaigns/'+ campaignId+'/activate',null, options);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to Activate Campaign. Error: ${error}`);
    return null;
  }
}

module.exports = {
  getMailById,
  updateMailAttachments,
  searchMail,
  sendMail,

  createUser,
  updateUser,
  createConversation,
  

  getCompany,
  createCompany,
  updateCompanyCredit,

  addCampaign,
  activateCampaign,
};