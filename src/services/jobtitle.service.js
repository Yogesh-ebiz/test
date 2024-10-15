const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobTitle= require('../models/jobtitle.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const jobTitleSchema = Joi.object({
  _id: Joi.object().optional(),
  name: Joi.object().required()
});


function findById(id) {
  if(!id){
    return;
  }

  return JobTitle.findById(id);
}



async function add(form) {

  if(!form){
    return;
  }
  jobTitleSchema.validate(form, {abortEarly: false});
  return  new JobTitle(form).save();

}


async function update(id, form) {
  if(!id || !form){
    return;
  }

  jobFunctionSchema.validate(form, {abortEarly: false});

  let jobTitle = await findById(id);

  if(jobTitle){
    jobTitle.name = form.name;
    jobTitle = await jobTitle.save();
  }
  return jobTitle;
};

async function suggestion(keyword) {
  let data = [];
  if(!keyword){
    return data;
  }
  data = await JobTitle.find({ name: { $regex: keyword, $options: 'i' }}).limit(10);
  return _.map(data, 'name');
}


module.exports = {
  add,
  findById,
  update,
  suggestion
}
