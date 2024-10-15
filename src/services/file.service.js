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

  await fileSchema.validate(file, {abortEarly: false});
  file = new File(file).save();

  return file;

}

function findById(id) {

  if(!id){
    return;
  }

  return File.findById(id);
}

async function findyByFileId(fileId) {

  if(!fileId){
    return;
  }
  let file = await File.findOne({ fileId: fileId });
  return file;
}

async function findyByUserAndFileId(userId, fileId) {

  if(!userId || !fileId){
    return;
  }

  let file = await File.findOne({userId: userId, fileId: fileId});

  return file;

}
function deleteById(id) {

  if(!id){
    return;
  }

  return File.findOneAndUpdate({_id: id}, {$set: {status: statusEnum.DELETED}});
}
function remove(id) {

  if(!id){
    return;
  }

  return File.findByIdAndDelete(id);
}

function findByHash(hash) {

  if(!hash){
    return;
  }

  return File.findOne({hash});
}
module.exports = {
  addFile,
  findById,
  findyByFileId,
  findyByUserAndFileId,
  deleteById,
  remove,
  findByHash
}
