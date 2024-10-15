import sovrenService from "../services/api/sovren.service.api";

const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const { ObjectId } = require('mongodb');
var path = require('path')
const httpStatus = require('http-status');
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import paymentService from "../services/api/payment.service.api";
import evaluationService from "../services/evaluation.service";
import { Member } from "../models";
const ISO6391 = require('iso-639-1');
const {jobMinimal, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');

const CustomPagination = require('../utils/custompagination');
//const pagination = require('../const/pagination');
const Application = require('../models/application.model');
const Bookmark = require('../models/bookmark.model');
const Company = require('../models/company.model');
const JobAlert = require('../models/jobalert.model');
const PartySKill = require('../models/partyskill.model');
const Skill = require('../models/skill.model');
const UserImpression = require('../models/userimpression.model');
const JobRequisition = require('../models/jobrequisition.model');
const JobImpression = require('../models/jobimpression.model');
const CompanySalary = require('../models/companysalary.model');
const Endorsement = require('../models/endorsement.model');
const User = require('../models/user.model');
const People = require('../models/people.model');
const peopleData = require('../../data/people.json');




const skillTypeEnum = require('../const/skillTypeEnum');
const partyEnum = require('../const/partyEnum');
const statusEnum = require('../const/statusEnum');
const alertEnum = require('../const/alertEnum');

const Resume = require('../templates/Resume');
const userService = require('../services/user.service');
const userResumeService = require('../services/userresume.service');
const experienceService = require('../services/experience.service');
const educationService = require('../services/education.service');
const fileService = require('../services/file.service');
const parserService = require('../services/api/sovren.service.api');
const {upload} = require('../services/aws.service');
const feedService = require('../services/api/feed.service.api');
const memberService = require('../services/member.service');
const companyService = require('../services/company.service');
const roleService = require('../services/role.service');
const jobPreferenceService = require('../services/jobPreference.service');
const bookmarkService = require('../services/bookmark.service');
const jobAlertService = require('../services/jobalert.service');
const skillService = require('../services/skill.service');
const endorsementService = require('../services/endorsement.service');
const elasticsearch = require('../services/elasticsearch/elasticsearch');


const {addCompany} = require('../services/api/party.service.api');
const {getPartyById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populateParties, populatePerson, populateParty, populateCompany, populateInstitute} = require('../services/party.service');
const {findJobIds, findJob_Ids} = require('../services/jobrequisition.service');
const {getListofSkills, addSkill} = require('../services/skill.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getIndustry} = require('../services/industry.service');
const {addAlertByUserId, findJobAlertById, removeAlertById, getAlertCount} = require('../services/jobalert.service');
const {getJobCount, getGroupOfCompanyJobs} = require('../services/jobrequisition.service');
const {findListOfPartyEmploymentTitle, findPartyEmploymentByUserId, addPartyEmploymentByUserId, addEmploymentByUserId, updateEmploymentByUserId} = require('../services/partyemployment.service');
const {findPartyEducationById, findPartyEducationByUserId, addPartyEducationsByUserId, updateEducationByUserId} = require('../services/partyeducation.service');
const {addEndorsementByUserId, removeEndorsementById, findEndorsementByEndorserIdAndPartySkillId, findEndorsementsByEndorserIdAndListOfPartySkillIds, getEndorsementCount, getTop3SkillsEndorsement, findEndorsementsByEndorseId} = require('../services/endorsement.service');

const {findPartyCertificationByUserId, findPartyCertificationByIdAndUserId, addPartyCertificationByUserId, updatePartyCertificationByUserId} = require('../services/partycertification.service');
const userPublicationService  = require('../services/userpublication.service');
const userLanguageService = require('../services/userlanguage.service');
const {getFieldOfStudyListByShortCode, getAllJobFunctions} = require('../services/filter.service');
const {addCompanySalary} = require('../services/company.service');


const {getPromotions, findPromotionById} = require('../services/promotion.service');


const partySkillService = require('../services/partyskill.service');
const { getFromCache, saveToCache, deleteFromCache } = require('../services/cacheService');
const userImpressionService = require('../services/userimpression.service');


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



async function register(form) {
  if(!form){
    return null;
  }

  let result;
  try {
    await memberService.sync(form);

  } catch(e){
    console.log('sync: Error', e);
  }


  return result;

}
const sync = catchAsync(async (req, res) => {
  const { params, files } = req;
  const {userId} = params;

  let result;
  try {
    await memberService.sync(user);

  } catch(e){
    console.log('sync: Error', e);
  }

  res.json(result);
});
const syncCompanies = catchAsync(async (req, res) => {
  const { params, files } = req;
  const {userId} = params;

  let result;
  try {
    let user = await feedService.getCurrentUser(userId);

    let userCompanies = await feedService.syncUserCompanies(userId);
    if(user && userCompanies.length) {
      let companies = await companyService.findByCompanyIds(_.map(userCompanies, 'id'), false);
      let members = await memberService.findAllByUserId(userId);
      let role = await roleService.getAdminRole();
      for (const [i, comp] of userCompanies.entries()) {
        let company = _.find(companies, {companyId: comp.id});

        if(!company){
          let newCompany = {
            name: comp.name,
            companyId: comp.id,
            partyType: comp.partyType,
            createdBy: user.id,
            email:user.primaryEmail?user.primaryEmail.value:'',
            primaryAddress: {address1: comp.primaryAddress.address1, address2: comp.primaryAddress.address2, district: comp.primaryAddress.district, city: comp.primaryAddress.city, state: comp.primaryAddress.state, country: comp.primaryAddress.country }
          }
          company = await companyService.add(newCompany);
          let member = _.find(members, {company: comp.id, userId: userId});

          if(!member){
            member = await memberService.addMember({
              createdBy: user.id,
              company: comp.id,
              userId: user.id,
              firstName: user.firstName,
              middleName: user.middleName,
              lastName: user.lastName,
              email: user.primaryEmail.value,
              phoneNumber: user.primaryPhone?user.primaryPhone.value:'',
              role: role
            });

          }
        }



      }
    }

  } catch(e){
    console.log('syncCompanies: Error', e);
  }

  res.json({success: true});
});

/************************** MANAGE SUBSCRIPTION *****************************/
const addSubscription = catchAsync(async (req, res) => {
  const {user, params, body} = req
  const {userId} = params;

  let subscription = null;
  try {
    let user = await userService.findByUserId(userId).populate('subscription');

    if(user) {
      body.defaultPaymentMethod = body.payment.paymentMethodId;
      body.createdBy = userId;
      body.trialDays = body.trialDays > 0 ? body.trialDays : user.subscription ? 0 : 14;
      subscription = await paymentService.addSubscription(body);
      if (subscription) {
        user.subscription = subscription.id;

        if (subscription.plan?.tier == 1) {
          user.credit = 30;
        } else if (subscription.plan?.tier == 2) {
          user.credit = 150;
        }

        await user.save();
      }
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Server Error');
  }

  res.json(subscription);
});
const getSubscription = catchAsync(async (req, res) => {
  const { params, files } = req;
  const {userId} = params;


  let subscription=null;
  try {

    let user = await userService.findByUserId(userId);
    if(user && user.subscription){
      subscription = await paymentService.getSubscriptionById(user.subscription);
    }

  } catch (error) {
    console.log(error);
  }
  res.json(subscription);
});
const updateSubscription = catchAsync(async (req, res) => {
  const { params, files } = req;
  const {userId} = params;


  let subscription;
  try {

    let user = await userService.findByUserId(userId).populate('subscription');
    console.log(user)
    subscription = await paymentService.getCustomerSubscriptions(user.customerId);

  } catch (error) {
    console.log(error);
  }

  res.json(subscription);
});
const cancelSubscription = catchAsync(async (req, res) => {
  const { params, files } = req;
  const {userId} = params;


  let subscription;
  try {

    let user = await userService.findByUserId(userId).populate('subscription');
    console.log(user)
    subscription = await paymentService.getCustomerSubscriptions(user.customerId);

  } catch (error) {
    console.log(error);
  }

  res.json(subscription);
});

const getUserDetail = catchAsync(async (req, res) => {
  const {user, params, query, headers} = req
  const {userId} = params;
  const locale = res.locale?res.locale : 'en';
  const currentUserId = parseInt(headers['userid'], 10);
  let result = null;
  try {

    let users = [];
    await feedService.findByUserId(currentUserId).then(async (response) => {
      if (response) {
        users.push(response);
      }
    });

    await feedService.findByUserId(userId).then(async (response) => {
      if (response) {
        users.push(response);
      }
    });

    let currentParty = _.find(users, {id: currentUserId});
    let foundUser = _.find(users, {id: userId});

    if(isPartyActive(currentParty) && isPartyActive(foundUser)) {

      const cacheKey = `user:${foundUser.id}`;
      result = await getFromCache(cacheKey);
      if(!result){
        console.log("Serving User data from Database");
        result = {}; // shouldn't this be result=foundUser

        //Skills-----------------------------------------------------
        let partySkills = await partySkillService.findTop3PartySkillsByUserId(foundUser.id);
        let skills = _.uniq(_.flatten(_.map(partySkills, 'skillTypeId')));
        let listOfSkills = await getListofSkills(_.uniq(_.flatten(_.map(partySkills, 'skillTypeId'))), locale);


        let partySkillIds = _.uniq(_.flatten(_.map(partySkills, 'partySkillId')));

        //Get Top 3 Skills Endorsed
        let top3SkillsEndorsement = await getTop3SkillsEndorsement(partySkillIds);
        let loadPromises = top3SkillsEndorsement.map(partySkillEndorsed => {
          let partySkill = _.find(partySkills, {partySkillId: partySkillEndorsed.partySkillId});
          let endorserIds = _.map(partySkillEndorsed.endorsers, 'endorserId');

          return partySkillService.getEndorsersHighlySkillBySkillTypeId(partySkill.skillTypeId, endorserIds)
        })
        let topEndorsers = await Promise.all(loadPromises);
        topEndorsers = _.reduce(topEndorsers, function(res, item){
          if(item.length>0){
            res.push(item[0])
          }

          return res;
        }, [])
        // Viet to check and fix the lines 389 - 392
        //topEndorsers = await populatePerson(topEndorsers);
        topEndorsers = await feedService.lookupUserIds(topEndorsers);
        let endorsementByCurrentUser = [];
        //let endorsementByCurrentUser = await partySkillService.findEndorsementsByEndorserIdAndListOfPartySkillIds(currentParty.id, partySkillIds);

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
        let userLanguages = await findByUserId(foundUser.id);
        userLanguages = _.reduce(userLanguages, function(res, item){
          res.push({language: ISO6391.getName(item.language), level: item.level});
          return res;
        }, []);
        result.languages = userLanguages;
        result.publications = await userPublicationService.findByUserId(userId);
        result.certificates = await findPartyCertificationByUserId(foundUser.id);
        result.certificates = await populateCompany(result.certificates);

         //Save to Cache
         await saveToCache(cacheKey, result);
      }else{
        console.log('Serving User data from cache');
        result = JSON.parse(result);
      }

    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);

})

/**
 * Upload User CV
 *
 * @param {HTTP} currentUserId
 * @param {HTTP} files
 */
const uploadResume = catchAsync(async (req, res) => {
  const {user, params, query, body, files} = req
  const {userId} = params;
  const {name} = body;
  const locale = res.locale?res.locale : 'en';

  console.log('name', name)
  let result = null;
  let basePath = 'user/';
  try {
    const currentParty = await feedService.findByUserId(userId);
    if(!currentParty) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    let user = await User.findOneAndUpdate({ userId },
      {userId: userId, firstName: currentParty.firstName, lastName: currentParty.lastName},
      {new: true,   upsert: true })

    console.log(user)
    let type;
    //------------Upload CV----------------

    if(files.file) {
          let cv = files.file[0];
          let fileName = name ? name.split('.') : cv.originalname.split('.');
          let fileExt = files.file[0].originalname.split('.').pop();
          // let date = new Date();
          let timestamp = Date.now();
          const resumeName = (!name) ? currentParty.firstName + '_' + currentParty.lastName + '_' + currentParty.id + '-' + timestamp + '.' + fileExt : name + '-' + timestamp + '.' + fileExt;
          let path = basePath + userId + '/_resumes/' + resumeName;
          let response = await upload(path, cv.path);
          switch (fileExt) {
            case 'pdf':
              type = 'PDF';
              break;
            case 'doc':
              type = 'WORD';
              break;
            case 'docx':
              type = 'WORD';
              break;

          }

          let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: userId});

          if(file){
            user.resumes = user.resumes?user.resumes:[];
            user.resumes.push(file._id);
            await user.save();
          }

          //Temporary commented out
          // await parserService.uploadJob(cv.path);
        }

  } catch (error) {
    console.log(error);
  }

  res.json(result);

})

const getUserExperiences = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;

  let result = [];
  try {
    const user = await userService.findByUserId(userId).populate('experiences');
    if(user && user.experiences){
      let employers = _.map(user.experiences, 'employer.id');
      if(employers.length){
        employers = await feedService.lookupCompaniesIds(employers);
      }
      user.experiences.forEach((exp) => {
        const found = _.find(employers, {id: exp.employer.id});
        exp.employer.avatar = found?.avatar;
      })
      result = user.experiences;
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);

});
const addUserExperience = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;

  let result;

  let user = await userService.findByUserId(userId);

  try {
    if(!user){
      const currentParty = await feedService.findByUserId(userId);
      if(!currentParty) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      const emails = currentParty.primaryEmail ? [currentParty.primaryEmail] : [];
      const phones = currentParty.primaryPhone ? [currentParty.primaryPhone] : [];
      user = await userService.add({
        userId: currentParty.id,
        firstName: currentParty.firstName,
        middleName: currentParty.middleName,
        lastName: currentParty.lastName,
        emails: emails,
        phones: phones
      });
    }

    const experience = await experienceService.add(body);
    if(experience){
      result = experience;
      user.experiences.push(experience);
      await user.save();

    }
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Request');
  }

  res.json(result);
});
const updateUserExperience = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, experienceId} = params;

  let result = null;
  try {
    const user = await userService.findByUserId(userId);
    const experience = await experienceService.findById(new ObjectId(experienceId));

    if (!experience) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Request');
    }

    const employer = _.pick(body.employer, ['id', 'name']);
    experience.employer = employer;
    experience.jobFunction = body.jobFunction;
    experience.fromDate = body.fromDate;
    experience.thruDate = body.thruDate;
    experience.employmentTitle = body.employmentTitle;
    experience.employmentType = body.employmentType;
    experience.terminationReason = body.terminationReason;
    experience.terminationType = body.terminationType;
    experience.isCurrent = body.isCurrent;
    experience.description = body.description;
    experience.city = body.city;
    experience.state = body.state;
    experience.country = body.country;
    result = await experience.save();



    //ToDo: Add salary data if user add it
    // const newSalaries = _.reduce(newSalaries, function(res, item){
    //   let exist = _.find(result, {fromDate: item.fromDate, thruDate: item.thruDate});
    //
    //   if(exist && item.salary){
    //     item.company=exist.company;
    //     res.push(item);
    //   }
    //   return res;
    // }, []);
    //
    // loadPromises = newSalaries.map(salary => addCompanySalary({baseSalary: salary.salary, yearsExperience: 0, jobFunction: 'DATA', employmentType: 'FULTIME', currency: 'USD', basePayPeriod: 'ANNUALLY', company: salary.company, employmentTitle: salary.employmentTitle, partyId: currentParty.id, city: salary.city, state: salary.state, country: salary.country}));
    // await Promise.all(loadPromises);
    //
    //
    //
    await deleteFromCache(`user:${userId}`);


  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const removeUserExperience = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, experienceId} = params;

  let result = null;
  try {
    const user = await userService.findByUserId(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Request');
    }

    const experience = await experienceService.remove(new ObjectId(experienceId));
    if(experience){
      user.experiences = _.reject(user.experiences, {_id: new ObjectId(experienceId)});
      await user.save();
    }


  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const getUserEducations = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;

  let result = [];
  try {
    const user = await userService.findByUserId(userId).populate({
      path: 'educations',
      model: 'Education',
      populate: [
        {
          path: 'fieldOfStudy',
          model: 'FieldStudy'
        }
      ]
    });

    if(user && user.educations){
      let institutes = _.map(user.educations, 'institute.id');
      if(institutes.length){
        institutes = await feedService.lookupInstituteIds(institutes);
      }
      user.educations.forEach((exp) => {
        const found = _.find(institutes, {id: exp.institute.id});
        exp.institute.avatar = found?.avatar;
        exp.institute.name = found?.name;
      })
      result = user.educations;
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);

});
const addUserEducation = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;

  let result;

  let user = await userService.findByUserId(userId);
  try {
    if(!user){
      const currentParty = await feedService.findByUserId(userId);
      if(!currentParty) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      const emails = currentParty.primaryEmail ? [currentParty.primaryEmail] : [];
      const phones = currentParty.primaryPhone ? [currentParty.primaryPhone] : [];
      user = await userService.add({
        userId: currentParty.id,
        firstName: currentParty.firstName,
        middleName: currentParty.middleName,
        lastName: currentParty.lastName,
        emails: emails,
        phones: phones
      });
    }

    const education = await educationService.add(body);
    if(education){
      result = education;
      user.educations.push(education);
      await user.save();

    }
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Request');
  }

  res.json(result);
});
const updateUserEducation = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, educationId} = params;

  let result = null;
  try {
    const user = await userService.findByUserId(userId);
    const education = await educationService.findById(new ObjectId(educationId));

    if (!education) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Request');
    }

    const institute = _.pick(body.institute, ['id', 'name']);
    education.institute = institute;
    education.degree = body.degree;
    education.fromDate = body.fromDate;
    education.thruDate = body.thruDate;
    education.fieldOfStudy = body.fieldOfStudy;
    education.gap = body.gpa;
    education.hasGraduated = body.hasGraduated;
    education.description = body.description;
    result = await education.save();
    await deleteFromCache(`user:${userId}`);
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});
const removeUserEducation = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, educationId} = params;

  let result = null;
  try {
    const user = await userService.findByUserId(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Request');
    }

    const education = await educationService.remove(new ObjectId(educationId));
    console.log(education)
    if(education){
      user.educations = _.reject(user.educations, {_id: new ObjectId(educationId)});
      await user.save();
    }


  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const getUserAccomplishments = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {userId} = params;

  const result = { };
  try {
      //Accomplishments-----------------------------------------------------
      let userLanguages = await userLanguageService.findByUserId(userId);

      userLanguages = _.reduce(userLanguages, function(res, item){
        res.push({name: ISO6391.getName(item.language), language: item.language, level: item.level});
        return res;
      }, []);
      result.languages = userLanguages;
      result.publications = await userPublicationService.findByUserId(userId);
      result.certificates = await findPartyCertificationByUserId(userId);
      // result.certificates = await populateCompany(result.certificates);
  } catch (error) {
    console.log(error);
  }

  res.json(result);

});

