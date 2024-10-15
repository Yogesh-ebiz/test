const { objectId } = require("../validations/custom.validation");
const User = require("../models/user.model");
const Reader = require('@maxmind/geoip2-node').Reader;
// Typescript:
// import { Reader } from '@maxmind/geoip2-node';

Reader.open('../../maxmind/GeoLite2-City.mmdb').then(reader => {
  const response = reader.city('171.239.216.125');

  console.log(response.country.isoCode); // 'US'
  console.log(response.city.names.en); // 'Minneapolis'
  console.log(response.postal.code); // '55407'
});

async function getLocation(ip) {

  if(!ip){
    return;
  }
  // const response = reader.city('171.239.216.125');
  const response = reader.city(ip);
  console.log(response.country.isoCode); // 'US'
  console.log(response.city.names.en); // 'Minneapolis'
  console.log(response.postal.code); // '55407'
  return response;

}

module.exports = {
  getLocation
};
