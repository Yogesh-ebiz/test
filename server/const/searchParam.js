const _ = require('lodash');


function SearchParam(filter) {
  this.query = {};

  if (filter.query && filter.query!="") {
    this.query.title =  { $regex: filter.query, $options: 'i' };
  }

  if (filter.level && filter.level!="") {
    this.query.level =  { $in: filter.level.split(',') };
  }

  if (filter.jobFunction && filter.jobFunction!="") {
    this.query.jobFunction =  { $in: filter.jobFunction.split(',') };
  }

  if (filter.employmentType && filter.employmentType!="") {
    this.query.employmentType =  { $in: filter.employmentType.split(',') };
  }

  if (filter.company && filter.company!="") {

    let company = _.reduce(filter.company.split(','), function(result, value, key) {
      result.push(parseInt(value));
      return result;
    }, []);

    this.query['company.id'] = { $in: company } ;
  }

  return this.query;
}

module.exports = SearchParam;
