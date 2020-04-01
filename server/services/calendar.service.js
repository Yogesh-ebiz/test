const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const axiosInstance = require('../services/api.service');

const axios = require('axios');
const instance = axios.create();


function createEvent(event) {
  if(event==null){
    return;
  }

  // return axiosInstance.request('http://localhost:8082/calendar/1/events' + "?source=job", event, {method: 'post', headers: {"UserId":event.organizer}});


  const options = {
    headers: { 'UserId': event.organizer},
    data: event
  };

  return axios.post('http://accessed-calendar-service.us-west-2.elasticbeanstalk.com/api/calendars/1/events', event, {headers: {"UserId":event.organizer}})
}

module.exports = {
  createEvent: createEvent
}
