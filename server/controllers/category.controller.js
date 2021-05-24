const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const {categoryMinimal} = require('../utils/helper');

const Industry = require('../models/industry.model');
const JobRequisition = require('../models/jobrequisition.model');

const filterService = require('../services/filter.service');
const feedService = require('../services/api/feed.service.api');
const jobService = require('../services/jobrequisition.service');


module.exports = {
  getAllCategories
}

async function getAllCategories(query, locale) {
  let localeStr = locale? locale : 'en';

  let categories = await feedService.findCategoryByType('JOB', locale);
  let jobs = await JobRequisition.aggregate([
    {$match: {status: 'ACTIVE'}},
    {$group: {_id: '$category', count: {$sum: 1}}}
  ]);

  categories.forEach(function(category){
    let found = _.find(jobs, {_id: category.shortCode});
    category.noOfJobs = found?found.count:0;
    category = categoryMinimal(category);
  })

  return categories;
}
