const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const currencyCtl = require('../controllers/currency.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;


router.route('/search').get(asyncHandler(searchCurrencies));


async function searchCurrencies(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = parseInt(req.params.id);
  let progess = req.body;
  let data = await applicationCtl.addProgress(currentUserId, applicationId, progess);

  res.json(new Response(data, data?'progress_added_successful':'not_found', res));
}
