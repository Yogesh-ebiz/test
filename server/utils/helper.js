const _ = require('lodash');
const fs = require('fs');
const AWS = require('aws-sdk');


const timestamp = () => {
  return !_.includes(['DELETED', 'SUSPENDED', 'INACTIVE'], user.status)
}

const capitalizeLocale = ([ first, ...rest ], locale = navigator.language) => {
  return [ first.toLocaleUpperCase(locale), ...rest ].join('');
}



module.exports = {
  capitalizeLocale
};
