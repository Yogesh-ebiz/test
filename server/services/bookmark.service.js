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

function findBookByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  return BookMark.find({partyId: userId});
}

function addBookById(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  let timestamp = Date.now();
  let bookmark = {partyId: userId, jobId: jobId, createdDate: timestamp};
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
