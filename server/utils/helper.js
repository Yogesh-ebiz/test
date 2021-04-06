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
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    avatar: user.avatar,
    isOnline: user.isOnline
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
    images: company.images
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

module.exports = {
  capitalizeLocale:capitalizeLocale,
  convertToAvatar:convertToAvatar,
  convertToCompany:convertToCompany,
  convertIndustry:convertIndustry,
  categoryMinimal:categoryMinimal,
  convertToTalentUser:convertToTalentUser
};
