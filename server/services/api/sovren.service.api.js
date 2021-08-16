const fs = require('fs');

const ApiClient = require('../apiManager');
const productType = require('../../const/productType');
const { PaymentError } = require('../../middleware/baseError');



const options = {
  headers: {
    'Sovren-AccountId': '35186509',
    'Sovren-ServiceKey': '/sNTpg9udpEa2OV/o74nH1tZYma3sDiEYC7Ynt5g',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

let client = new ApiClient('https://rest.resumeparsing.com');


async function uploadResume(filePath) {

  console.log(filePath)
  var buffer = fs.readFileSync(filePath);
  var base64Doc = buffer.toString('base64');

  var modifiedDate = (new Date(fs.statSync(filePath).mtimeMs)).toISOString().substring(0, 10);


  var data = JSON.stringify({
    'DocumentAsBase64String': base64Doc,
    'DocumentLastModified': modifiedDate,
    'OutputCandidateImage':true
  });


  options.headers['Content-Length'] =  Buffer.byteLength(data);

  let response = await client.post(`/v10/parser/resume`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

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

async function uploadJob(filePath) {
  console.log(filePath)
  var buffer = fs.readFileSync(filePath);
  var base64Doc = buffer.toString('base64');

  var modifiedDate = (new Date(fs.statSync(filePath).mtimeMs)).toISOString().substring(0, 10);


  var data = JSON.stringify({
    'DocumentAsBase64String': base64Doc,
    'DocumentLastModified': modifiedDate,
    'OutputCandidateImage':true
  });


  options.headers['Content-Length'] =  Buffer.byteLength(data);

  let response = await client.post(`/v10/parser/joborder`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

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


async function addSkills(data) {

  let response = await client.post(`/v10/skills`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

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

async function listAllSkills() {

  let response = await client.get(`/v10/skills`, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

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



module.exports = {
  uploadResume:uploadResume,
  uploadJob:uploadJob,
  addSkills:addSkills,
  listAllSkills:listAllSkills
}
