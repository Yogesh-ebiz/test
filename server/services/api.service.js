const axios = require('axios');
const TIMEOUT = 4000;

const newsApiKey = '74c53fdc23674475ba60cdcfd516bb08';
const gNewsApiKey = '1537ff482ed6dbb59c76810a8b03ad6a'
const newsURL = 'https://newsapi.org/v2/';
const gNewsURL= 'https://gnews.io/api/v3/';

// Init Axios
const axiosInstance = axios.create({
  baseURL: newsURL
})

const isHandlerEnabled = (config={}) => {
  return config.hasOwnProperty('handlerEnabled') && !config.handlerEnabled ?
    false : true
}

const requestHandler = (request) => {
  if (isHandlerEnabled(request)) {
    request.headers['X-CodePen'] = 'https://codepen.io/teroauralinna/full/vPvKWe'
    // VanillaToasts.create({
    //   title: 'Sending request',
    //   text: `Sending request to: ${request.url}`,
    //   type: 'info',
    //   timeout: TIMEOUT
    // })
  }
  // request.url = request.url + '&apiKey=' + newsApiKey;

  request.url = request.url + (request.url.includes('?')? '':'?') + '&apiKey=' + newsApiKey;
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
