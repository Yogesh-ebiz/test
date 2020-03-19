const express = require('express');
const authRoutes = require('./auth.route');
const jobRequisitionRoutes = require('./jobrequisition.route');
const jobFunctionsRoutes = require('./jobfunction.route');
const skillTypeRoutes = require('./skilltypes.route');
const industryRoutes = require('./industry.route');
const employmentTypeRoutes = require('./employmenttypes.route');
const userRoutes = require('./user.route');



const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/jobfunctions', jobFunctionsRoutes);
router.use('/jobs', jobRequisitionRoutes);
router.use('/skilltypes', skillTypeRoutes);
// router.use('/experiencelevels', experienceLevelRoutes);
router.use('/industries', industryRoutes);
router.use('/employmenttypes', employmentTypeRoutes);
router.use('/users', userRoutes);


module.exports = router;
