const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const partyTypeEnum = require('../const/partyEnum');
const axiosInstance = require('../services/api.service');
let User = require('../models/user.model');
let Company = require('../models/company.model');

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

async function getPersonById(partyId) {
  if(partyId==null){
    return;
  }
  let result = null;

  result = await axiosInstance.request('/api/person/' + partyId + "?source=job");
  if(result){
    result = new User(result.data.data);
  }

  return result;
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
  if(company==null){
    return;
  }

  company = {
    companyName: company.groupName,
    officeSiteName: '',
    annualRevenue: null,
    groupSize: null,
    tickerSymbol: '',
    industry: '',
    website: '',
    mission: '',
    yearFounded: null,
    city: company.city, state: company.state, country: company.country}

  return axios.post('http://accessed.us-west-2.elasticbeanstalk.com/api/company/register', company, {headers: {"UserId":userId}});

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

  let ids = _.uniq(_.map(list, 'partyId'));
  let result = await searchParties(ids, partyTypeEnum.PERSON, list.length, 0);
  result = result.data.data.content;
  for (let i = 0; i < list.length; i++) {
    let party = _.find(result, {id: list[i].partyId});
    if(party){
      party = new User(party);
      delete party._id;
    }
    list[i].party = party;
  }
  return list;
}

async function populateCompany(list) {
  let data = [];

  if(list==null){
    return;
  }

  for (let i = 0; i < list.length; i++) {
    let id = list[i].company;
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