async function updateUserAccomplishments(currentUserId, data, locale) {

  if(currentUserId==null || data==null){
    return null;
  }

  locale = locale?locale: 'en';
  let result = null;
  try {
    let currentParty = await feedService.findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {

      result = {skills: [], languages: [], certificates: [], publications: []};
      let partySkills = data.skills;

      let certificates = data.certificates;
      let publications = data.publications;


      try {

        let languages = data.languages;
        languages = _.reduce(languages, function(res, item){
          res.push(ISO6391.getCode(item))
          return res;
        }, []);

        let currentPartyLanguage = await userLanguageService.findByUserId(userId);

        if(currentPartyLanguage){
          currentPartyLanguage.languages = languages;
          result.languages = currentPartyLanguage.save();
        } else {
          result.languages = await userLanguageService.add(currentParty.id, {partyId: currentParty.id, languages: languages});
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


// ToDo: remove
const updateUserSkills = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = null;
  try {
    let partySkills = data.skills;
    let user = await userService.findByUserId(userId);
    let currentSkills = await partySkillService.findPartySkillsByUserId(userId);
    let addSkills = [], updateSkills=[], deleteSkills=[], newSkills=[];

    if(user){
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

  res.json(result);
});

const getUserSkills = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {userId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = [];
  try {


    const user = await userService.findByUserId(userId).populate({
      path: 'skills',
      model: 'PartySkill',
      populate: {
        path: 'skill',
        model: 'Skill',
      }
    });

    user.skills = _.reduce(user.skills, function(res, ps) {

      const {skill, endorsements} = ps;
      ps.name = skill?.name;
      ps.noOfEndorsement = endorsements.length;
      delete ps.endorsements;
      res.push(ps);
      return res;
    }, []);

    result = _.orderBy(user.skills, ['endorsements'], ['desc']);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const getUserTopSkills = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {userId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = {topSkills: [], industrySkills: [], interpersonalSkills: [], toolAndTechnologySkills: [], otherSkills: []};
  try {


    const user = await userService.findByUserId(userId).populate({
      path: 'skills',
      model: 'PartySkill',
      populate: [
        {
          path: 'skill',
          model: 'Skill',
        },
        {
          path: 'endorsements',
          model: 'Endorsement',
        }
      ]
    });

    if(user) {
      user.skills = _.reduce(user.skills, function(res, ps) {
        const { skill, endorsements } = ps;
        ps.name = skill?.name;
        ps.hasEndorsed = _.some(endorsements, { endorserId: currentUserId });
        ps.noOfEndorsement = endorsements.length;
        ps.endorsements = [];
        res.push(ps);
        return res;
      }, []);

      user.skills = _.orderBy(user.skills, ['endorsements'], ['desc']);
      result = user.skills.splice(0, 3);
    }
    // result = await userService.getUserTopSkills(userId, currentUserId);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const getUserSkillList = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {userId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = [];
  try {


    // const user = await userService.findByUserId( userId).populate({
    //   path: 'skills',
    //   model: 'PartySkill',
    //   populate: [
    //     {
    //       path: 'skill',
    //       model: 'Skill',
    //     },
    //     {
    //       path: 'endorsements',
    //       model: 'Endorsement',
    //     }
    //   ]
    // });
    //
    // // let partySkills = await partySkillService.findPartySkillsByUserId(userId).populate('skill');
    // user.skills = _.reduce(user.skills, function(res, ps) {
    //
    //   const {skill, endorsements} = ps;
    //   ps.name = skill?.name;
    //   ps.noOfEndorsement = endorsements.length;
    //   delete ps.endorsements;
    //   res.push(ps);
    //   return res;
    // }, []);
    //
    // result = _.orderBy(user.skills, ['endorsements'], ['desc']);

    result = await partySkillService.getUserPartySkills(userId, currentUserId);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const addUserSkill = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;

  let result;

  const skill = await skillService.findById(new ObjectId(body.skill));
  if(!skill){
    throw new ApiError(httpStatus.NOT_FOUND, 'Skill not found');
  }

  try {
    let user = await userService.findByUserId(userId).populate('skills');
    if(!user){
      const currentParty = await feedService.findByUserId(userId);
      if(!currentParty){
        return res.status(500).send({success: false, error: 'Current user details not found in Feed'})
      }
      const emails = currentParty.primaryEmail ? [currentParty.primaryEmail] : [];
      const phones = currentParty.primaryPhone ? [currentParty.primaryPhone] : [];
      user = await userService.add({userId: currentParty.id, firstName: currentParty.firstName, middleName: currentParty.middleName, lastName: currentParty.lastName, emails: emails, phones: phones});
    }

    const partySkill = await partySkillService.findPartySkillByUserIdAndSkill(userId, new ObjectId(body.skill));
    if(partySkill){
      partySkill.noOfMonths = body.noOfMonths;
      partySkill.lastUpdatedDate = Date.now();
      result = await partySkill.save();


      if(!_.includes(user.skills, partySkill._id)){
        user.skills.push(partySkill._id);
        await user.save();
      }

    } else {
      body.partyId = userId;
      body.name = skill.name;
      result = await partySkillService.add(body);
      user.skills.push(result._id);
      await user.save();
    }

  } catch (error) {
    console.log(error);
    return res.status(500).send({success: false, error: 'Internal Server Error'});
  }

  res.json(result);
});

const updateUserSkillById = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, partySkillId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result;
  try {

    const partySkill = await partySkillService.findPartySkillById(partySkillId);
    if(partySkill && partySkill.partyId==currentUserId){

      partySkill.noOfMonths=body.noOfMonths;
      partySkill.selfRating=body.selfRating;
      result = await partySkill.save();
      await deleteFromCache(`user:${userId}`);
    }
  } catch (error) {
    console.log(error);
    return result;
  }

  res.json(result);
})

const removeUserSkillById = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {userId, partySkillId} = params;
  let currentUserId = parseInt(req.header('UserId'));
  let result;
  try {

    const user = await userService.findByUserId(userId).populate('skills');
    if(user && user.skills.length>0){
      console.log(user.skills);
      console.log(partySkillId);
      const newSkills = _.reject(user.skills, function(ps){
        return ps.partySkillId==partySkillId;
      });
      user.skills = newSkills;
      await user.save();
      result = {success: true}
    }


  } catch (error) {
    console.log(error);
  }

  res.json(result);
})

const getUserLanguages = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;

  let result = [];
  try {
    let userLanguages = await userLanguageService.findByUserId(userId);
    userLanguages = _.reduce(userLanguages, function(res, item){
      item.name = ISO6391.getName(item.language);
      res.push(item);
      return res;
    }, []);
    result = userLanguages;

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const addUserLanguage = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;

  let result = null;
  try {
    result = await userLanguageService.add({...body, userId});
    result.name = ISO6391.getName(result.language);
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const removeUserLanguage = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {userId, language} = params;

  let result = { succcess: false };
  try {
    const data = await userLanguageService.removeByUserIdAndLanguage(userId, language);
    if(data && data.deletedCount!=0){
      result = { success: true };
    }
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const addEndorsement = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, partySkillId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result;
  try {

    let currentParty = await feedService.findByUserId(currentUserId);

    if (isPartyActive(currentParty)) {
      let user = await userService.findByUserId(userId);
      const partySkill = await partySkillService.findById(new ObjectId(partySkillId));
      if(partySkill && partySkill.partyId!=currentParty.id){

        let foundEndorsement = await endorsementService.findEndorsementByEndorserIdAndPartySkillId(currentUserId, new ObjectId(partySkillId));
        let endorser = await userService.findByUserId(currentUserId);

        if(!endorser){
          const emails = currentParty.primaryEmail ? [currentParty.primaryEmail] : [];
          const phones = currentParty.primaryPhone ? [currentParty.primaryPhone] : [];
          endorser = await userService.add({user_id: currentParty.id, first_name: currentParty.firstName, middle_name: currentParty.middleName, last_name: currentParty.lastName, emails: emails, phones: phones});
        }

        if(_.includes(endorser.highly_skills, partySkill.name)){
          body.isHighlySkilledEndorser = true;
          partySkill.highlySkilledEndorsers.push(endorser._id)
        }

        if(foundEndorsement){
          foundEndorsement.isHighlySkilledEndorser = body.isHighlySkilledEndorser;
          foundEndorsement.rating = body.rating;
          foundEndorsement.relationship = body.relationship;
          foundEndorsement.lastUpdatedDate = Date.now();
          result = await foundEndorsement.save();

          partySkill.noOfHighlySkillEndorsers = foundEndorsement.isHighlySkilledEndorser? ++partySkill.noOfHighlySkillEndorsers : partySkill.noOfHighlySkillEndorsers;
        } else {

          body.partySkill = new ObjectId(partySkillId);
          body.endorser = endorser._id;
          body.endorserId = currentUserId;
          result = await endorsementService.add(body);

          partySkill.noOfHighlySkillEndorsers = body.isHighlySkilledEndorser? ++partySkill.noOfHighlySkillEndorsers : partySkill.noOfHighlySkillEndorsers;
          partySkill.endorsements.push(result);

        }

        await partySkill.save();

        if(result){
          // let endorsementCount = await endorsementService.getEndorsementCount([result.partySkillId]);
          // partySkill.averageEndorsedRating = endorsementCount[0].averageEndorsedRating;
          // await partySkill.save();
        }

      }

    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const removeEndorsement = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, partySkillId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result;
  try {

    const partySkill = await partySkillService.findById(new ObjectId(partySkillId));
    if(partySkill){
      let foundEndorsement = await findEndorsementByEndorserIdAndPartySkillId(currentUserId, partySkill._id);
      if(foundEndorsement){
        let deleted = await foundEndorsement.remove();

        if(deleted){
          result = {status: statusEnum.DELETED};
          let index = _.indexOf(partySkill.endorsements, deleted._id);
          partySkill.endorsements.splice(index, 1);
          await partySkill.save();
        }
      }
    }

  } catch (error) {
    console.log(error);
    return result;
  }

  res.json(result);
});


const getEndorsementsByPartySkill = catchAsync(async (req, res) => {
  const { params, query, locale } = req;
  const {userId, partySkillId} = params;

  let result = null;
  let partySkill = await partySkillService.findPartySkillById(partySkillId, query);
  if (!partySkill) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }

  try {
    let count = partySkill.endorsements.length;
    let page = query.page;
    let size = query.size;
    let skip = query.size * query.page;

    partySkill = await PartySKill.findOne({ partySkillId }).populate([
      {
        path: 'endorsements',
        model: 'Endorsement',
        options: {
          sort: { createdDate: 1 },
          skip: skip,
          limit: size
        },
        populate: [
          {
            path: 'endorser',
            model: 'User'
          }
        ]
      }
    ]);

    console.log(partySkill)
    let totalCount = partySkill.endorsements.length;

    // partySkill = Endorsement.populate(partySkill, {path: 'endorsements', model: 'Endorsement'});
    let endorsements = partySkill.endorsements;

    let endorsers = _.map(endorsements, 'endorser.userId');
    endorsers = await feedService.lookupUserIds(_.map(endorsers, 'id'));
    console.log(endorsers)

    // let employments = await findListOfPartyEmploymentTitle(_.map(endorsers, 'id'));

    endorsements = _.reduce(endorsements, function(res, item) {
      let user = _.find(endorsers, { id: item.endorser });
      // let employment = _.find(employments, { id: user.id });
      item.endorser.headline = (user && user.headline) ? user.headline : user?.job_title;
      item.endorser.emails = [];
      item.endorser.phones = [];
      item.endorser.preferences = null;
      res.push(item);
      return res;
    }, []);

    result = new CustomPagination({ count: count, result: endorsements }, query, locale);


  } catch (error) {
    console.log(error);
  }

  res.json(result);

});

//
// const getUserResume = catchAsync(async (req, res) => {
//   const { query, body, locale } = req;
//   let currentUserId = parseInt(req.header('UserId'));
//
//   let result = null;
//   try {
//     const people = new People(peopleData[0]);
//     result = people.transform();
//   } catch (error) {
//     console.log(error);
//   }
//
//   res.json(result);
//
// })

const getUserResumesFiles = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, resumeId} = params;


  let result = null;
  try {
    result = await userService.getUserLast5Resumes(userId);
    console.log('result', result)
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const downloadResume = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, fileName} = params;

  let result = null;
  try {
    let people = new People(peopleData[0]);
    people = people.transform();
    let stream = await Resume.generateResume(people);
    res.setHeader('Content-Type', 'application/pdf');
    // stream.pipe(res);
    // stream.on('error', async (err) => {
    //   res.setHeader('Content-Type', 'text/plain');
    //   res.status(404).end('Not Found')
    //   console.log(`error...........`, err);
    // });../templates/
    // stream.on('end', () => console.log('Done streaming, response sent.'));
    const fileName = `${people.firstName.toLowerCase()}_${people.lastName.toLowerCase()}.pdf`
    const directoryPath = __basedir + '/templates/';

    res.sendFile(directoryPath + fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });

  } catch (error) {
    console.log(error);
  }

  // res.json(null);
});


const setResumeDefault = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, resumeId} = params;

  let result = null;
  try {
    result = await updateResumeDefault(userId, resumeId);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});


