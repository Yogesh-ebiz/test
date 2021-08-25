const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const ObjectID = require('mongodb').ObjectID;


function SearchParam(filter) {
  this.query = {};


  if (filter.query && filter.query!="") {
    this.query.$text = { $search: filter.query, $diacriticSensitive: true, $caseSensitive: false };
  }

  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  }


  if(filter.tags && filter.tags.length>0){
    this.query['user.tags.name'] =  { $in: filter.tags };
  }


  if (filter.level && filter.level.length) {
    this.query['user.level'] = { $in: filter.level };
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

  if (filter.city && filter.city.length) {
    this.query['user.city'] =  { $in: filter.city};
  }

  if (filter.state && filter.state.length) {
    this.query['user.state'] =  { $in: filter.state};
  }

  if (filter.country && filter.country.length) {
    this.query['user.country'] =  { $in: filter.country};
  }

  if (filter.createdBy && filter.createdBy.length) {
    this.query.createdBy =  { $in: filter.createdBy};
  }

  if (filter.skills && filter.skills.length) {
    this.query['user.skills'] =  { $in: filter.skills};
  }

  if (filter.sources && filter.sources.length) {
    this.query['user.sources.name'] =  { $in: filter.sources};
  }

  if (filter.stages && filter.stages.length) {
    this.query['currentProgress.stage.type'] =  { $in: filter.stages};
  }


  if (filter.distance && filter.distance!="") {
    this.query.distance =  { $in: filter.distance};
  }


  if (filter.minYear && filter.maxYear) {
    this.query.$and =  [{noOfMonthExperiences:  {$gte: (filter.minYear * 12)} }, {noOfMonthExperiences: { $lte: (filter.maxYear * 12)}}];
  }

  return this.query;
}

module.exports = SearchParam;
