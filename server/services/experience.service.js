const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Experience = require('../models/experience.model');
const feedService = require('../services/api/feed.service.api');

const experienceSchema = Joi.object({
  _id: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  employer: Joi.object(),
  description: Joi.string().allow('').optional(),
  employmentTitle: Joi.string().allow('').optional(),
  employmentType: Joi.string().allow('').optional(),
  fromDate: Joi.number().optional(),
  thruDate: Joi.number().optional(),
  isCurrent: Joi.boolean(),
  terminationReason: Joi.string().allow('').optional(),
  terminationType: Joi.string().allow('').optional(),
  jobFunction: Joi.string().allow('').optional()
});


async function add(form) {

  if(!form){
    return;
  }

  form = await Joi.validate(form, experienceSchema, {abortEarly: false});

  let experience;

  if(!form.employer.id){
    let company = {name: form.employer.name, primaryAddress: {name: '', address1: '', address2: '', city: form.city, state: form.state, country: form.country, postalCode: ''} };
    company = await feedService.createCompany(company);
    form.employer.id=company.id;
  }

  if(form._id){
    let experience = await Experience.findById(ObjectID(form._id));
    if(experience){
      experience.city = form.city;
      experience.state = form.state;
      experience.country = form.country
      experience.employer = form.employer
      experience.description = form.description;
      experience.employmentTitle = form.employmentTitle
      experience.employmentType = form.employmentType;
      experience.fromDate = form.fromDate;
      experience.thruDate = form.thruDate;
      experience.isCurrent = form.isCurrent;
      experience.terminationReason = form.terminationReason;
      experience.terminationType = form.terminationType;
      experience.jobFunction = form.jobFunction;
      await experience.save();
    }
  } else {
    console.log('not found')
    experience = await new Experience(form).save();
  }


  return experience;

}


async function update(experience) {

  if(!experience){
    return;
  }

  experience = await Joi.validate(experience, experienceSchema, {abortEarly: false});
  experience = await new Experience(experience).save();
  return experience;

}

module.exports = {
  add:add,
  update:update

}
