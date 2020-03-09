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

function addBookById(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  let bookmark = {partyId: userId, jobId: jobId, createdDate: Date().now};
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
  addBookById: addBookById,
  removeBookById: removeBookById
}
