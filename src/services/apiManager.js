const axios = require('axios');
const Raven = require('raven-js');
// const store  = require('../store/index');

/**
 * Create a new Axios client instance
 * @see https://github.com/mzabriskie/axios#creating-an-instance
 */
const getClient = (baseUrl = null) => {

  const options = {
    baseURL: baseUrl
  };

  // if (store.getters['users/isAuthenticated']) {
  //   options.headers = {
  //     Authorization: `Bearer ${store.getters['users/accessToken']}`,
  //   };
  // }

  const client = axios.create(options);

  // Add a request interceptor
  client.interceptors.request.use(
    requestConfig => requestConfig,
    (requestError) => {
      Raven.captureException(requestError);

      return Promise.reject(requestError);
    },
  );

  // Add a response interceptor
  client.interceptors.response.use(
    response => response,
    (error) => {
      if (error.response) {
        if (error.response.status >= 500) {
          Raven.captureException(error);
        }

        if (error.response.status === 401) {
          // For example, handle 401 Unauthorized errors
          throw new Error('Unauthorized');
        }

        if (error.response.status === 400) {
          // For example, handle 401 Unauthorized errors
          throw new Error(`Bad Request: ${error.response.data.message}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in Node.js
        throw new Error('Network error');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Request setup error');
      }

      error.errors = error.response.data?.errors?error.response.data.errors:error.errors
      error.message = error.response.data?.message?error.response.data.message:error.message;
      return Promise.reject(error);
    },
  );

  return client;
};

class ApiClient {
  constructor(baseUrl = null) {
    this.client = getClient(baseUrl);
  }

  get(url, conf = {}) {
    return this.client.get(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }

  delete(url, conf = {}) {
    return this.client.delete(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }

  head(url, conf = {}) {
    return this.client.head(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }

  options(url, conf = {}) {
    return this.client.options(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }

  post(url, data = {}, conf = {}) {
    return this.client.post(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }

  put(url, data = {}, conf = {}) {
    return this.client.put(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }

  patch(url, data = {}, conf = {}) {
    return this.client.patch(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }
}

module.exports = ApiClient;



/**
 * Base HTTP Client
 */
module.expots = {
  // Provide request methods with the default base_url
  get(url, conf = {}) {
    return getClient().get(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  delete(url, conf = {}) {
    return getClient().delete(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  head(url, conf = {}) {
    return getClient().head(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  options(url, conf = {}) {
    return getClient().options(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  post(url, data = {}, conf = {}) {
    return getClient().post(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  put(url, data = {}, conf = {}) {
    return getClient().put(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  patch(url, data = {}, conf = {}) {
    return getClient().patch(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }
};
