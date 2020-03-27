const express = require('express');
const authRoutes = require('./auth.route');
const jobRequisitionRoutes = require('./jobrequisition.route');
const jobFunctionsRoutes = require('./jobfunction.route');
const experienceLevelRoutes = require('./experiencelevel.route');
const skillTypeRoutes = require('./skilltypes.route');
const industryRoutes = require('./industry.route');
const employmentTypeRoutes = require('./employmenttypes.route');
const userRoutes = require('./user.route');
const applicationRoutes = require('./application.route');
const workflowRoutes = require('./workflow.route');
const promotionRoutes = require('./promotion.route');

const filterRoutes = require('./filter.route');



const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/jobfunctions', jobFunctionsRoutes);
router.use('/jobs', jobRequisitionRoutes);
router.use('/skilltypes', skillTypeRoutes);
router.use('/experiencelevels', experienceLevelRoutes);
router.use('/industries', industryRoutes);
router.use('/employmenttypes', employmentTypeRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/workflows', workflowRoutes);
router.use('/promotion', promotionRoutes);
router.use('/filters', filterRoutes);



module.exports = router;
