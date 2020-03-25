const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
//const pagination = require('../const/pagination');
const Application = require('../models/application.model');
const Bookmark = require('../models/bookmark.model');
const JobAlert = require('../models/job_alert.model');
const PartySKill = require('../models/partyskill.model');
const Skilltype = require('../models/skilltype.model');
const JobView = require('../models/jobview.model');





const partyEnum = require('../const/partyEnum');
const statusEnum = require('../const/statusEnum');
const alertEnum = require('../const/alertEnum');


const {upload} = require('../services/aws.service');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {findJobIds} = require('../services/jobrequisition.service');
const {findBookByUserId} = require('../services/bookmark.service');
const {getListofSkillTypes} = require('../services/skilltype.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getIndustry} = require('../services/industry.service');
const {addAlertByUserId, findJobAlertById, removeAlertById, getAlertCount} = require('../services/jobalert.service');

const {findJobViewByUserId} = require('../services/jobview.service');


const {findPartySkillByUserIdAndSkillTypeId, findPartySkillsById, findPartySkillsByUserId, addUserPartySkill, removePartySkillById} = require('../services/partyskill.service');


let Pagination = require('../utils/pagination');
let SearchParam = require('../const/searchParam');

let ApplicationSearchParam = require('../const/applicationSearchParam');
let BookmarkSearchParam = require('../const/bookmarkSearchParam');

const {findApplicationByUserId} = require('../services/application.service');



const partySkillSchema = Joi.object({
  partyId: Joi.number(),
  skillTypeId: Joi.number(),
  noOfMonths: Joi.number()
});



const jobAlertSchema = Joi.object({
  jobId: Joi.number().optional(),
  partyId: Joi.number().optional(),
  title: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  level: Joi.string().optional(),
  industry: Joi.string().optional(),
  employmentType: Joi.string().optional(),
  distance: Joi.array().optional(),
  company: Joi.array().optional(),
  companySize: Joi.number().optional(),
  repeat: Joi.string().allow('').optional(),
  notification: Joi.array().optional(),
  status: Joi.string().optional(),
  remote: Joi.boolean().optional(),
  lt: Joi.number().optional(),
  gt: Joi.number().optional()
});


module.exports = {
  uploadCV,
  addPartySkill,
  removePartySkill,
  getPartySkillsByUserId,
  getApplicationsByUserId,
  getBookmarksByUserId,
  getAlertsByUserId,
  addPartyAlert,
  removePartyAlert,
  updatePartyAlert,
  getJobViewsByUserId
}



/**
 * Upload User CV
 *
 * @param {HTTP} currentUserId
 * @param {HTTP} files
 */
async function uploadCV(currentUserId, files) {

  if(currentUserId==null || files==null){
    return null;
  }

  let application = null;
  try {
    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;


    if (isPartyActive(currentParty)) {

      let file = files.file;
      let fileExt = file.originalFilename.split('.');
      let timestamp = Date.now();
      let name = currentParty.firstName  + currentParty.lastName + '_' + currentParty.id + '_' + timestamp + '.' + fileExt[fileExt.length - 1];

      let path = 'user/' + currentParty.id + '/resumes/' + name;
      let res = await upload(path, file);
      console.log('upload done')

      //await application.save();



    }

  } catch (error) {
    console.log(error);
  }

  return application;

}




async function getPartySkillsByUserId(currentUserId, filter, locale) {

  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;


    if(isPartyActive(currentParty)) {
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

      result = await PartySKill.paginate(new SearchParam(filter), options);
      let skills = _.uniq(_.flatten(_.map(result.docs, 'skillTypeId')));
      // let listOfSkills = await Skilltype.find({ skillTypeId: { $in: skills } });
      let listOfSkills = await getListofSkillTypes(skills, locale);

      result.docs = _.reduce(result.docs, function(res, skill) {

        var found = _.find(listOfSkills, {skillTypeId: skill.skillTypeId})
        skill.name = found.name;

        delete skill.id;
        res.push(skill);
        return res;
      }, []);
    }

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}

async function addPartySkill(currentUserId, partySkill) {
  partySkill = await Joi.validate(partySkill, partySkillSchema, { abortEarly: false });

  if(currentUserId==null || partySkill==null){
    return null;
  }


  let result;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    if (isPartyActive(currentParty)) {
      found = await findPartySkillByUserIdAndSkillTypeId(currentParty.id, partySkill.skillTypeId);

      if(!found){
        result = await addUserPartySkill(partySkill);
      } else {
        let lastUpdatedDate = Date.now();
        found.noOfMonths = partySkill.noOfMonths;
        found.lastUpdatedDate = Date.now();
        result = await found.save();
      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}


async function removePartySkill(currentUserId, partySkillId) {

  if(currentUserId==null || partySkillId==null){
    return null;
  }


  let result;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    if (isPartyActive(currentParty)) {
      found = await findPartySkillsById(partySkillId);

      if(found){
        let deleted = await removePartySkillById(partySkillId);

        if(deleted && deleted.deletedCount==1){
          found.status = statusEnum.DELETED;
          result = found;
        }


      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}


async function getApplicationsByUserId(currentUserId, filter, locale) {

  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {

      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;


      if(isPartyActive(currentParty)) {
        // console.debug('isActive', currentParty)
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


        let jobs = await findJobIds(jobIds);

        let companyIds = _.map(jobs, 'company');

        let employmentTypes = await getEmploymentTypes(_.uniq(_.map(jobs, 'employmentType')), locale);
        let experienceLevels = await getExperienceLevels(_.uniq(_.map(jobs, 'level')), locale);

        let industries = await getIndustry(_.uniq(_.flatten(_.map(jobs, 'industry'))), locale);



        let res = await searchParties(companyIds, partyEnum.COMPANY);
        let foundCompanies = res.data.data.content;


        let hasSaves = await findBookByUserId(currentParty.id);


        _.forEach(result.docs, function(application){

          let job = _.find(jobs, {jobId: application.jobId});
          job.description = null;
          job.responsibilities=[];
          job.qualifications = [];
          job.skills = [];
          job.connection = {noConnection: 0, list: []};
          job.company = _.find(foundCompanies, {id: job.company});
          job.hasApplied = true;
          job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
          job.promotion = {
            "id": 1,
            "type": "HOT",
            "createdDate": 1578887589,
            "hasExpired": true
          };

          job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
          job.level = _.find(experienceLevels, {shortCode: job.level});

          let industry = _.reduce(industries, function(res, item){
            if(_.includes(job.industry, item.shortCode)){
              res.push(item);
            }
            return res;
          }, []);

          job.industry = industry;


          application.job = job;


        });

        // result.docs = jobs;

      }

  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}

async function getBookmarksByUserId(currentUserId, filter, locale) {

  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;


    if(isPartyActive(currentParty)) {

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


      let jobs = await findJobIds(jobIds);
      let companyIds = _.map(jobs, 'company');
      let res = await searchParties(companyIds, partyEnum.COMPANY);
      let foundCompanies = res.data.data.content;

      let employmentTypes = await getEmploymentTypes(_.uniq(_.map(jobs, 'employmentType')), locale);
      let experienceLevels = await getExperienceLevels(_.uniq(_.map(jobs, 'level')), locale);
      let industries = await getIndustry(_.uniq(_.flatten(_.map(jobs, 'industry'))), locale);

      _.forEach(jobs, function(job){
        job.hasSaved=true;
        job.description = null;
        job.responsibilities=[];
        job.qualifications = [];
        job.skills = [];
        job.connection = {noConnection: 0, list: []};
        job.company = _.find(foundCompanies, {id: job.company});
        job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
        job.level = _.find(experienceLevels, {shortCode: job.level});
        job.promotion = {
          "id": 1,
          "type": "HOT",
          "createdDate": 1578887589,
          "hasExpired": true
        };

        let industry = _.reduce(industries, function(res, item){
          if(_.includes(job.industry, item.shortCode)){
            res.push(item);
          }
          return res;
        }, []);

        job.industry = industry;


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

      let companyIds = _.map(result.docs, 'company');
      let res = await searchParties(companyIds, partyEnum.COMPANY);
      let foundCompanies = res.data.data.content;

      // _.forEach(result.docs, function(alert) {
      //   alert.company = _.find(foundCompanies, {id: alert.company});
      //
      //   alert.noJobs = await getAlertCount(filter);
      // })

      const loadPromises = result.docs.map(alert => getAlertCount(alert));
      let count = await Promise.all(loadPromises);

      _.forEach(result.docs, function(alert, idx) {
        alert.company = _.find(foundCompanies, {id: alert.company});

        alert.noJobs = count[idx];
      })

    }


  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}


async function addPartyAlert(currentUserId, alert) {
  alert = await Joi.validate(alert, jobAlertSchema, { abortEarly: false });

  if(currentUserId==null || alert==null){
    return null;
  }


  let result;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;
    // console.log('currentParty', currentParty)

    //Security Check if user is part of meeting attendees that is ACTIVE.
    if (isPartyActive(currentParty)) {

      // result = await findAlertByUserIdAndJobId(currentParty.id, jobId);

      // if(!result) {
        alert.partyId = currentParty.id;

        console.log('alert', alert);
        result = await addAlertByUserId(currentParty.id, alert);
      // }

    }


  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function removePartyAlert(currentUserId, alertId) {

  if(currentUserId==null || alertId==null){
    return null;
  }


  let result;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    if (isPartyActive(currentParty)) {
      found = await findJobAlertById(alertId);

      if(found){
        let deleted = await removeAlertById(alertId);

        if(deleted && deleted.deletedCount==1){
          found.status = statusEnum.DELETED;
          result = found;
        }


      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}

async function updatePartyAlert(currentUserId, alertId, alert) {

  if(currentUserId==null || alertId==null || alert==null){
    return null;
  }


  let result;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    if (isPartyActive(currentParty)) {
      found = await findJobAlertById(alertId);

      if(found){
        found.title = alert.title;
        found.company = alert.company;
        found.companySize = alert.companySize;
        found.distance = alert.distance;
        found.employmentType = alert.employmentType;
        found.city = alert.city;
        found.state = alert.state;
        found.country = alert.country;
        found.repeat = alert.repeat;
        found.industry = alert.industry;
        found.notification = alert.notification;
        found.remote = alert.remote;

        found.status = (alert.status && alert.status==statusEnum.ACTIVE)?statusEnum.ACTIVE : statusEnum.INACTIVE;

        result = await found.save();

      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}




async function getJobViewsByUserId(currentUserId, filter, locale) {

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

      result = await JobView.paginate(new SearchParam(filter), options);

      let jobIds = _.map(result.docs, 'jobId');


      let jobs = await findJobIds(jobIds);
      let companyIds = _.map(jobs, 'company');
      let res = await searchParties(companyIds, partyEnum.COMPANY);
      let foundCompanies = res.data.data.content;

      let employmentTypes = await getEmploymentTypes(_.uniq(_.map(jobs, 'employmentType')), locale);
      let experienceLevels = await getExperienceLevels(_.uniq(_.map(jobs, 'level')), locale);

      _.forEach(jobs, function(job){
        job.hasSaved=true;
        job.description = null;
        job.responsibilities=[];
        job.qualifications = [];
        job.skills = [];
        job.connection = {noConnection: 0, list: []};
        job.company = _.find(foundCompanies, {id: job.company});
        job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
        job.level = _.find(experienceLevels, {shortCode: job.level});

      })

      result.docs = jobs;

    }


  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}

