const _ = require('lodash');
const Category = require('../models/category.model');
const JobRequisition = require('../models/jobrequisition.model');


function getTopCategory(locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  let propLocale = '$locale.'+localeStr;

  // data = Category.aggregate([
  //   { $project: {categoryId: 1, name: propLocale, shortCode: 1, icon: 1 } }
  // ]);

  data = JobRequisition.aggregate([
    {$group: {_id: {category: '$category'}, count: {$sum: 1} }},
    {$project: {_id: 0, shortCode: { $arrayElemAt: [ '$_id.category', 0 ] }, count: 1}},
    {$sort: {count: -1}},
    {$limit: 4}
  ])



  return data;
}



function getAllCategory(locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  let propLocale = '$locale.'+localeStr;

  data = Category.aggregate([
    { $project: {categoryId: 1, name: propLocale, shortCode: 1, icon: 1 } }
  ]);

  return data;
}

module.exports = {
  getTopCategory: getTopCategory,
  getAllCategory: getAllCategory
}
