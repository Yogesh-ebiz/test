const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const querystring = require('querystring');
const templateCtl = require('../controllers/template.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;


router.route('/').post(asyncHandler(createTemplate));
router.route('/:id').get(asyncHandler(getTemplate));
router.route('/:id').put(asyncHandler(updateTemplate));
router.route('/:cat').delete(asyncHandler(deleteTemplate));

async function createTemplate(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let map = {"message": "Created successfully", "status": 200, data: null };

  let data = await templateCtl.createTemplate(currentUserId, req.body);
  res.json(new Response(data, data?'template_created_successful':'not_found', res));
}

async function getTemplate(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let templateId = parseInt(req.params.id);

  let data = await templateCtl.getTemplate(currentUserId, templateId);

  res.json(new Response(data, data?'template_retrieved_successful':'not_found', res));
}


async function updateTemplate(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let templateId = parseInt(req.params.id);
  let template = req.body;
  template.createdBy = currentUserId;

  let map = {"message": "Created successfully", "status": 200, data: null };
  let data = await templateCtl.updateTemplate(currentUserId, templateId, template);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}


async function deleteTemplate(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let templateId = parseInt(req.params.id);
  let category = req.params.cat

  let map = {"message": "Created successfully", "status": 200, data: null };
  let data = await templateCtl.deleteTemplate(currentUserId, templateId, category);
  res.json(new Response(data, data?'template_deleted_successful':'not_found', res));
}


