const ApiClient = require('../apiManager');
const productType = require('../../const/productType');
const { PaymentError } = require('../../middleware/baseError');



const options = { headers: {'userId': null } };
let client = new ApiClient('http://accessed-payment-service.us-west-2.elasticbeanstalk.com/api');
// let client = new ApiClient('http://localhost:5000/api');

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
  let response = await client.post(`/payment/charge`, form, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      let status;
      switch (error.response.status){
        case 400:
          status = 400;
          break;
        case 500:
          status = 500;
          break;
        case 502:
          status = 500;
          break;
      }

      throw new PaymentError(status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data;
};

async function addProduct(userId, form) {

  const options = {
    headers: {'userId': userId}
  };

  if (form.type === productType.ADVERTISEMENT) {
    form = {
      name: form.name,
      description: form.description,
      price: {
        currency: form.price.currency,
        unit_amount: form.price.listPrice * 100
      }
    }
  } else if (form.type === productType.SUBSCRIPTION) {
    form = {
      name: form.name,
      description: form.description,
      price: {
        currency: form.price.currency,
        unit_amount: form.price.listPrice * 100,
        recurring: {
          interval: form.recurring.interval,
          interval_count: form.recurring.intervalCount,
          usage_type: form.recurring.usageType
        }
      }
    }
  }


  let response = await client.post(`/products`, form, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });;


  return response.data;
};


async function getAdroducts() {

  let response = await client.get(`/products/providers?types=JOB`, null, null).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });;


  return response.data;
};

async function getUserCards(userId) {

  let response = await client.get(`/customers/${userId}/card/list`, null, null).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });;


  return response.data;
};


module.exports = {
  charge:charge,
  addProduct:addProduct,
  getAdroducts:getAdroducts,
  getUserCards:getUserCards
}
