const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const axiosInstance = require('../services/api.service');


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

function searchParties(listOfParties, type) {
  if(listOfParties==null){
    return;
  }

  let listOfIds = listOfParties.toString();
  return axiosInstance.request('/api/search/all?type=' + type + '&id=' + listOfIds + "&source=job");
}


function getPartySkills(partyId) {
  if(partyId==null){
    return;
  }

  return axiosInstance.request('/api/person/' + partyId + "/skills?source=job");
}



module.exports = {
  getPartyById: getPartyById,
  getPersonById: getPersonById,
  getCompanyById: getCompanyById,
  isPartyActive: isPartyActive,
  searchParties:searchParties,
  getPartySkills: getPartySkills
}
