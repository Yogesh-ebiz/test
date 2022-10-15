const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const noteCtl = require('../controllers/note.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/').post(asyncHandler(add));
router.route('/:id').put(asyncHandler(update));
router.route('/:id').delete(asyncHandler(remove));
router.route('/subject/:subjectId').get(asyncHandler(search));




async function add(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let form = req.body;

  let data = await noteCtl.addNote(currentUserId, form);
  res.json(new Response(data, data?'note_added_successful':'not_found', res));
}


async function update(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = req.params.id;
  let form = req.body;

  let data = await noteCtl.updateNote(id, currentUserId, form);
  res.json(new Response(data, data?'note_updated_successful':'not_found', res));
}


async function remove(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = req.params.id;

  let data = await noteCtl.removeNote(id, currentUserId);
  res.json(new Response(data, data?'note_deleted_successful':'not_found', res));
}

async function search(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let subjectId = req.params.subjectId;
  let pagination = req.query;

  let data = await noteCtl.search(currentUserId, subjectId, pagination, res.locale);
  res.json(new Response(data, data?'notes_retrieved_successful':'not_found', res));
}


