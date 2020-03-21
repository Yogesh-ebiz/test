const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const partyEnum = require('../const/partyEnum');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {getListofSkillTypes} = require('../services/skilltype.service');
const {findApplicationByUserIdAndJobId, findApplicationById, applyJob, findAppliedCountByUserIdAndJobId} = require('../services/application.service');
const {findBookById, addBookById, removeBookById, findBookByUserId} = require('../services/bookmark.service');
const {findAlertByUserIdAndJobId, addAlertById, removeAlertByUserIdAndJobId} = require('../services/jobalert.service');
const filterService = require('../services/filter.service');



//const pagination = require('../const/pagination');
const JobRequisition = require('../models/jobrequisition.model');
const Skilltype = require('../models/skilltype.model');
const JobFunction = require('../models/jobfunctions.model');
const Bookmark = require('../models/bookmark.model');
const PartySkill = require('../models/party_skill.model');
const Application = require('../models/application.model');



let Pagination = require('../utils/job.pagination');
let SearchParam = require('../const/searchParam');

const jobRequisitionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.any(),
  minMonthExperience: Joi.number(),
  maxMonthExperience: Joi.number(),
  lastCurrencyUom: Joi.string(),
  noOfResources: Joi.any(),
  type: Joi.string(),
  jobFunction: Joi.string(),
  expirationDate: Joi.number(),
  requiredOnDate: Joi.number(),
  salaryRangeLow: Joi.number(),
  salaryRangeHigh: Joi.number(),
  salaryFixed: Joi.any(),
  level: Joi.string(),
  responsibilities: Joi.array(),
  qualifications: Joi.array(),
  skills: Joi.array(),
  industry: Joi.string(),
  employmentType: Joi.string(),
  promotion: Joi.object(),
  hasSaved: Joi.boolean(),
  company: Joi.object(),
  connection: Joi.object(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
  isExternal: Joi.boolean(),
  externalUrl: Joi.string(),
  hasApplied: Joi.boolean()
});

const applicationSchema = Joi.object({
  jobId: Joi.number().required(),
  partyId: Joi.number().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().required(),
  availableDate: Joi.number().required(),
  attachment: Joi.string().allow('').optional()
});


const jobAlertSchema = Joi.object({
  jobId: Joi.number().optional(),
  partyId: Joi.number().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  level: Joi.string().optional(),
  employmentType: Joi.string().optional(),
  distance: Joi.number().optional(),
  company: Joi.number().optional()
});



module.exports = {
  importJobs,
  insert,
  getJobById,
  searchJob,
  getLatestJobs,
  getSimilarCompanyJobs,
  applyJobById,
  addBookmark,
  removeBookmark,
  addAlert,
  removeAlert,
  getAllJobLocations
}

async function insert(job) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  if(job) {
    //job.skills = await Skilltype.find({id: {$in: job.skills}});
  }
  return await new JobRequisition(job).save();
}

async function importJobs(type, jobs) {
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });
  // if(job) {
  //   job.skills = await Skilltype.find({id: {$in: job.skills}});
  // }
  return await new JobRequisition(job).save();
}


