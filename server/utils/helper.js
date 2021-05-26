const _ = require('lodash');
const fs = require('fs');
const AWS = require('aws-sdk');


const timestamp = () => {
  return !_.includes(['DELETED', 'SUSPENDED', 'INACTIVE'], user.status)
}

const capitalizeLocale = ([ first, ...rest ], locale = navigator.language) => {
  return [ first.toLocaleUpperCase(locale), ...rest ].join('');
}



const convertToTalentUser = (user) => {

  if(!user){
    return;
  }

  let primaryEmail = (user.primaryEmail)?{
    type: user.primaryEmail.name,
    value: user.primaryEmail.value
  }: null;

  let primaryPhone = (user.primaryPhone)?{
    type: user.primaryPhone.name,
    value: user.primaryPhone.value
  }: null;

  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    avatar: user.avatar,
    isOnline: user.isOnline,
    primaryEmail: primaryEmail,
    primaryPhone: primaryPhone
  };
}


const convertToAvatar = (user) => {
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    avatar: user.avatar,
    isOnline: user.isOnline,
    partyType: user.partyType,
    headline: user.headline
  };
}

const convertToCandidate = (user) => {
  if(!user){
    return;
  }
  console.log(user.noOfMonthExperiences?user.noOfMonthExperiences:6.5);
  return {
    id: user._id,
    userId: user.userId,
    createdDate: user.createdDate,
    company: user.company,
    name: user.name,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    avatar: user.avatar?user.avatar:'',
    email: user.email,
    phoneNumber: user.phoneNumber,
    isOnline: user.isOnline,
    partyType: user.partyType?user.partyType:'',
    jobTitle: user.jobTitle?user.jobTitle:'',
    headline: user.headline,
    noOfMonthExperiences: user.noOfMonthExperiences?user.noOfMonthExperiences:6.5,
    level:user.level?user.level:'SENIOR',
    match:user.match?user.match:0,
    overallRating: user.overallRating?user.overallRating:0,
    teamRating: user.teamRating?user.teamRating:0,
    links: user.links?user.links:[],
    tags: user.tags?user.tags:[],
    sources: user.sources?user.sources:[],
    applications: user.applications?user.applications:[],
    evaluations: user.evaluations?user.evaluations:[]
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
    country: company.primaryAddress.country,
    images: company.images
  }: null;

  return {
    id: company.id,
    name: company.name,
    avatar: company.avatar,
    cover: company.cover,
    partyType: company.partyType,
    headline: company.headline,
    primaryAddress: primaryAddress,
    hasFollowed:company.hasFollowed,
    images: company.images,
    rating: company.rating,
    noOfFollowers: company.noOfFollowers
  };
}


const convertIndustry = (industry) => {
  return {
    id: industry.id,
    name: industry.name,
    shortCode: industry.shortCode,
    icon: industry.icon,
    image: industry.image,
    cover: industry.cover,
    noOfItems: industry.noOfItems
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
    hasSaved: job.hasSaved,
    level: job.level,
    employmentType: job.employmentType,
    city: job.city,
    state: job.state,
    country: job.country,
    company: job.company
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



module.exports = {
  capitalizeLocale:capitalizeLocale,
  convertToAvatar:convertToAvatar,
  convertToCompany:convertToCompany,
  convertIndustry:convertIndustry,
  categoryMinimal:categoryMinimal,
  convertToTalentUser:convertToTalentUser,
  convertToCandidate:convertToCandidate,
  roleMinimal:roleMinimal,
  jobMinimal:jobMinimal
};
