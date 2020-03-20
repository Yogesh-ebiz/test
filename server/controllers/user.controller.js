const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
//const pagination = require('../const/pagination');
const Application = require('../models/application.model');
const Bookmark = require('../models/bookmark.model');
const JobAlert = require('../models/job_alert.model');



const partyEnum = require('../const/partyEnum');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {findJobIds} = require('../services/jobrequisition.service');


let Pagination = require('../utils/pagination');
let SearchParam = require('../const/searchParam');

let ApplicationSearchParam = require('../const/applicationSearchParam');
let BookmarkSearchParam = require('../const/bookmarkSearchParam');

const {findApplicationByUserId} = require('../services/application.service');



module.exports = {
  getApplicationsByUserId,
  getBookmarksByUserId,
  getAlertsByUserId
}





async function getApplicationsByUserId(currentUserId, filter) {

  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {

      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;


      if(isPartyActive(currentParty)) {
        console.debug('isActive', currentParty)
        let select = '';
        let limit = (filter.size && filter.size > 0) ? filter.size : 20;
        let page = (filter.page && filter.page == 0) ? filter.page : 1;
        let sortBy = {};
        sortBy[filter.sortBy] = (filter.direction && filter.direction == "DESC") ? -1 : 1;

        let options = {
          select: select,
          sort: sortBy,
          lean: true,
          limit: limit,
          page: parseInt(filter.page) + 1
        };

        filter.partyId=currentParty.id;

        result = await Application.paginate(new ApplicationSearchParam(filter), options);
        let jobIds = _.map(result.docs, 'jobId');

        console.log(jobIds)

        let jobs = await findJobIds(jobIds);
        console.log(jobs)

        let companyIds = _.map(jobs, 'company');
        console.log(companyIds)

        let res = await searchParties(companyIds, partyEnum.COMPANY);
        let foundCompanies = res.data.data.content;
        console.log(foundCompanies)


        _.forEach(jobs, function(job){
          job.description = null;
          job.responsibilities=[];
          job.qualifications = [];
          job.skills = [];
          job.connection = [];
          job.company = _.find(foundCompanies, {id: job.company});

        })

        result.docs = jobs;

      }

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}

async function getBookmarksByUserId(currentUserId, filter) {

  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;


    if(isPartyActive(currentParty)) {
      console.debug('isActive', currentParty.id)
      let select = '';
      let limit = (filter.size && filter.size > 0) ? filter.size : 20;
      let page = (filter.page && filter.page == 0) ? filter.page : 1;
      let sortBy = {};
      sortBy[filter.sortBy] = (filter.direction && filter.direction == "DESC") ? -1 : 1;

      let options = {
        select: select,
        sort: sortBy,
        lean: true,
        limit: limit,
        page: parseInt(filter.page) + 1
      };

      filter.partyId=currentParty.id;

      result = await Bookmark.paginate(new BookmarkSearchParam(filter), options);
      let jobIds = _.map(result.docs, 'jobId');

      console.log(jobIds)

      let jobs = await findJobIds(jobIds);
      console.log(jobs)

      let companyIds = _.map(jobs, 'company');
      console.log(companyIds)

      let res = await searchParties(companyIds, partyEnum.COMPANY);
      let foundCompanies = res.data.data.content;
      console.log(foundCompanies)


      _.forEach(jobs, function(job){
        job.description = null;
        job.responsibilities=[];
        job.qualifications = [];
        job.skills = [];
        job.connection = [];
        job.company = _.find(foundCompanies, {id: job.company});

      })

      result.docs = jobs;

    }

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}




async function getAlertsByUserId(currentUserId, filter) {

  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;


    if(isPartyActive(currentParty)) {
      console.debug('isActive', currentParty.id)
      let select = '';
      let limit = (filter.size && filter.size > 0) ? filter.size : 20;
      let page = (filter.page && filter.page == 0) ? filter.page : 1;
      let sortBy = {};
      sortBy[filter.sortBy] = (filter.direction && filter.direction == "DESC") ? -1 : 1;

      let options = {
        select: select,
        sort: sortBy,
        lean: true,
        limit: limit,
        page: parseInt(filter.page) + 1
      };

      filter.partyId=currentParty.id;

      result = await JobAlert.paginate(new SearchParam(filter), options);

    }

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}

