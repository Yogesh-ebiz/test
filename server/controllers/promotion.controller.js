const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const partyEnum = require('../const/partyEnum');

const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties} = require('../services/party.service');
const {getListofSkillTypes} = require('../services/jobrequisition.service');



//const pagination = require('../const/pagination');
const JobRequisition = require('../models/jobrequisition.model');
const Promotion = require('../models/promotion.model');




let Pagination = require('../utils/job.pagination');
let SearchParam = require('../const/searchParam');


const promotionSchema = Joi.object({
});



module.exports = {
  addPromotion,
  getPromotionById,
  removePromotion,
  searchPromotions
}

async function addPromotion(currentUserId, jobId, promotion) {
  promotion = await Joi.validate(promotion, promotionSchema, { abortEarly: false });

  if(currentUserId==null || jobId==null || promotion==null){
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

async function removePromotion(currentUserId, promotionId) {

  if(currentUserId==null || promotionId==null){
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


async function getPromotionById(currentUserId, jobId, locale) {

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


        let noApplied = await findAppliedCountByJobId(job.jobId);
        job.noApplied = noApplied;

        let employmentType = await getEmploymentTypes(_.map(job, 'employmentType'), locale);
        job.employmentType = employmentType[0];

        let experienceLevel = await getExperienceLevels(_.map(job, 'level'), locale);
        job.level = experienceLevel[0];

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


async function searchPromotions(currentUserId, jobId, filter, locale) {

  if(currentUserId==null || filter==null){
    return null;
  }

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


  if(jobId){
    foundJob = await JobRequisition.findOne({jobId:jobId});
    //
    // if(!foundJob){
    //   return new Pagination(null);
    // }



    filter.similarId = foundJob.jobId;
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
  let employmentTypes = await getEmploymentTypes(_.uniq(_.map(result.docs, 'employmentType')), locale);
  let experienceLevels = await getExperienceLevels(_.uniq(_.map(result.docs, 'level')), locale);


  let listOfCompanyIds = _.uniq(_.flatten(_.map(result.docs, 'company')));

  let res = await searchParties(listOfCompanyIds, partyEnum.COMPANY);
  let foundCompanies = res.data.data.content;


  let hasSaves = await findBookByUserId(currentUserId);


  _.forEach(result.docs, function(job){
    job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
    job.company = _.find(foundCompanies, {id: job.company});
    job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
    job.level = _.find(experienceLevels, {shortCode: job.level});


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



