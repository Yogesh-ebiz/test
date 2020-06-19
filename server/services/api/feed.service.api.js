const ApiClient = require('../apiManager');
const {findById} = require('./party.service.api');

const options = { headers: {'userId': null } };
let client = new ApiClient('http://accessed-feed-service.us-west-2.elasticbeanstalk.com/api');


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
  let response = await client.get(`/company/${id}`);
  return response.data.data;
};

async function followCompany(id, userId){

  const options = {
    headers: {'userId': userId}
  };
  return await client.post(`/company/${id}/follow`, {}, options);
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

  createJobFeed: createJobFeed,

  syncExperiences:syncExperiences,

  update(userId, data) {
    return client.put(`/user/${userId}`, data);
  }

}
