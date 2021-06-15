const ApiClient = require('../apiManager');

const options = { headers: {'userId': null } };
// let client = new ApiClient('http://accessed-payment-service.us-west-2.elasticbeanstalk.com/api');
let client = new ApiClient('http://localhost:5000/api');

async function findUserByIdFull(id) {
  let user = null;

  const options = {
    headers: {'userId': id}
  };

  try {
    let response = await client.get(`/user/${id}/update`, options);
    user = response.data.data;
  } catch(error) {
    console.log("findUserByIdFull: error", error);
  }
  return user;
};

async function charge(userId, form) {

  const options = {
    headers: {'userId': userId}
  };
  let response = await client.post(`/payment/charge`, form, options);
  return response.data;
};




module.exports = {
  charge:charge
}
