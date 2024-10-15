const ApiClient = require('../apiManager');
const _ = require('lodash');

let client = new ApiClient('http://accessed-feed-service.us-west-2.elasticbeanstalk.com/api');

async function findById(companyId) {

  let response = await client.get(`/company/${companyId}`, null);

  return response.data.data;
};
async function updateCompany(id, userId, form){
  if(!id || !userId || !form){
    return null;
  }

  const options = {
    headers: {'userId': userId}
  };


  let response = await client.put(`/company/${id}`, form, options);
  return response.data.data;
};

async function uploadCompanyAvatar(id, userId, file){
  if(!id || !userId || !file){
    return null;
  }

  const options = {
    headers: {'userId': userId},
    'content-type': 'multipart/form-data'
  };


  let response = await client.post(`/company/${id}/upload/avatar`, file, options);
  return response.data.data;
};

