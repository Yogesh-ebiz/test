const fs = require('fs');
var path = require('path');
var async = require("async");
var Promise = require('promise');
const ApiClient = require('../apiManager');


const defaultIndex = 'accessed-resume';
const options = {
  headers: {
    'Sovren-AccountId': '35186509',
    'Sovren-ServiceKey': '/sNTpg9udpEa2OV/o74nH1tZYma3sDiEYC7Ynt5g',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

let client = new ApiClient('https://rest.resumeparsing.com');

async function createIndex(form) {
  console.log('createIndex', form)
  let data = {
    "IndexType": form.indexType
  };

  let response = await client.post(`/v10/index/${form.name}`, data, options).catch(function (error) {
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

async function deleteIndex(index) {
  console.log('deleteIndex', index)


  let response = await client.delete(`/v10/index/${index}`, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);
      return error.response;
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

async function getResume(index, documentId) {
  console.log('getResume', index, documentId)

  let response = await client.get(`/v10/index/${index}/resume/${documentId}`, options).catch(function (error) {
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

async function uploadResume(filePath, index, documentId) {
  var buffer = fs.readFileSync(filePath);
  var base64Doc = buffer.toString('base64');

  var modifiedDate = (new Date(fs.statSync(filePath).mtimeMs)).toISOString().substring(0, 10);

  var data = JSON.stringify({
    'DocumentAsBase64String': base64Doc,
    'DocumentLastModified': modifiedDate,
    'OutputCandidateImage':true,
    'IndexingOptions': {
      'IndexId': index,
      'DocumentId': documentId
    }
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

async function addResume(form, index, documentId) {

  console.log(form)
  let response = await client.post(`/v10/index/${index}/resume/${documentId}`, form, options).catch(function (error) {
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

async function uploadJob(filePath, index, documentId) {
  var buffer = fs.readFileSync(filePath);
  var base64Doc = buffer.toString('base64');

  var modifiedDate = (new Date(fs.statSync(filePath).mtimeMs)).toISOString().substring(0, 10);

  var data = JSON.stringify({
    'DocumentAsBase64String': base64Doc,
    'DocumentLastModified': modifiedDate,
    'IndexingOptions': {
      'IndexId': index,
      'DocumentId': documentId
    }
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

async function matchResume(data) {


  let response = await client.post(`/v10/matcher/resume`, data, options).catch(function (error) {
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


async function matchResumeByDocument(index, documentId, data) {


  let response = await client.post(`/v10/matcher/indexes/${index}/documents/${documentId}`, data, options).catch(function (error) {
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
  createIndex:createIndex,
  deleteIndex:deleteIndex,
  getResume:getResume,
  uploadResume:uploadResume,
  addResume:addResume,
  uploadJob:uploadJob,
  matchResume:matchResume,
  matchResumeByDocument:matchResumeByDocument,
  addSkills:addSkills,
  listAllSkills:listAllSkills
}
