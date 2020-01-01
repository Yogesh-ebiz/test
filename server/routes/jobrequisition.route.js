const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const jobRequisitionCtl = require('../controllers/jobrequisition.controller');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/search').get(asyncHandler(getJobs));
router.route('/:id').get(asyncHandler(getJobById));


async function insert(req, res) {
  let job = await jobRequisitionCtl.insert(req.body);
  res.json(job);
}

async function getJobById(req, res) {
  console.log('JobID: ', req.params.id)
  let job = await jobRequisitionCtl.getJobById(req.params.id);
  res.json(job);
}


async function getJobs(req, res) {
  let jobs = await jobRequisitionCtl.getJobs(req.params);
  res.json(jobs);
}
