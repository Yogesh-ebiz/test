const bcrypt = require('bcrypt');
const Joi = require('joi');
//const pagination = require('../const/pagination');
const JobBookmark = require('../models/jobbookmark.model')
const _ = require('lodash');

let PaginationModel = require('../utils/pagination');
let SearchParam = require('../const/searchParam');

const JobBookmarkSchema = Joi.object({
  id: Joi.number(),
  userId: Joi.number().required(),
  jobId: Joi.number().required(),
  createdDate: Joi.number(),
  status: Joi.string().required()
});



module.exports = {
  getJobsByUserId,
  addToJobBookmark
}


async function getJobsByUserId(id, locale) {

  let job, skills=[];
  try {
    let localeStr = locale? locale : 'en';
    job = await JobRequisition.findOne({jobId: id});
    let skills = await Skilltype.find({skillTypeId: job.skills});
    //let jobFunction = await JobFunction.findOne({shortCode: job.jobFunction});
    let jobFunction = await JobFunction.aggregate([{$match: {shortCode: job.jobFunction} }, {$project: {name: '$name.'+localeStr, shortCode:1}}]);


    //jobFunction.name=jobFunction[name][localeStr];


    job.skills = skills;
    job.jobFunction=jobFunction;

  } catch (error) {
    console.log(error);

  }




  return job;
}


async function addToJobBookmark(userId, jobId) {

  let foundJob = await JobRequisition.findOne({jobId: filter.id});

  if(!foundJob){
    return null;
  }

  let bookmark = await JobBookmark.find({userId: userId, jobId: jobId});
  if (!bookmark) {
    bookmark = await new JobRequisition({userId:userId, jobId: jobId}).save();
  }else if (bookmark && bookmark.status==='INACTIVE'){
    bookmark.status="ACTIVE";
    bookmark = await JobBookmark.save(bookmark);
  }

  return bookmark;

}
