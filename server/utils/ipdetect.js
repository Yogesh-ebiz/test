const Reader = require('@maxmind/geoip2-node').Reader;
// Typescript:
// import { Reader } from '@maxmind/geoip2-node';

Reader.open('../../maxmind/GeoLite2-City.mmdb').then(reader => {
  const response = reader.city('171.239.216.125');

  console.log(response.country.isoCode); // 'US'
  console.log(response.city.names.en); // 'Minneapolis'
  console.log(response.postal.code); // '55407'
});
