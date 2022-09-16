const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const asyncHandler = require('express-async-handler');
const invitationCtl = require('../controllers/invitation.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/:id').get(asyncHandler(getInvitationById));

async function getInvitationById(req, res) {
  const invitationId = ObjectID(req.params.id);
  let data = await invitationCtl.getInvitationById(invitationId);
  res.json(new Response(data, data?'invitation_retrieved_successful':'not_found', res));

}

