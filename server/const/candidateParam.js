const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const ObjectID = require('mongodb').ObjectID;


function CandidateParam(filter) {
  this.query = {};
  // this.query.$or = [];




  if(filter.hasApplied) {
    this.query.hasApplied = true;
  } else {
    this.query.hasApplied = false;
  }


  // this.query.hasApplied =  filter.hasApplied?true:false;
  // this.query.hasImported =  filter.hasImported?true:false;

  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  }


  if(filter.userId){
    this.query.userId =  filter.userid;
  }

  if(filter.id){
    let ids = _.reduce(filter.id.split(','), function(res, i){
      res.push(parseInt(i));
      return res;
    }, []);
    this.query.jobId =  { $in: ids };
  }


  if(filter.tags && filter.tags.length>0){
    this.query.tags =  { $in: filter.tags };
  }


  if (filter.query) {
    this.query.$or = [];
    this.query.$or.push({firstName: { $regex: filter.query, $options: "i" }});
    this.query.$or.push({lastName: { $regex: filter.query, $options: "i" }});
    this.query.$or.push({email: { $regex: filter.query, $options: "i" }});
  }

  if (filter.level && filter.level.length) {
    this.query.level = { $in: filter.level };
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
    this.query.district =  { $in: filter.district};
  }

  if (filter.city && filter.city.length) {
    this.query.city =  { $in: filter.city};
  }

  if (filter.state && filter.state.length) {
    this.query.state =  { $in: filter.state};
  }

  if (filter.country && filter.country.length) {
    this.query.country =  { $in: filter.country};
  }


  if (filter.distance && filter.distance!="") {
    this.query.distance =  { $in: filter.distance};
  }

  if (filter.members && filter.members.length) {
    this.query.members =  { $in: filter.members};
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

  return this.query;
}

module.exports = CandidateParam;
