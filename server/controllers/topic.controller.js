const bcrypt = require('bcrypt');
const Joi = require('joi');
var mongoose = require('mongoose');
const Topic = require('../models/topic.model');
const filterService = require('../services/filter.service');


const topicSchema = Joi.object({
  name: Joi.string().required(),
  shortCode: Joi.number().required(),
  icon: Joi.string().required(),
  parent: Joi.string().required(),
  sequence: Joi.number().required(),
  status: Joi.boolean().required(),
})


module.exports = {
  insert,
  getAllTopics,
  getTopicById
}

async function insert(topic) {
  return await new Topic(topic).save();
}


async function getAllTopics(locale) {
  let localeStr = locale? locale : 'en';
  let data = await filterService.getAllTopics(locale);
  return data;
}



async function getTopicById(id, locale) {
  let localeStr = locale? locale : 'en';
  let data = await Topic.aggregate([
    { $lookup: { from: "topics", localField: "topicId", foreignField: "parent", as: "children" } },
    { $match: { id: id },  },
    { $project: {
        children: { $map: { input: '$children', as: "child", in: { _id: '$$child._id', parent: '$$child.parent', shortCode: '$$child.shortCode', icon: '$$child.icon', jobFunctionId: '$$child.topicId', sequence: '$$child.sequence', name: '$$child.name.' + localeStr} } },
        parent: 1, shortCode: 1, icon: 1, topicId: 1, sequence: 1, name: ('$name.' + localeStr) } }
    ]);
  //jobFunction.name = jobFunction.name['en'];
  return data?data[0]:null;

}
