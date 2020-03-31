const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const suggestionCtl = require('../controllers/suggestion.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/search').get(asyncHandler(getSuggestion));


async function getSuggestion(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let query = req.query.query;
  let data = await suggestionCtl.getSuggestion(currentUserId, query);

  res.json(new Response(data, data?'suggestion_retrieved_successful':'not_found', res));
}

