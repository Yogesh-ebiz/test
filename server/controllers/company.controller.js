const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/job.pagination');
let SearchParam = require('../const/searchParam');
const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
let employmentTypeEnum = require('../const/employmentTypeEnum');

const {convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');

const {getUserExperienceById, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findUserByIdFull, findCompanyById, searchUsers, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');
const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populatePerson} = require('../services/party.service');
const {findListOfPartyEmploymentTitle} = require('../services/partyemployment.service');
const {findCompanyReviewReactionByPartyId, addCompanyReviewReaction} = require('../services/companyreviewreaction.service');
const {findCurrencyRate} = require('../services/currency.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getGroupOfCompanyJobs} = require('../services/jobrequisition.service');
const {getDepartments, addDepartment} = require('../services/department.service');
const {getPipelines, addPipeline} = require('../services/pipeline.service');
const companyService = require('../services/company.service');
const roleService = require('../services/role.service');
const labelService = require('../services/label.service');


const {addCompanySalary, findCompanySalaryByEmploymentTitle, findEmploymentTitlesCountByCompanyId, findSalariesByCompanyId, addCompanyReview,
  findCompanyReviewHistoryByCompanyId, addCompanyReviewReport, findAllCompanySalaryLocations, findAllCompanyReviewLocations, findAllCompanySalaryEmploymentTitles, findAllCompanySalaryJobFunctions, findTop3Highlights} = require('../services/company.service');
const {findBookById, addBookById, removeBookById, findBookByUserId, findMostBookmarked} = require('../services/bookmark.service');
const memberService = require('../services/member.service');


const JobRequisition = require('../models/jobrequisition.model');
const CompanyReview = require('../models/companyreview.model');
// const CompanyReviewReport = require('../models/companyreviewreport.model');
const CompanyReviewReaction = require('../models/companyreviewreaction.model');
const Department = require('../models/department.model');
const Pipeline = require('../models/pipeline.model');
const Role = require('../models/role.model');
const Label = require('../models/label.model');


const salarySchema = Joi.object({
  partyId: Joi.number().required(),
  company: Joi.number().required(),
  employmentTitle: Joi.string().required(),
  employmentType: Joi.string().required(),
  jobFunction: Joi.string().required(),
  yearsExperience: Joi.number().optional(),
  currency: Joi.string().required(),
  basePayPeriod: Joi.string().required(),
  baseSalary: Joi.number().required(),
  additionalIncome: Joi.number(),
  cashBonus: Joi.number(),
  stockBonus: Joi.number(),
  profitSharing: Joi.number(),
  tip: Joi.number(),
  commision: Joi.number(),
  gender: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string()
})


const reviewSchema = Joi.object({
  user: Joi.number().required(),
  company: Joi.number().required(),
  employmentTitle: Joi.string().allow('').optional(),
  rating: Joi.number().required(),
  employmentType: Joi.string().required(),
  recommendCompany: Joi.boolean().required(),
  approveCEO: Joi.boolean(),
  isCurrentEmployee: Joi.boolean(),
  reviewTitle: Joi.string(),
  pros: Joi.array(),
  cons: Joi.array(),
  advices: Joi.array(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional()
})

const companyReviewReportSchema = Joi.object({
  companyReviewId: Joi.number().required(),
  partyId: Joi.number().required(),
  isAnonymous: Joi.boolean(),
  reason: Joi.string().required(),
  note: Joi.string().allow('')
});

const companyReviewReactionSchema = Joi.object({
  company: Joi.number().required(),
  companyReviewId: Joi.number().required(),
  partyId: Joi.number().required(),
  reactionType: Joi.string().required()
});

const departmentSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.number().required(),
  createdBy: Joi.number().required()
});

const pipelineSchema = Joi.object({
  name: Joi.string().required(),
  department: Joi.number().required(),
  category: Joi.string().required(),
  company: Joi.number().required(),
  stages: Joi.array().required(),
  createdBy: Joi.number()
});

const roleSchema = Joi.object({
  name: Joi.string().required(),
  createdBy: Joi.number().required(),
  company: Joi.number().required(),
  description: Joi.object().required(),
  privileges: Joi.array().required(),
  default: Joi.boolean()
});

const labelSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  company: Joi.number().required()
});



