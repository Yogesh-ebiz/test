const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const ISO6391 = require('iso-639-1');
const {jobMinimal, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');

const CustomPagination = require('../utils/custompagination');
//const pagination = require('../const/pagination');
const Application = require('../models/application.model');
const Bookmark = require('../models/bookmark.model');
const JobAlert = require('../models/job_alert.model');
const PartySKill = require('../models/partyskill.model');
const Skilltype = require('../models/skilltype.model');
const JobView = require('../models/jobview.model');
const CompanySalary = require('../models/companysalary.model');
const Endorsement = require('../models/endorsement.model');




const skillTypeEnum = require('../const/skillTypeEnum');
const partyEnum = require('../const/partyEnum');
const statusEnum = require('../const/statusEnum');
const alertEnum = require('../const/alertEnum');


const {upload} = require('../services/aws.service');
const {addCompany} = require('../services/api/party.service.api');
const {updateResumeDefault, addUserResume, getUserLast5Resumes, syncExperiences, getUserEmployers, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findByUserId, findCompanyById, searchCompany} = require('../services/api/feed.service.api');
const {getPartyById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populateParties, populatePerson, populateParty, populateCompany, populateInstitute} = require('../services/party.service');
const {findJobIds, findJob_Ids} = require('../services/jobrequisition.service');
const {findBookByUserId} = require('../services/bookmark.service');
const {getListofSkillTypes, addSkillType} = require('../services/skilltype.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getIndustry} = require('../services/industry.service');
const {addAlertByUserId, findJobAlertById, removeAlertById, getAlertCount} = require('../services/jobalert.service');
const {getJobCount, getGroupOfCompanyJobs} = require('../services/jobrequisition.service');
const {findListOfPartyEmploymentTitle, findPartyEmploymentByUserId, addPartyEmploymentByUserId, addEmploymentByUserId, updateEmploymentByUserId} = require('../services/partyemployment.service');
const {findPartyEducationById, findPartyEducationByUserId, addPartyEducationsByUserId, updateEducationByUserId} = require('../services/partyeducation.service');
const {addEndorsementByUserId, removeEndorsementById, findEndorsementByEndorserIdAndPartySkillId, findEndorsementsByEndorserIdAndListOfPartySkillIds, getEndorsementCount, getTop3SkillsEndorsement, findEndorsementsByEndorseId} = require('../services/endorsement.service');

const {findPartyCertificationByUserId, findPartyCertificationByIdAndUserId, addPartyCertificationByUserId, updatePartyCertificationByUserId} = require('../services/partycertification.service');
const {findPartyPublicationByUserId, addPartyPublicationByUserId, findPartyPublicationByIdAndUserId, updatePartyPublicationByUserId}  = require('../services/partypublication.service');
const {findPartyLanguageByUserId, addLanguagesByUserId} = require('../services/partylanguage.service');
const {getFieldOfStudyListByShortCode, getAllJobFunctions} = require('../services/filter.service');
const {addCompanySalary} = require('../services/company.service');


const {getPromotions, findPromotionById} = require('../services/promotion.service');

const {findJobViewByUserId} = require('../services/jobview.service');


const {findPartySkillByUserIdAndSkillTypeId, findPartySkillById, findTop3PartySkillsByUserId, findPartySkillsByUserId, addPartySkillByUserId, updatePartySkillByUserId, removePartySkillBySkillTypeIdAndUserId, getEndorsersHighlySkillBySkillTypeId} = require('../services/partyskill.service');


let Pagination = require('../utils/pagination');
let SearchParam = require('../const/searchParam');

let ApplicationSearchParam = require('../const/applicationSearchParam');
let BookmarkSearchParam = require('../const/bookmarkSearchParam');

const {findApplicationByUserId} = require('../services/application.service');



const partySkillSchema = Joi.object({
  partyId: Joi.number(),
  skillTypeId: Joi.number(),
  noOfMonths: Joi.number(),
  selfRating: Joi.number()
});



const jobAlertSchema = Joi.object({
  jobId: Joi.number().optional(),
  partyId: Joi.number().optional(),
  title: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  level: Joi.string().allow('').optional(),
  industry: Joi.string().allow('').optional(),
  jobFunction: Joi.string().allow('').optional(),
  employmentType: Joi.string().allow('').optional(),
  distance: Joi.string().allow('').optional(),
  company: Joi.string().allow('').optional(),
  companySize: Joi.string().allow('').optional(),
  repeat: Joi.string().allow('').optional(),
  notification: Joi.array().optional(),
  status: Joi.string().optional(),
  remote: Joi.boolean().optional()

});

const employmentSchema = Joi.object({
  employmentId: Joi.number().optional(),
  partyId: Joi.number(),
  company: Joi.number().required(),
  employmentTitle: Joi.string().required(),
  jobFunction: Joi.string().required(),
  description: Joi.string().optional(),
  startDate: Joi.number().required(),
  thruDate: Joi.number().required(),
  terminationReason: Joi.string().allow('').optional(),
  terminationType: Joi.string().allow('').optional(),
  isCurrent: Joi.string().allow('').optional()
});


const endorsementSchema = Joi.object({
  partySkillId: Joi.number().required(),
  endorser: Joi.number().required(),
  rating: Joi.number().required(),
  relationship: Joi.string().allow('').optional()
});

const partyPublicationSchema = Joi.object({
  partyPublicationId: Joi.number().optional(),
  partyId: Joi.number().required(),
  title: Joi.string().required(),
  author: Joi.string().required(),
  date: Joi.number().optional(),
  publisher: Joi.string().allow('').optional(),
  publishedDate: Joi.string().allow('').optional(),
  url: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
  isbn: Joi.string().allow('').optional()
});


const partyCertificationSchema = Joi.object({
  partyCertificationId: Joi.number().optional(),
  partyId: Joi.number().required(),
  certificationId: Joi.string().optional(),
  company: Joi.number().optional(),
  title: Joi.string().optional(),
  issuedDate: Joi.number().optional(),
  expirationDate: Joi.number().allow('').optional(),
  url: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional()
});



module.exports = {
  getUserDetail,
  uploadResume,
  getPartyExperiences,
  updatePartyExperiences,
  getPartyEducations,
  updatePartyEducations,
  getPartyAccomplishments,
  updateSkillsAndAccomplishments,
  addPartySkill,
  updatePartySkills,
  updatePartySkillById,
  removePartySkillById,
  getPartySkillsByUserId,
  getPartyLanguages,
  updatePartyLanguages,
  getEndorsementsByPartySkill,
  addEndorsement,
  removeEndorsement,
  getUserResumes,
  setResumeDefault,
  getApplicationsByUserId,
  getBookmarksByUserId,
  getAlertsByUserId,
  addPartyAlert,
  removePartyAlert,
  updatePartyAlert,
  getJobViewsByUserId,
  getPartyPublications,
  addPartyPublication,
  updatePartyPublications,
  getPartyCertifications,
  addPartyCertification,
  updatePartyCertifications,
  getUserEmployersJobs
}



async function getUserDetail(currentUserId, userId, locale) {

  if(currentUserId==null || userId==null){
    return null;
  }

  let result = null;
  try {

    let response = await searchParties([currentUserId, userId], partyEnum.PERSON, 2, 0);
    let users = response.data.data.content;

    let currentParty = _.find(users, {id: currentUserId});
    let foundUser = _.find(users, {id: userId});

    if(isPartyActive(currentParty) && isPartyActive(foundUser)) {

      result = {};

      //Skills-----------------------------------------------------
      let partySkills = await findTop3PartySkillsByUserId(foundUser.id);
      let skills = _.uniq(_.flatten(_.map(partySkills, 'skillTypeId')));
      let listOfSkills = await getListofSkillTypes(_.uniq(_.flatten(_.map(partySkills, 'skillTypeId'))), locale);


      let partySkillIds = _.uniq(_.flatten(_.map(partySkills, 'partySkillId')));

      //Get Top 3 Skills Endorsed
      let top3SkillsEndorsement = await getTop3SkillsEndorsement(partySkillIds);
      let loadPromises = top3SkillsEndorsement.map(partySkillEndorsed => {
        let partySkill = _.find(partySkills, {partySkillId: partySkillEndorsed.partySkillId});
        let endorserIds = _.map(partySkillEndorsed.endorsers, 'endorserId');

        return getEndorsersHighlySkillBySkillTypeId(partySkill.skillTypeId, endorserIds)
      })
      let topEndorsers = await Promise.all(loadPromises);
      topEndorsers = _.reduce(topEndorsers, function(res, item){
        if(item.length>0){
          res.push(item[0])
        }

        return res;
      }, [])
      topEndorsers = await populatePerson(topEndorsers);

      let endorsementByCurrentUser = await findEndorsementsByEndorserIdAndListOfPartySkillIds(currentParty.id, partySkillIds);

      partySkills = _.reduce(partySkills, function(res, skill) {

        var found = _.find(listOfSkills, {skillTypeId: skill.skillTypeId})
        if(found){
          skill.name = found.name;
        }


        let highlySkilledEndorsers = _.find(topEndorsers, {skillTypeId: skill.skillTypeId});
        skill.hasEndorsed = _.find(endorsementByCurrentUser, {partySkillId: skill.partySkillId})?true:false;
        skill.highlySkilledEndorsers = highlySkilledEndorsers?highlySkilledEndorsers:null;

        //temporary
        skill.mutaulEndorser = highlySkilledEndorsers? { noOfMutualEndorsers: 1, skillTypeId: skill.skillTypeId, party: highlySkilledEndorsers.party}:null;
        skill.noOfEndorsement = skill.endorsements.length;
        skill.endorsements = [];
        res.push(skill);
        return res;
      }, []);

      result.skills = partySkills;

      //Employments-----------------------------------------------------
      let employments = await findPartyEmploymentByUserId(foundUser.id);

      let employmentTypes = await getEmploymentTypes(_.uniq(_.map(employments, 'employmentType')));

      let listOfJobFunctions = _.uniq(_.map(employments, 'jobFunction'));
      listOfJobFunctions = await getAllJobFunctions({shortCode: listOfJobFunctions.join(',')}, locale);
      employments = _.reduce(employments, function(res, item){
        let found = _.find(listOfJobFunctions, {shortCode: item.jobFunction});

        console.log('item', item.jobFunction, found)
        if(found){
          item.jobFunction = found;
        }
        res.push(item);
        return res;
      }, [])

      result.employments = await populateCompany(employments);


      //Educations-----------------------------------------------------
      let educations = await findPartyEducationByUserId(foundUser.id);
      let fieldOfStudies = _.uniq(_.flatten(_.map(educations, 'fieldOfStudy')));
      fieldOfStudies = await getFieldOfStudyListByShortCode(fieldOfStudies);
      educations = _.reduce(educations, function(res, item){
        item.fieldOfStudy = _.find(fieldOfStudies, {shortCode: item.fieldOfStudy});
        res.push(item);
        return res;
      }, [])
      result.educations = await populateInstitute(educations);

      //Accomplishments-----------------------------------------------------
      let userLanguages = await findPartyLanguageByUserId(foundUser.id);
      userLanguages = _.reduce(userLanguages, function(res, item){
        res.push({language: ISO6391.getName(item.language), level: item.level});
        return res;
      }, []);
      result.languages = userLanguages;
      result.publications = await findPartyPublicationByUserId(foundUser.id);
      result.certificates = await findPartyCertificationByUserId(foundUser.id);
      result.certificates = await populateCompany(result.certificates);

    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

/**
 * Upload User CV
 *
 * @param {HTTP} currentUserId
 * @param {HTTP} files
 */
async function uploadResume(currentUserId, file) {
  if(currentUserId==null || file==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {

      let fileExt = file.originalFilename.split('.');
      let timestamp = Date.now();
      let name = currentParty.firstName  + currentParty.lastName + '_' + currentParty.id + '_' + timestamp + '.' + fileExt[fileExt.length - 1];

      let path = 'user/' + currentParty.id + '/resumes/' + name;


      result = await upload(path, file);

      result = {
        employments: [
          {
            "employmentTitle": "Sr. Android Developer",
            "fromDate": 1554080400000,
            "description": "Lead a team of 5 mobile developers",
            "isCurrent": false,
            "terminationReason": '',
            "terminationType": '',
            "company": {
              "id": 15,
              "partyType": "ORGANIZATION",
              "groupName": "eBay"
            },
            "city": "San Jose",
            "state": "California",
            "country": "US"
          },
          {
            "employmentTitle": "Android Developer",
            "fromDate": 1483232400000,
            "thruDate": 1554080400000,
            "description": "Developed first app",
            "isCurrent": false,
            "terminationReason": '',
            "terminationType": '',
            "company": {
              "partyType": "ORGANIZATION",
              "groupName": "FPT"
            },
            "city": "Seattle",
            "state": "Washington",
            "country": "US"
          }

        ],
        educations: [
          {
            "typeOfDegree": "Bachelor of Science",
            "major": "CIS",
            "fromDate": 1320123740000,
            "thruDate": 1398920540000,
            "hasGraduated": true,
            "isCurrent": false,
            "school": {
              "id": 27,
              "partyType": "INSTITUTE",
              "groupName": "Temple University"
            },
          },
          {
            "typeOfDegree": "Bachelor of Science",
            "major": "MIS",
            "fromDate": 1320123740000,
            "thruDate": 1398920540000,
            "hasGraduated": true,
            "isCurrent": false,
            "school": {
              "partyType": "INSTITUTE",
              "groupName": "Ohio University"
            },

          },
        ]

      }



      // console.log('result', result)




    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function uploadResume(currentUserId, files, name) {

  if(!currentUserId || !files){
    return null;
  }

  let result = null;
  let basePath = 'user/';
  try {
    let currentParty = await findByUserId(currentUserId);
    if (isPartyActive(currentParty)) {

      let file = files.file;
      let fileName = file.originalFilename.split('.');
      let fileExt = fileName[fileName.length - 1];
      // let date = new Date();
      let timestamp = Date.now();
      name = (!name)? currentParty.firstName + '_' + currentParty.lastName + '_' + currentUserId + '-' + timestamp + '.' + fileExt : name + '-' + timestamp + '.' + fileExt;
      let path = basePath + currentUserId + '/_resumes/' + name;

      let response = await upload(path, file);
      let type;
      switch(fileExt){
        case 'pdf':
          type='PDF';
          break;
        case 'doc':
          type='WORD';
          break;
        case 'docx':
          type='WORD';
          break;

      }
      console.log('fileExt', fileExt, type)

      await addUserResume(currentUserId, name, type);

      result = {
        employments: [
          {
            "employmentTitle": "Sr. Android Developer",
            "fromDate": 1554080400000,
            "description": "Lead a team of 5 mobile developers",
            "isCurrent": false,
            "terminationReason": '',
            "terminationType": '',
            "company": {
              "id": 15,
              "partyType": "ORGANIZATION",
              "groupName": "eBay"
            },
            "city": "San Jose",
            "state": "California",
            "country": "US"
          },
          {
            "employmentTitle": "Android Developer",
            "fromDate": 1483232400000,
            "thruDate": 1554080400000,
            "description": "Developed first app",
            "isCurrent": false,
            "terminationReason": '',
            "terminationType": '',
            "company": {
              "partyType": "ORGANIZATION",
              "groupName": "FPT"
            },
            "city": "Seattle",
            "state": "Washington",
            "country": "US"
          }

        ],
        educations: [
          {
            "typeOfDegree": "Bachelor of Science",
            "major": "CIS",
            "fromDate": 1320123740000,
            "thruDate": 1398920540000,
            "hasGraduated": true,
            "isCurrent": false,
            "school": {
              "id": 27,
              "partyType": "INSTITUTE",
              "groupName": "Temple University"
            },
          },
          {
            "typeOfDegree": "Bachelor of Science",
            "major": "MIS",
            "fromDate": 1320123740000,
            "thruDate": 1398920540000,
            "hasGraduated": true,
            "isCurrent": false,
            "school": {
              "partyType": "INSTITUTE",
              "groupName": "Ohio University"
            },

          },
        ]

      }


    }



  } catch (error) {
    console.log(error);
  }

  return result;

}

async function getPartyExperiences(currentUserId, locale) {

  if(currentUserId==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {
      let employments = await findPartyEmploymentByUserId(currentParty.id);
      let listOfJobFunctions = _.map(employments, 'jobFunction');

      listOfJobFunctions = await getAllJobFunctions({shortCode: listOfJobFunctions.join(',')}, locale);
      employments = _.reduce(employments, function(res, item){
        let found = _.find(listOfJobFunctions, {shortCode: item.jobFunction});

        if(found){
          item.jobFunction = found;
        }
        res.push(item);
        return res;
      }, [])
      result = await populateParty(employments);
    }


  } catch (error) {
    console.log(error);
  }

  return result;

}

async function updatePartyExperiences(currentUserId, data) {

  if(currentUserId==null || data==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {

      let employments = data.employments;
      let newEmployments = [], updateEmployments=[], deleteEmployments = [], companies = [], newSalaries=[];

      let currentEmployments = await findPartyEmploymentByUserId(currentParty.id);
      if(!currentEmployments.length){

        for(let employment of employments){
          let company = employment.company;
          try{
            if(company.id==null){
              company.groupName = employment.company.
              company.city = employment.city;
              company.state = employment.state;
              company.country = employment.country;
              let result = await addCompany(currentParty.id, company);
              company=result.data.data;
            }
          } catch(e){
            console.log('Adding Company Error: ', e);
          }

          employment.company = company.id;
          employment.partyId = currentParty.id;
          newEmployments.push(employment);
          newSalaries.push(employment);
        }


      } else if(!employments.length){
        deleteEmployments = currentEmployments;
      } else {

        for(let employment of employments) {

          // if(!employments[i].company.id){
          //   companies.push(employments[i].company);
          // }

          let exist = _.find(currentEmployments, {partyEmploymentId: employment.partyEmploymentId})
          if (exist) {

            let company = employment.company;

            try{
              if(!company.id){
                company.city = employment.city;
                company.state = employment.state;
                company.country = employment.country;
                company = await addCompany(currentParty.id, company);
                company=company.data.data;

              }
            } catch(e){
              console.log('Adding Company Error: ', e);
            }
            exist.company = company.id;
            exist.jobFunction = employment.jobFunction;
            exist.fromDate = employment.fromDate;
            exist.thruDate = employment.thruDate;
            exist.employmentTitle = employment.employmentTitle;
            exist.employmentType = employment.employmentType;
            exist.terminationReason = employment.terminationReason;
            exist.terminationType = employment.terminationType;
            exist.isCurrent = employment.isCurrent;
            exist.description = employment.description;
            exist.city = employment.city;
            exist.state = employment.state;
            exist.country = employment.country;

            updateEmployments.push(exist);
          } else {

            let company = employment.company;
            try{
              if(!company.id){
                company.city = employment.city;
                company.state = employment.state;
                company.country = employment.country;
                company = await addCompany(currentParty.id, company);
                company=company.data.data;
              }
            } catch(e){
              console.log('Adding Company Error: ', e);
            }
            employment.company = company.id;
            employment.partyId = currentParty.id;
            newSalaries.push(employment);
            newEmployments.push(employment);
          }

        }

        for (var i = 0; i < currentEmployments.length; i++) {
          let exist = _.find(employments, {partyEmploymentId: currentEmployments[i].partyEmploymentId})
          if (!exist) {
            deleteEmployments.push(currentEmployments[i]);
          }

        }
      }


      try {
        let loadPromises = newEmployments.map(employment => addPartyEmploymentByUserId(currentParty.id, employment));
        newEmployments = await Promise.all(loadPromises);

        loadPromises = updateEmployments.map(employment => updateEmploymentByUserId(currentParty.id, employment));
        updateEmployments = await Promise.all(loadPromises);

        loadPromises = deleteEmployments.map(employment => employment.remove());

        result = _.orderBy(newEmployments.concat(updateEmployments), ['fromDate'], ['desc']);

        syncExperiences(currentParty.id, result);

        newSalaries = _.reduce(newSalaries, function(res, item){
          let exist = _.find(result, {fromDate: item.fromDate, thruDate: item.thruDate});

          if(exist && item.salary){
            item.company=exist.company;
            res.push(item);
          }
          return res;
        }, []);

        loadPromises = newSalaries.map(salary => addCompanySalary({baseSalary: salary.salary, yearsExperience: 0, jobFunction: 'DATA', employmentType: 'FULTIME', currency: 'USD', basePayPeriod: 'ANNUALLY', company: salary.company, employmentTitle: salary.employmentTitle, partyId: currentParty.id, city: salary.city, state: salary.state, country: salary.country}));
        await Promise.all(loadPromises);

      }catch (e) {
        console.debug('Update Experiences Error: ', e)
      }
    }


  } catch (error) {
    console.log(error);
  }


  return result;

}

async function getPartyEducations(currentUserId) {

  if(currentUserId==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {
      let educations = await findPartyEducationByUserId(currentParty.id);
      let fieldOfStudies = _.uniq(_.flatten(_.map(educations, 'fieldOfStudy')));
      fieldOfStudies = await getFieldOfStudyListByShortCode(fieldOfStudies);
      educations = _.reduce(educations, function(res, item){
        item.fieldOfStudy = _.find(fieldOfStudies, {shortCode: item.fieldOfStudy});
        res.push(item);
        return res;
      }, [])
      result = await populateParty(educations);
    }


  } catch (error) {
    console.log(error);
  }

  return result;

}

async function updatePartyEducations(currentUserId, data) {

  if(currentUserId==null || data==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {

      let educations = data.educations;
      let addEducations = [], updateEducations=[], deleteEducations = [], institutes = [];

      let currentEducations = await findPartyEducationByUserId(currentParty.id);


      if(!currentEducations.length){
        educations = _.reduce(educations, function(res, item){
          item.partyId = currentParty.id;
          item.institute = item.institute.id?item.institute.id:27;
          res.push(item);
          return res;
        }, []);
        addEducations = educations;
      } else if(!educations.length){
        deleteEducations = currentEducations;
      } else {

        for(var i=0; i<educations.length; i++){


          let exist = _.find(currentEducations, {partyEducationId: educations[i].partyEducationId})
          if(exist){

            exist.institute = educations[i].institute.id?educations[i].institute.id:27;
            exist.fromDate = educations[i].fromDate;
            exist.thruDate = educations[i].thruDate;
            exist.fieldOfStudy = educations[i].fieldOfStudy;
            exist.degree = educations[i].degree;
            exist.gpa = educations[i].gpa;
            exist.hasGraduated = educations[i].hasGraduated;
            exist.isCurrent = educations[i].isCurrent;
            exist.city = educations[i].city;
            exist.state = educations[i].state;
            exist.country = educations[i].country;
            updateEducations.push(exist);
          }else {
            educations[i].partyId = currentParty.id;
            educations[i].institute = educations[i].institute.id?educations[i].institute.id:27;
            addEducations.push(educations[i]);
          }

        }

        for (var i = 0; i < currentEducations.length; i++) {
          let exist = _.find(educations, {partyEducationId: currentEducations[i].partyEducationId})
          if (!exist) {
            deleteEducations.push(currentEducations[i]);
          }

        }

      }


      try{

        // console.log('companies', companies);
        // let loadPromises = companies.map(company => {
        //   console.log('company', company)
        //   addCompany(currentParty.id, company)
        // });
        // companies = await Promise.all(loadPromises);
        //
        // console.log(companies);
      } catch(e){
        console.debug('Add Company Error: ', e);
      }

      try {
        let loadPromises = addEducations.map(education => addPartyEducationsByUserId(currentParty.id, education));
        addEducations = await Promise.all(loadPromises);

        loadPromises = updateEducations.map(education => updateEducationByUserId(currentParty.id, education));
        updateEducations = await Promise.all(loadPromises);

        loadPromises = deleteEducations.map(education => education.remove());

        result = _.orderBy(addEducations.concat(updateEducations), ['fromDate'], ['desc']);

        loadPromises = deleteEducations.map(education => education.remove());

      }catch (e) {
        console.debug('Update Experiences Error: ', e)
      }
    }


  } catch (error) {
    console.log(error);
  }

  return result;

}

async function updatePartySkills(currentUserId, data, locale) {

  if(currentUserId==null || data==null){
    return null;
  }

  locale = locale?locale: 'en';
  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {

      let partySkills = data.skills;


      let currentSkills = await findPartySkillsByUserId(currentParty.id);
      let addSkills = [], updateSkills=[], deleteSkills=[], newSkills=[];

      if(!currentSkills.length){
        for(var i=0; i<partySkills.length; i++){
          if(partySkills[i].skillTypeId) {
            addSkills.push(partySkills[i]);
          } else if(partySkills[i].name!=''){
            let skill = {locale: {}};
            skill.locale[locale]=partySkills[i].name;
            newSkills.push(skill);
          }
        }
      } else if(!partySkills.length){
        deleteSkills = currentSkills;
      } else {

        for(var i=0; i<partySkills.length; i++){

          if(!partySkills[i].skillTypeId){
            if(partySkills[i].name!=''){
              let skill = {locale: {}};
              skill.locale[locale]=partySkills[i].name;
              newSkills.push(skill);
            }

          }else {
            let exist = _.find(currentSkills, {skillTypeId: partySkills[i].skillTypeId})
            if(exist){
              exist.noOfMonths = partySkills[i].noOfMonths;
              exist.skillTypeId = partySkills[i].skillTypeId;
              exist.selfRating = partySkills[i].selfRating;
              updateSkills.push(exist);
            }else {
              addSkills.push(partySkills[i]);
            }
          }
        }

        for (var i = 0; i < currentSkills.length; i++) {
          let exist = _.find(partySkills, {partySkillId: currentSkills[i].partySkillId})
          if (!exist) {
            deleteSkills.push(currentSkills[i]);
          }

        }

      }

      try{

        let loadPromises =newSkills.map(skillType => addSkillType(skillType));
        newSkills = await Promise.all(loadPromises);

        newSkills.forEach(function(skill, index){

          let found = _.find(partySkills, {name: skill.locale[locale]});

          if(found){
            found.skillTypeId = skill._doc.skillTypeId;
            found.partyId = currentParty.id;
            addSkills.push(found)
          }
        })

        loadPromises = addSkills.map(partySkill => addPartySkillByUserId(currentParty.id, {partyId: currentParty.id, selfRating: partySkill.selfRating, skillTypeId: partySkill.skillTypeId, noOfMonths: partySkill.noOfMonths}));
        addSkills = await Promise.all(loadPromises);

        loadPromises = updateSkills.map(partySkill => partySkill.save())
        updateSkills = await Promise.all(loadPromises);
        loadPromises = deleteSkills.map(partySkill => partySkill.remove());
        result = addSkills.concat(updateSkills);

      } catch(e){
        console.debug('Update Skills Error: ', e);
      }

    }


  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getPartyAccomplishments(currentUserId, userId, locale) {

  if(currentUserId==null || userId==null){
    return null;
  }

  let result = null;
  try {

    let user = await findByUserId(userId);


    if(isPartyActive(user)) {

      result = {};


      //Accomplishments-----------------------------------------------------
      let userLanguages = await findPartyLanguageByUserId(user.id);
      userLanguages = _.reduce(userLanguages, function(res, item){
        res.push({language: ISO6391.getName(item.language), level: item.level});
        return res;
      }, []);
      result.languages = userLanguages;
      result.publications = await findPartyPublicationByUserId(user.id);
      result.certificates = await findPartyCertificationByUserId(user.id);
      result.certificates = await populateCompany(result.certificates);

    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function updateSkillsAndAccomplishments(currentUserId, data, locale) {

  if(currentUserId==null || data==null){
    return null;
  }

  locale = locale?locale: 'en';
  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {

      result = {skills: [], languages: [], certificates: [], publications: []};
      let partySkills = data.skills;

      let certificates = data.certificates;
      let publications = data.publications;

      let currentSkills = await findPartySkillsByUserId(currentParty.id);
      let addSkills = [], updateSkills=[], deleteSkills=[], newSkills=[];

      if(!currentSkills.length){
        for(var i=0; i<partySkills.length; i++){
          if(partySkills[i].skillTypeId) {
            addSkills.push(partySkills[i]);
          } else {
            newSkills.push(partySkills[i]);
          }
        }
      } else if(!partySkills.length){
        deleteSkills = currentSkills;
      } else {

        for(var i=0; i<partySkills.length; i++){

          if(!partySkills[i].skillTypeId){
            newSkills.push(partySkills[i]);
          }else {
            let exist = _.find(currentSkills, {skillTypeId: partySkills[i].skillTypeId})
            if(exist){
              updateSkills.push(exist);
            }else {
              addSkills.push(partySkills[i]);
            }
          }
        }
        deleteSkills = _.differenceBy(currentSkills, partySkills, 'skillTypeId')
      }


      try{
        let loadPromises =newSkills.map(skillType => addSkillType(skillType));
        newSkills = await Promise.all(loadPromises);

        newSkills.forEach(function(skill, index){
          let found = _.find(partySkills, {locale: skill.locale});

          if(found){
            found.skillTypeId = skill._doc.skillTypeId;
            found.partyId = currentParty.id;
            addSkills.push(found)
          }
        })

        loadPromises = addSkills.map(partySkill => addPartySkillByUserId({partyId: currentParty.id, skillTypeId: partySkill.skillTypeId, noOfMonths: partySkill.noOfMonths}));
        addSkills = await Promise.all(loadPromises);

        loadPromises = updateSkills.map(partySkill => partySkill.save())
        updateSkills = await Promise.all(loadPromises);
        loadPromises = deleteSkills.map(partySkill => partySkill.remove());
        result.skills = addSkills.concat(updateSkills);

      } catch(e){
        console.debug('Update Skills Error: ', e);
      }



      try {

        let languages = data.languages;
        languages = _.reduce(languages, function(res, item){
          res.push(ISO6391.getCode(item))
          return res;
        }, []);

        let currentPartyLanguage = await findLanguageByUserId(currentParty.id);

        if(currentPartyLanguage){
          currentPartyLanguage.languages = languages;
          result.languages = currentPartyLanguage.save();
        } else {
          result.languages = await addLanguagesByUserId(currentParty.id, {partyId: currentParty.id, languages: languages});
        }

      }catch (e) {
        console.debug('Update Languages Error: ', e)
      }


      try {



      } catch (e) {
        console.debug('Update Education Error: ', e)
      }
    }


  } catch (error) {
    console.log(error);
  }

  return result;

}

async function getPartySkillsByUserId(currentUserId, userId, filter, locale) {

  if(currentUserId==null || userId==null || filter==null){
    return null;
  }

  let result = {topSkills: [], industrySkills: [], interpersonalSkills: [], toolAndTechnologySkills: [], otherSkills: []};
  try {

    let user = await findByUserId(userId);


    if(isPartyActive(user)) {

      let partySkills = await findPartySkillsByUserId(user.id);
      partySkills = _.orderBy(partySkills, ['endorsements'], ['desc']);

      let skills = _.uniq(_.flatten(_.map(partySkills, 'skillTypeId')));
      let listOfSkills = await getListofSkillTypes(skills, locale);

      result.topSkills  = _.reduce(partySkills.splice(0, 3), function(res, skill) {

        var found = _.find(listOfSkills, {skillTypeId: skill.skillTypeId})
        delete skill.id;
        if(found){
          skill.name = found.name;
          res.push(skill);
        }

        return res;
      }, []);

      result = _.reduce(partySkills, function(res, skill) {

        var found = _.find(listOfSkills, {skillTypeId: skill.skillTypeId})
        delete skill.id;
        if(found){
          skill.name = found.name;

          if(found.type==skillTypeEnum.INDUSTRY) {
            res.industrySkills.push(skill);
          }else if (found.type==skillTypeEnum.INTERPERSONAL) {
            res.interpersonalSkills.push(skill);
          }else if(found.type==skillTypeEnum.TECHNOLOGY) {
            res.toolAndTechnologySkills.push(skill);
          }else if(found.type==skillTypeEnum.TOOL) {
            res.toolAndTechnologySkills.push(skill);
          } else{
            res.otherSkills.push(skill);
          }

        }

        return res;
      }, result);
    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function addPartySkill(currentUserId, partySkill) {
  partySkill = await Joi.validate(partySkill, partySkillSchema, { abortEarly: false });

  if(currentUserId==null || partySkill==null){
    return null;
  }


  let result;
  try {

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      found = await findPartySkillByUserIdAndSkillTypeId(currentParty.id, partySkill.skillTypeId);

      if(!found){
        result = await addPartySkillByUserId(currentParty.id, partySkill);
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

async function updatePartySkillById(currentUserId, partySkill) {

  if(currentUserId==null || partySkill==null){
    return null;
  }


  let result;
  try {

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      found = await findPartySkillById(partySkill.partySkillId);

      if(found && found.partyId==currentParty.id){

        found.noOfMonths=partySkill.noOfMonths;
        found.selfRating=partySkill.selfRating;
        result = await found.save();
      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}

async function removePartySkillById(currentUserId, partySkillId) {

  if(currentUserId==null || partySkillId==null){
    return null;
  }


  let result;
  try {

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      found = await findPartySkillById(partySkillId);

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

async function getPartyLanguages(currentUserId, locale) {

  if(currentUserId==null){
    return null;
  }

  let result = null;
  try {

    let currentParty = await findByUserId(currentUserId);


    if(isPartyActive(currentParty)) {

      let userLanguages = await findPartyLanguageByUserId(currentParty.id);

      userLanguages = _.reduce(userLanguages, function(res, item){
        // item.language = ISO6391.getName(item.language);
        res.push(item);
        return res;
      }, []);
      result = userLanguages;
    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function updatePartyLanguages(currentUserId, data, locale) {

  if(currentUserId==null || data==null){
    return null;
  }

  locale = locale?locale: 'en';
  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {

      let languages = data.languages;


      let currentPartyLanguage = await findPartyLanguageByUserId(currentParty.id);
      let addLanguages = [], updateLanguages=[], deleteLanguages=[];


      if(!currentPartyLanguage.length){
        addLanguages = languages;
      } else if(!languages.length){
        deleteLanguages = currentPartyLanguage;
      } else {

        for(var i=0; i<languages.length; i++){


          let exist = _.find(currentPartyLanguage, {language: languages[i].language})
          if(exist){
            exist.level = languages[i].level;
            exist.language = languages[i].language;
            updateLanguages.push(exist);
          }else {
            addLanguages.push(languages[i]);
          }

        }

        for (var i = 0; i < currentPartyLanguage.length; i++) {
          let exist = _.find(languages, {language: currentPartyLanguage[i].language})
          if (!exist) {
            deleteLanguages.push(currentPartyLanguage[i]);
          }

        }

      }

      try{


        loadPromises = addLanguages.map(language => addLanguagesByUserId(currentParty.id, {partyId: currentParty.id, language: language.language, level: language.level}));
        addLanguages = await Promise.all(loadPromises);

        loadPromises = updateLanguages.map(language => language.save())
        updateLanguages = await Promise.all(loadPromises);

        loadPromises = deleteLanguages.map(language => language.remove());

        result = addLanguages.concat(updateLanguages);


      } catch(e){
        console.debug('Update Language Error: ', e);
      }

    }


  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addEndorsement(currentUserId, endorsement) {
  endorsement = await Joi.validate(endorsement, endorsementSchema, { abortEarly: false });

  if(currentUserId==null || endorsement==null){
    return null;
  }


  let result;
  try {

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      found = await findPartySkillById(endorsement.partySkillId);
      if(found && found.partyId!=currentParty.id){

        let foundEndorsement = await findEndorsementByEndorserIdAndPartySkillId(endorsement.endorser, endorsement.partySkillId);

        if(foundEndorsement){
          foundEndorsement.rating = endorsement.rating;
          foundEndorsement.relationship = endorsement.relationship;
          foundEndorsement.lastUpdatedDate = Date.now();
          result = await foundEndorsement.save();
        } else {
          result = await addEndorsementByUserId(endorsement);

          // let endorsementCount = await getEndorsementCount([result.partySkillId]);
          // found.averageEndorsedRating = endorsementCount[0].averageEndorsedRating;

          found.endorsements.push(result);
          // await found.save();
        }

        if(result){
          let endorsementCount = await getEndorsementCount([result.partySkillId]);
          found.averageEndorsedRating = endorsementCount[0].averageEndorsedRating;
          await found.save();
        }

      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}

async function removeEndorsement(currentUserId, partySkillId) {

  if(currentUserId==null || partySkillId==null){
    return null;
  }


  let result;
  try {

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      found = await findPartySkillById(partySkillId);

      if(found){
        let foundEndorsement = await findEndorsementByEndorserIdAndPartySkillId(currentParty.id, partySkillId);
        if(foundEndorsement){
          let deleted = await foundEndorsement.remove();

          if(deleted){
            result = {status: statusEnum.DELETED};
            let index = _.indexOf(found.endorsements, deleted._id);

            let endorsementCount = await getEndorsementCount([result.partySkillId]);

            found.averageEndorsedRating = endorsementCount.length? endorsementCount[0].averageEndorsedRating:0;
            found.endorsements.splice(index, 1);
            await found.save();
          }
        }
      }

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}

async function getEndorsementsByPartySkill(currentUserId, partySkillId, filter, locale) {

  if(currentUserId==null || partySkillId==null || filter==null){
    return null;
  }

  let result = null;
  try {

    let currentParty = await findByUserId(currentUserId);
    if(isPartyActive(currentParty)) {

      let partySkill = await findPartySkillById(partySkillId, filter);
      let count = partySkill.endorsements.length;

      let page = filter.page;
      let size = filter.size;
      let skip = filter.size * filter.page;

      partySkill = await PartySKill.findOne({partySkillId}).populate([
        {
          path: 'endorsements',
          model:'Endorsement',
          options: {
            sort:{ createdDate: 1},
            skip: skip,
            limit : size
          }
        }
      ]);

      let totalCount = partySkill.endorsements.length;

      // partySkill = Endorsement.populate(partySkill, {path: 'endorsements', model: 'Endorsement'});
      let endorsements = partySkill.endorsements;

      let endorsers = _.map(endorsements, 'endorser');
      endorsers = await searchParties(endorsers, partyEnum.PERSON);
      endorsers = endorsers.data.data.content;

      let employments = await findListOfPartyEmploymentTitle(_.map(endorsers, 'id'));

      endorsements = _.reduce(endorsements, function(res, item){
        let user = _.find(endorsers, {id: item.endorser});
        let employment = _.find(employments, {id: user.id});
        if(user){
          if(employment){
            user.headline = (user.headline)?user.headline:employment.partyTitle;
          }

          item.endorser = user;

        }
        res.push(item);
        return res;
      }, []);

      result = new CustomPagination({count: count, result: endorsements}, filter, locale);
    }

  } catch (error) {
    console.log(error);
  }

  return result;

}



async function getUserResumes(currentUserId) {

  if(currentUserId==null){
    return null;
  }

  let result = null;
  try {
    result = await getUserLast5Resumes(currentUserId);

  } catch (error) {
    console.log(error);
  }

  return result;

}



async function setResumeDefault(currentUserId, resumeId) {
  console.log(currentUserId, resumeId)
  if(!currentUserId || !resumeId){
    return null;
  }


  let result = null;
  try {
    result = await updateResumeDefault(currentUserId, resumeId);

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function getApplicationsByUserId(currentUserId, filter, locale) {

  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {

      let currentParty = await findByUserId(currentUserId);

      if(isPartyActive(currentParty)) {
        // console.debug('isActive', currentParty)
        let select = '';
        let limit = (filter.size && filter.size > 0) ? filter.size : 20;
        let page = (filter.page && filter.page == 0) ? filter.page : 1;
        let sortBy = {};
        filter.sortBy = (filter.sortyBy) ? filter.sortyBy : 'createdDate';
        filter.direction = (filter.direction && filter.direction=="ASC") ? "ASC" : 'DESC';
        sortBy[filter.sortBy] = (filter.direction == "DESC") ? -1 : 1;

        let options = {
          select: select,
          sort: sortBy,
          lean: true,
          limit: limit,
          page: parseInt(filter.page) + 1
        };

        filter.partyId=currentParty.id;


        const aggregate = Application.aggregate([
          { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
          { $unwind: '$user'},
          { $match: {'user.userId': currentUserId}}
        ]);
        result = await Application.aggregatePaginate(aggregate, options);

        let jobIds = _.map(result.docs, 'jobId');

        let jobs = await findJob_Ids(jobIds);

        let companyIds = _.map(jobs, 'company');

        let employmentTypes = await getEmploymentTypes(_.uniq(_.map(jobs, 'employmentType')), locale);
        let experienceLevels = await getExperienceLevels(_.uniq(_.map(jobs, 'level')), locale);

        // let industries = await getIndustry(_.uniq(_.flatten(_.map(jobs, 'industry'))), locale);



        let res = await searchCompany('', companyIds, currentUserId);
        let foundCompanies = res.content;

        let promotions = await getPromotions(_.uniq(_.flatten(_.map(jobs, 'promotion'))), locale);
        let hasSaves = await findBookByUserId(currentParty.id);


        _.forEach(result.docs, function(application, idx) {

          let job = _.find(jobs, {_id: ObjectID(application.jobId)});
          if(job) {
            job.hasSaved = _.some(hasSaves, {jobId: job._id});
            job.description = null;
            job.responsibilities = [];
            job.qualifications = [];
            job.skills = [];
            job.connection = {noConnection: 0, list: []};
            job.company = convertToCompany(_.find(foundCompanies, {id: job.company}));
            job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
            job.level = _.find(experienceLevels, {shortCode: job.level});
            job.promotion = _.find(promotions, {promotionId: job.promotion});
          }
          // let industry = _.reduce(industries, function(res, item){
          //   if(_.includes(job.industry, item.shortCode)){
          //     res.push(item);
          //   }
          //   return res;
          // }, []);
          //
          // job.industry = industry;

          application.job = jobMinimal(job);



        })

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

    let currentParty = await findByUserId(currentUserId);

    if(isPartyActive(currentParty)) {

      let select = '';
      let limit = (filter.size && filter.size > 0) ? filter.size : 20;
      let page = (filter.page && filter.page == 0) ? filter.page : 1;
      let sortBy = {};
      filter.sortBy = (filter.sortyBy) ? filter.sortyBy : 'createdDate';
      filter.direction = (filter.direction && filter.direction=="ASC") ? "ASC" : 'DESC';
      sortBy[filter.sortBy] = (filter.direction == "DESC") ? -1 : 1;

      let options = {
        select: select,
        sort: sortBy,
        lean: true,
        limit: limit,
        page: parseInt(filter.page) + 1
      };

      filter.partyId=currentParty.id;

      result = await Bookmark.aggregatePaginate(new BookmarkSearchParam(filter), options);
      let jobIds = _.map(result.docs, 'jobId');
      let jobs = await findJob_Ids(jobIds);

      let companyIds = _.map(jobs, 'company');
      let res = await searchCompany('', companyIds, currentUserId);
      let foundCompanies = res.content;

      let employmentTypes = await getEmploymentTypes(_.uniq(_.map(jobs, 'employmentType')), locale);
      let experienceLevels = await getExperienceLevels(_.uniq(_.map(jobs, 'level')), locale);
      let industries = await findIndustry('', _.uniq(_.flatten(_.map(jobs, 'industry'))), locale);

      let promotions = await getPromotions(_.uniq(_.flatten(_.map(jobs, 'promotion'))), locale);


      _.forEach(result.docs, function(bookmark, idx) {
        let job = _.find(jobs, {_id: ObjectID(bookmark.jobId)});
        if(job) {
          job.hasSaved = true;
          job.description = null;
          job.responsibilities = [];
          job.qualifications = [];
          job.skills = [];
          job.connection = {noConnection: 0, list: []};
          job.company = convertToCompany(_.find(foundCompanies, {id: job.company}));
          job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
          job.level = _.find(experienceLevels, {shortCode: job.level});
          job.promotion = _.find(promotions, {promotionId: job.promotion});
          let industry = _.reduce(industries, function (res, item) {
            if (_.includes(job.industry, item.shortCode)) {
              res.push(item);
            }
            return res;
          }, []);

          job.industry = industry;

          bookmark.job = jobMinimal(job);
        }

      })



      // result.docs = jobs;

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

    let currentParty = await findByUserId(currentUserId);

    if(isPartyActive(currentParty)) {
      let select = '';
      let limit = (filter.size && filter.size > 0) ? filter.size : 20;
      let page = (filter.page && filter.page == 0) ? filter.page : 1;
      let sortBy = {};
      filter.sortBy = (filter.sortyBy) ? filter.sortyBy : 'createdDate';
      filter.direction = (filter.direction && filter.direction=="ASC") ? "ASC" : 'DESC';
      sortBy[filter.sortBy] = (filter.direction == "DESC") ? -1 : 1;

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

      const loadPromises = result.docs.map(alert => getJobCount(alert));
      let count = await Promise.all(loadPromises);

      _.forEach(result.docs, function(alert, idx) {
        // alert.company = _.find(foundCompanies, {id: alert.company});

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

    let currentParty = await findByUserId(currentUserId);
    // console.log('currentParty', currentParty)

    //Security Check if user is part of meeting attendees that is ACTIVE.
    if (isPartyActive(currentParty)) {

      alert.partyId = currentParty.id;
      result = await addAlertByUserId(currentParty.id, alert);


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

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {

      let found = await findJobAlertById(alertId);

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

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      found = await findJobAlertById(alertId);
      if(found){
        found.title = alert.title?alert.title:found.title;
        found.company = alert.company?alert.company:found.company;
        found.companySize = alert.companySize?alert.companySize:found.companySize;
        found.distance = alert.distance?alert.distance:found.distance;
        found.employmentType = alert.employmentType?alert.employmentType:found.employmentType;
        found.city = alert.city?alert.city:found.city;
        found.state = alert.state?alert.state:found.state;
        found.country = alert.country?alert.country:found.country;
        found.repeat = alert.repeat?alert.repeat:found.repeat;
        found.industry = alert.industry?alert.industry:found.industry;
        found.notification = alert.notification?alert.notification:found.notification;
        found.remote = alert.remote?alert.remote:false;
        found.level = alert.level?alert.level:found.level;
        found.jobFunction = alert.jobFunction?alert.jobFunction:found.jobFunction;

        found.status = alert.status?alert.status : found.status;

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

    let currentParty = await findByUserId(currentUserId);

    if(isPartyActive(currentParty)) {
      // console.debug('isActive', currentParty.id)
      let select = '';
      let limit = (filter.size && filter.size > 0) ? filter.size : 20;
      let page = (filter.page && filter.page == 0) ? filter.page : 1;
      let sortBy = {};
      filter.sortBy = (filter.sortyBy) ? filter.sortyBy : 'createdDate';
      filter.direction = (filter.direction && filter.direction=="ASC") ? "ASC" : 'DESC';
      sortBy[filter.sortBy] = (filter.direction == "DESC") ? -1 : 1;

      let options = {
        select: select,
        sort: sortBy,
        lean: true,
        limit: limit,
        page: parseInt(filter.page) + 1
      };

      filter.partyId=currentParty.id;

      result = await JobView.aggregatePaginate(new SearchParam(filter), options);
      let jobIds = _.map(result.docs, 'jobId');

      let hasSaves = await findBookByUserId(currentUserId);


      let jobs = await findJob_Ids(jobIds);
      let companyIds = _.map(jobs, 'company');
      let res = await searchCompany('', companyIds, currentUserId);
      let foundCompanies = res.content;

      let employmentTypes = await getEmploymentTypes(_.uniq(_.map(jobs, 'employmentType')), locale);
      let experienceLevels = await getExperienceLevels(_.uniq(_.map(jobs, 'level')), locale);

      let promotionIds = _.map(jobs, 'promotion');
      let promotions = await getPromotions(promotionIds);

      _.forEach(result.docs, function(view, idx) {
        let job = _.find(jobs, {_id: ObjectID(view.jobId)});
        job.hasSaved = _.some(hasSaves, {jobId: job._id});
        job.description = null;
        job.responsibilities=[];
        job.qualifications = [];
        job.skills = [];
        job.connection = {noConnection: 0, list: []};
        job.company = convertToCompany(_.find(foundCompanies, {id: job.company}));
        job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
        job.level = _.find(experienceLevels, {shortCode: job.level});
        job.promotion = _.find(promotions, {promotionId: job.promotion});

        view.job = job;

      })


    }


  } catch (error) {
    console.log(error);
  }

  return new Pagination(result);

}

async function getPartyPublications(currentUserId) {

  if(currentUserId==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      result = await findPartyPublicationByUserId(currentParty.id);
    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function addPartyPublication(currentUserId, publication) {
  publication = await Joi.validate(publication, partyPublicationSchema, { abortEarly: false });

  if(currentUserId==null || publication==null){
    return null;
  }


  let result;
  try {

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      let found;
      if(publication.publicationId){
        found = await findPartyPublicationByIdAndUserId(currentParty.id, publication.partyPublicationId);
      }


      if(!found){
        console.log('add new')
        result = await addPublicationByUserId(publication);
      } else {
        let lastUpdatedDate = Date.now();
        found.title = partySkill.title;
        found.author = partySkill.author;
        found.date = partySkill.date;
        found.publisher = partySkill.publisher;
        found.url = partySkill.url;
        found.description = partySkill.description;
        found.isbn = partySkill.isbn;

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

async function updatePartyPublications(currentUserId, data) {

  if(currentUserId==null || data==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {

      let newPublications = [], updatePublications=[], deletePublications=[];
      let publications = data.publications;

      let currentPublications = await findPartyPublicationByUserId(currentParty.id)
      if (!currentPublications.length) {
        publications = _.reduce(publications, function (res, item) {
          item.partyId = currentParty.id;
          res.push(item);
          return res;
        }, []);
        newPublications = publications;
      } else if (!publications.length) {
        deletePublications = currentPublications;
      } else {

        for (var i = 0; i < publications.length; i++) {

          let exist = _.find(currentPublications, {partyPublicationId: publications[i].partyPublicationId})
          if (exist) {
            exist.title = publications[i].title;
            exist.author = publications[i].author;
            exist.publisher = publications[i].publisher;
            exist.publishedDate = publications[i].publishedDate;
            exist.url = publications[i].url;
            exist.description = publications[i].description;
            exist.isbn = publications[i].isbn;

            updatePublications.push(exist);
          } else {
            publications[i].partyId = currentParty.id;
            newPublications.push(publications[i]);
          }

        }

        for (var i = 0; i < currentPublications.length; i++) {
          let exist = _.find(publications, {partyPublicationId: currentPublications[i].partyPublicationId})
          if (!exist) {
            deletePublications.push(currentPublications[i]);
          }

        }


      }
      try {
        let loadPromises = newPublications.map(publication => addPartyPublicationByUserId(currentParty.id, publication));
        newPublications = await Promise.all(loadPromises);

        loadPromises = updatePublications.map(publication => updatePartyPublicationByUserId(currentParty.id, publication));
        updatePublications = await Promise.all(loadPromises);


        if(deletePublications){
          loadPromises = deletePublications.map(publication => publication.remove());
        }


        result = _.orderBy(newPublications.concat(updatePublications), ['createdDate'], ['desc']);

      }catch (e) {
        console.debug('Update Publications Error: ', e)
      }

    }


  } catch (error) {
    console.log(error);
  }

  return result;

}

async function getPartyCertifications(currentUserId) {

  if(currentUserId==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      result = await findPartyCertificationByUserId(currentParty.id);
      result = await populateParty(result);
    }

  } catch (error) {
    console.log(error);
  }

  return result;

}

async function addPartyCertification(currentUserId, certification) {
  certification = await Joi.validate(certification, partyCertificationSchema, { abortEarly: false });

  if(currentUserId==null || certification==null){
    return null;
  }


  let result;
  try {

    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      let found;
      if(certification.partyCertificationId){
        found = await findPartyCertificationByIdAndUserId(currentParty.id, certification.partyCertificationId);
      }


      if(!found){
        result = await addCertificationByUserId(certification);
      } else {
        let lastUpdatedDate = Date.now();
        found.title = certification.title;
        found.author = certification.author;
        found.date = certification.date;
        found.publisher = certification.publisher;
        found.url = certification.url;
        found.description = certification.description;
        found.isbn = certification.isbn;
        found.certificatinoId= certification.certificationId;
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

async function updatePartyCertifications(currentUserId, data) {

  if(currentUserId==null || data==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {

      let newCertifications = [], updateCertifications = [], deleteCertifications = [];
      let certifications = data.certifications;

      let currentCertifications = await findPartyCertificationByUserId(currentParty.id)

      if (!currentCertifications.length) {
        certifications = _.reduce(certifications, function (res, item) {
          item.partyId = currentParty.id;
          item.company = item.company.id ? item.company.id : 27;
          res.push(item);
          return res;
        }, []);
        newCertifications = certifications;
      } else if (!certifications.length) {
        deleteCertifications = currentCertifications;
      } else {

        for (var i = 0; i < certifications.length; i++) {


          let exist = _.find(currentCertifications, {partyCertificationId: certifications[i].partyCertificationId})
          if (exist) {
            exist.company = certifications[i].company.id ? certifications[i].company.id : 27;
            exist.expirationDate = certifications[i].expirationDate;
            exist.issuedDate = certifications[i].issuedDate;
            exist.certificationId = certifications[i].certificationId;
            exist.title = certifications[i].title;
            exist.url = certifications[i].url;
            exist.description = certifications[i].description;
            exist.city = certifications[i].city;
            exist.state = certifications[i].state;
            exist.country = certifications[i].country;

            updateCertifications.push(exist);
          } else {
            certifications[i].partyId = currentParty.id;
            certifications[i].company = certifications[i].company.id ? certifications[i].company.id : 27;
            newCertifications.push(certifications[i]);
          }

        }

        for (var i = 0; i < currentCertifications.length; i++) {
          let exist = _.find(certifications, {partyCertificationId: currentCertifications[i].partyCertificationId})
          if (!exist) {
            deleteCertifications.push(currentCertifications[i]);
          }

        }

      }
      try {
        let loadPromises = newCertifications.map(certification => addPartyCertificationByUserId(currentParty.id, certification));
        newCertifications = await Promise.all(loadPromises);

        loadPromises = updateCertifications.map(certification => updatePartyCertificationByUserId(currentParty.id, certification));
        updateCertifications = await Promise.all(loadPromises);

        if(deleteCertifications){
          loadPromises = deleteCertifications.map(certification => certification.remove());
        }


        result = _.orderBy(newCertifications.concat(updateCertifications), ['createdDate'], ['desc']);

      }catch (e) {
        console.debug('Update Certifications Error: ', e)
      }

    }


  } catch (error) {
    console.log(error);
  }

  return result;

}


async function getUserEmployersJobs(currenterUserid, locale) {

  let res = null;
  if(currenterUserid==null){
    return null;
  }

  let employers = await getUserEmployers(currenterUserid, locale);
  let employerIds = _.reduce(employers, function(a,b){
    a.push(parseInt(b.id));
    return a;
  }, [])
  let listOfCompanies = await getGroupOfCompanyJobs(employerIds);
  res = _.reduce(listOfCompanies, function(a,b){
    let found = _.find(employers, {id: b['_id']});

    if(found){
      let list = _.reduce(b.list, function (a, b) {
        b.company=convertToCompany(found);
        b.responsibilities=null;
        b.qualifications=null;
        b.skills=null;
        a.push(b);
        return a;
      }, []);
      let company = {id: found.id, name: found.name, list: b.list};
      a.push(company);
    }

    return a;
  }, []);
  return res;

}
