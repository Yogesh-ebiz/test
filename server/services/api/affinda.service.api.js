const axios = require('axios');
const {AffindaCredential, AffindaAPI} = require("@affinda/affinda");
const Raven = require('raven-js');
const fs = require("fs");

const token = "d1eccf25950d2b1f4713c740a59bd38d94643a17"

/**
 * Create a new client instance
 */
const getClient = (baseUrl = null) => {

  const credential = new AffindaCredential(token);
  const client = new AffindaAPI(credential);

  return client;
};


const createResume = async (filePath = null) => {

  if(!filePath){
    return null;
  }
  const readStream = fs.createReadStream(filePath);
  return await getClient().createResume({file: readStream}).then((result) => {
    // console.log("Returned data:", result);
    // console.dir(result)
    return result;
  }).catch((err) => {
    console.log("An error occurred:");
    console.error(err);
  });

};

const getAllResumes = async (params) => {

  return await getClient({offset: 0, limit: 1}).getAllResumes().then((result) => {
    console.log(result)
    return result;
  }).catch((err) => {
    console.log("An error occurred:");
    console.error(err);
  });

};

const searchResumes = async (filePath = null) => {

  if(!filePath){
    return null;
  }
  const readStream = fs.createReadStream(filePath);
  return await getClient().createResume({file: readStream}).then((result) => {
    // console.log("Returned data:", result);
    // console.dir(result)
    return result;
  }).catch((err) => {
    console.log("An error occurred:");
    console.error(err);
  });

};

/**
 * Base API
 */
module.exports = {
  createResume: createResume,
  getAllResumes: getAllResumes,

};
