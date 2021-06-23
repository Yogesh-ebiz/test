const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const ObjectID = require('mongodb').ObjectID;


function SearchParam(filter) {
  this.query = {};


  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  }

  if(filter.partyId){
    this.query.partyId =  { $eq: filter.partyId };
  }

  if(filter.id){
    let ids = _.reduce(filter.id.split(','), function(res, i){
      res.push(parseInt(i));
      return res;
    }, []);
    this.query.jobId =  { $in: ids };
  }

  if(filter.similarId){
    this.query.jobId =  { $nin: [filter.similarId] };
  }


  if(filter.tags && filter.tags.length>0){
    this.query.tags =  { $in: filter.tags };
  }

  if(filter.createdDate){
    let start, end;


    start = new Date();
    start.setHours(0,0,0,0);

    end = new Date();

    switch (filter.createdDate) {
      case dateEnum.PASTDAY:
        start.setDate(start.getDate() - 1);
        break;
      case dateEnum.PASTWEEK:
        start.setDate(start.getDate() - 7);
        break;
      case dateEnum.PASTBIWEEK:
        start.setDate(start.getDate() - 14);
        break;
      case dateEnum.PASTMONTH:
        start.setDate(start.getDate() - 30);
        break;
    }

    this.query.publishedDate =  { $gte: start.getTime()};
  }


  if (filter.query && filter.query!="") {
    this.query.$text = { $search: filter.query, $diacriticSensitive: true, $caseSensitive: false };
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

  if (filter.types && filter.types.length) {
    this.query.type =  { $in: filter.types};
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

  if (filter.department && filter.department.length) {
    filter.department = _.reduce(filter.department, function(res, item){
      res.push(ObjectID(item));
      return res;
    }, []);
    this.query.department =  { $in: filter.department};
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



  // if (filter.createdDate && filter.createdBy.length) {
  //   let date = new Date();
  //   switch (filter.createdDate){
  //     case 'PASTDAY':
  //       date = date.setDate(date.getDate()-1);
  //       console.log(date.getTime())
  //       break;
  //
  //   }
  //   this.query.createdDate =  { $gte: date.getTime()};
  // }



  console.log(this.query)
  return this.query;
}

module.exports = SearchParam;
