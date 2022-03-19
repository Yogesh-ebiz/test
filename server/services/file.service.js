const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const File = require('../models/file.model');
const Joi = require('joi');


const fileSchema = Joi.object({
  fileType: Joi.string(),
  filename: Joi.string().required(),
  createdBy: Joi.number(),
  path: Joi.string(),
  hash: Joi.string()
});


async function addFile(file) {

  if(!file){
    return;
  }

  file = await Joi.validate(file, fileSchema, {abortEarly: false});
  file = new File(file).save();

  return file;

}

async function findyByUserAndFileId(userId, fileId) {

  if(!userId || !fileId){
    return;
  }

  let file = await File.find({userId: userId, fileId: fileId});

  return file;

}

module.exports = {
  addFile:addFile,
  findyByUserAndFileId:findyByUserAndFileId
}
