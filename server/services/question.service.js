const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Question = require('../models/question.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const questionSchema = Joi.object({
  _id: Joi.object().optional(),
  createdBy: Joi.number().allow(null).optional(),
  text: Joi.string().required(),
  category: Joi.string().allow('').allow(null).optional(),
  type: Joi.string().required(),
  required: Joi.boolean().required(),
  options: Joi.array().optional(),
  noMaxSelection: Joi.number().optional(),
  hint: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
  isDefault: Joi.boolean().optional()
});


async function getQuestions(filter, sort) {
  let data = null;

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };


  let products = Product.paginate({}, options);
  return products
}

function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return Question.findById(id).populate('answers');
}



async function add(form) {

  if(!form){
    return;
  }

  form.isDefault = form.isDefault?true:false;
  form.required = form.required?true:false;
  form = await Joi.validate(form, questionSchema, {abortEarly: false});
  const question = new Question(form).save();

  return question;

}


async function update(id, form) {
  if(!id || !form){
    return;
  }

  form = await Joi.validate(form, questionSchema, {abortEarly: false});

  let question = await findById(id);

  if(question){
    question.lastUpdatedDate = Date.now();
    question.text = form.text;
    question.type = form.type;
    question.required = form.required;
    question.options = form.options;
    question.noMaxSelection = form.noMaxSelection;
    question.hint = form.hint;
    question.description = form.description;

    result = await question.save();
  }
  return result;

}



module.exports = {
  getQuestions:getQuestions,
  findById:findById,
  add:add,
  update:update
}