const getUserResumes = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, resumeId} = params;

  let result = null;
  try {
    result = await userResumeService.findByUserId(userId).populate([
      {
        path: 'template',
        model: 'UserResumeTemplate',
        populate: {
          path: 'template',
          model: 'ResumeTemplate'
        }
      }
    ]);
    result = _.reduce(result, function(res, item){
      const temp = _.pick(item, ['_id', 'name', 'template', 'createdAt', 'updatedAt', 'template']);
      const {_id, name, image} = item.template.template;
      res.push({...temp, template: { template: { _id, name, image}}});
      return res;
    }, []);
  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const getUserResume = catchAsync(async (req, res) => {
  const { params, locale } = req;
  const {resumeId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = null;
  try {
    result = await userResumeService.findById(resumeId).populate('template');
  } catch (error) {
    console.log(error);
  }

  res.json(result);

})


const addUserResume = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = null, resume;
  try {
      body.userId = userId;
      body.template = new ObjectId(body.template);
      result = await userResumeService.add(body);
      console.log(result);
  } catch (error) {
    console.log(error);
  }

  res.json(result);

})

const updateUserResume = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, resumeId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = null, userResume;
  try {
    userResume = await userResumeService.findById(resumeId);
    if(userResume){
      userResume.resume = userResume.resume?userResume.resume:{};
      userResume.resume.firstName = body.firstName;
      userResume.resume.middleName = body.middleName;
      userResume.resume.lastName = body.lastName;
      userResume.resume.jobTitle = body.jobTitle;
      userResume.resume.summary = body.summary;
      userResume.resume.email = body.email;
      userResume.resume.phone = body.phone;
      userResume.resume.experiences = body.experiences;
      userResume.resume.educations = body.educations;
      userResume.resume.skills = body.skills;
      userResume.resume.languages = body.languages;
      userResume.resume.courses = body.courses;
      userResume.resume.hobbies = body.hobbies;
      userResume.resume.extraCurricularActivities = body.extraCurricularActivities;
      userResume.resume.references = body.references;
      userResume.resume.links = body.links;
      userResume = await userResume.save();
      result = userResume;
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);

})


