const ApiClient = require('../apiManager');
const {findById} = require('./party.service.api');

const options = { headers: {'userId': null } };
let client = new ApiClient('http://accessed-feed-service.us-west-2.elasticbeanstalk.com/api');
// let client = new ApiClient('http://localhost:90/api');


async function createJobFeed(jobId, partyId, text, userId){

  let party = await findById(partyId);

  let data = {};
  data.type = "JOB";
  data.text = text;
  data.policy = {type: party.partyType, destinationId: party.id};
  data.shareRefId = jobId;
  data.shareRefType = "JOB";

  options.headers.userId = userId;
  return client.post(`/feeds`, data, options);
};

async function findUserById(id) {
  let response = await client.get(`/user/${id}`);
  return response.data.data;
};

async function findCompanyById(id) {
  let response = await client.get(`/company/${id}?source=JOB`);
  return response.data.data;
};

async function followCompany(id, userId){

  const options = {
    headers: {'userId': userId}
  };
  return await client.post(`/company/${id}/follow`, {}, options);
};


async function searchCompany(query, ids, userId){

  const options = {
    headers: {'userId': userId}
  };
  let res = await client.post(`/search/all?type=COMPANY&query=${query}`, {ids: ids}, options);
  return res.data.data;
};


async function findSkillsById(ids) {
  let response = await client.get(`/common/skills/search?query=&id=${ids}`);
  return response.data.data;
};

async function findIndustry(query, shortCodes, locale) {
  const options = {
    'Accept-Language': locale
  };
  let response = await client.get(`/common/industry/search?query={query}&shortCodes=${shortCodes}`);
  return response.data.data;
};

async function findJobfunction(query, shortCodes, locale) {
  const options = {
    'Accept-Language': locale
  };
  let response = await client.get(`/common/jobfunction/search?query=${query}&shortCodes=${shortCodes}`);
  return response.data.data;
};

async function syncExperiences(id, experiences){

  const options = {
    headers: {'userId': id}
  };
  return await client.post(`/user/${id}/sync/experiences`, experiences, options);
};


module.exports = {

  findByUserId: findUserById,

  findCompanyById: findCompanyById,

  followCompany: followCompany,
  searchCompany:searchCompany,

  createJobFeed: createJobFeed,

  findSkillsById:findSkillsById,
  findIndustry:findIndustry,
  findJobfunction:findJobfunction,

  syncExperiences:syncExperiences,

  update(userId, data) {
    return client.put(`/user/${userId}`, data);
  }

}
