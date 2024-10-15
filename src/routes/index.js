const express = require('express');
const authRoute = require('./v1/auth.route');
const userRoute = require('./v1/user.route');
const adRoutes = require('./ad.route');
const candidateRoutes = require('./candidate.route');
const docsRoute = require('./v1/docs.route');
const articleRoutes = require('./article.route');
const applicationRoutes = require('./application.route');
const adminRoutes = require('./admin.route');
const campaignRoutes = require('./campaign.route');
const companyRoutes = require('./company.route');
const emailRoutes = require('./email.route');
const filterRoutes = require('./filter.route');
const invitationRoutes = require('./invitation.route');
const jobRoutes = require('./jobrequisition.route');
const memberRoutes = require('./member.route');
const peopleRoutes = require('./people.route');
const projectRoutes = require('./project.route');
const resumeRoutes = require('./resumes.route');
const roleRoutes = require('./role.route');
const salaryRoutes = require('./salary.route');
const suggestionRoutes = require('./suggestion.route');
const templateRoutes = require('./template.route');
const talentRoutes = require('./talent.route');
const subscriptionRoutes = require('./subscription.route');
const userRoutes = require('./user.route');
const taskRoutes = require('./task.route');
const webhookRoutes = require('./webhook.route');
const commentRoutes = require('./comment.route');
const captureRoute = require('./capture.route');
const systemRoute = require('./system.route');
const config = require('../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/ads',
    route: adRoutes,
  },
  {
    path: '/articles',
    route: articleRoutes,
  },
  {
    path: '/applications',
    route: applicationRoutes,
  },
  {
    path: '/campaigns',
    route: campaignRoutes,
  },
  {
    path: '/candidates',
    route: candidateRoutes,
  },
  {
    path: '/comments',
    route: commentRoutes,
  },
  {
    path: '/emails',
    route: emailRoutes,
  },
  {
    path: '/company',
    route: companyRoutes,
  },
  {
    path: '/filters',
    route: filterRoutes,
  },
  {
    path: '/invitations',
    route: invitationRoutes,
  },
  {
    path: '/jobs',
    route: jobRoutes,
  },
  {
    path: '/members',
    route: memberRoutes,
  },
  {
    path: '/people',
    route: peopleRoutes,
  },
  {
    path: '/projects',
    route: projectRoutes,
  },
  {
    path: '/roles',
    route: roleRoutes,
  },
  {
    path: '/resumes',
    route: resumeRoutes,
  },
  {
    path: '/salary',
    route: salaryRoutes,
  },
  {
    path: '/suggestions',
    route: suggestionRoutes,
  },
  {
    path: '/templates',
    route: templateRoutes,
  },
  {
    path: '/talent',
    route: talentRoutes,
  },
  {
    path: '/subscriptions',
    route: subscriptionRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/tasks',
    route: taskRoutes,
  },
  {
    path: '/webhooks',
    route: webhookRoutes,
  },
  {
    path: '/captures',
    route: captureRoute
  },
  {
    path: '/sys',
    route: systemRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
