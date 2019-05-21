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

  if(!userId){
    return;
  }

  console.log(userId)
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
  console.log(userId, jobId)
  if(!userId || !jobId){
    return;
  }


  return BookMark.remove({partyId: userId, jobId: jobId});
}

async function findMostBookmarked() {
  let data = null;

  let group = {
    _id: {jobId: '$jobId'},
    count: {'$sum': 1}
  };

  data = await BookMark.aggregate([
    {$match: {}},
    {
      $group: group
    },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        jobId: '$_id.jobId',
        count: '$count'
      }
    }
  ]);

  return data;
}


module.exports = {
  findBookById: findBookById,
  findBookByUserId: findBookByUserId,
  addBookById: addBookById,
  removeBookById: removeBookById,
  findMostBookmarked:findMostBookmarked
}
