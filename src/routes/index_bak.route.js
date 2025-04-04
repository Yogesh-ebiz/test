const express = require('express');
const authRoutes = require('./auth.route');
const candidatesRoutes = require('./candidates.route');
const jobRequisitionRoutes = require('./jobrequisition.route');
const jobFunctionsRoutes = require('./jobfunction.route');
const experienceLevelRoutes = require('./experiencelevel.route');
const skillRoutes = require('./skill.route');
const industryRoutes = require('./industry.route');
const categoryRoutes = require('./category.route');
const employmentTypeRoutes = require('./employmenttypes.route');
const userRoutes = require('./user.route');
const applicationRoutes = require('./application.route');
const workflowRoutes = require('./workflow.route');
const memberRoutes = require('./member.route');
const invitationRoutes = require('./invitation.route');
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
const roleRoutes = require('./role.route');
const resumesRoutes = require('./resumes.route');
const salaryRoutes = require('./salary.route');
const webhookRoutes = require('./webhook.route');



const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/ads', adRoutes);
router.use('/admin', adminRoutes);

router.use('/applications', applicationRoutes);
router.use('/candidates', candidatesRoutes);
router.use('/categories', categoryRoutes);
router.use('/company', companyRoutes);
router.use('/emails', emailRoutes);
router.use('/employmenttypes', employmentTypeRoutes);
router.use('/experiencelevels', experienceLevelRoutes);
router.use('/filters', filterRoutes);
router.use('/industries', industryRoutes);
router.use('/invitations', invitationRoutes);
router.use('/jobs', jobRequisitionRoutes);
router.use('/jobfunctions', jobFunctionsRoutes);
router.use('/members', memberRoutes);
router.use('/promotion', promotionRoutes);
router.use('/skills', skillRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/parser', parserRoutes);
router.use('/policies', policyRoutes);
router.use('/products', productRoutes);
router.use('/people', peopleRoutes);
router.use('/roles', roleRoutes);
router.use('/resumes', resumesRoutes);
router.use('/salaries', salaryRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/talent', talentRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/workflows', workflowRoutes);
router.use('/webhooks', webhookRoutes);


module.exports = router;
