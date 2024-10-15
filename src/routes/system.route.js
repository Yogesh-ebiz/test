const express = require('express');
const {ObjectId} = require('mongodb');
const validate = require('../middlewares/validate');

const jobValidation = require("../validations/job.validation");
const jobRequisitionCtl = require('../controllers/jobrequisition.controller');

const router = express.Router();
module.exports = router;

router.route('/jobs/ending-today').get(validate(jobValidation.getJobsEndingToday), jobRequisitionCtl.getJobsEndingToday);
router.route('/jobs/:id/expire').put(validate(jobValidation.markJobAsExpired), jobRequisitionCtl.markJobAsExpired);
router.route('/jobs/drafts/outdated').get(validate(jobValidation.getOutdatedDraftJobs), jobRequisitionCtl.getOutdatedDraftJobs);