module.exports = {
  sync,
  register,
  getCompanyJobs,
  addNewSalary,
  getCompanySalaries,
  getCompanySalaryByEmploymentTitle,
  getCompanySalaryLocations,
  getCompanySalaryEmploymentTitles,
  getCompanySalaryJobFunctions,
  addNewReview,
  getCompanyReviewStats,
  getCompanyReviews,
  getCompanyReviewLocations,
  reportCompanyReviewById,
  reactionToCompanyReviewById,
  removeReactionToCompanyReviewById,
  addCompanyDepartment,
  updateCompanyDepartment,
  deleteCompanyDepartment,
  getCompanyDepartments,
  addCompanyPipeline,
  updateCompanyPipeline,
  deleteCompanyPipeline,
  getCompanyPipelines,
  addCompanyRole,
  getCompanyRoles,
  updateCompanyRole,
  deleteCompanyRole,
  addCompanyLabel,
  getCompanyLabels,
  updateCompanyLabel,
  deleteCompanyLabel,


}


async function sync(form) {
  if(!form){
    return null;
  }

  let result;
  try {
    let company = await companyService.findByCompanyId(form.id);
    if(company){
      company.avatar = form.avatar;
      company.name = form.name;
    } else {
      let user = await feedService.lookupPeopleIds([form.createdBy]);
      let role = await roleService.getAdminRole();
      if(user && company) {
        let company = await new Company({
          name: form.name,
          companyId: form.id,
          createdBy: form.createdBy,
          email: user[0].primaryEmail ? user[0].primaryEmail.value : '',
          primaryAddress: {
            address1: form.primaryAddress.address1,
            address2: form.primaryAddress.address2,
            district: form.primaryAddress.district,
            city: form.primaryAddress.city,
            state: form.primaryAddress.state,
            country: form.primaryAddress.country
          }
        }).save();

        let member = memberService.addMember({
          company: form.id,
          userId: user.id,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          email: user.primaryEmail.value,
          phone: user.primaryPhone?user.primaryPhone.value:'',
          role: role
        });
        
      }
    }
  } catch(e){
    console.log('sync: Error', e);
  }


  return result;

}

async function register(currentUserId, form) {

  if(!currentUserId || !form){
    return null;
  }

  let currentParty = await findUserByIdFull(currentUserId);

  let company;
  try {
    if (isPartyActive(currentParty)) {
      company = await companyService.register(currentParty, form);
    }
  } catch(e){
    console.log('register: Error', e);
  }


  return company;

}

