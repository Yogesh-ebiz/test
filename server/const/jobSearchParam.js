const _ = require('lodash');
const dateEnum = require('../const/dateEnum')


function jobSearchParam(filter) {
  this.query = {};


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

    this.query.createdDate =  { $gte: start.getTime(), $lte: end.getTime() };
  }


  if (filter.query && filter.query!="") {
    this.query.title =  { $regex: filter.query, $options: 'i' };
    // this.query.$text = { $search: filter.query, $caseSensitive: true };
  }

  if (filter.level && filter.level.length) {
    this.query.level =  { $in: filter.level };
  }

  if (filter.jobFunction && filter.jobFunction.length) {
    this.query.jobFunction =  { $in: filter.jobFunctions };
  }

  if (filter.employmentType && filter.employmentType.length) {
    this.query.employmentType =  { $in: filter.employmentType};
  }

  if (filter.industry && filter.industry.length) {
    this.query.industry =  { $in: filter.industry };
  }

  if (filter.company && filter.company.length) {
    console.log(filter.company)
    this.query.company = {$in: filter.company };
  }

  if (filter.city && filter.city.length) {
    let city = _.reduce(filter.city.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);

    this.query.city =  { $in: city};
  }

  if (filter.state && filter.state.length) {
    let state = _.reduce(filter.state.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);
    this.query.state =  { $in: state};
  }

  if (filter.country && filter.country.length ) {
    this.query.country =  { $in: filter.country};
  }

  if (filter.distance && filter.distance.length) {

    // this.query.distance =  { $in: distance};
  }

  return this.query;
}

module.exports = jobSearchParam;
