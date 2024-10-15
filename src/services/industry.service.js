const _ = require('lodash');
const confirmEnum = require('../const/confirmEnum');
const statusEnum = require('../const/statusEnum');
const Industry = require('../models/industry.model');
const JobRequisition = require('../models/jobrequisition.model');
const JobFunction = require("../models/jobfunction.model");
const feedService = require("./api/feed.service.api");

function findById(id) {

  if(!id){
    return null;
  }


  const data = Industry.findById(id);

  return data;
}

function findByIds(ids) {

  if(!ids){
    return null;
  }


  const data = Industry.find({ _id: {$in: ids} });

  return data;
}


function getIndustry(list, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(!list){
    return [];
  }

  let propLocale = '$name.'+localeStr;

  let match = { shortCode: {$in: list} };

  data = Industry.aggregate([
    { $match: match },
    { $project: {experienceLevelId: 1, name: propLocale, shortCode: 1 } }
  ]);

  return data;
}

function getTopIndustry() {
  let data = null;

  data = JobRequisition.aggregate([
    {$group: {_id: {industry: '$industry'}, count: {$sum: 1} }},
    // {$project: {_id: 0, shortCode: { $arrayElemAt: [ '$_id.industry', 0 ] }, count: 1}},
    {$sort: {count: -1}},
    {$limit: 4}
  ])



  return data;
}


async function getFeatureIndustries(count, locale) {
  let data = [];
  data = await feedService.getIndustryFeatured(locale);
  if(data){
    data = _.reduce(data, function(res, industry){
      industry.icon = `${process.env.ACCESSED_CDN}/industry/${industry.id}/icon.png`;
      industry.image = `${process.env.ACCESSED_CDN}/industry/${industry.id}/image.jpg`;
      res.push(industry);
      return res;
    }, []);
  } else {
    data = [];
  }
  return data;
}


module.exports = {
  findById,
  findByIds,
  getIndustry,
  getTopIndustry,
  getFeatureIndustries
}