const deleteUserResume = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, resumeId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = null;
  try {
    const deleted = await userResumeService.removeById(resumeId);
    if(deleted && deleted.deletedCount===1){
      result = { _id: resumeId };
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);

})

const updateUserResumeName = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId, resumeId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = null, userResume;
  try {
    userResume = await userResumeService.findById(resumeId);
    if(userResume){
      userResume.name = body.name;
      userResume = await userResume.save();
      result = userResume;
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);

})

const getUserResumeTemplates = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;

  let result = [];
  try {
    result = await userResumeService.findByUserId(userId);
  } catch (error) {
    console.log(error);
  }

  res.json(result);

})
const updateUserResumeTemplate = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {resumeId, templateId} = params;
  let currentUserId = parseInt(req.header('UserId'));

  let result = null, template;
  try {
    body.template = new ObjectId(body.template);
    template = await userResumeService.updateTemplate(resumeId, templateId, body);
    console.log(template)
    result = {success: true};
  } catch (error) {
    console.log(error);
  }

  res.json(result);

})

const getApplications = catchAsync(async (req, res) => {
  const { params, query, body, locale } = req;
  const {userId} = params
  let currentUserId = parseInt(req.header('UserId'));

  if(!currentUserId || !body){
    return null;
  }

  let result = null;
  try {

    let select = '';
    let limit = (query.size && query.size > 0) ? query.size : 20;
    let page = (query.page && query.page == 0) ? query.page : 1;
    let sortBy = {};
    query.sortBy = (query.sortBy) ? query.sortBy : 'createdDate';
    query.direction = (query.direction && query.direction=="ASC") ? "ASC" : 'DESC';
    sortBy[query.sortBy] = (query.direction == "DESC") ? -1 : 1;

    let options = {
      select: select,
      sort: sortBy,
      lean: true,
      limit: limit,
      page: parseInt(query.page) + 1
    };

    const aggregate = Application.aggregate([
      {$match: {partyId: userId}},
      {$lookup:{
          from:"jobrequisitions",
          let:{job: '$job'},
          pipeline:[
            {$match:{$expr:{$eq:["$$job","$_id"]}}},
            {
              $lookup: {
                from: 'companies',
                localField: "company",
                foreignField: "_id",
                as: "company"
              }
            },
            { $unwind: '$company' }
          ],
          as: 'job'
        }},
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
      // { $lookup: {from: 'candidates', localField: 'user', foreignField: '_id', as: 'user' } },
      // { $unwind: '$user'},
      // { $match: {'user.userId': currentUserId}}
    ]);

    result = await Application.aggregatePaginate(aggregate, options);
    // let foundCompanies = await feedService.lookupCompaniesIds(_.reduce(result.docs, function(res, i){ res.push(i.job.company.companyId); return res;},  []));
    let hasSaves = await bookmarkService.findBookByPartyId(userId);

    _.forEach(result.docs, function(application, idx) {
      application.job.hasSaved = _.some(hasSaves, {job: application.job?._id});
      application.job.company = convertToCompany(application.job?.company);
      application.job = jobMinimal(application.job);

    })

  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});


const getApplicationList = catchAsync(async (req, res) => {
  const { query, locale } = req;
  let currentUserId = parseInt(req.header('UserId'));

  if(!currentUserId){
    return null;
  }

  console.log('getApplicationList', currentUserId)
  let result = [];
  try {

    result = await Application.aggregate([
      {$match: {partyId: currentUserId}},
      {$project: {_id: 1, status: 1, job: 1, jobTitle: 1, createdDate: 1, currentProgress: 1}}
    ]);

  } catch (error) {
    console.log(error);
  }

  res.json(result);

});

const getBookmarks = catchAsync(async (req, res) => {
  const { query, body, locale } = req;
  const currentUserId = parseInt(req.header('UserId'));

  let result = null;
  try {


    result = await bookmarkService.findBookByPartyId(currentUserId, query);
    result.docs = _.reduce(result.docs, function(res, bookmark){
      bookmark.job.hasSaved = true;
      bookmark.job.company = new Company(bookmark.job.company);
      bookmark.job.impression = new JobImpression(bookmark.job.impression);
      bookmark.job = new JobRequisition(bookmark.job).minimal();
      res.push(bookmark);
      return res;
    }, []);

    // result.docs = jobs;


  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));

});