async function getJobById(currentUserId, jobId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {

      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', response.data)

      response = await getCompanyById(job.company);
      job.company = response.data.data;

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {
        let partySkills = await PartySkill.find({partyId: currentParty.id});
        partySkills = _.map(partySkills, "skillTypeId");
        // console.log('partyskills', partySkills)

        let jobSkills = await getListofSkillTypes(job.skills);
        // console.log('jobSkils', jobSkills)


        let hasSaved = await findBookById(currentParty.id, job.jobId);
        job.hasSaved = (hasSaved)?true:false;

        let hasApplied = await findApplicationByUserIdAndJobId(currentParty.id, job.jobId);
        job.hasApplied = (hasApplied)?true:false;


        let noApplied = await findAppliedCountByUserIdAndJobId(currentParty.id, job.jobId);
        job.noApplied = noApplied;



        //let jobFunction = await JobFunction.findOne({shortCode: job.jobFunction});
        let jobFunction = await JobFunction.aggregate([{$match: {shortCode: job.jobFunction} }, {$project: {name: '$name.'+localeStr, shortCode:1}}]);


        skills = _.reduce(jobSkills, function(res, skill, key){
          let temp = _.clone(skill);

          if(_.includes(partySkills, skill.skillTypeId)){
            temp.hasSkill=true;
          } else {
            temp.hasSkill=false;
          }

          res.push(temp);
          return res;
        }, []);

        job.skills = skills;
        job.jobFunction=jobFunction[0];

      }
    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


async function addToUser(id, locale) {

  try {
    let localeStr = locale? locale : 'en';
    job = await JobRequisition.findOne({jobId: id});
    let skills = await Skilltype.find({skillTypeId: job.skills});
    //let jobFunction = await JobFunction.findOne({shortCode: job.jobFunction});

    //jobFunction.name=jobFunction[name][localeStr];

    job.skills = skills;
    job.jobFunction=jobFunction;

  } catch (error) {
    console.log(error);

  }

  return job;
}


async function searchJob(currentUserId, filter) {

  let foundJob = null;
  let select = '-description -qualifications -responsibilities';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };


  if(filter.id){
    console.log('ID', filter.id)
    foundJob = await JobRequisition.findOne({jobId: filter.id});
    //
    // if(!foundJob){
    //   return new Pagination(null);
    // }



    //filter.query = foundJob.title;
    filter.level = foundJob.level;
    filter.jobFunction=foundJob.jobFunction;
    filter.employmentType=foundJob.employmentType;
    filter.employmentType=null;
  }



  // let select = 'title createdDate';

  // if(filter.id && !result.content.length)


  let result = await JobRequisition.paginate(new SearchParam(filter), options);
  let docs = [];

  let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
  let listOfSkills = await Skilltype.find({ skillTypeId: { $in: skills } });

  let listOfCompanyIds = _.uniq(_.flatten(_.map(result.docs, 'company')));

  let res = await searchParties(listOfCompanyIds, partyEnum.COMPANY);
  let foundCompanies = res.data.data.content;


  let hasSaves = await findBookByUserId(currentUserId);


  _.forEach(result.docs, function(job){

    job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
    job.company = _.find(foundCompanies, {id: job.company});
    var skills = _.reduce(job.skills, function(res, skill){
      let find = _.filter(listOfSkills, { 'skillTypeId': skill});
      if(find){
        res.push(find[0]);
      }
      return res;
    }, [])

    job.skills = skills;
  })


  // if(filter.id && !result.content.length){
  //   filter.employmentType=null;
  //
  //
  //   //Assuring similar Job always have data
  //   result = await JobRequisition.paginate(new SearchParam(filter), options, function(err, result) {
  //     console.log('result', result)
  //     return new PaginationModel(result);
  //   });
  // }


  return new Pagination(result);

}



async function getLatestJobs(req) {

  let filter = req.query
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;


  var options = {
    select:   '-description -qualifications -responsibilities -skills ',
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };


  return await JobRequisition.paginate(new SearchParam(filter), options, function(result){
    new Pagination(result);
  });

  //return await JobRequisition.find({}).select(['-description','-qualifications', '-responsibilities']);
}



// async function getSimilarCompanyJobs(filter) {
//
//   let foundJob = null;
//   let select = '-description -qualifications -responsibilities -skills ';
//
//   if(filter.id){
//     foundJob = await JobRequisition.findOne({jobId: filter.id});
//
//     if(!foundJob){
//       return null;
//     }
//
//     filter.level = foundJob.level;
//     filter.jobFunction=foundJob.jobFunction;
//   }
//
//
//
//
//   let similarCompanies = await JobRequisition.aggregate([{$match: {level: foundJob.level}}, { $group: {_id: '$company'} }  ]);
//
//
//   let res = await searchParties(_.uniq(_.map(similarCompanies, '_id')), partyEnum.COMPANY);
//   let companies = res.data.data.content;
//   return companies;
//
// }






async function getSimilarCompanyJobs(currentUserId, jobId, filter) {

  if(currentUserId==null || jobId==null || filter==null){
    return null;
  }

  let result = null;

  try {

    let foundJob = await JobRequisition.findOne({jobId: filter.id});

    if(foundJob && foundJob.status==statusEnum.ACTIVE){


      let response = await getPartyById(currentUserId);
      let currentParty = response.data.data;


      if(!isPartyActive(currentParty)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }

      let currentAttendee = await getAttendeeById(eventId, currentUserId);
      console.log('currentAttendee', currentAttendee);

      let isOrganizer = (currentAttendee && currentAttendee.isOrganizer)?true:false;
      let guestCanSeeOtherGuests = foundEvent.guestCanSeeOtherGuests;
      let isAllowToUpdate = (isOrganizer || (currentAttendee && guestCanSeeOtherGuests))? true : false;

      console.log('status', isAllowToUpdate, isOrganizer, guestCanSeeOtherGuests);

      if(isAllowToUpdate){
        console.log('guestCanSeeOtherGuests')
        let foundAttendees = null;
        let select = '';
        let limit = (filter.size && filter.size>0) ? filter.size:20;
        let page = (filter.page && filter.page==0) ? filter.page:1;
        let sortBy = {};
        sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

        let options = {
          select:   select,
          sort:     sortBy,
          lean:     true,
          limit:    limit,
          page: parseInt(filter.page)+1
        };

        filter.eventId = eventId;

        result = await Attendee.paginate(new SearchParam(filter), options);
        let activeAttendees = result.docs;
        let attendees = _.map(activeAttendees, 'partyId');

        let response = await searchParties(attendees);
        let foundUsers = response.data.data.content;
        let found = [];

        for (var i = 0; i < activeAttendees.length; i++) {
          for (var j = 0; j < foundUsers.length; j++) {
            if (activeAttendees[i].partyId == foundUsers[j].id) {
              let userMerge = _.merge(activeAttendees[i], foundUsers[j]);
              found.push(userMerge);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}




async function applyJobById(currentUserId, application) {

  application = await Joi.validate(application, applicationSchema, { abortEarly: false });

  if(currentUserId==null || application==null){
    return null;
  }

  let result;
  try {
    job = await JobRequisition.findOne({jobId: application.jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {

      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', currentParty)

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        result = await findApplicationByUserIdAndJobId(currentParty.id, application.jobId);
        if(!result){
          application.attachment = application.jobId.toString().concat("_").concat(application.partyId).concat(".pdf");
          result = await applyJob(application);
        }
      }
    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function addBookmark(currentUserId, jobId) {

  console.log('saveJobById')
  if(currentUserId==null || jobId==null){
    return null;
  }


  let result;
  try {
    job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {
      console.log('job', job)
      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', currentParty)

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        result = await findBookById(currentParty.id, jobId);

        if(!result) {
          result = await addBookById(currentParty.id, jobId);
        }

      }
    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function removeBookmark(currentUserId, jobId) {

  if(currentUserId==null || jobId==null){
    return null;
  }


  let result;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    //Security Check if user is part of meeting attendees that is ACTIVE.
    if (isPartyActive(currentParty)) {
      result = await findBookById(currentParty.id, jobId);

      if(result){
        let deleted = await removeBookById(currentParty.id, jobId);

        if(deleted && deleted.deletedCount>0){
          result.status=statusEnum.DELETED;
        } else {
          result = null;
        }
      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function addAlert(currentUserId, jobId, alert) {
  alert = await Joi.validate(alert, jobAlertSchema, { abortEarly: false });

  if(currentUserId==null || jobId==null){
    return null;
  }


  let result;
  try {
    job = await JobRequisition.findOne({jobId: jobId, status: { $nin: [statusEnum.DELETED, statusEnum.SUSPENDED] } });

    if(job) {
      let response = await getPersonById(currentUserId);
      let currentParty = response.data.data;
      // console.log('currentParty', currentParty)

      //Security Check if user is part of meeting attendees that is ACTIVE.
      if (isPartyActive(currentParty)) {

        result = await findAlertByUserIdAndJobId(currentParty.id, jobId);

        if(!result) {
          alert.partyId = currentParty.id;
          alert.jobId = job.jobId;
          alert.company = job.company;

          console.log('alert', alert);
          result = await addAlertById(currentParty.id, alert);
        }

      }
    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}



async function removeAlert(currentUserId, jobId) {

  if(currentUserId==null || jobId==null){
    return null;
  }


  let found;
  try {

    let response = await getPersonById(currentUserId);
    let currentParty = response.data.data;

    //Security Check if user is part of meeting attendees that is ACTIVE.
    if (isPartyActive(currentParty)) {
      found = await findAlertByUserIdAndJobId(currentParty.id, jobId);
      if(found){
        let deleted = await removeAlertByUserIdAndJobId(currentParty.id, jobId);
        if(deleted && deleted.deletedCount>0){
          found.status=statusEnum.DELETED;
        } else {
          found = null;
        }
      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return found;
}


async function getAllJobLocations(query, locale) {
  let data = await filterService.getAllJobLocations(query, locale);

  data = _.uniqBy(data, 'city');
  return data;
}
