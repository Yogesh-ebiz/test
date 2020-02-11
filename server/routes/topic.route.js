const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const topicCtl = require('../controllers/topic.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/').get(asyncHandler(getAllTopics));
router.route('/:id').get(asyncHandler(getTopicById));


async function getAllTopics(req, res) {
  let data = await topicCtl.getAllTopics(res.locale);
  res.json(new Response(data, res));
}

async function getTopicById(req, res) {
  console.log('ID: ', req.params.id)
  console.log('locale', res.locale);
  let map = {data: null , "message": "Retrieved successfully", "status": 200};
  let data = await topicCtl.getTopicById(req.params.id, res.locale);

  res.json(new Response(data, res));
}
