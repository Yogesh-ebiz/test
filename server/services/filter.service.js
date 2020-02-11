const Topic = require('../models/topic.model');

function getAllTopics(locale) {
  let localeStr = locale? locale : 'en';
  console.log('locale', locale)
  let data = Topic.aggregate([
    { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: ('$name.' + localeStr) } }
  ]);
  return data;
}


module.exports = {
  getAllTopics: getAllTopics
}
