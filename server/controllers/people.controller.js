const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let Pagination = require('../utils/pagination');

let JobSearchParam = require('../const/jobSearchParam');
let SearchParam = require('../const/searchParam');

let statusEnum = require('../const/statusEnum');
const {convertToCandidate} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');

module.exports = {
  searchPeople,
  getPeopleSuggestions,
  getPeopleById
}

async function searchPeople(filter, sort, locale) {

  if(!filter || !sort){
    return null;
  }

  result = await feedService.searchPeople(filter, sort);
  result.content = _.reduce(result.content, function(res, people){
    res.push(convertToCandidate(people));
    return res;
  }, []);

  return result;
}


async function getPeopleSuggestions(filter, sort, locale) {

  if(!filter || !sort){
    return null;
  }

  result = await feedService.searchPeople(filter, sort);

  return result;
}


async function getPeopleById(peopleId, locale) {

  if(!peopleId){
    return null;
  }
  let result = await feedService.findCandidateById(peopleId);
  return result;

}

