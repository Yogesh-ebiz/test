const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const jobFunctionsRoutes = require('./jobfunction.route');
const jobRequisitionRoutes = require('./jobrequisition.route');
const skillTypeRoutes = require('./skilltypes.route');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/jobfunctions', jobFunctionsRoutes);
router.use('/jobs', jobRequisitionRoutes);
router.use('/skilltypes', skillTypeRoutes);

module.exports = router;
