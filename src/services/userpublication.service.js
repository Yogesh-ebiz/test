const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const UserPublication = require('../models/userpublication.model');
const Joi = require('joi');




const publicationSchema = Joi.object({
  userId: Joi.number().required(),
  title: Joi.string().required(),
  author: Joi.string().required(),
  publisher: Joi.string().allow('').optional(),
  publishedDate: Joi.date().optional(),
  url: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
  isbn: Joi.string().allow('').optional()
});


async function add(publication) {
  let data = null;

  if(!publication){
    return;
  }

  console.log(publication);
  await publicationSchema.validate(publication, {abortEarly: false});
  return new UserPublication(publication).save();
}

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return UserPublication.findById(id);
}

function findByUserId(userId) {

  if(!userId){
    return;
  }

  return UserPublication.find({userId: userId}).sort({createdDate: -1});
}

function removeById(_id) {
  if(!_id){
    return;
  }

  return UserPublication.deleteOne({_id});
}

module.exports = {
  add,
  findById,
  findByUserId,
  removeById
}
