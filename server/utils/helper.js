const _ = require('lodash');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
const config = require('../config/config');


// function to encode file data to base64 encoded string
const  base64Encode = async (file) => {
  // read binary data
  var bitmap = await fs.readFile(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
const base64Decode = async (base64str, file) => {
  // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
  var bitmap = new Buffer(base64str, 'base64');
  // write buffer to file
  let newFile = await fs.writeFile(file, bitmap);
  console.log('******** File created from base64 encoded string ********');
}

const timestamp = () => {
  return !_.includes(['DELETED', 'SUSPENDED', 'INACTIVE'], user.status)
}

const capitalizeLocale = ([ first, ...rest ], locale = navigator.language) => {
  return [ first.toLocaleUpperCase(locale), ...rest ].join('');
}

const cardTest = (card) => {
  let brand;

  if(card.match('^4[0-9]{6,}$')){
    brand = 'VISA';
  } else if(card.match('^5[1-5][0-9]{5,}|222[1-9][0-9]{3,}|22[3-9][0-9]{4,}|2[3-6][0-9]{5,}|27[01][0-9]{4,}|2720[0-9]{3,}$')){
    brand = 'MASTERCARD';
  } else if(card.match('^3[47][0-9]{5,}$')){
    brand = 'AMX';
  } else if(card.match('^3(?:0[0-5]|[68][0-9])[0-9]{4,}$')){
    brand = 'DINER';
  } else if(card.match('^6(?:011|5[0-9]{2})[0-9]{3,}$')){
    brand = 'DISCOVER';
  } else if(card.match('^(?:2131|1800|35[0-9]{3})[0-9]{3,}$')){
    brand = 'JCB';
  }

  return brand;
}


const convertToTalentUser = (user) => {

  if(!user){
    return;
  }

  let primaryEmail = (user.email)?{
    value: user.email
  }: null;

  let primaryPhone = (user.phone)?{
    value: user.phone
  }: null;

  return {
    _id: user._id,
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    avatar: buildUserUrl(user),
    isOnline: user.isOnline,
    primaryEmail: primaryEmail,
    primaryPhone: primaryPhone,
    currency: user.currency,
    language: user.language,
    userId: user.userId,
    preferredCompany: user.preferredCompany,
    preferTimeFormat: user.preferTimeFormat,
    timezone: user.timezone,
  };
}


const convertToAvatar = (user) => {
  if(!user){
    return;
  }

  let data = {
    _id: user._id,
    id: user._id?user.userId:user.id,
    name: user.name,
    tagname: user.tagname,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    avatar: user.avatar,
    isOnline: user.isOnline,
    partyType: user.partyType,
    headline: user.headline,
    email: user.email,
    isMember: user.isMember?user.isMember:false,
    isCandidate: user.isCandidate?user.isCandidate:false
  };


  return data;
}

const convertToCauser = (user) => {

  if(!user){
    return;
  }

  let data = {
    _id: user._id,
    userId: user.userId,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    avatar: user.avatar,
    isMember: user.isMember
  };


  return data;
}

const convertToCandidate = (user) => {
  if(!user){
    return;
  }

  let current = user.current?user.current:null;
  if(current){
    current.employer = convertToCompany(current.employer);
  }

  let past = user.current?user.current:null;
  if(past){
    past.employer = convertToCompany(past.employer);
  }

  let match = Math.random() * (100 - 30) + 30;

  let primaryPhone, primaryEmail;
  if(user.phoneNumbers){
    primaryPhone =_.find(user.phoneNumbers, {isPrimary: true}) || user.phoneNumbers[0];
  }

  if(user.emails){
    primaryEmail =_.find(user.emails, {isPrimary: true}) || user.emails[0];
  }

  if(user.resumes){
    resumes =_.reduce(user.resumes, function(res, resume){
      if(typeof resume==='object'){
        resume.path = process.env.CDN + '/' + resume.path;
      }
      res.push(resume);
      return res;
    }, []);
  }

  return {
    id: user.id?user.id:user._id,
    userId: user.userId?user.userId:user.partyId?user.partyId:null,
    createdDate: user.createdDate,
    status: user.status,
    about: user.about,
    applications: user.applications || [],
    avatar: buildCandidateUrl(user),
    certifications: user.certifications || [],
    comments: user.comments || [],
    company: user.company,
    current: current,
    dob: user.dob,
    email: user.email,
    emails: user.emails || [],
    experiences: user.experiences?_.reduce(user.experiences, function(res, i){ i.employer = convertToCompany(i.employer); res.push(i);  return res;}, []):[],
    educations: user.educations?_.reduce(user.educations, function(res, i){ i.institute = convertToCompany(i.institute); res.push(i);  return res;}, []):[],
    evaluations: user.evaluations || [],
    files: user.files || [],
    firstName: user.firstName,
    flag: user.flag,
    gender: user.gender,
    hasApplied: user.hasApplied || false,
    hasFollowed: user.hasFollowed || false,
    hasFollowedCompany: user.hasFollowedCompany || false,
    hasImported: user.hasImported || false,
    hasSaved: user.hasSaved,
    headline: user.headline,
    jobTitle: user.jobTitle?user.jobTitle:'',
    labels: user.labels || [],
    lastName: user.lastName,
    languages: user.languages || [],
    level:user.level || 'SENIOR',
    links: user.links || [],
    maritalStatus: user.maritalStatus,
    match:user.match?user.match:match.toFixed(0),
    middleName: user.middleName,
    noOfComments: user.noOfComments || 0,
    noOfMonthExperiences: user.noOfMonthExperiences?user.noOfMonthExperiences:35,
    name: user.name,
    openToJob: user.openToJob?user.openToJob:true,
    openToRelocate: user.openToRelocate?user.openToRelocate:true,
    past: past,
    phoneNumber: user.phoneNumber,
    phoneNumbers: user.phoneNumbers?user.phoneNumbers:[],
    preferences: user.preferences?user.preferences: null,
    primaryPhone: primaryPhone,
    primaryEmail: primaryEmail,
    primaryAddress: user.primaryAddress?user.primaryAddress:null,
    progress: user.progress || [],
    rating: Math.round(user.rating * 10) /10,
    resume: user.resume,
    skills: user.skills || [],
    sources: user.sources || [],
    tagname: user.tagname,
    tags: user.tags?user.tags:[],
    teamRating: user.teamRating || 0,
    url: user.shareUrl?user.shareUrl:user.url?user.url:null,
    partyType: user.partyType?user.partyType:''

  };
}

const convertToCompany = (company) => {
  if(!company){
    return;
  }

  let primaryAddress = (company.primaryAddress)?{
    name: company.primaryAddress.name,
    address1: company.primaryAddress.address1,
    city: company.primaryAddress.city,
    state: company.primaryAddress.state,
    country: company.primaryAddress.country
  }: null;

  let result = {
    id: company._id?company.companyId:company.id?company.id:null,
    name: company.name,
    tagname: company.tagname,
    avatar: buildCompanyUrl(company),
    cover: company.cover,
    partyType: company.partyType,
    headline: company.headline,
    primaryAddress: primaryAddress,
    hasFollowed:company.hasFollowed,
    images: company.images,
    video: company.video,
    rating: company.rating,
    noOfFollowers: company.noOfFollowers
  };

  return result;
}


const convertIndustry = (industry) => {
  return {
    id: industry.id,
    name: industry.name,
    shortCode: industry.shortCode,
    icon: industry.icon,
    image: industry.image,
    cover: industry.cover,
    // noOfJobs: industry.noOfJobs?industry.noOfJobs:0
  };
}

const categoryMinimal = (category) => {
  if(!category){
    return null;
  }
  return {
    id: category.id,
    name: category.name,
    image: category.image,
    icon: category.icon,
    cover: category.cover,
    fontColor: category.fontColor,
    backgroundColor: category.backgroundColor,
    shortCode: category.shortCode
  };
}


function isUserActive(user){{

  if(!user){
    return false;
  }
  let status = _.includes(['ACTIVE', 'NEW'], user.status);

  return status;
}}

const roleMinimal = (role) => {
  if(!role){
    return null;
  }
  return {
    _id: role._id,
    name: role.name,
    privileges: role.privileges,
    name: role.name,
    company: role.company
  };
}


const jobMinimal = (job) => {
  if(!job){
    return null;
  }
  return {
    _id: job._id,
    jobId: job.jobId,
    title: job.title,
    type: job.type,
    hasSaved: job.hasSaved,
    level: job.level,
    employmentType: job.employmentType,
    city: job.city,
    state: job.state,
    country: job.country,
    company: job.company,
    createdBy: job.createdBy,
    department: job.department,
    createdDate: job.createdDate,
    publishedDate: job.publishedDate,
    originalPublishedDate:job.originalPublishedDate,
    noOfApplied:job.noOfApplied

  };
}


const skillMinimal = (job) => {
  if(!job){
    return null;
  }
  return {
    _id: job._id,
    jobId: job.jobId,
    title: job.title,
    hasSaved: job.hasSaved,
    level: job.level,
    employmentType: job.employmentType,
    city: job.city,
    state: job.state,
    country: job.country,
    company: job.company
  };
}


const buildFileUrl = (file) => {
  return config.cdn + "/" + file;
}

const buildCompanyUrl = (company) => {
  if(company && company.avatar && company.avatar.indexOf('http')>-1){
    return company.avatar;
  }

  let id = company._id?company.companyId:company.id;
  let avatar = company.avatar?company.avatar:'';
  return avatar?config.cdn + '/company/' + id + '/avatar/' + avatar:'';
}

const buildUserUrl = (user) => {
  if(!user){
    return null;
  }

  let avatar = user.avatar?user.avatar:user._avatar;
  if(!avatar){
    return null;
  } else if(avatar.indexOf('http')>-1){
    return avatar;
  }

  let id = user.id?user.id:user._id?user.userId:null;
  return config.cdn + '/user/' + id + '/avatar/' + avatar;
}

const buildCandidateUrl = (candidate) => {
  console.log(candidate)
  if(candidate && candidate.avatar && candidate.avatar.indexOf('http')>-1){
    return candidate.avatar;
  }

  let avatar = candidate.avatar?candidate.avatar:candidate._avatar;
  let path = avatar.indexOf('http')>-1?avatar:`${process.env.CDN}/candidates/${candidate._id}/images/${avatar}`;
  return avatar?path:'';
}

module.exports = {
  base64Encode:base64Encode,
  base64Decode:base64Decode,
  capitalizeLocale:capitalizeLocale,
  convertToAvatar:convertToAvatar,
  convertToCompany:convertToCompany,
  convertIndustry:convertIndustry,
  categoryMinimal:categoryMinimal,
  convertToTalentUser:convertToTalentUser,
  convertToCandidate:convertToCandidate,
  convertToCauser:convertToCauser,
  roleMinimal:roleMinimal,
  isUserActive: isUserActive,
  jobMinimal:jobMinimal,
  buildFileUrl:buildFileUrl,
  buildCompanyUrl:buildCompanyUrl,
  buildUserUrl:buildUserUrl,
  buildCandidateUrl:buildCandidateUrl,
  cardTest:cardTest
};
