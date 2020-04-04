const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const axiosInstance = require('../services/api.service');

const axios = require('axios');
const instance = axios.create();

function isPartyActive(party){{

  if(!party){
    return false;
  }
  let status = _.includes(['ACTIVE', 'NEW'], party.status);

  return status;
}}

function getPartyById(partyId) {
  if(partyId==null){
    return;
  }

  return axiosInstance.request('/api/party/' + partyId + "?source=job");
}

function getPersonById(partyId) {
  if(partyId==null){
    return;
  }

  return axiosInstance.request('/api/person/' + partyId + "?source=job");
}

function getCompanyById(partyId) {
  if(partyId==null){
    return;
  }

  return axiosInstance.request('/api/company/' + partyId + "?source=job");
}

function searchParties(listOfParties, type, size, page) {
  if(listOfParties==null || type==null){
    return;
  }

  size = (size)? size:20;
  page = (page)? page: 0;

  let listOfIds = listOfParties.toString();
  return axiosInstance.request('/api/search/all?type=' + type + '&id=' + listOfIds + "&size=" + size + "&page=" + page + "&source=job");
}


function getPartySkills(partyId) {
  if(partyId==null){
    return;
  }

  return axiosInstance.request('/api/person/' + partyId + "/skills?source=job");
}

function addCompany(userId, company) {
  console.log('add company', company)
  if(company==null){
    return;
  }


  company = {type: 'ORGANIZATION', companyName: company.companyName, officeSiteName: '', annualRevenue: 0, groupSize: 0,
    tickerSymbol: '', industry: '', website: '', mission: '', yearFounded: 2020, city: '', state: '', country: ''}
  return axios.post('http://localhost:8080/api/company/register', company, {headers: {"UserId":userId}})
}

async function populateParties(list) {
  let data = [];

  if(list==null){
    return;
  }

  for (let i = 0; i < list.length; i++) {
    let result = await getPersonById(list[i].partyId);
    list[i].party = result.data.data;
  }

  return list;

}


module.exports = {
  getPartyById: getPartyById,
  getPersonById: getPersonById,
  getCompanyById: getCompanyById,
  isPartyActive: isPartyActive,
  searchParties:searchParties,
  getPartySkills: getPartySkills,
  addCompany: addCompany,
  populateParties:populateParties
}
