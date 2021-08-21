const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const fs = require('fs');
const ejs = require('ejs');
const pdf = require('html-pdf');
var path = require('path');


const parserService = require('../services/api/sovren.service.api');

module.exports = {
  deleteIndex,
  createIndex,
  getResume,
  uploadResume,
  matchResume,
  matchResumeByDocument,
  uploadJob,
  getAllSkillLists
}

async function createIndex(form) {
  let result;
  try {
    result = await parserService.createIndex(form);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function deleteIndex(index) {
  let result;
  try {
    result = await parserService.deleteIndex(index);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function getResume(index, documentId) {
  let result;
  try {
    result = await parserService.getResume(index, documentId);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function matchResume(form) {
  let result;
  try {
    result = await parserService.matchResume(form);

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function matchResumeByDocument(index, document, form) {
  let result;
  try {
    result = await parserService.matchResumeByDocument(index, document, form);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function uploadResume(index, documentId, file) {
  let result;
  try {

    if(!index || !documentId || file) {

      result = await parserService.uploadResume(file.path, index, documentId);


    }
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function uploadJob(index, documentId, file) {
  let result;
  try {

    if(!index || !documentId || file) {

      result = await parserService.uploadJob(file.path, index, documentId);


    }
  } catch (error) {
    console.log(error);
  }

  return result;
}




async function addSkillList(form) {


  let result;
  try {
    result = await parserService.addSkillList(form);
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getAllSkillLists(locale) {


  let result;
  try {
    result = await parserService.listAllSkills();
  } catch (error) {
    console.log(error);
  }

  return result;
}