async function getCompanyJobs(currentUserId, companyId, filter, sort, locale) {

  if(!companyId || !filter || !sort){
    return null;
  }
  let company = await companyService.findByCompanyId(companyId);
  let foundJob = null;
  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  filter.company = [company._id];
  filter.status = [statusEnum.ACTIVE];

  let aList = [];
  let aMatch = { $match: new SearchParam(filter)};
  let aSort = { $sort: {createdDate: direction} };
  aList.push(aMatch);

  aList.push(
    {
      $lookup: {
        from: 'companies',
        localField: "company",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: '$company'}
  );


  if(sort && sort.sortBy=='popular'){
    aSort = { $sort: { noOfViews: direction} };
    aList.push(aSort);
  } else {
    aList.push(aSort);
  }

  const aggregate = JobRequisition.aggregate(aList);
  let result = await JobRequisition.aggregatePaginate(aggregate, options);
  let docs = [];

  // let skills = _.uniq(_.flatten(_.map(result.docs, 'skills')));
  // let listOfSkills = await findSkillsById(skills, locale);
  let employmentTypes = await getEmploymentTypes(_.uniq(_.map(result.docs, 'employmentType')), locale);
  let experienceLevels = await getExperienceLevels(_.uniq(_.map(result.docs, 'level')), locale);
  // let industries = await findIndustry('', _.uniq(_.flatten(_.map(result.docs, 'industry'))), locale);
  // let promotions = await getPromotions(_.uniq(_.flatten(_.map(result.docs, 'promotion'))), locale);

  let foundCompanies = await feedService.lookupCompaniesIds(_.reduce(result.docs, function(res, i){ res.push(i.company.companyId); return res;},  []));

  let hasSaves = [];

  if(currentUserId){
    hasSaves=await findBookByUserId(currentUserId);
  }


  _.forEach(result.docs, function(job){
    job.hasSaved = _.includes(_.map(hasSaves, 'jobId'), job.jobId);
    job.company = convertToCompany(_.find(foundCompanies, {id: job.company.companyId}));
    job.employmentType = _.find(employmentTypes, {shortCode: job.employmentType});
    job.level = _.find(experienceLevels, {shortCode: job.level});

    job.shareUrl = 'https://www.anymay.com/jobs/'+job.jobId;
    job.skills=[];
    job.industry=[];
    job.members=[];
    job.responsibilities=[];
    job.qualifications = [];
    job.minimumQualifications=[];
    job.applicationForm=null;
    job.description = null;
    job.isHot = false;
  })

  return new Pagination(result);

}

async function addNewSalary(currentUserId, salary) {
  salary = await Joi.validate(salary, salarySchema, { abortEarly: false });
  if(currentUserId==null || salary==null){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await addCompanySalary(salary);
    }
  } catch(e){
    console.log('addNewSalary: Error', e);
  }


  return result
}

async function getCompanySalaries(currentUserId, filter, locale) {
  if(currentUserId==null || filter==null){
    return null;
  }

  let result = null;
  try {
    let currentParty = await findByUserId(currentUserId);


    if (isPartyActive(currentParty)) {
      let total = await findEmploymentTitlesCountByCompanyId(filter);
      result = await findSalariesByCompanyId(filter);

      let listOfCurrencies = _.reduce(result, function(res, item){
        let preferredCurrency = currentParty.preferredCurrency?currentParty.preferredCurrency:'USD';
        res.push({src: item.currency, target: preferredCurrency});
        return res;
      }, []);

      // let currencies = await findCurrencyRate(currentParty.preferredCurrency);
      let loadCurrencies = listOfCurrencies.map(currency => findCurrencyRate(currency.src, currency.target));
      let currencies = await Promise.all(loadCurrencies);

      result = _.reduce(result, function (res, item) {
        let currency = _.find(currencies, {currency: item.currency+currentParty.preferredCurrency});
        let avgBaseSalary = 0;

        /* temporary commenting out
        switch (item.basePayPeriod){
          case 'ANNUALLY':
            avgBaseSalary = item.avgBaseSalary * currency.rate;
            break;
          case 'MONTHLY':
            avgBaseSalary = item.avgBaseSalary * currency.rate;
            break;
          case 'WEEKLY':
            avgBaseSalary = item.avgBaseSalary * currency.rate;
            break;
        }
        */

        item.hasLiked = false;
        item.avgBaseSalary = avgBaseSalary //Math.floor(item.avgBaseSalary * currency.rate, 0);
        item.displayCurrency = currentParty.preferredCurrency;

        res.push(item);
        return res;
      }, [])

      let pagination = new CustomPagination({count: total, result: result}, filter, locale);
      result = pagination;
    }
  } catch (e) {
    console.log('getCompanySalaries: Error', e);
  }

  return result;
}

async function getCompanySalaryByEmploymentTitle(currentUserId, companyId, employmentTitle, country) {

  if(currentUserId==null || companyId==null || employmentTitle==null || country==null){
    return null;
  }

  let result = null;
  try {

    result = await findCompanySalaryByEmploymentTitle(companyId, employmentTitle, country);
    result.shareUrl = 'http://www.accessed.com/company/' + companyId + '/salary/' + employmentTitle.replace(' ', '-');

  } catch (e) {
    console.log('Error: getCompanySalaryByEmploymentTitle', e)
  }
  return result;
}

