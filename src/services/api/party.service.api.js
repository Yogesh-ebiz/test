const ApiClient = require('../apiManager');

let client = new ApiClient('http://accessed.us-west-2.elasticbeanstalk.com/api');

async function findById(partyId) {
  if(partyId==null){
    return;
  }
  let response = await client.get(`/party/${partyId}`);
  return response.data.data;
}


async function addCompany(userId, company) {
  if(company==null){
    return;
  }

  company = {
    companyName: company.groupName,
    officeSiteName: '',
    annualRevenue: null,
    size: null,
    tickerSymbol: '',
    industry: '',
    website: '',
    mission: '',
    yearFounded: null,
    postalAddress: {city: company.city, state: company.state, country: company.country},
    createdBy: userId
  }

  const options = {
    headers: {'userId': userId}
  };

  let response = await client.post(`/company/register`, company, options);
  return response.data.data;

}


module.exports = {

  findById : findById,
  addCompany: addCompany,
  update(id, data) {
    return client.put(`/party/${id}`, data);
  }

}
