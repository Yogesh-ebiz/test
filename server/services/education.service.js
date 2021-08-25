const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Education = require('../models/education.model');
const feedService = require('../services/api/feed.service.api');


const educationSchema = Joi.object({
  _id: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  institute: Joi.object(),
  degree: Joi.string().allow('').optional(),
  fieldOfStudy: Joi.object().optional(),
  fromDate: Joi.number().optional(),
  thruDate: Joi.number().optional(),
  isCurrent: Joi.boolean(),
  hasGraduated: Joi.boolean(),
  gpa: Joi.number().optional()
});


async function add(form) {

  if(!form){
    return;
  }

  form = await Joi.validate(form, educationSchema, {abortEarly: false});

  let education;

  if(!form.institute.id){
    institute = {name: form.institute.name, primaryAddress: {name: '', address1: '', address2: '', city: form.city, state: form.state, country: form.country, postalCode: ''} };
    institute = await feedService.createInstitute(institute);
    form.institute.id=institute.id;
  }

  if(form._id){
    education = await Education.findById(ObjectID(form._id));
    if(education){
      education.city = form.city;
      education.state = form.state;
      education.country = form.country
      education.institute = form.institute
      education.degree = form.degree;
      education.fieldOfStudy = form.fieldOfStudy
      education.employmentType = form.employmentType;
      education.fromDate = form.fromDate;
      education.thruDate = form.thruDate;
      education.isCurrent = form.isCurrent;
      education.hasGraduated = form.hasGraduated;
      education.gpa = form.gpa;
      education = await education.save();
    }
  } else {
    education = await new Education(form).save();
  }


  return education;

}


async function update(education) {

  if(!education){
    return;
  }

  return education;

}

module.exports = {
  add:add,
  update:update

}