async function getCompanySalaryLocations(currentUserId, companyId) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let result = null;
  try {

    result = await findAllCompanySalaryLocations(companyId);


  } catch (e) {
    console.log('Error: getCompanySalaryLocations', e)
  }
  return result;
}

async function getCompanySalaryEmploymentTitles(currentUserId, companyId) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let result = null;
  try {

    result = await findAllCompanySalaryEmploymentTitles(companyId);
    result = _.reduce(result, function(res, item){
      res.push(item.employmentTitle);
      return res;
    }, []);

  } catch (e) {
    console.log('Error: getCompanySalaryEmploymentTitles', e)
  }
  return result;
}

async function getCompanySalaryJobFunctions(currentUserId, companyId, locale) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let result = null;
  try {

    result = await findAllCompanySalaryJobFunctions(companyId, locale);
    // result = _.reduce(result, function(res, item){
    //   if(item.jobFunction){
    //     res.push(item.jobFunction);
    //   }
    //
    //   return res;
    // }, []);

  } catch (e) {
    console.log('Error: getCompanySalaryEmploymentTitles', e)
  }
  return result;
}

async function getCompanySalaryById(filter, locale) {
  let result = null;
  let count = await findEmploymentTitlesCountByCompanyId(filter.company);
  result = await findSalariesByCompanyId(filter);


  result = _.reduce(result, function(res, item){
    item.hasLiked = false;
    res.push(item);
    return res;
  }, [])

  return new Pagination(result, filter, locale);
}

async function addNewReview(currentUserId, review) {
  if (currentUserId==null || review==null){
    return null;
  }
  review = await Joi.validate(review, reviewSchema, {abortEarly: false});

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  if (isPartyActive(currentParty)) {

    result = await addCompanyReview(review);
  }

  return result;
}

// async function getCompanyReviews(filter, locale) {
//   let result = null;
//   result = await findCompanyReviewsByCompanyId(filter);
//
//   result = _.reduce(result, function(res, item){
//     item.hasLiked = false;
//     res.push(item);
//     return res;
//   }, [])
//
//   return new Pagination(result, filter, locale);
// }

async function getCompanyReviewStats(userId, company, locale) {
  let result = null;

  result = await findCompanyReviewHistoryByCompanyId(company);

  if(result) {
    let highlights = await findTop3Highlights(company);
    result.mostPopularReviews = highlights;
  }
  return result;
}

async function getCompanyReviews(currentUserId, filter, locale) {
  let result = null;
  let select = '-description -qualifications -responsibilities';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};

  switch(filter.sortBy){
    case('createdDate'):
      filter.sortBy='createdDate';
      break;
    case('popular'):
      filter.sortBy='popular';
      break;
    case('rating'):
      filter.sortBy='rating';
      break;
    default:
      filter.sortBy='createdDate';

  }

  // filter.sortBy = (filter.sortBy!=null) ? filter.sortBy : 'createdDate';
  filter.direction = (filter.direction && filter.direction=="ASC") ? "ASC" : 'DESC';
  sortBy[filter.sortBy] = (filter.direction == "DESC") ? -1 : 1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  if(!filter.employmentType){
    let employmentTypes = [];
    for(employmentType in employmentTypeEnum){
      employmentTypes.push(employmentType);

    }
    employmentTypes = employmentTypes.join(',');
    filter.employmentType = employmentTypes;
  }

  result = await CompanyReview.paginate(new SearchParam(filter), options);

  let partyIds = _.uniq(_.map(result.docs, 'user'));
  let reactions = await findCompanyReviewReactionByPartyId(currentUserId);

  let results = await searchUsers(currentUserId, '', partyIds);
  let foundUsers = results.content;

  let employments = await findListOfPartyEmploymentTitle(partyIds);

  result.docs = _.reduce(result.docs, function(res, item){
    // let find = _.find(employments, {id: item.party.id});
    let hasLiked = _.find(reactions, {user: currentUserId, companyReviewId: item.companyReviewId, reactionType: 'LIKE'})?true:false;
    let hasLoved = _.find(reactions, {user: currentUserId, companyReviewId: item.companyReviewId, reactionType: 'LOVE'})?true:false;


    item.user = convertToAvatar(_.find(foundUsers, {id: item.user}));
    item.noOfLikes =  (item.likes)? item.likes.length: 0;
    item.noOfLoves = (item.loves)? item.loves.length : 0;
    item.hasLiked = hasLiked;
    item.hasLoved = hasLoved;
    item.likes = [];
    item.loves = [];
    res.push(item);
    return res;
  }, []);

  return new Pagination(result);
}

