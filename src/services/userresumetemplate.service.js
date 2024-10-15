const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const UserResumeTemplate = require('../models/userresumetemplate.model');

function findById(id) {

  if(!id){
    return;
  }

  return UserResumeTemplate.findById(id);
}



module.exports = {
  findById,

}
