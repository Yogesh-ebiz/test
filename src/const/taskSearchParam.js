const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const {ObjectId} = require('mongodb');


function TaskSearchParam(filter) {
  this.query = {};

  if(filter.query){
    this.query.status =  { $regex: query, $options: 'i' };
  }

  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  }

  if (filter.members && filter.members.length) {
    this.query.$or =  [{members: { $in: filter.members} }, {owner: { $in: filter.members}}];
  }

  if(filter.application){
    this.query['meta.application'] =  { $exists: true };
  }

  if(filter.meta?.applicationId){
    this.query['meta.applicationId'] =  new ObjectId(filter.meta.applicationId);
  }

  if(filter.meta?.candidate){
    this.query['meta.candidate'] =  new ObjectId(filter.meta.candidate);
  }


  if(filter.tags && filter.tags.length>0){
    this.query.tags =  { $in: filter.tags };
  }

  if(filter.startDate && filter.endDate){
    let start, end;


    start = new Date(filter.startDate);
    start.setHours(0,0,0,0);

    end = new Date(filter.endDate );
    end.setHours(23,59,59,0);

    this.query.$and =  [{startDate: { $gte: start.getTime() }}, {startDate: { $lte: end.getTime()} }];
  }


  if (filter.title && filter.title!="") {
    this.query.title = { $regex: filter.title, $options: 'i' };
  }

  if (filter.company && filter.company!="") {
    this.query.company = { $in: filter.company };
  }



  if (filter.createdBy && filter.createdBy.length) {
    this.query.createdBy =  { $in: filter.createdBy};
  }

  return this.query;
}

module.exports = TaskSearchParam;
