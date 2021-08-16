const express = require('express');
const authRoutes = require('./auth.route');
const jobRequisitionRoutes = require('./jobrequisition.route');
const jobFunctionsRoutes = require('./jobfunction.route');
const experienceLevelRoutes = require('./experiencelevel.route');
const skillTypeRoutes = require('./skilltypes.route');
const industryRoutes = require('./industry.route');
const categoryRoutes = require('./category.route');
const employmentTypeRoutes = require('./employmenttypes.route');
const userRoutes = require('./user.route');
const applicationRoutes = require('./application.route');
const workflowRoutes = require('./workflow.route');
const promotionRoutes = require('./promotion.route');
const suggestionRoutes = require('./suggestion.route');
const companyRoutes = require('./company.route');
const talentRoutes = require('./talent.route');
const adminRoutes = require('./admin.route');
const productRoutes = require('./product.route');
const peopleRoutes = require('./people.route');
const emailRoutes = require('./email.route');
const taskRoutes = require('./task.route');
const adRoutes = require('./ad.route');
const parserRoutes = require('./parser.route');

const filterRoutes = require('./filter.route');
const policyRoutes = require('./policy.route');
const subscriptionRoutes = require('./subscription.route');



const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/ads', adRoutes);
router.use('/admin', adminRoutes);

router.use('/applications', applicationRoutes);
router.use('/categories', categoryRoutes);
router.use('/company', companyRoutes);
router.use('/emails', emailRoutes);
router.use('/employmenttypes', employmentTypeRoutes);
router.use('/experiencelevels', experienceLevelRoutes);
router.use('/filters', filterRoutes);
router.use('/industries', industryRoutes);
router.use('/jobs', jobRequisitionRoutes);
router.use('/jobfunctions', jobFunctionsRoutes);
router.use('/promotion', promotionRoutes);
router.use('/skilltypes', skillTypeRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/parser', parserRoutes);
router.use('/policies', policyRoutes);
router.use('/products', productRoutes);
router.use('/people', peopleRoutes);

router.use('/subscriptions', subscriptionRoutes);
router.use('/talent', talentRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/workflows', workflowRoutes);

module.exports = router;
