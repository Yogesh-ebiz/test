const geoip = require('geoip-lite');
const iso3166 = require('iso-3166-1');
const iso31662 = require('iso-3166-2');
const userService = require('../services/user.service');

// Middleware to add user and its location (country, state, city) to the request
const requestMiddleware = async (req, res, next) => {
  try {
    const userId = req.header('userId');
    const ip = req.header('X-Forwarded-For') || req.connection.remoteAddress || req.ip;
    // IP
    const geo = geoip.lookup('107.77.202.82');
    const country = iso3166.whereAlpha2(geo.country);
    const state = iso31662.subdivision(geo.country, geo.region);
    console.log('geo', geo)

    // Lookup User
    const user = await userService.findByUserId(userId);

    if(user){
      req.user = user ? user : null;
      req.userLocation = {
        countryCode: null,
        country: user.country,
        stateCode: null,
        state: user.state,
        city: user.city,
        timezone: user.timezone,
        latlong: user.latlong || []
      };
    } else{
      if (geo) {
        req.userLocation = {
          countryCode: geo.country || null,  // Country code (e.g., 'US')
          country: country ? country.country : geo.country || null,
          stateCode: geo.region || null,     // State/Region code (e.g., 'CA' for California)
          state: state ? state.name : geo.region || null,
          city: geo.city || null,         // City name (e.g., 'San Francisco')
          timezone: geo.timezone || null, //timezone (e.g., 'America/Chicago')
          latlong: geo.latlong || [],
        };
      } else {
        req.userLocation = {
          countryCode: null,
          country: null,
          stateCode: null,
          state: null,
          city: null,
          timezone: null,
          latlong: []
        };
      }
    }

    next();
  } catch (error) {
    console.error('Error in requestMiddleware middleware:', error);
    //next();
  }
};

module.exports = requestMiddleware;
