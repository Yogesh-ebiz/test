const ApiClient = require('../apiManager');
const _ = require('lodash');
const config = require('../../config/config')

const options = { headers: {'userId': null } };
let client = new ApiClient(config.services.auth);

async function getUserSocialAccount(email,socialAccountType){
  try {
    let response = await client.get('/api/user/socials/email/' + email + '/'+socialAccountType, options);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to Get User's Social Account. Error: ${error}`);
    return null;
  }
}

module.exports = {
  getUserSocialAccount,
};