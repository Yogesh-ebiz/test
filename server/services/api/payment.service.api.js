const ApiClient = require('../apiManager');
const productType = require('../../const/productType');
const { PaymentError } = require('../../middleware/baseError');



const options = { headers: {'userId': null } };
let client = new ApiClient('http://accessed-ps.us-west-2.elasticbeanstalk.com/api');
// let client = new ApiClient('http://localhost:5001/api');


async function addCustomer(form) {


  let response = await client.post(`/customers/`, form, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data.data;
};


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
      console.log(error)
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

  });


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


  return response.data.data;
};


async function addPaymentMethod(customerId, form) {


  let response = await client.post(`/customers/${customerId}/paymentmethod`, form, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data.data;
};


async function getPaymentMethod(customerId) {

  let response = await client.get(`/customers/${customerId}/payment/method`, null, null).catch(function (error) {
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


  return response.data.data;
};

async function getDefaultCard(customerId) {

  let response = await client.get(`/customers/${customerId}/card/default`, null, null).catch(function (error) {
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

  });


  return response.data.data;
};


async function removeDefaultCard(customerId, cardId) {

  let response = await client.post(`/customers/${customerId}/card/${cardId}/remove`, null, null).catch(function (error) {
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

  });


  return response.data.data;
};



async function getCards(customerId) {

  let response = await client.get(`/customers/${customerId}/card/list`, null, null).catch(function (error) {
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


async function lookupProducts(ids) {

  let response = await client.get(`/products/lookup?ids=${ids}`, null, null).catch(function (error) {
    if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data.data;
};


async function addSubscription(form) {

  let response = await client.post(`/subscriptions`, form, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data.data;
};

async function getSubscriptionById(id) {

  let response = await client.get(`/subscriptions/${id}`, null).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data.data;
};

async function updateSubscription(id, form) {

  let response = await client.put(`/subscriptions/${id}`, form, null).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data.data;
};


async function cancelSubscription(id, form) {


  let response = await client.post(`/subscriptions/${id}/cancel`, form, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data.data;
};


async function activateSubscription(id) {


  let response = await client.post(`/subscriptions/${id}/activate`, null, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data.data;
};


async function deleteSubscription(id) {

  let response = await client.delete(`/subscriptions/${id}`, null, null).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      throw new PaymentError(error.response.data.status, error.response.data.message);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data.data;
};


async function lookupSubscriptions(filter) {

  let response = await client.post(`/subscriptions/lookup`, filter, null).catch(function (error) {
    if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data.data;
};


async function getPlans() {

  let response = await client.get(`/plans/list?category=TALENT&type=MEMBERSHIP`, null, null).catch(function (error) {
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


  return response.data.data;
};



module.exports = {
  addCustomer:addCustomer,
  charge:charge,
  addProduct:addProduct,
  getAdroducts:getAdroducts,
  addPaymentMethod:addPaymentMethod,
  getPaymentMethod:getPaymentMethod,
  getDefaultCard:getDefaultCard,
  removeDefaultCard:removeDefaultCard,
  getCards:getCards,
  lookupProducts:lookupProducts,
  addSubscription:addSubscription,
  getSubscriptionById:getSubscriptionById,
  updateSubscription:updateSubscription,
  cancelSubscription:cancelSubscription,
  activateSubscription:activateSubscription,
  deleteSubscription:deleteSubscription,
  getPlans:getPlans,
  lookupSubscriptions:lookupSubscriptions
}
