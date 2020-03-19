const _ = require('lodash');
const filterService = require('../services/filter.service');
const Pagination = require('../utils/pagination');
// const jobFunctions = require('../../data/jobfunctions');

function normalizeJobFunction(content) {

  //let jobFunction = {_id: "", shortCode: "", name: ""};

  // let res =_.reduce(content, function(res, value, key){
  //   //jobFunction.shortCode=value.jobFunction;
  //
  //   let jobFunction = _.reduce(jobFunctions, function(res2, item, key) {
  //     if(value.shortCode==item.jobFunction) {
  //       return item;
  //     }
  //   }, {});
  //
  //   value.jobFunction=jobFunction;
  //   res.push(value);
  //   return res;
  // }, []);
  // return res;
}


class JobPagination extends Pagination {
  constructor(data, locale) {
    super(data, locale);
    // this.content = normalizeJobFunction(this.content);

  }
}
module.exports = JobPagination;
