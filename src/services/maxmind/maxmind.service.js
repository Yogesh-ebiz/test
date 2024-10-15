// const Reader = require('@maxmind/geoip2-node').Reader;
import maxmind, { CityResponse } from 'maxmind';
// Typescript:
// import { Reader } from '@maxmind/geoip2-node';

// Reader.open('../../maxmind/GeoLite2-City.mmdb').then(reader => {
//   const response = reader.city('171.239.216.125');
//
//   console.log(response.country.isoCode); // 'US'
//   console.log(response.city.names.en); // 'Minneapolis'
//   console.log(response.postal.code); // '55407'
// });

async function getLocation(req) {

  if(!req){
    return;
  }
  const lookup = await maxmind.open('./migrations/maxmind/GeoLite2-City.mmdb');
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
  // const result = lookup.get('27.67.136.59');
  console.log('ip', ip)
  const result = lookup.get(ip);
  const city= result?.city;
  const country = result?.country;
  const location  = result?.location;
  const data = {
    city:  city?.names?.en,
    country: {
      iso: country?.iso_code,
      nam: country?.names?.en
    },
    latitude: location?.longitude,
    longitude: location?.longitude,
    timeZone: location?.time_zone
  };

  // const response = reader.city('171.239.216.125');
  // const response = reader.city(ip);
  // console.log(response.country.isoCode); // 'US'
  // console.log(response.city.names.en); // 'Minneapolis'
  // console.log(response.postal.code); // '55407'


  return data;

}

module.exports = {
  getLocation
};
