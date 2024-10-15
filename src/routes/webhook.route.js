const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const webhookCtl = require('../controllers/webhook.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/webscraper.io').post(asyncHandler(webscraperio));
router.route('/:applicationId/updateApplicationEmails').post(webhookCtl.updateApplicationEmails);
router.route('/:applicationId/updateApplicationConversation').post(webhookCtl.updateApplicationConversation);
router.route('/:candidateId/updateCandidateConversation').post(webhookCtl.updateCandidateConversation);

async function webscraperio(req, res) {

  let data = await webhookCtl.webscraperio(req.body);
  res.json(new Response(data, data?'user_retrieved_successful':'not_found', res));
}