async function getCompanyReviewLocations(currentUserId, companyId) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let result = null;
  try {

    result = await findAllCompanyReviewLocations(companyId);


  } catch (e) {
    console.log('Error: getCompanyReviewLocations', e)
  }
  return result;
}

async function reportCompanyReviewById(currentUserId, companyReviewId, report) {

  report = await Joi.validate(report, companyReviewReportSchema, { abortEarly: false });

  if(!currentUserId || !companyReviewId || !report){
    return null;
  }

  let result;
  try {

    let found = await CompanyReview.findOne({companyReviewId: companyReviewId});
    if(found){

      let currentParty = await findByUserId(currentUserId);

      if(!isPartyActive(currentParty)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }


      report = await addCompanyReviewReport(report);


      if(report){

        found.status=statusEnum.REPORTED;
        result  = await found.save();
      }
    }
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function reactionToCompanyReviewById(currentUserId, companyReviewId, reaction) {

  reaction = await Joi.validate(reaction, companyReviewReactionSchema, { abortEarly: false });

  if(!currentUserId || !companyReviewId || !reaction){
    return null;
  }

  let result;
  try {

    let found = await CompanyReview.findOne({companyReviewId: companyReviewId});
    if(found){

      let currentParty = await findByUserId(currentUserId);

      if(!isPartyActive(currentParty)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }


      reaction = await addCompanyReviewReaction(reaction);


      if(reaction){
        result = reaction;
        if(reaction.reactionType=='LIKE'){
          found.likes.push(reaction)

        } else if (reaction.reactionType=='LOVE') {
          found.loves.push(reaction)
        }

        found  = await found.save();
        found.noOfLikes = found.likes.length;
        found.noOfLoves = found.loves.length;
        found.loves=[];
        found.likes=[];

      }

    }
  } catch (error) {
    console.log(error);
  }

  return result;
}

async function removeReactionToCompanyReviewById(currentUserId, companyReviewId, reaction) {

  reaction = await Joi.validate(reaction, companyReviewReactionSchema, { abortEarly: false });

  if(!currentUserId || !companyReviewId || !reaction){
    return null;
  }

  let result;
  try {

    let found = await CompanyReview.findOne({companyReviewId: companyReviewId});
    if(found) {


      let currentParty = await findByUserId(currentUserId);

      if (!isPartyActive(currentParty)) {
        console.debug('User Not Active: ', currentUserId);
        return null;
      }


      reaction = await CompanyReviewReaction.findOne({
        partyId: currentParty.id,
        companyReviewId: companyReviewId,
        reactionType: reaction.reactionType
      });


      if (reaction) {
        let deleted = await reaction.delete();

        if (deleted) {

          if (reaction.reactionType == 'LIKE') {
            let index = _.indexOf(found.likes, reaction);
            found.likes.splice(index, 1);
          } else {
            let index = _.indexOf(found.loves, reaction);
            found.loves.splice(index, 1);
          }
          await found.save();
          result = {deleted: 1};
        }

      }
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function addCompanyDepartment(company, currentUserId, form) {
  form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await addDepartment(form);
    }
  } catch(e){
    console.log('addCompanyDepartment: Error', e);
  }


  return result
}

async function updateCompanyDepartment(company, departmentId, currentUserId, form) {
  form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!company || !currentUserId || !departmentId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let department = await Department.findById(departmentId);
      if(department){
        department.name = form.name;
        department.updatedBy = currentUserId;
        result = await department.save();
      }

    }
  } catch(e){
    console.log('updateCompanyDepartment: Error', e);
  }


  return result
}

async function deleteCompanyDepartment(company, departmentId, currentUserId) {
  if(!company || !currentUserId || !departmentId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let department = await Department.findById(departmentId);
      if(department){
        result = await department.delete();
        if(result){
          result = {deleted: 1};
        }

      }

    }
  } catch(e){
    console.log('deleteCompanyDepartment: Error', e);
  }


  return result
}

