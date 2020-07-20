const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const BookMark = require('../models/bookmark.model');




function findBookById(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return BookMark.findOne({partyId: userId, jobId: jobId});
}

function findBookByUserId(userId, size) {
  let data = null;

  if(userId==null){
    return;
  }

  return size?BookMark.find({partyId: userId}).sort({createdDate: -1}).limit(size):BookMark.find({partyId: userId}).sort({createdDate: -1});
}

function addBookById(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  let bookmark = {partyId: userId, jobId: jobId};
  return new BookMark(bookmark).save();
}


function removeBookById(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return BookMark.remove({partyId: userId, jobId: jobId});
}


module.exports = {
  findBookById: findBookById,
  findBookByUserId: findBookByUserId,
  addBookById: addBookById,
  removeBookById: removeBookById
}
