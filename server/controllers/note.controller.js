const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Note = require('../models/note.model');
const noteService = require('../services/note.service');
const Comment = require("../models/comment.model");


module.exports = {
  addNote,
  updateNote,
  removeNote,
  search
}



async function addNote(currentUserId, form) {
  form = await Joi.validate(form, policySchema, { abortEarly: false });
  if(!currentUserId || !form){
    return null;
  }

  let result = null;

  try {
    result = await policyService.addPolicy(form);

  } catch(e){
    console.log('addNote: Error', e);
  }


  return result
}



async function updateNote(noteId, currentUserId, form) {
  if(!currentUserId || !noteId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let note = await Note.findById(noteId);
      if(note){
        note.name = form.name;
        note.updatedBy = currentUserId;
        note.description=form.description;
        note.privileges=form.privileges;
        result = await policy.save();
      }

    }
  } catch(e){
    console.log('updateNote: Error', e);
  }


  return result
}


async function deleteNote(noteId, currentUserId) {
  if(!currentUserId || !noteId){
    return null;
  }

  let result = null;

  try {

    let note = await Note.findById(noteId);
    if(note){
      result = await note.delete();
      if(result){
        result = {deleted: 1};
      }
    }

  } catch(e){
    console.log('deleteNote: Error', e);
  }


  return result
}


async function search(currentUserId, subjectId, pagination, locale) {

  if(!currentUserId || !subjectId || !pagination){
    return null;
  }

  let limit = (pagination.size && pagination.size>0) ? parseInt(pagination.size):20;
  let page = (pagination.page && pagination.page==0) ? 1:parseInt(pagination.page)+1;
  let direction = (pagination.direction && sort.direction=="DESC") ? -1:1;



  const options = {
    page: page,
    limit: limit,
  };


  let aList = [];
  const aMatch = {$match: {subject: ObjectID(subjectId)}};
  const aSort = {$sort: {createdDate: direction} };
  aList.push(aMatch);
  aList.push(aSort);

  const aggregate = Note.aggregate(aList);

  return await Note.aggregatePaginate(aggregate, options);
}
