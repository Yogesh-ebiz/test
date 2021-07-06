const _ = require('lodash');
const ApiClient = require('../apiManager');
const confirmEnum = require('../../const/confirmEnum');
const statusEnum = require('../../const/statusEnum');
// const axiosInstance = require('../services/api.service');

// const axios = require('axios');
// const instance = axios.create();
let client = new ApiClient('http://accessed-calendar-service.us-west-2.elasticbeanstalk.com/api');


function createEvent(event) {
  if(event==null){
    return;
  }

  // return axiosInstance.request('http://localhost:8082/calendar/1/events' + "?source=job", event, {method: 'post', headers: {"UserId":event.organizer}});


  const options = {
    headers: { 'UserId': event.organizer},
    data: event
  };

  return axios.post('/calendars/1/events', event, {headers: {"UserId":event.organizer}})
}



function acceptEvent(userId, eventId) {
  if(userId==null || eventId==null){
    return;
  }

  return axios.post('/calendars/'+userId+ '/events/' + eventId + '/accept', {}, {headers: {"UserId":userId}})
}


function declineEvent(userId, eventId) {
  if(userId==null || eventId==null){
    return;
  }

  return axios.post('/calendars/'+userId+ '/events/' + eventId + '/decline', null, {headers: {"UserId":userId}})
}


module.exports = {
  createEvent: createEvent,
  acceptEvent: acceptEvent,
  declineEvent:declineEvent
}


