const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');

const Note = require('../models/note.model');

const noteSchema = Joi.object({
  subject: Joi.object(),
  subjectType: Joi.string().required(),
  createdBy: Joi.object().required(),
  message: Joi.string().required()
});



async function findBy_Id(noteId) {
  let data = null;

  if(noteId==null){
    return;
  }

  let comment = Comment.findById(commentId);
  return comment
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
  let aMatch = {$match: {subjectType: subjectType, subject: ObjectID(subjectId)}};
  let aSort = {$sort: {createdDate: direction} };

  aList.push(aMatch);
  aList.push(
    {$lookup:{
        from:"members",
        let:{user:"$createdBy"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$user"]}}}
        ],
        as: 'createdBy'
      }
    },
    { $unwind: '$createdBy'}
  );


  const aggregate = Note.aggregate(aList);

  return await Note.aggregatePaginate(aggregate, options);
}


async function addNote(note, member) {
  let data = null;

  if(!note || !member){
    return;
  }

  note = await Joi.validate(note, noteSchema, {abortEarly: false});
  note = await new Note(note).save()

  return note;

}



module.exports = {
  findBy_Id:findBy_Id,
  getNotes:getNotes,
  addNote:addNote
}
