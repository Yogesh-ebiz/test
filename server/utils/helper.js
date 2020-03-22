const _ = require('lodash');
const fs = require('fs');
const AWS = require('aws-sdk');


const timestamp = () => {
  return !_.includes(['DELETED', 'SUSPENDED', 'INACTIVE'], user.status)
}





module.exports = {
  isUserActive,
  orderAttendees,
  rgbToHex,
  hexToRgb,
  fullColorHex, calculateForeground, validateMeetingType };
