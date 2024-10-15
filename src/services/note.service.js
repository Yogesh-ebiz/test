const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');

const Note = require('../models/note.model');

const noteSchema = Joi.object({
  subject: Joi.object(),
  subjectType: Joi.string().required(),
  createdBy: Joi.object().required(),
  message: Joi.string().required(),
  viewers: Joi.array().optional()
});



async function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  let note = Note.findById(id);
  return note
}


async function findBy_Id(id) {
  let data = null;

  if(!id){
    return;
  }

  let note = Note.findById(id);
  return note;
}


async function getNotes(subjectType, subjectId, sort) {
  let data = null;

  if(!subjectType || !subjectId || !sort){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page)+1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;



  const options = {
    page: page,
    limit: limit,
  };


  let aList = [];
  let aLookup = [];
  let aMatch = {$match: {subjectType: subjectType, subject: subjectId}};
  let aSort = {$sort: {createdDate: direction} };

  aList.push(aMatch);
  aList.push(
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy'}
  );

  const aggregate = Note.aggregate(aList);

  return await Note.aggregatePaginate(aggregate, options);
}


async function addNote(form) {
  let data = null;

  if(!form){
    return;
  }

  await noteSchema.validate(form, {abortEarly: false});
  const note = await new Note(form).save();

  return note;
}

async function update(form, member) {
  let data = null;

  if(!note || !member){
    return;
  }

  let note = await Note.findById(form._id);
  if(note){
    note.message = form.message;
    note.viewers = form.viewers;
    note = await note.save();
  }

  return note;
}

async function deleteById(id) {
  if (!id) {
    return;
  }

  return await Note.findByIdAndDelete(id);
}

module.exports = {
  findById:findById,
  findBy_Id:findBy_Id,
  getNotes:getNotes,
  addNote:addNote,
  update:update,
  deleteById,
}