async function getCompanyDepartments(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getDepartments(company);

  return result;

}



async function addCompanyPipeline(company, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await addPipeline(form);
    }
  } catch(e){
    console.log('addCompanyPipeline: Error', e);
  }


  return result
}

async function updateCompanyPipeline(company, pipelineId, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!company || !currentUserId || !pipelineId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let pipeline = await Pipeline.findOne({pipelineId: pipelineId});
      if(pipeline){
        pipeline.name = form.name;
        pipeline.updatedBy = currentUserId;
        pipeline.stages=form.stages;
        pipeline.category=form.category;
        pipeline.department=form.department;
        pipeline.type=form.type;
        result = await pipeline.save();
      }

    }
  } catch(e){
    console.log('updateCompanyPipeline: Error', e);
  }


  return result
}

async function deleteCompanyPipeline(company, pipelineId, currentUserId) {
  if(!company || !currentUserId || !pipelineId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let pipeline = await Pipeline.findOne({pipelineId: pipelineId});
      if(pipeline){
        result = await pipeline.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyPipeline: Error', e);
  }


  return result
}

async function getCompanyPipelines(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getPipelines(company);

  return result;

}




async function addCompanyRole(company, currentUserId, form) {
  console.log('addCompanyRole', form)
  form = await Joi.validate(form, roleSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await roleService.addRole(form);
    }
  } catch(e){
    console.log('addCompanyRole: Error', e);
  }


  return result
}

async function updateCompanyRole(company, roleId, currentUserId, form) {
  form = await Joi.validate(form, roleSchema, { abortEarly: false });
  if(!company || !currentUserId || !roleId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let role = await Role.findById(roleId);
      if(role){
        role.name = form.name;
        role.updatedBy = currentUserId;
        role.privileges=form.privileges;
        role.description=form.description;
        result = await role.save();
      }

    }
  } catch(e){
    console.log('updateCompanyRole: Error', e);
  }


  return result
}

async function deleteCompanyRole(company, roleId, currentUserId) {
  if(!company || !currentUserId || !roleId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let role = await Role.findById(roleId);
      if(role){
        result = await role.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyRole: Error', e);
  }


  return result
}

async function getCompanyRoles(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await roleService.getRoles(company);

  return result;

}




async function addCompanyLabel(company, currentUserId, form) {
  console.log('addCompanyRole', form)
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await labelService.addLabel(form);
    }
  } catch(e){
    console.log('addCompanyLabel: Error', e);
  }


  return result
}

async function updateCompanyLabel(company, labelId, currentUserId, form) {
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!company || !currentUserId || !labelId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let label = await Label.findById(labelId);
      if(label){
        label.name = form.name;
        label.updatedBy = currentUserId;
        label.type=form.type;
        result = await label.save();
      }

    }
  } catch(e){
    console.log('updateCompanyLabel: Error', e);
  }


  return result
}


async function deleteCompanyLabel(company, labelId, currentUserId) {
  if(!company || !currentUserId || !labelId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let label = await Label.findById(labelId);
      if(label){
        result = await label.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyLabel: Error', e);
  }


  return result
}

async function getCompanyLabels(company, type, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await labelService.getLabels(company, type);

  return result;

}


