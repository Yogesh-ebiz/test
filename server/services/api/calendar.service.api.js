const _ = require('lodash');
const ApiClient = require('../apiManager');
const confirmEnum = require('../../const/confirmEnum');
const statusEnum = require('../../const/statusEnum');
// const axiosInstance = require('../services/api.service');

// const axios = require('axios');
// const instance = axios.create();
let client = new ApiClient('http://accessed-calendar-service.us-west-2.elasticbeanstalk.com/api');


function createEvent(event) {
  if(!event){
    return;
  }

  // return axiosInstance.request('http://localhost:8082/calendar/1/events' + "?source=job", event, {method: 'post', headers: {"UserId":event.organizer}});


  const options = {
    headers: { 'UserId': event.organizer},
    data: event
  };

  return client.post('/calendars/1/events', event, {headers: {"UserId":event.organizer}})
}



function acceptEvent(userId, eventId) {
  if(!userId || !eventId){
    return;
  }

  return client.post('/calendars/'+userId+ '/events/' + eventId + '/accept', {}, {headers: {"UserId":userId}})
}


function declineEvent(userId, eventId) {
  if(!userId || !eventId){
    return;
  }

  return client.post('/calendars/'+userId+ '/events/' + eventId + '/decline', null, {headers: {"UserId":userId}})
}


function cancelEvent(companyId, userId, eventId) {
  if(!companyId || !userId || !eventId){
    return;
  }

  return client.post(`/company/${companyId}/events/${eventId}/cancel`, null, {headers: {"UserId":userId}})
}


async function getEventByEventId(userId, eventId) {
  if (!userId || !eventId) {
    return;
  }

  const options = {
    headers: {'UserId': userId}
  };


  let response = await client.get('/calendars/'+userId+ '/events/' + eventId, options);
  return response.data.data;
}


async function lookupEvents(listOfIds) {
  if (!listOfIds) {
    return;
  }
  let ids = listOfIds.join(",")
  let response = await client.get(`/calendars/events/lookup?ids=${ids}`, null);
  return response.data.data;
}


module.exports = {
  createEvent: createEvent,
  acceptEvent: acceptEvent,
  declineEvent:declineEvent,
  cancelEvent:cancelEvent,
  cancelEvent:cancelEvent,
  getEventByEventId:getEventByEventId,
  lookupEvents:lookupEvents
}


