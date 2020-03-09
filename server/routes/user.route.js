const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtl = require('../controllers/user.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))


router.route('/:userId/applications').get(asyncHandler(getApplicationsByUserId));
router.route('/:userId/bookmarks').get(asyncHandler(getBookmarkByUserId));





async function getApplicationsByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await userCtl.getApplicationsByUserId(currentUserId, filter);

  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}


async function getBookmarkByUserId(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await userCtl.getBookmarksByUserId(currentUserId, filter);

  res.json(new Response(data, data?'bookmarks_retrieved_successful':'not_found', res));
}
