const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const applicationCtl = require('../controllers/application.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/:id').get(asyncHandler(getApplicationById));
router.route('/:id/upload/cv').post(asyncHandler(uploadCV));




async function getApplicationById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let data = await applicationCtl.getApplicationById(currentUserId, applicationId);

  res.json(new Response(data, data?'event_retrieved_successful':'not_found', res));
}



async function uploadCV(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);

  let data = await applicationCtl.uploadCV(currentUserId, applicationId, req);
  res.json(new Response(data, data?'experiencelevel_retrieved_successful':'not_found', res));
}

