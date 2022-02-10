const express = require('express');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const asyncHandler = require('express-async-handler');
const salaryCtl = require('../controllers/salary.controller');

let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/:id/reactions').post(asyncHandler(addSalaryReaction));
router.route('/salaryhistory/:salaryHistoryId/count').get(asyncHandler(getSalaryReactionCount));



async function addSalaryReaction(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let salaryHistoryId = ObjectID(req.params.id);
  let reaction = req.body;
  let data = await salaryCtl.addSalaryReaction(currentUserId, salaryHistoryId, reaction);
  res.json(new Response(data, data?'companysalary_reaction_added_successful':'not_found', res));
}



async function getSalaryReactionCount(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let salaryHistoryId = ObjectID(req.params.salaryHistoryId);
  let data = await salaryCtl.getSalaryReactionCount(salaryHistoryId);
  res.json(new Response(data, data?'companysalary_reaction_retrieved_successful':'not_found', res));
}
