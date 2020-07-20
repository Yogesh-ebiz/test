const _ = require('lodash');
const Category = require('../models/category.model');


function getTopCategory(locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  let propLocale = '$locale.'+localeStr;

  data = Category.aggregate([
    { $project: {categoryId: 1, name: propLocale, shortCode: 1, icon: 1 } }
  ]);

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
