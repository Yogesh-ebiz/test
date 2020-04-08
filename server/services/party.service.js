const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');

const partyTypeEnum = require('../const/partyEnum');
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



async function populateParty(list) {
  let data = [];

  if(list==null){
    return;
  }

  for (let i = 0; i < list.length; i++) {
    let id = list[i].company? list[i].company: list[i].institute? list[i].institute:list[i].partyId? list[i].partyId:null;
    if(id){
      let result = await getPartyById(id);
      if(list[i].company){
        list[i].company = result.data;
      } else if(list[i].institute){
        list[i].institute = result.data;
      }

    }
  }

  return list;

}

async function populatePerson(list) {
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

async function populateCompany(list) {
  let data = [];

  if(list==null){
    return;
  }

  for (let i = 0; i < list.length; i++) {
    let id = _.includes([16,17,18,19,20,21,22,23,24,25], list[i].company)?list[i].company: 17;
    let result = await getCompanyById(id);
    list[i].company = result.data.data;
  }

  return list;

}

async function populateInstitute(list) {
  let data = [];

  if(list==null){
    return;
  }

  for (let i = 0; i < list.length; i++) {
    let id = _.includes([27,28], list[i].institute)?list[i].institute: 27;
    let result = await searchParties([id], partyTypeEnum.INSTITUTE, 1,0);
    list[i].institute = result.data.data.content[0];
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
  populatePerson:populatePerson,
  populateParty:populateParty,
  populateCompany:populateCompany,
  populateInstitute:populateInstitute
}
