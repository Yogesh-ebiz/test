const axios = require('axios');
const TIMEOUT = 4000;

// Init Axios
const axiosInstance = axios.create({
  // baseURL: "http://localhost:8080"
  baseURL: "http://accessed.us-west-2.elasticbeanstalk.com"
})

const isHandlerEnabled = (config={}) => {
  return config.hasOwnProperty('handlerEnabled') && !config.handlerEnabled ?
    false : true
}

const requestHandler = (request) => {
  if (isHandlerEnabled(request)) {
    request.headers['accessed-token'] = 'GET TOKEN'
  }

  console.log('url', request.url);
  // request.url = request.url + (request.url.includes('?')? '':'?');

  return request
}

const errorHandler = (error) => {
  if (isHandlerEnabled(error.config)) {
    // VanillaToasts.create({
    //   title: `Request failed: ${error.response.status}`,
    //   text: `Unfortunately error happened during request: ${error.config.url}`,
    //   type: 'warning',
    //   timeout: TIMEOUT
    // })
  }
  return Promise.reject({ ...error })
}

const successHandler = (response) => {
  if (isHandlerEnabled(response.config)) {
    // VanillaToasts.create({
    //   title: 'Request succeeded!',
    //   text: `Request done successfully: ${response.config.url}`,
    //   type: 'success',
    //   timeout: TIMEOUT
    // })
  }
  return response
}



// Add interceptors
axiosInstance.interceptors.request.use(
  request => requestHandler(request),
  response => successHandler(response),
  error => errorHandler(error)
)


module.exports = axiosInstance;
