const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const ObjectID = require('mongodb').ObjectID;

const emailCtl = require('../controllers/email.controller');
let Response = require('../const/response');

let emailValidation = require('../validations/email.validation');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require('../middlewares/validate');

const router = express.Router();
module.exports = router;

//router.route('/compose').post(asyncHandler(composeEmail));
router.route('/compose').post(authorize('update_application'), validate(emailValidation.composeEmail), emailCtl.composeEmail);
router.route('/:emailId').get(asyncHandler(getEmailById));
router.route('/:emailId/upload').post(authorize('update_application'),validate(emailValidation.uploadEmailAttachmentById), emailCtl.uploadEmailAttachmentById);



async function composeEmail(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = req.header('companyId') ? parseInt(req.header('companyId')) : null;
  let form = req.body;


  let data = await emailCtl.composeEmail(currentUserId, form, companyId);
  res.json(new Response(data, data?'email_composed_successful':'not_found', res));
}


async function getEmailById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let emailId = ObjectID(req.params.emailId);


  let data = await emailCtl.getEmailById(currentUserId, emailId);
  res.json(new Response(data, data?'emails_retrieved_successful':'not_found', res));
}


async function uploadEmailAttachmentById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let emailId = ObjectID(req.params.emailId);
  let files = req.files;
  let data = await emailCtl.uploadEmailAttachmentById(currentUserId, emailId, files.file);
  res.json(new Response(data, data?'emails_retrieved_successful':'not_found', res));
}




