const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const ObjectID = require('mongodb').ObjectID;


function CandidateParam(filter) {
  this.query = {};
  // this.query.$or = [];


  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  }


  if(filter.jobs){
    this.query.job =  { $in: filter.jobs };
  }


  if(filter.tags && filter.tags.length>0){
    this.query.tags =  { $in: filter.tags };
  }


  if (filter.query) {
    this.query.$or = [];
    this.query.$or.push({firstName: { $regex: filter.query, $options: "i" }});
    this.query.$or.push({lastName: { $regex: filter.query, $options: "i" }});
  }

  if (filter.level && filter.level.length) {
    this.query.candidate.level = { $in: filter.level };
  }

  if (filter.jobFunction && filter.jobFunction.length) {
    this.query.jobFunction =  { $in: filter.jobFunction };
  }

  if (filter.employmentType && filter.employmentType.length) {
    this.query.employmentType =  { $in: filter.employmentType};
  }

  if (filter.industry && filter.industry.length) {
    this.query.industry =  { $in: filter.industry };
  }

  if (filter.company && filter.company!="") {
    this.query.company = { $in: filter.company };
  }

  if (filter.district && filter.district.length) {
    this.query['candidate.district'] =  { $in: filter.district};
  }

  if (filter.city && filter.city.length) {
    this.query['candidate.city'] =  { $in: filter.city};
  }

  if (filter.state && filter.state.length) {
    this.query['candidate.state'] =  { $in: filter.state};
  }

  if (filter.country && filter.country.length) {
    this.query['candidate.country'] =  { $in: filter.country};
  }

  if (filter.rating) {
    this.query['$and'] =  [{'candidate.rating': {$gte: filter.rating}}, {'candidate.rating': {$lt: filter.rating+1}}];
  }


  if (filter.distance && filter.distance!="") {
    this.query.distance =  { $in: filter.distance};
  }

  if (filter.createdBy && filter.createdBy.length) {
    this.query.createdBy =  { $in: filter.createdBy};
  }

  if (filter.skills && filter.skills.length) {
    this.query.skills =  { $in: filter.skills};
  }


  if (filter.minYear && filter.maxYear) {
    this.query.$and =  [{noOfMonthExperiences:  {$gte: (filter.minYear * 12)} }, {noOfMonthExperiences: { $lte: (filter.maxYear * 12)}}];
  }

  console.debug(this.query)
  return this.query;
}

module.exports = CandidateParam;