const getAlerts = catchAsync(async (req, res) => {
  const { query, body, locale } = req;
  const currentUserId = parseInt(req.header('UserId'));

  let result = null;
  try {

    let select = '';
    let limit = (query.size && query.size > 0) ? query.size : 20;
    let page = (query.page && query.page == 0) ? query.page : 1;
    let sortBy = {};
    query.sortBy = (query.sortyBy) ? query.sortyBy : 'createdDate';
    query.direction = (query.direction && query.direction=="ASC") ? "ASC" : 'DESC';
    sortBy[query.sortBy] = (query.direction == "DESC") ? -1 : 1;

    let options = {
      select: select,
      sort: sortBy,
      lean: true,
      limit: limit,
      page: parseInt(query.page) + 1
    };

    query.partyId=currentUserId;

    result = await JobAlert.paginate(new SearchParam(query), options);

    let companyIds = _.map(result.docs, 'company');
    let foundCompanies = await feedService.searchCompany('', companyIds, currentUserId);

    // _.forEach(result.docs, function(alert) {
    //   alert.company = _.find(foundCompanies, {id: alert.company});
    //
    //   alert.noJobs = await getAlertCount(filter);
    // })

    // const loadPromises = result.docs.map(alert => getJobCount(alert));
    // let count = await Promise.all(loadPromises);

    _.forEach(result.docs, function(alert, idx) {
      // alert.company = _.find(foundCompanies, {id: alert.company});

      // alert.noJobs = count[idx];
    })

  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
});


const addUserAlert = catchAsync(async (req, res) => {
  const { params, body, locale } = req;
  const {userId} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result;
  try {

    body.partyId = userId;
    result = await jobAlertService.add(body);

  } catch (error) {
    console.log(error);
    return result;
  }

  res.json(result);
});


const removeUserAlert = catchAsync(async (req, res) => {
  const { query, params, locale } = req;
  const {userId, alertId} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let result;
  try {
    let found = await jobAlertService.findById(new ObjectId(alertId));
    if(!found){
      return res.status(400).send({success: false, error: 'Alert not found'});
    }
    result = await jobAlertService.removeAlertById(found._id);

    res.json({success: true})

  } catch (error) {
    console.log(error);
    return res.status(500).send({success: false, error: 'Internal Server Error'});
  }
});

const updateUserAlert = catchAsync(async (req, res) => {
  const { params, query, body, locale } = req;
  const {userId, alertId} = params;
  const currentUserId = parseInt(req.header('UserId'));

  let alert;
  try {
    alert = await jobAlertService.findJobAlertById(alertId);
    if(alert){
      alert.title = alert.title?alert.title:found.title;
      alert.company = alert.company?alert.company:found.company;
      alert.companySize = alert.companySize?alert.companySize:found.companySize;
      alert.distance = alert.distance?alert.distance:found.distance;
      alert.employmentType = alert.employmentType?alert.employmentType:found.employmentType;
      alert.city = alert.city?alert.city:found.city;
      alert.state = alert.state?alert.state:found.state;
      alert.country = alert.country?alert.country:found.country;
      alert.repeat = alert.repeat?alert.repeat:found.repeat;
      alert.industry = alert.industry?alert.industry:found.industry;
      alert.notification = alert.notification?alert.notification:found.notification;
      alert.remote = alert.remote?alert.remote:false;
      alert.level = alert.level?alert.level:found.level;
      alert.jobFunction = alert.jobFunction?alert.jobFunction:found.jobFunction;

      alert.status = alert.status?alert.status : alert.status;

      alert = await alert.save();

    }

  } catch (error) {
    console.log(error);
    return result;
  }

  res.json(alert);
});


const getJobViews = catchAsync(async (req, res) => {
  const { params, query } = req;
  const {userId} = params;
  const currentUserId = parseInt(req.header('UserId'));

  if(parseInt(currentUserId) != parseInt(userId)){
    res.status(400).send({success: false, error: 'UserId in header and URL does not match'});
  }
  try {
    let limit = (query.size && query.size > 0) ? parseInt(query.size) : 20;
    let page = (query.page && parseInt(query.page)>0) ? parseInt(query.page)+1:1;
    let sortBy = query.sortBy ? query.sortBy : 'createdDate';
    let direction = (query.direction && query.direction.toUpperCase() === 'ASC') ? 1 : -1;

    let options = {
      sort: { [sortBy]: direction },
      lean: true,
      limit: limit,
      page: page
    };

    const result = await userImpressionService.findUniqueJobsViewedByUserId(userId, options);

    result.docs = result.docs.map(view => {
      view.job.company = convertToCompany(view.job.company);
      view.job = jobMinimal(view.job);
      return view;
    });

    res.json(new Pagination(result));
  } catch (error) {
    console.log(error);
    res.status(500).send({success: false, error: 'An error occurred while fetching job views'});
  }
});

const getUserPublications = catchAsync(async (req, res) => {
  const { params, query } = req;
  const {userId} = params;

  let result = null;
  try {
    result = await userPublicationService.findByUserId(userId);

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const addUserPublication = catchAsync(async (req, res) => {
  const { params, body } = req;
  const {userId} = params;

  let result;
  try {
      result = await userPublicationService.add({...body, userId});
  } catch (error) {
    console.log(error);
    return result;
  }

  res.json(result);
});

const updateUserPublication = catchAsync(async (req, res) => {
  const { params, query } = req;
  const {userId, publicationId} = params;

  let result = null;
  try {


      let newPublications = [], updatePublications=[], deletePublications=[];
      let publications = data.publications;

      let currentPublications = await userPublicationService.findByUserId(userId);
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




  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const removeUserPublication = catchAsync(async (req, res) => {
  const { params, query } = req;
  const {userId, publicationId} = params;

  let result = { success: false };
  try {
    const data = await userPublicationService.removeById(new ObjectId(publicationId));
    if(data && data.deletedCount!=0){
      result = { success: true };
    }
  } catch (error) {
    console.log(error);
    return result;
  }

  res.json(result);
});


async function getPartyCertifications(currentUserId) {

  if(currentUserId==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await feedService.findByUserId(currentUserId);

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

    let currentParty = await feedService.findByUserId(currentUserId);

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
    let currentParty = await feedService.findByUserId(currentUserId);

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

  let employers = await feedService.getUserEmployers(currenterUserid, locale);
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


const getJobPreferences = catchAsync(async (req, res) => {
  const { params, body} = req;
  const {userId} = params;

  const result = await userService.getJobPreferences(userId);
  res.json(result);
});


const updateJobPreferences = catchAsync(async (req, res) => {
  const { params, body} = req;
  const {userId} = params;

  const result = await userService.updateJobPreferences(userId, body);
  await deleteFromCache(`user:${userId}`);
  res.json(result);
});

/************************** User Evaluations *****************************/
const getUserEvaluations = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {companyId, id} = params;

  let result;
  try {
    body.applicationId = body.applicationId ? new ObjectId(body.applicationId): null;
    result = await evaluationService.filterByUser(new ObjectId(id), body, query);



    // let userIds = _.reduce(result.docs, function(res, item){res.push(item.createdBy.userId); return res;}, []);
    // let users = await feedService.lookupUserIds(userIds);
    //
    // result.docs.forEach(function(evaluation){
    //   let found = _.find(users, {id: evaluation.createdBy.userId});
    //   if(found){
    //     evaluation.createdBy.avatar = found.avatar;
    //   }
    //   evaluation.createdBy.followJobs = [];
    //
    // });

    result.docs.forEach(function(evaluation){
      const member = Member(evaluation.createdBy);
      evaluation.createdBy = member.transform();
    });

  } catch (error) {
    console.log(error);
  }

  res.json(new Pagination(result));
})

//
const getUserEvaluationsStats = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {id} = params;
  let result = {
    internal: {},
    external: {},
    noOfEvaluations: 0,
    rating: null
  };
  console.log('getstats')
  try {
    body.applicationId = body.applicationId ? new ObjectId(body.applicationId): null;
    const stats  = await evaluationService.getUserEvaluationsStats(new ObjectId(id), body);

    if(stats){
      result = stats;
    }

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const getUserEvaluationById = catchAsync(async (req, res) => {
  const {user, params, body, query} = req;
  const {id, evaluationId} = params;

  let result;
  try {
    result = await evaluationService.findById(new ObjectId(evaluationId));
    result.createdBy = result.createdBy.transform();

  } catch (error) {
    console.log(error);
  }
  res.json(result);
});

module.exports = {
  register,
  sync,
  syncCompanies,
  getSubscription,
  addSubscription,
  updateSubscription,
  getUserDetail,
  uploadResume,
  getUserExperiences,
  addUserExperience,
  updateUserExperience,
  removeUserExperience,
  getUserEducations,
  addUserEducation,
  updateUserEducation,
  removeUserEducation,
  getUserAccomplishments,
  updateUserAccomplishments,
  addUserSkill,
  updateUserSkillById,
  removeUserSkillById,
  updateUserSkills,
  getUserTopSkills,
  getUserSkillList,
  getUserSkills,
  getUserLanguages,
  addUserLanguage,
  removeUserLanguage,
  getEndorsementsByPartySkill,
  addEndorsement,
  removeEndorsement,
  getUserResumesFiles,
  downloadResume,
  setResumeDefault,
  getUserResumes,
  getUserResume,
  addUserResume,
  updateUserResume,
  deleteUserResume,
  updateUserResumeName,
  getUserResumeTemplates,
  updateUserResumeTemplate,
  getApplications,
  getApplicationList,
  getBookmarks,
  getAlerts,
  addUserAlert,
  removeUserAlert,
  updateUserAlert,
  getJobViews,
  getUserPublications,
  addUserPublication,
  updateUserPublication,
  removeUserPublication,
  getPartyCertifications,
  addPartyCertification,
  updatePartyCertifications,
  getUserEmployersJobs,
  getJobPreferences,
  updateJobPreferences,
  getUserEvaluations,
  getUserEvaluationsStats,
  getUserEvaluationById
}
