const express = require('express');
const passport = require('passport');
const validate = require('../middlewares/validate');
const asyncHandler = require('express-async-handler');
const companyCtrl = require('../controllers/company.controller');
const talentCtrl = require('../controllers/talent.controller');
const companyValidation = require('../validations/company.validation');
const jobValidation = require('../validations/job.validation');
const userValidation = require('../validations/user.validation');
const peopleValidation = require('../validations/people.validation');
const projectValidation = require('../validations/project.validation');
const memberValidation = require('../validations/member.validation');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');

let Response = require('../const/response');
const {parse} = require("url");
const { authorize } = require("../middlewares/authMiddleware");

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.get('/session', validate(userValidation.getUserSession), talentCtrl.getUserSession);
router.post('/register', validate(userValidation.registerNewUser), talentCtrl.registerNewUser);


router.route('/company/search').post(validate(companyValidation.searchCompany), talentCtrl.searchCompany);
router.route('/company/:companyId').get(authorize('manage_company'), validate(companyValidation.getCompany), talentCtrl.getCompany);
router.route('/company/:companyId').put(authorize('manage_company'), validate(companyValidation.updateCompany), talentCtrl.updateCompany);
router.route('/company/:companyId/upload/avatar').post(authorize('manage_company'), validate(companyValidation.uploadCompanyAvatar), talentCtrl.uploadCompanyAvatar);
router.route('/company/:companyId/upload/cover').post(authorize('manage_company'), validate(companyValidation.uploadCompanyCover), talentCtrl.uploadCompanyCover);

router.route('/company/:companyId/subscriptions').get(authorize('manage_subscription'), validate(companyValidation.getSubscription), talentCtrl.getSubscriptions);
router.route('/company/:companyId/subscriptions').post(authorize('manage_subscription'), validate(companyValidation.addSubscription), talentCtrl.addSubscription);
router.route('/company/:companyId/subscription/:subscriptionId').post(authorize('manage_subscription'), validate(companyValidation.updateSubscription), talentCtrl.updateSubscription);


router.route('/company/:companyId/paymentmethod').post(authorize('manage_billing'), validate(companyValidation.addPaymentMethod), talentCtrl.addPaymentMethod);
router.route('/company/:companyId/payment/cards').get(authorize('manage_billing'), validate(companyValidation.getCards), talentCtrl.getCards);
router.route('/company/:companyId/payment/cards/:cardId').delete(authorize('manage_billing'), validate(companyValidation.removeCard), talentCtrl.removeCard);
router.route('/company/:companyId/payment/cards/verify').post(authorize('manage_billing'), validate(companyValidation.verifyCard), talentCtrl.verifyCard);

router.route('/company/:companyId/invoices').get(authorize('manage_billing'), validate(companyValidation.getInvoices), talentCtrl.getInvoices);

router.route('/company/:companyId/insights').get(authorize('view_insight'), validate(companyValidation.getInsights), talentCtrl.getCompanyInsights);
router.route('/company/:companyId/tasks/stats').get(authorize('view_insight'), validate(companyValidation.getInsights), talentCtrl.getTasksInsights);
router.route('/company/:companyId/inmail/credits').get(authorize(), validate(companyValidation.getInmailCredits), talentCtrl.getInmailCredits);
router.route('/company/:companyId/taxandfee').get(authorize(), validate(companyValidation.getTaxAndFee), talentCtrl.getTaxAndFee);

router.route('/company/:companyId/impression/insight/candidates').get(authorize('view_insight'), validate(companyValidation.getImpressionCandidates), talentCtrl.getImpressionCandidates);
router.route('/company/:companyId/dashboard').get(authorize('view_dashboard'), validate(companyValidation.getDashboard), talentCtrl.getDashboard);




router.route('/company/:companyId/jobs').post(authorize('create_job'), validate(companyValidation.createJob), talentCtrl.createJob);
router.route('/company/:companyId/jobs/summary').get(authorize('view_dashboard'), validate(companyValidation.getCompanyJobSummary), talentCtrl.getCompanyJobSummary)
router.route('/company/:companyId/jobs/count').get(authorize('view_job'), validate(companyValidation.getCompanyJobCount), talentCtrl.getCompanyJobCount);
router.route('/company/:companyId/jobs/search').post(authorize('view_job'), validate(companyValidation.searchJob), talentCtrl.searchJobs);
router.route('/company/:companyId/jobs/searchwithBudget').post(authorize('view_job'), validate(companyValidation.searchJob), talentCtrl.searchJobsWithBudget);
router.route('/company/:companyId/jobs/lookup').post(authorize('view_job'), validate(companyValidation.lookupJobs), talentCtrl.lookupJobs);
router.route('/company/:companyId/jobs/search/title').get(authorize('view_job'), validate(companyValidation.searchJobTitle), talentCtrl.searchJobTitle);
router.route('/company/:companyId/jobs/:jobId').get(authorize('view_job'), validate(companyValidation.getJobById), talentCtrl.getJobById);
router.route('/company/:companyId/jobs/:jobId').put(authorize('update_job'), validate(companyValidation.updateJob), talentCtrl.updateJob);
router.route('/company/:companyId/jobs/:jobId/close').post(authorize('update_job'), validate(companyValidation.closeJob), talentCtrl.closeJob);
router.route('/company/:companyId/jobs/:jobId/archive').post(authorize('update_job'), validate(companyValidation.archiveJob), talentCtrl.archiveJob);
router.route('/company/:companyId/jobs/:jobId/unarchive').post(authorize('update_job'), validate(companyValidation.unarchiveJob), talentCtrl.unarchiveJob);
router.route('/company/:companyId/jobs/:jobId').delete(authorize('update_job'), validate(companyValidation.deleteJob), talentCtrl.deleteJob);
router.route('/company/:companyId/jobs/:jobId/shareToSocialAccount/:socialAccountType').post(authorize('create_job'), validate(companyValidation.shareJobToSocialAccount), talentCtrl.shareJobToSocialAccount);

router.route('/company/:companyId/jobs/:jobId/comments').get(authorize('update_job'), validate(companyValidation.getJobComments), talentCtrl.getJobComments);
router.route('/company/:companyId/jobs/:jobId/comments').post(authorize('update_job'), validate(companyValidation.addJobComment), talentCtrl.addJobComment);

router.route('/company/:companyId/jobs/:jobId/tags').post(authorize('update_job'), validate(companyValidation.addJobTag), talentCtrl.addJobTag);
router.route('/company/:companyId/jobs/:jobId/tags').put(authorize('update_job'), validate(companyValidation.updateJobTags), talentCtrl.updateJobTags);
router.route('/company/:companyId/jobs/:jobId/tags').delete(authorize('update_job'), validate(companyValidation.removeJobTags), talentCtrl.removeJobTags);


router.route('/company/:companyId/jobs/:jobId/insights').get(authorize('view_insight'), validate(companyValidation.getJobInsights), talentCtrl.getJobInsights);
router.route('/company/:companyId/jobs/:jobId/activities').get(authorize('view_job'), validate(companyValidation.getJobActivities), talentCtrl.getJobActivities);
router.route('/company/:companyId/jobs/:jobId/candidates/suggestions').post(authorize('view_job'), validate(companyValidation.searchPeopleSuggestions), talentCtrl.searchPeopleSuggestions);


router.route('/company/:companyId/jobs/:jobId/pipeline').post(authorize('update_job'), validate(companyValidation.updateJobPipeline), talentCtrl.updateJobPipeline);
router.route('/company/:companyId/jobs/:jobId/pipeline').get(authorize('update_job'), validate(companyValidation.getJobPipeline), talentCtrl.getJobPipeline);
router.route('/company/:companyId/jobs/:jobId/members').get(authorize('update_job'), validate(companyValidation.getJobMembers), talentCtrl.getJobMembers);
router.route('/company/:companyId/jobs/:jobId/members').post(authorize('update_job'), validate(companyValidation.updateJobMembers), talentCtrl.updateJobMembers);

router.route('/company/:companyId/jobs/:jobId/subscribe').post(authorize('view_job'), validate(companyValidation.subscribeJob), talentCtrl.subscribeJob);
router.route('/company/:companyId/jobs/:jobId/subscribe').delete(authorize('view_job'), validate(companyValidation.unsubscribeJob), talentCtrl.unsubscribeJob);
router.route('/company/:companyId/jobs/:jobId/applicationform').post(authorize('update_job'), validate(companyValidation.updateJobApplicationForm), talentCtrl.updateJobApplicationForm);
router.route('/company/:companyId/jobs/:jobId/board').get(authorize('view_dashboard'), validate(companyValidation.getBoard), talentCtrl.getBoard);

router.route('/company/:companyId/jobs/:jobId/campaigns').post(authorize('view_campaign'), validate(jobValidation.searchCampaigns), talentCtrl.searchCampaigns);
router.route('/company/:companyId/jobs/:jobId/sources/:sourceId').post(authorize('update_job'), validate(jobValidation.addSourceApplication), talentCtrl.addSourceApplication);
router.route('/company/:companyId/jobs/:jobId/ads').get(authorize('view_job'), validate(jobValidation.getJobAds), talentCtrl.getJobAds);
router.route('/company/:companyId/jobs/:jobId/feed').get(authorize('view_job'), validate(jobValidation.getJobAds), talentCtrl.getJobAds);


router.route('/company/:companyId/jobs/:jobId/publish').post(authorize('update_job'), validate(jobValidation.publishJob), talentCtrl.publishJob);
router.route('/company/:companyId/jobs/:jobId/pay').post(authorize('update_job'), validate(jobValidation.payJob), talentCtrl.payJob);

router.route('/company/:companyId/jobs/:jobId/applications').post(authorize('view_job'), validate(companyValidation.searchApplications), talentCtrl.searchApplications);
router.route('/company/:companyId/jobs/:jobId/applications/disqualify').post(authorize('update_application'), validate(companyValidation.disqualifyApplications), talentCtrl.disqualifyApplications);
router.route('/company/:companyId/jobs/:jobId/applications/revert').post(authorize('update_application'), validate(companyValidation.revertApplications), talentCtrl.revertApplications);
router.route('/company/:companyId/jobs/:jobId/applications/shortlist').post(authorize('update_application'), validate(companyValidation.shortlistApplications), talentCtrl.shortlistApplications);
router.route('/company/:companyId/jobs/:jobId/applications/shortlist').delete(authorize('update_application'), validate(companyValidation.removeShortlistApplications), talentCtrl.removeShortlistApplications);
router.route('/company/:companyId/applications').post(authorize('update_job'), validate(companyValidation.addApplication), talentCtrl.addApplication);
router.route('/company/:companyId/applications/endingsoon').get(authorize('view_application'), validate(companyValidation.getAllApplicationsEndingSoon), talentCtrl.getAllApplicationsEndingSoon);
router.route('/company/:companyId/applications/newlycreated').get(authorize('view_application'), validate(companyValidation.getAllApplicationsNewlyCreated), talentCtrl.getAllApplicationsNewlyCreated);
// router.route('/company/:companyId/jobs/:jobId/applications/:applicationId/reject').post(authorize('manage_application'), validate(jobValidation.rejectApplication), talentCtrl.rejectApplication);
// router.route('/company/:companyId/jobs/:jobId/applications/:applicationId').post(asyncHandler(updateApplication));
router.route('/company/:companyId/applications/:applicationId').get(authorize('view_application'), validate(companyValidation.getApplicationById), talentCtrl.getApplicationById);
// router.route('/company/:companyId/applications/:applicationId').post(authorize('manage_application'), validate(jobValidation.updateApplication), talentCtrl.updateApplication);
router.route('/company/:companyId/applications/:applicationId/disqualify').post(authorize('update_application'), validate(companyValidation.disqualifyApplication), talentCtrl.disqualifyApplication);
router.route('/company/:companyId/applications/:applicationId/revert').post(authorize('update_application'), validate(companyValidation.revertApplication), talentCtrl.revertApplication);
router.route('/company/:companyId/applications/:applicationId').delete(authorize('update_application'), validate(companyValidation.deleteApplication), talentCtrl.deleteApplication);
router.route('/company/:companyId/applications/:applicationId/accept').post(authorize('update_application'), validate(companyValidation.acceptApplication), talentCtrl.acceptApplication);
router.route('/company/:companyId/applications/:applicationId/reject').post(authorize('update_application'), validate(companyValidation.rejectApplication), talentCtrl.rejectApplication);
router.route('/company/:companyId/applications/:applicationId/progress').post(authorize('manage_application'), validate(companyValidation.updateApplicationProgress), talentCtrl.updateApplicationProgress);
router.route('/company/:companyId/applications/:applicationId/progress/:progressId').get(authorize('view_application'), validate(companyValidation.getApplicationProgress), talentCtrl.getApplicationProgress);

router.route('/company/:companyId/applications/:applicationId/questions').get(authorize('view_application'), validate(companyValidation.getApplicationQuestions), talentCtrl.getApplicationQuestions);

router.route('/company/:companyId/applications/:applicationId/evaluations').get(authorize('view_application'), validate(companyValidation.getApplicationEvaluations), talentCtrl.getApplicationEvaluations);
router.route('/company/:companyId/applications/:applicationId/evaluations').post(authorize('update_application'), validate(companyValidation.addApplicationEvaluation), talentCtrl.addApplicationEvaluation);
router.route('/company/:companyId/applications/:applicationId/evaluations/:evaluationId').put(authorize('update_application'), validate(companyValidation.updateApplicationEvaluation), talentCtrl.updateApplicationEvaluation);
router.route('/company/:companyId/applications/:applicationId/evaluations/:evaluationId').delete(authorize('update_application'), validate(companyValidation.removeApplicationEvaluation), talentCtrl.removeApplicationEvaluation);

router.route('/company/:companyId/applications/:applicationId/emails').get(authorize('view_application'), validate(companyValidation.getApplicationEmails), talentCtrl.getApplicationEmails);

router.route('/company/:companyId/applications/:applicationId/labels').get(authorize('view_application'), validate(companyValidation.getApplicationLabels), talentCtrl.getApplicationLabels);
router.route('/company/:companyId/applications/:applicationId/labels').post(authorize('update_application'), validate(companyValidation.addApplicationLabel), talentCtrl.addApplicationLabel);
router.route('/company/:companyId/applications/:applicationId/labels/:labelId').delete(authorize('update_application'), validate(companyValidation.deleteApplicationLabel), talentCtrl.deleteApplicationLabel);

router.route('/company/:companyId/applications/:applicationId/comments').get(authorize('view_application'), validate(companyValidation.getApplicationComments), talentCtrl.getApplicationComments);
router.route('/company/:companyId/applications/:applicationId/comments').post(authorize('update_application'), validate(companyValidation.addApplicationComment), talentCtrl.addApplicationComment);

// router.route('/company/:companyId/applications/:applicationId/progress/:progressId/evaluate').post(authorize('update_application'), validate(jobValidation.addApplicationProgressEvaluation), talentCtrl.addApplicationProgressEvaluation);
// router.route('/company/:companyId/applications/:applicationId/progress/:progressId/evaluate').delete(asyncHandler(removeApplicationProgressEvaluation));

// ToDo: Come back later to investigate events
router.route('/company/:companyId/applications/:applicationId/progress/:progressId/event').post(authorize('update_application'), validate(companyValidation.updateApplicationProgressEvent), talentCtrl.updateApplicationProgressEvent);
router.route('/company/:companyId/applications/:applicationId/progress/:progressId/event').delete(asyncHandler(removeApplicationProgressEvent));





router.route('/company/:companyId/applications/:applicationId/subscribe').post(authorize('view_application'), validate(jobValidation.subscribeApplication), talentCtrl.subscribeApplication);
router.route('/company/:companyId/applications/:applicationId/subscribe').delete(authorize('view_application'), validate(jobValidation.unsubscribeApplication), talentCtrl.unsubscribeApplication);

router.route('/company/:companyId/applications/:applicationId/activities').get(authorize('view_application'), validate(jobValidation.getApplicationActivities), talentCtrl.getApplicationActivities);
router.route('/company/:companyId/applications/:applicationId/upload').post(authorize('update_application'), validate(jobValidation.uploadApplication), talentCtrl.uploadApplication);
router.route('/company/:companyId/applications/:applicationId/files').get(authorize('view_application'), validate(jobValidation.getFiles), talentCtrl.getFiles);
router.route('/company/:companyId/applications/:applicationId/files/:fileId').delete(authorize('view_application'), validate(jobValidation.removeApplicationFile), talentCtrl.removeApplicationFile);


router.route('/company/:companyId/candidates').post(authorize('update_candidate'), validate(companyValidation.addCandidate), talentCtrl.addCandidate);
router.route('/company/:companyId/candidates').delete(authorize('update_candidate'), validate(companyValidation.removeCandidates), talentCtrl.removeCandidates);
router.route('/company/:companyId/candidates/import').post(authorize('update_candidate'), validate(companyValidation.importResumes), talentCtrl.importResumes);
router.route('/company/:companyId/candidates/search').post(authorize('view_candidate'), validate(companyValidation.searchCandidates), talentCtrl.searchCandidates);
router.route('/company/:companyId/candidates/:candidateId').get(authorize('view_candidate'), validate(companyValidation.getCandidateById), talentCtrl.getCandidateById);
router.route('/company/:companyId/candidates/:candidateId').put(authorize('update_candidate'), validate(companyValidation.updateCandidateById), talentCtrl.updateCandidateById);
// ToDo: Need to investigate should we allow delete candidate
router.route('/company/:companyId/candidates/:candidateId').delete(authorize('update_candidate'), validate(companyValidation.removeCandidateById), talentCtrl.removeCandidateById);
router.route('/company/:companyId/candidates/:candidateId/notes').get(authorize('view_candidate'), validate(companyValidation.getCandidateNotes), talentCtrl.getCandidateNotes);
router.route('/company/:companyId/candidates/:candidateId/notes').post(authorize('update_candidate'), validate(jobValidation.addCandidateNote), talentCtrl.addCandidateNote);
router.route('/company/:companyId/candidates/:candidateId/notes/:noteId').put(authorize('update_candidate'), validate(companyValidation.updateCandidateNote), talentCtrl.updateCandidateNote);
router.route('/company/:companyId/candidates/:candidateId/notes/:noteId').delete(authorize('update_candidate'), validate(companyValidation.removeCandidateNote), talentCtrl.removeCandidateNote);

router.route('/company/:companyId/candidates/tags').post(authorize('update_candidate'), validate(companyValidation.addTagsToMultipleCandidates), talentCtrl.addTagsToMultipleCandidates);
router.route('/company/:companyId/candidates/:candidateId/tags').post(authorize('update_candidate'), validate(companyValidation.addCandidateTag), talentCtrl.addCandidateTag);
router.route('/company/:companyId/candidates/:candidateId/tags/:tagId').delete(authorize('update_candidate'), validate(companyValidation.removeCandidateTag), talentCtrl.removeCandidateTag);

// ToDo: Need to investigate sources
router.route('/company/:companyId/candidates/:candidateId/sources').post(authorize('update_candidate'), validate(companyValidation.addCandidateSources), talentCtrl.addCandidateSources);
router.route('/company/:companyId/candidates/:candidateId/sources/:sourceId').delete(authorize('update_candidate'), validate(companyValidation.removeCandidateSource), talentCtrl.removeCandidateSource);

router.route('/company/:companyId/candidates/:candidateId/pools').post(authorize('update_candidate'), validate(jobValidation.updateCandidatePool), talentCtrl.updateCandidatePool);

router.route('/company/:companyId/candidates/:candidateId/evaluations').post(authorize('view_candidate'), validate(companyValidation.getCandidateEvaluations), talentCtrl.getCandidateEvaluations);
router.route('/company/:companyId/candidates/:candidateId/evaluations/stats').post(authorize('view_candidate'), validate(companyValidation.getCandidateEvaluationsStats), talentCtrl.getCandidateEvaluationsStats);
router.route('/company/:companyId/candidates/:candidateId/evaluations/:evaluationId').get(authorize('view_candidate'), validate(jobValidation.getCandidateEvaluationById), talentCtrl.getCandidateEvaluationById);

router.route('/company/:companyId/candidates/:candidateId/similar').get(authorize('view_candidate'), validate(companyValidation.getCandidatesSimilar), talentCtrl.getCandidatesSimilar);

router.route('/company/:companyId/candidates/:candidateId/activities').get(authorize('view_candidate'), validate(jobValidation.getCandidateActivities), talentCtrl.getCandidateActivities);

router.route('/company/:companyId/candidates/:candidateId/experiences').get(authorize('view_candidate'), validate(companyValidation.getCandidateExperiences), talentCtrl.getCandidateExperiences);
router.route('/company/:companyId/candidates/:candidateId/experiences').post(authorize('update_candidate'), validate(companyValidation.addCandidateExperience), talentCtrl.addCandidateExperience);
router.route('/company/:companyId/candidates/:candidateId/experiences/:experienceId').put(authorize('update_candidate'), validate(companyValidation.updateCandidateExperience), talentCtrl.updateCandidateExperience);
router.route('/company/:companyId/candidates/:candidateId/experiences/:experienceId').delete(authorize('update_candidate'), validate(companyValidation.removeCandidateExperience), talentCtrl.removeCandidateExperience);

router.route('/company/:companyId/candidates/:candidateId/educations').get(authorize('view_candidate'), validate(companyValidation.getCandidateEducations), talentCtrl.getCandidateEducations);
router.route('/company/:companyId/candidates/:candidateId/educations').post(authorize('view_candidate'), validate(companyValidation.addCandidateEducation), talentCtrl.addCandidateEducation);
router.route('/company/:companyId/candidates/:candidateId/educations/:educationId').put(authorize('view_candidate'), validate(companyValidation.updateCandidateEducation), talentCtrl.updateCandidateEducation);
router.route('/company/:companyId/candidates/:candidateId/educations/:educationId').delete(authorize('view_candidate'), validate(companyValidation.removeCandidateEducation), talentCtrl.removeCandidateEducation);

router.route('/company/:companyId/candidates/:candidateId/skills').get(authorize('view_candidate'), validate(companyValidation.getCandidateSkills), talentCtrl.getCandidateSkills);
router.route('/company/:companyId/candidates/:candidateId/skills').put(authorize('update_candidate'), validate(companyValidation.updateCandidateSkills), talentCtrl.updateCandidateSkills);
router.route('/company/:companyId/candidates/:candidateId/skills').post(authorize('update_candidate'), validate(companyValidation.addCandidateSkill), talentCtrl.addCandidateSkill);
router.route('/company/:companyId/candidates/:candidateId/skills/:skillId').put(authorize('update_candidate'), validate(companyValidation.updateCandidateSkill), talentCtrl.updateCandidateSkill);
router.route('/company/:companyId/candidates/:candidateId/skills/:skillId').delete(authorize('update_candidate'), validate(companyValidation.removeCandidateSkill), talentCtrl.removeCandidateSkill);

// router.route('/company/:companyId/candidates/:candidateId/accomplishments').get(authorize('view_candidate'), validate(jobValidation.getCandidateAccomplishments), talentCtrl.getCandidateAccomplishments);

router.route('/company/:companyId/candidates/:candidateId/references').get(authorize('view_candidate'), validate(companyValidation.getCandidateReferences), talentCtrl.getCandidateReferences);
router.route('/company/:companyId/candidates/:candidateId/references').post(authorize('update_candidate'), validate(companyValidation.addCandidateReference), talentCtrl.addCandidateReference);
router.route('/company/:companyId/candidates/:candidateId/references/:referenceId').put(authorize('update_candidate'), validate(companyValidation.updateCandidateReference), talentCtrl.updateCandidateReference);
router.route('/company/:companyId/candidates/:candidateId/references/:referenceId').delete(authorize('update_candidate'), validate(companyValidation.removeCandidateReference), talentCtrl.removeCandidateReference);

router.route('/company/:companyId/candidates/:candidateId/comments').get(authorize('update_candidate'), validate(companyValidation.getCandidateComments), talentCtrl.getCandidateComments);
router.route('/company/:companyId/candidates/:candidateId/comments').post(authorize('update_candidate'), validate(companyValidation.addCandidateComment), talentCtrl.addCandidateComment);

router.route('/company/:companyId/candidates/:candidateId/subscribe').post(authorize('update_candidate'), validate(companyValidation.subscribeCandidate), talentCtrl.subscribeCandidate);
router.route('/company/:companyId/candidates/:candidateId/subscribe').delete(authorize('update_candidate'), validate(companyValidation.unsubscribeCandidate), talentCtrl.unsubscribeCandidate);
router.route('/company/:companyId/candidates/subscribe').post(authorize('update_candidate'), validate(companyValidation.subscribeCandidates), talentCtrl.subscribeCandidates);

router.route('/company/:companyId/candidates/:candidateId/upload/avatar').post(authorize('update_candidate'), validate(jobValidation.uploadAvatar), talentCtrl.uploadAvatar);
router.route('/company/:companyId/candidates/:candidateId/resumes/upload').post(authorize('update_candidate'), validate(jobValidation.uploadCandidateResume), talentCtrl.uploadCandidateResume);
router.route('/company/:companyId/candidates/:candidateId/resumes').get(authorize('view_candidate'), validate(jobValidation.getCandidateResume), talentCtrl.getCandidateResume);
  router.route('/company/:companyId/candidates/:candidateId/resumes/:resumeId').delete(authorize('update_candidate'), validate(jobValidation.deleteCandidateResume), talentCtrl.deleteCandidateResume);

router.route('/company/:companyId/candidates/assignjobs').post(authorize('view_candidate'), validate(jobValidation.assignCandidatesJobs), talentCtrl.assignCandidatesJobs);
router.route('/company/:companyId/candidates/assignpools').post(authorize('view_candidate'), validate(jobValidation.assignCandidatesPools), talentCtrl.assignCandidatesPools);
router.route('/company/:companyId/candidates/email/check').post(authorize('view_candidate'), validate(companyValidation.checkCandidateEmail), talentCtrl.checkCandidateEmail);

// ToDo: Deprecated, why are we using this?
router.route('/company/:companyId/filter/skills').get(asyncHandler(getAllCandidatesSkills));

router.route('/company/:companyId/departments').get(authorize('view_department'), validate(jobValidation.getCompanyDepartments), talentCtrl.getCompanyDepartments);
router.route('/company/:companyId/departments').post(authorize('update_department'), validate(jobValidation.addCompanyDepartment), talentCtrl.addCompanyDepartment);
router.route('/company/:companyId/departments/:departmentId').put(authorize('update_department'), validate(jobValidation.updateCompanyDepartment), talentCtrl.updateCompanyDepartment);
router.route('/company/:companyId/departments/:departmentId').delete(authorize('update_department'), validate(jobValidation.deleteCompanyDepartment), talentCtrl.deleteCompanyDepartment);


router.route('/company/:companyId/questions/templates').get(authorize('view_template'), validate(companyValidation.getCompanyQuestionTemplates), talentCtrl.getCompanyQuestionTemplates);
router.route('/company/:companyId/questions/templates').post(authorize('update_template'), validate(companyValidation.addCompanyQuestionTemplate), talentCtrl.addCompanyQuestionTemplate);
router.route('/company/:companyId/questions/templates/:questionTemplateId').get(authorize('view_template'), validate(companyValidation.getCompanyQuestionTemplate), talentCtrl.getCompanyQuestionTemplate);
router.route('/company/:companyId/questions/templates/:questionTemplateId').put(authorize('update_template'), validate(companyValidation.getCompanyQuestionTemplate), talentCtrl.updateCompanyQuestionTemplate);
router.route('/company/:companyId/questions/templates/:questionTemplateId').delete(authorize('update_template'), validate(companyValidation.deleteCompanyQuestionTemplate), talentCtrl.deleteCompanyQuestionTemplate);
router.route('/company/:companyId/questions/templates/:questionTemplateId/disable').post(authorize('update_template'), validate(jobValidation.deactivateCompanyQuestionTemplate), talentCtrl.deactivateCompanyQuestionTemplate);
router.route('/company/:companyId/questions/templates/:questionTemplateId/enable').post(authorize('update_template'), validate(companyValidation.activateCompanyQuestionTemplate), talentCtrl.activateCompanyQuestionTemplate);

router.route('/company/:companyId/pipelines').get(authorize('view_template'), validate(companyValidation.getCompanyPipelineTemplates), talentCtrl.getCompanyPipelineTemplates);
router.route('/company/:companyId/pipelines').post(authorize('update_template'), validate(jobValidation.addCompanyPipelineTemplate), talentCtrl.addCompanyPipelineTemplate);
router.route('/company/:companyId/pipelines/:pipelineId').get(authorize('view_template'), validate(companyValidation.getCompanyPipelineTemplate), talentCtrl.getCompanyPipelineTemplate);
router.route('/company/:companyId/pipelines/:pipelineId').put(authorize('update_template'), validate(jobValidation.updateCompanyPipelineTemplate), talentCtrl.updateCompanyPipelineTemplate);
router.route('/company/:companyId/pipelines/:pipelineId').delete(authorize('update_template'), validate(jobValidation.deleteCompanyPipelineTemplate), talentCtrl.deleteCompanyPipelineTemplate);
router.route('/company/:companyId/pipelines/:pipelineId/disable').post(authorize('update_template'), validate(jobValidation.deactivateCompanyPipelineTemplate), talentCtrl.deactivateCompanyPipelineTemplate);
router.route('/company/:companyId/pipelines/:pipelineId/enable').post(authorize('update_template'), validate(jobValidation.activateCompanyPipelineTemplate), talentCtrl.activateCompanyPipelineTemplate);

router.route('/company/:companyId/labels').get(authorize('view_label'), validate(jobValidation.getCompanyLabels), talentCtrl.getCompanyLabels);
router.route('/company/:companyId/labels').post(authorize('update_label'), validate(jobValidation.addCompanyLabel), talentCtrl.addCompanyLabel);
router.route('/company/:companyId/labels/:labelId').put(authorize('update_label'), validate(jobValidation.updateCompanyLabel), talentCtrl.updateCompanyLabel);
router.route('/company/:companyId/labels/:labelId').delete(authorize('update_label'), validate(jobValidation.deleteCompanyLabel), talentCtrl.deleteCompanyLabel);

router.route('/company/:companyId/members').get(authorize('view_member'), validate(companyValidation.getCompanyMembers), talentCtrl.getCompanyMembers);
router.route('/company/:companyId/members/invites').post(authorize('update_member'), validate(companyValidation.inviteMembers), talentCtrl.inviteMembers);
router.route('/company/:companyId/members/invites').get(authorize('update_member'), validate(companyValidation.getCompanyMemberInvitations), talentCtrl.getCompanyMemberInvitations);
router.route('/company/:companyId/members/invites/:invitationId').delete(authorize('update_member'), validate(companyValidation.cancelMemberInvitation), talentCtrl.cancelMemberInvitation);
router.route('/company/:companyId/members/invites/:invitationId/accept').post(validate(companyValidation.acceptMemberInvitation), talentCtrl.acceptMemberInvitation);
// router.route('/company/:companyId/members').post(asyncHandler(addCompanyMember));
router.route('/company/:companyId/members/:memberId').get(authorize('view_member'), validate(companyValidation.getCompanyMember), talentCtrl.getCompanyMember);

router.route('/company/:companyId/members/:memberId').put(authorize('update_member'), validate(companyValidation.updateCompanyMember), talentCtrl.updateCompanyMember);
router.route('/company/:companyId/members/:memberId').delete(authorize('update_member'), validate(companyValidation.deleteCompanyMember), talentCtrl.deleteCompanyMember);
router.route('/company/:companyId/members/:memberId/role').put(authorize('update_member'), validate(companyValidation.updateCompanyMemberRole), talentCtrl.updateCompanyMemberRole);
router.route('/company/:companyId/members/:memberId/upload/avatar').post(authorize('update_member'), validate(companyValidation.uploadMemberAvatar), talentCtrl.uploadMemberAvatar);
router.route('/company/:companyId/members/:memberId/upload/cover').post(authorize('update_member'), validate(companyValidation.uploadMemberCover), talentCtrl.uploadMemberCover);


router.route('/company/:companyId/roles').get(authorize('view_role'), validate(companyValidation.getCompanyRoles), talentCtrl.getCompanyRoles);
router.route('/company/:companyId/roles').post(authorize('update_role'), validate(companyValidation.addCompanyRole), talentCtrl.addCompanyRole);
router.route('/company/:companyId/roles/:roleId').put(authorize('update_role'), validate(companyValidation.updateCompanyRole), talentCtrl.updateCompanyRole);
router.route('/company/:companyId/roles/:roleId').delete(authorize('update_role'), validate(companyValidation.deleteCompanyRole), talentCtrl.deleteCompanyRole);
router.route('/company/:companyId/roles/:roleId/disable').post(authorize('update_role'), validate(companyValidation.disableCompanyRole), talentCtrl.disableCompanyRole);
router.route('/company/:companyId/roles/:roleId/enable').post(authorize('update_role'), validate(companyValidation.enableCompanyRole), talentCtrl.enableCompanyRole);


router.route('/company/:companyId/members/:memberId/jobs/subscribes').get(authorize('view_job'), validate(jobValidation.getJobsSubscribed), talentCtrl.getJobsSubscribed);
router.route('/company/:companyId/members/:memberId/applications/subscribes').get(authorize('view_application'), validate(jobValidation.getApplicationsSubscribed), talentCtrl.getApplicationsSubscribed);
router.route('/company/:companyId/members/:memberId/candidates/subscribes').get(authorize('view_candidate'), validate(jobValidation.getCandidatesSubscribed), talentCtrl.getCandidatesSubscribed);
router.route('/company/:companyId/members/:memberId/tasks').post(authorize(), validate(companyValidation.searchTasks), talentCtrl.searchTasks);

router.route('/company/:companyId/members/:memberId/notifications/preference').get(authorize('view_member'), validate(memberValidation.getNotificationPreference), talentCtrl.getNotificationPreference);
router.route('/company/:companyId/members/:memberId/notifications/preference').put(authorize('update_member'), validate(memberValidation.updateNotificationPreference), talentCtrl.updateNotificationPreference);


router.route('/company/:companyId/pools').get(authorize('view_candidate'), validate(companyValidation.getCompanyPools), talentCtrl.getCompanyPools);
router.route('/company/:companyId/pools').post(authorize('view_candidate'), validate(companyValidation.addCompanyPool), talentCtrl.addCompanyPool);
router.route('/company/:companyId/pools/:poolId').get(authorize('view_candidate'), validate(companyValidation.getCompanyPoolById), talentCtrl.getCompanyPoolById);
router.route('/company/:companyId/pools/:poolId').put(authorize('view_candidate'), validate(companyValidation.updateCompanyPool), talentCtrl.updateCompanyPool);
router.route('/company/:companyId/pools/:poolId').delete(authorize('view_candidate'), validate(companyValidation.deleteCompanyPool), talentCtrl.deleteCompanyPool);
router.route('/company/:companyId/pools/:poolId/candidates').get(authorize('view_candidate'), validate(companyValidation.getPoolCandidates), talentCtrl.getPoolCandidates);
router.route('/company/:companyId/pools/:poolId/candidates').post(authorize('view_candidate'), validate(companyValidation.addPoolCandidates), talentCtrl.addPoolCandidates);
router.route('/company/:companyId/pools/:poolId/candidates/:candidateId').delete(authorize('view_candidate'), validate(companyValidation.removePoolCandidate), talentCtrl.removePoolCandidate);
router.route('/company/:companyId/pools/:poolId/candidates').delete(authorize('view_candidate'), validate(companyValidation.removePoolCandidates), talentCtrl.removePoolCandidates);

router.route('/company/:companyId/projects').get(authorize('view_project'), validate(projectValidation.getProjects), talentCtrl.getProjects);
router.route('/company/:companyId/projects').post(authorize('update_project'), validate(projectValidation.addProjec), talentCtrl.addProject);
router.route('/company/:companyId/projects/:projectId').get(authorize('view_project'), validate(projectValidation.getProject), talentCtrl.getProject);
router.route('/company/:companyId/projects/:projectId').put(authorize('update_project'), validate(projectValidation.updateProject), talentCtrl.updateProject);
router.route('/company/:companyId/projects/:projectId/name').put(authorize('update_project'), validate(projectValidation.updateProjectName), talentCtrl.updateProjectName);
router.route('/company/:companyId/projects/:projectId').delete(authorize('update_project'), validate(projectValidation.deleteProject), talentCtrl.deleteProject);
router.route('/company/:companyId/projects/:projectId/peoples').get(authorize('view_candidate'), validate(projectValidation.getProjectPeoples), talentCtrl.getProjectPeoples);
router.route('/company/:companyId/projects/:projectId/peoples').post(authorize('update_project'), validate(projectValidation.addProjectPeoples), talentCtrl.addProjectPeoples);
router.route('/company/:companyId/projects/:projectId/peoples/remove').post(authorize('update_project'), validate(projectValidation.removeProjectPeoples), talentCtrl.removeProjectPeoples);
router.route('/company/:companyId/projects/:projectId/peoples/:peopleId').post(authorize('update_project'), validate(projectValidation.addProjectPeople), talentCtrl.addProjectPeople);
router.route('/company/:companyId/projects/:projectId/peoples/:peopleId').delete(authorize('update_project'), validate(projectValidation.removeProjectPeople), talentCtrl.removeProjectPeople);

router.route('/company/:companyId/projects/:projectId/settings').get(authorize('view_project'), validate(projectValidation.getProjectSettings), talentCtrl.getProjectSettings);
router.route('/company/:companyId/projects/:projectId/settings').post(authorize('update_project'), validate(projectValidation.updateProjectSettings), talentCtrl.updateProjectSettings);
router.route('/company/:companyId/projects/:projectId/shares/:memberId').post(authorize('update_project'), validate(projectValidation.addProjectViewer), talentCtrl.addProjectViewer);
router.route('/company/:companyId/projects/:projectId/shares/:memberId').delete(authorize('update_project'), validate(projectValidation.removeProjectViewer), talentCtrl.removeProjectViewer);

router.route('/company/:companyId/people/:peopleId/projects').post(asyncHandler(updateCandidateProject));
router.route('/company/:companyId/people/:peopleId/pools').post(asyncHandler(updatePeoplePool));
router.route('/company/:companyId/people/flagged').get(authorize('view_people'), validate(companyValidation.getCandidatesFlagged), talentCtrl.getCandidatesFlagged);


router.route('/company/:companyId/impressions').get(asyncHandler(getImpressionCandidates));

router.route('/company/:companyId/evaluations/templates').get(authorize('view_template'), validate(companyValidation.getCompanyEvaluationTemplates), talentCtrl.getCompanyEvaluationTemplates);
router.route('/company/:companyId/evaluations/templates').post(authorize('update_template'), validate(companyValidation.addCompanyEvaluationTemplate), talentCtrl.addCompanyEvaluationTemplate);
router.route('/company/:companyId/evaluations/templates/:templateId').get(authorize('view_template'), validate(companyValidation.getCompanyEvaluationTemplate), talentCtrl.getCompanyEvaluationTemplate);
router.route('/company/:companyId/evaluations/templates/:templateId').put(authorize('update_template'), validate(companyValidation.updateCompanyEvaluationTemplate), talentCtrl.updateCompanyEvaluationTemplate);
router.route('/company/:companyId/evaluations/templates/:templateId').delete(authorize('update_template'), validate(companyValidation.deleteCompanyEvaluationTemplate), talentCtrl.deleteCompanyEvaluationTemplate);
router.route('/company/:companyId/evaluations/templates/:templateId/disable').post(authorize('update_template'), validate(companyValidation.deactivateCompanyEvaluationTemplate), talentCtrl.deactivateCompanyEvaluationTemplate);
router.route('/company/:companyId/evaluations/templates/:templateId/enable').post(authorize('view_template'), validate(companyValidation.activateCompanyEvaluationTemplate), talentCtrl.activateCompanyEvaluationTemplate);
router.route('/company/:companyId/evaluations/filters').get(authorize('view_template'), validate(companyValidation.getEvaluationFilters), talentCtrl.getEvaluationFilters);



router.route('/company/:companyId/emails/templates').get(authorize('view_template'), validate(companyValidation.getCompanyEmailTemplates), talentCtrl.getCompanyEmailTemplates);
router.route('/company/:companyId/emails/templates').post(authorize('update_template'), validate(companyValidation.addCompanyEmailTemplate), talentCtrl.addCompanyEmailTemplate);
router.route('/company/:companyId/emails/templates/:templateId').get(authorize('view_template'), validate(companyValidation.getCompanyEmailTemplate), talentCtrl.getCompanyEmailTemplate);
router.route('/company/:companyId/emails/templates/:templateId').put(authorize('update_template'), validate(companyValidation.updateCompanyEmailTemplate), talentCtrl.updateCompanyEmailTemplate);
router.route('/company/:companyId/emails/templates/:templateId').delete(authorize('update_template'), validate(companyValidation.deleteCompanyEmailTemplate), talentCtrl.deleteCompanyEmailTemplate);
router.route('/company/:companyId/emails/templates/:templateId/disable').post(authorize('update_template'), validate(companyValidation.deactivateCompanyEmailTemplate), talentCtrl.deactivateCompanyEmailTemplate);
router.route('/company/:companyId/emails/templates/:templateId/enable').post(authorize('update_template'), validate(companyValidation.activateCompanyEmailTemplate), talentCtrl.activateCompanyEmailTemplate);

router.route('/company/:companyId/emails/signatures').get(authorize('view_template'), validate(companyValidation.getCompanyEmailSignatures), talentCtrl.getCompanyEmailSignatures);
router.route('/company/:companyId/emails/signatures').post(authorize('update_template'), validate(companyValidation.addCompanyEmailSignature), talentCtrl.addCompanyEmailSignature);
router.route('/company/:companyId/emails/signatures/:templateId').get(authorize('view_template'), validate(companyValidation.getCompanyEmailSignature), talentCtrl.getCompanyEmailSignature);
router.route('/company/:companyId/emails/signatures/:templateId').put(authorize('update_template'), validate(companyValidation.updateCompanyEmailSignature), talentCtrl.updateCompanyEmailSignature);
router.route('/company/:companyId/emails/signatures/:templateId').delete(authorize('update_template'), validate(companyValidation.deleteCompanyEmailSignature), talentCtrl.deleteCompanyEmailSignature);

router.route('/company/:companyId/contacts/search').get(authorize('view_contact'), validate(companyValidation.searchContacts), talentCtrl.searchContacts);


router.route('/company/:companyId/sources').post(authorize('view_candidate'), validate(companyValidation.searchSources), talentCtrl.searchSources);
router.route('/company/:companyId/sources/:sourceId').delete(asyncHandler(removeSources));
router.route('/company/:companyId/sources').delete(authorize('view_candidate'), validate(companyValidation.removeSources), talentCtrl.removeSources);


async function getUserSession(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let preferredCompany = req.query.company?parseInt(req.query.company):null;

  let data = await talentCtrl.getUserSession(currentUserId, preferredCompany);
  res.json(new Response(data, data?'get_session_successful':'not_found', res));
}


async function registerNewUser(req, res) {
  const form = req.body;
  let data = await talentCtrl.registerNewUser(form);
  res.json(new Response(data, data?'get_session_successful':'not_found', res));
}


async function getCompany(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.getCompany(currentUserId, companyId);
  res.json(new Response(data, data?'company_retrieved_successful':'not_found', res));
}

async function updateCompany(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.updateCompany(companyId, currentUserId, req.body);
  res.json(new Response(data, data?'company_updated_successful':'not_found', res));
}


async function uploadCompanyAvatar(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.uploadCompanyAvatar(companyId, currentUserId, req);
  res.json(new Response(data, data?'company_updated_successful':'not_found', res));
}

async function getSubscriptions(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getSubscriptions(companyId, currentUserId);
  res.json(new Response(data, data?'get_subscriptions_successful':'not_found', res));
}


async function getMarketSalary(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let jobTitle = req.query.jobTitle?req.query.jobTitle:'';

  let data = await talentCtrl.getMarketSalary(jobTitle);
  res.json(new Response(data, data?'get_salary_successful':'not_found', res));
}


async function getInsights(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let timeframe = req.query.timeframe

  let data = await talentCtrl.getCompanyInsights(currentUserId, companyId, timeframe);
  res.json(new Response(data, data?'get_insights_successful':'not_found', res));
}


async function getInmailCredits(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getInmailCredits(companyId, currentUserId);
  res.json(new Response(data, data?'credits_retrieved_successful':'not_found', res));
}



async function getTaxAndFee(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getTaxAndFee(currentUserId, companyId);
  res.json(new Response(data, data?'taxandfees_retrieved_successful':'not_found', res));
}


async function getImpressionCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let type = req.query.type;
  let level = req.query.level;
  let jobId = req.query.jobId;
  let timeframe = req.query.timeframe;
  let sort = req.query;
  sort.page = parseInt(req.query.page)
  sort.size = parseInt(req.query.size)

  let data = await talentCtrl.getImpressionCandidates(companyId, currentUserId, timeframe, type, level, jobId, sort, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}



async function getDashboard(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getDashboard(currentUserId, companyId);
  res.json(new Response(data, data?'get_dashboard_successful':'not_found', res));
}


async function searchCompany(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let sort = req.query;
  let filter = req.body;
  let data = await talentCtrl.searchCompany(currentUserId, filter, sort);
  res.json(new Response(data, data?'companies_retrieved_successful':'not_found', res));
}

async function addPaymentMethod(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let card = req.body;
  let data = await talentCtrl.addPaymentMethod(companyId, currentUserId, card);
  res.json(new Response(data, data?'card_created_successful':'not_found', res));
}

async function getCards(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.getCards(companyId, currentUserId);
  res.json(new Response(data, data?'cards_retrieved_successful':'not_found', res));
}

async function removeCard(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let cardId = req.params.cardId;
  let data = await talentCtrl.removeCard(companyId, currentUserId, cardId);
  res.json(new Response(data, data?'card_removed_successful':'not_found', res));
}


async function verifyCard(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.query.id);
  let verification = req.body;
  let data = await talentCtrl.verifyCard(companyId, currentUserId, jobId, verification);
  res.json(new Response(data, data?'card_verified_successful':'not_found', res));
}



async function updateSubscription(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let subscription = req.body;
  let data = await talentCtrl.updateSubscription(companyId, currentUserId, subscription);
  res.json(new Response(data, data?'subscription_updated_successful':'not_found', res));
}


async function createJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let job = req.body;
  let data = await talentCtrl.createJob(companyId, currentUserId, job);
  res.json(new Response(data, data?'job_created_successful':'not_found', res));
}


async function updateJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = ObjectID(req.params.jobId);
  let companyId = parseInt(req.params.id);
  let job = req.body;
  job.department = job.department?ObjectID(job.department):null;

  let data = await talentCtrl.updateJob(companyId, currentUserId, jobId, job);
  res.json(new Response(data, data?'job_updated_successful':'not_found', res));
}



async function closeJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.closeJob(companyId, currentUserId, jobId);
  res.json(new Response(data, data?'job_closed_successful':'not_found', res));
}



async function archiveJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.archiveJob(companyId, currentUserId, jobId);
  res.json(new Response(data, data?'job_archived_successful':'not_found', res));
}



async function unarchiveJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.unarchiveJob(companyId, currentUserId, jobId);
  res.json(new Response(data, data?'job_unarchived_successful':'not_found', res));
}


async function deleteJob(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;

  let data = await talentCtrl.deleteJob(companyId, currentUserId, jobId);
  res.json(new Response(data, data?'job_deleted_successful':'not_found', res));
}



async function getJobComments(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let filter = req.query;

  let data = await talentCtrl.getJobComments(companyId, currentUserId, jobId, filter);

  res.json(new Response(data, data?'comment_retrieved_successful':'not_found', res));
}


async function addJobComment(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let comment = req.body;

  let data = await talentCtrl.addJobComment(companyId, currentUserId, jobId, comment);

  res.json(new Response(data, data?'comment_added_successful':'not_found', res));
}



async function deleteJobComment(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let commentId = req.params.commentId;

  let data = await talentCtrl.deleteJobComment(companyId, currentUserId, jobId, commentId);

  res.json(new Response(data, data?'comment_deleted_successful':'not_found', res));
}


async function updateJobComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let commentId = req.params.commentId;
  let comment = req.body;

  let data = await talentCtrl.updateJobComment(currentUserId, jobId, commentId, comment);

  res.json(new Response(data, data?'comment_updated_successful':'not_found', res));
}




async function searchJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let sort = req.query;
  let filter = req.body;
  filter.createdBy = _.reduce(filter.createdBy, function(res, id){res.push(ObjectID(id)); return res;}, []);
  filter.tags = _.reduce(filter.tags, function(res, id){res.push(ObjectID(id)); return res;}, []);
  filter.department = _.reduce(filter.department, function(res, id){res.push(ObjectID(id)); return res;}, []);
  let data = await talentCtrl.searchJobs(currentUserId, companyId, req.query.query, filter, sort, res.locale);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}

async function getJobById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let data = await talentCtrl.getJobById(currentUserId, companyId, jobId, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}


async function publishJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let type = req.body.type;

  let data = await talentCtrl.publishJob(companyId, currentUserId, jobId, type);
  res.json(new Response(data, data?'job_paid_successful':'not_found', res));
}


async function payJob(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let payment = req.body;

  let data = await talentCtrl.payJob(companyId, currentUserId, jobId, payment);
  res.json(new Response(data, data?'job_paid_successful':'not_found', res));
}



async function getJobInsights(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);

  let data = await talentCtrl.getJobInsights(currentUserId, companyId, jobId);
  res.json(new Response(data, data?'get_insights_successful':'not_found', res));
}


async function getJobActivities(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = ObjectID(req.params.jobId);
  let sort = req.query;
  let data = await talentCtrl.getJobActivities(companyId, currentUserId, jobId, sort);

  res.json(new Response(data, data?'application_reverted_successful':'not_found', res));
}


async function searchPeopleSuggestions(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let jobId = req.params.jobId;
  let sort = req.query;
  let filter = req.body;
  let data = await talentCtrl.searchPeopleSuggestions(companyId, currentUserId, jobId, filter, sort);
  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}




async function searchApplications(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let filter = req.body;
  let sort = req.query;
  let jobId = ObjectID(req.params.jobId);
  let data = await talentCtrl.searchApplications(companyId, currentUserId, jobId, filter, sort, res.locale);
  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}
//
// async function searchAllApplications(req, res) {
//   let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
//   let companyId = parseInt(req.params.id);
//   let filter = req.query;
//   let data = await talentCtrl.searchAllApplications(currentUserId, companyId, filter, res.locale);
//   res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
// }


async function rejectApplication(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let applicationId = parseInt(req.params.applicationId);
  let data = await talentCtrl.getJobById(companyId, currentUserId, jobId, res.locale);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function updateApplication(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let company = parseInt(req.params.id);
  let jobId = req.params.jobId;
  let applicationId = parseInt(req.params.applicationId);
  let requestBody = req.query.status;
  let data = await talentCtrl.updateApplication(companyId, currentUserId, jobId, applicationId, requestBody);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function searchSources(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let companyId = parseInt(req.params.id);
  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;

  filter.jobs = _.reduce(filter.jobs, function(res, job){res.push(ObjectID(job)); return res;}, []);

  data = await talentCtrl.searchSources(companyId, currentUserId, filter, sort, res.locale);

  res.json(new Response(data, data?'sources_retrieved_successful':'not_found', res));
}



async function removeSource(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let companyId = parseInt(req.params.id);
  let source = ObjectID(req.param.sourceId);
  data = await talentCtrl.removeSources(companyId, currentUserId, [source]);
  res.json(new Response(data, data?'sources_removed_successful':'not_found', res));
}


async function removeSources(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let companyId = parseInt(req.params.id);
  let sources = _.reduce(req.body.sources, function(res, id){res.push(new ObjectId(id)); return res;}, []);
  data = await talentCtrl.removeSources(companyId, currentUserId, sources);
  res.json(new Response(data, data?'sources_removed_successful':'not_found', res));
}


async function addSourceApplication(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);
  let sourceId = ObjectID(req.params.sourceId);

  let application = req.body;
  application.stage = ObjectID(application.stage);

  let data = await talentCtrl.addSourceApplication(company, currentUserId, jobId, sourceId, application);
  res.json(new Response(data, data?'source_added_successful':'not_found', res));
}


async function searchCampaigns(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);

  let filter = req.body;
  let sort = req.query;
  filter.query = req.query.query;


  let data = await talentCtrl.searchCampaigns(company, currentUserId, jobId, filter, sort, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}


async function getJobAds(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);

  let data = await talentCtrl.getJobAds(company, currentUserId, jobId, res.locale);
  res.json(new Response(data, data?'ads_retrieved_successful':'not_found', res));
}


async function addApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let form = req.body;
  form.jobId = ObjectID(form.jobId);
  form.user = ObjectID(form.user);
  let data = await talentCtrl.addApplication(companyId, currentUserId, form);

  res.json(new Response(data, data?'application_retrieved_successful':'not_found', res));
}


async function getAllApplicationsEndingSoon(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let sort = req.query;

  let data = await talentCtrl.getAllApplicationsEndingSoon(companyId, currentUserId, sort);

  res.json(new Response(data, data?'applicagion_retrieved_successful':'not_found', res));
}


async function getApplicationById(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.getApplicationById(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_retrieved_successful':'not_found', res));
}


async function updateApplicationProgress(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = ObjectID(req.params.applicationId);
  let newStage = req.body.newStage;

  let data = await talentCtrl.updateApplicationProgress(companyId, currentUserId, applicationId, newStage);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function getApplicationProgress(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = ObjectID(req.params.applicationId);
  let progressId = ObjectID(req.params.progressId);


  let data = await talentCtrl.getApplicationProgress(companyId, currentUserId, applicationId, progressId);

  res.json(new Response(data, data?'job_retrieved_successful':'not_found', res));
}



async function getApplicationQuestions(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.getApplicationQuestions(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'questions_retrieved_successful':'not_found', res));
}



async function getApplicationLabels(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let companyId = parseInt(req.params.id);
  let data = await talentCtrl.getApplicationLabels(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'label_retrieved_successful':'not_found', res));
}


async function addApplicationLabel(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;
  let label = req.body;

  let data = await talentCtrl.addApplicationLabel(companyId, currentUserId, applicationId, label);

  res.json(new Response(data, data?'label_added_successful':'not_found', res));
}



async function deleteApplicationLabel(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;
  let labelId = req.params.labelId;

  let data = await talentCtrl.deleteApplicationLabel(companyId, currentUserId, applicationId, labelId);

  res.json(new Response(data, data?'label_deleted_successful':'not_found', res));
}



async function getApplicationComments(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;
  let filter = req.query;
  let data = await talentCtrl.getApplicationComments(companyId, currentUserId, applicationId, filter);

  res.json(new Response(data, data?'comment_retrieved_successful':'not_found', res));
}


async function addApplicationComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = ObjectID(req.params.applicationId);
  let comment = req.body;

  let data = await talentCtrl.addApplicationComment(companyId, currentUserId, applicationId, comment);

  res.json(new Response(data, data?'comment_added_successful':'not_found', res));
}



async function deleteApplicationComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let companyId = parseInt(req.params.id);
  let applicationId = req.params.applicationId;
  let commentId = req.params.commentId;

  let data = await talentCtrl.deleteApplicationComment(companyId, currentUserId, applicationId, commentId);

  res.json(new Response(data, data?'comment_deleted_successful':'not_found', res));
}


async function updateApplicationComment(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let commentId = req.params.commentId;
  let comment = req.body;

  let data = await talentCtrl.updateApplicationComment(currentUserId, applicationId, commentId, comment);

  res.json(new Response(data, data?'comment_updated_successful':'not_found', res));
}



//NOT DONE
async function getApplicationEvaluations(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let pagination = req.query;
  let data = await talentCtrl.getApplicationEvaluations(companyId, currentUserId, applicationId, pagination);

  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
}


async function searchApplicationEmails(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let applicationId = ObjectID(req.params.applicationId);
  let sort = req.query;


  let data = await talentCtrl.searchApplicationEmails(currentUserId, companyId, applicationId, sort, res.locale);
  res.json(new Response(data, data?'emails_retrieved_successful':'not_found', res));
}

async function addApplicationProgressEvaluation(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let progressId = req.params.progressId;
  let evaluation = req.body;

  let data = await talentCtrl.addApplicationProgressEvaluation(companyId, currentUserId, applicationId, progressId, evaluation);

  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
}

async function removeApplicationProgressEvaluation(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let progressId = ObjectID(req.params.progressId);

  let data = await talentCtrl.removeApplicationProgressEvaluation(companyId, currentUserId, applicationId, progressId);

  res.json(new Response(data, data?'evaluation_removed_successful':'not_found', res));
}


async function updateApplicationProgressEvent(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let progressId = ObjectID(req.params.progressId);
  let form = req.body;

  let data = await talentCtrl.updateApplicationProgressEvent(companyId, currentUserId, applicationId, progressId, form);

  res.json(new Response(data, data?'application_event_updated_successful':'not_found', res));
}


async function removeApplicationProgressEvent(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let progressId = ObjectID(req.params.progressId);

  let data = await talentCtrl.removeApplicationProgressEvent(companyId, applicationId, progressId);

  res.json(new Response(data, data?'application_event_updated_successful':'not_found', res));
}


async function disqualifyApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let disqualification = req.body;

  let data = await talentCtrl.disqualifyApplication(companyId, currentUserId, applicationId, disqualification);

  res.json(new Response(data, data?'application_disqualified_successful':'not_found', res));
}


async function revertApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);

  let data = await talentCtrl.revertApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_reverted_successful':'not_found', res));
}


async function deleteApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);

  let data = await talentCtrl.deleteApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_deleted_successful':'not_found', res));
}


async function acceptApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);

  let data = await talentCtrl.acceptApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_accepted_successful':'not_found', res));
}

async function subscribeApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.subscribeApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_subscribed_successful':'not_found', res));
}


async function unsubscribeApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;

  let data = await talentCtrl.unsubscribeApplication(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'application_unsubscribeed_successful':'not_found', res));
}




async function getApplicationActivities(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = ObjectID(req.params.applicationId);
  let sort = req.query;
  let data = await talentCtrl.getApplicationActivities(companyId, currentUserId, applicationId, sort);

  res.json(new Response(data, data?'activities_retrieved_successful':'not_found', res));
}



async function updateJobPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);
  let form = req.body;
  form._id = ObjectID(form._id);

  if(form.pipelineTemplateId){
    form.pipelineTemplateId = ObjectID(form.pipelineTemplateId);
  }



  let data = await talentCtrl.updateJobPipeline(companyId, jobId, currentUserId, form);
  res.json(new Response(data, data?'job_pipeline_updated_successful':'not_found', res));
}


async function getJobPipeline(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);

  let data = await talentCtrl.getJobPipeline(companyId, jobId, currentUserId);
  res.json(new Response(data, data?'job_pipeline_retreived_successful':'not_found', res));
}


async function getJobMembers(req, res) {
  let jobId = ObjectID(req.params.jobId);

  let data = await talentCtrl.getJobMembers(jobId);
  res.json(new Response(data, data?'job_member_retrieved_successful':'not_found', res));
}

async function updateJobMembers(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);
  let members = _.reduce(req.body.members, function(res, item){ res.push(ObjectID(item)); return res;},  []);
  let data = await talentCtrl.updateJobMembers(companyId, currentUserId, jobId, members);
  res.json(new Response(data, data?'job_member_updated_successful':'not_found', res));
}



async function subscribeJob(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let memberId = req.header('memberId');
  let jobId = req.params.jobId;

  let data = await talentCtrl.subscribeJob(currentUserId, companyId, jobId);

  res.json(new Response(data, data?'job_subsribed_successful':'not_found', res));
}


async function unsubscribeJob(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let memberId = req.header('memberId');
  let jobId = req.params.jobId;

  let data = await talentCtrl.unsubscribeJob(currentUserId, companyId, jobId);

  res.json(new Response(data, data?'job_unsubscribed_successful':'not_found', res));
}


async function updateJobApplicationForm(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let jobId = ObjectID(req.params.jobId);
  let form = req.body;

  if(form.questionTemplateId){
    form.questionTemplateId = ObjectID(form.questionTemplateId);
  }

  let data = await talentCtrl.updateJobApplicationForm(companyId, currentUserId, jobId, form);
  res.json(new Response(data, data?'job_applicationform_updated_successful':'not_found', res));
}




async function getBoard(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let filter = req.query;
  let jobId = ObjectID(req.params.jobId);
  let data = await talentCtrl.getBoard(currentUserId, companyId, jobId, filter, res.locale);
  res.json(new Response(data, data?'board_retrieved_successful':'not_found', res));
}


async function addCandidate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let form = req.body;


  let data = await talentCtrl.addCandidate(currentUserId, company, form);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}



async function importResumes(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.importResumes(companyId, currentUserId, req.files);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}

async function searchCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let filter = {...req.body, company: [company]};
  let sort = req.query;
  filter.query = req.query.query;
  filter.tags = _.reduce(filter.tags, function(res, item){res.push(ObjectID(item)); return res;}, []);
  filter.sources = _.reduce(filter.sources, function(res, item){res.push(ObjectID(item)); return res;}, []);
  let data = await talentCtrl.searchCandidates(currentUserId, company, filter, sort, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}


async function getCandidateById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let company = parseInt(req.params.id);
  let candidateId = isNaN(req.params.candidateId)?ObjectID(req.params.candidateId):parseInt(req.params.candidateId);

  data = await talentCtrl.getCandidateById(currentUserId, company, candidateId, res.locale);
  res.json(new Response(data, data?'candidate_retrieved_successful':'not_found', res));
}


async function updateCandidateById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;

  data = await talentCtrl.updateCandidateById(currentUserId, company, candidateId, form);
  res.json(new Response(data, data?'candidate_retrieved_successful':'not_found', res));
}


async function removeCandidateById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let data;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  data = await talentCtrl.removeCandidateById(currentUserId, company, candidateId);
  res.json(new Response(data, data ? 'candidate_removed_successful' : 'not_found', res));

}

async function getCandidateNotes(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = req.params.candidateId;
  let sort = req.query;

  let data = await talentCtrl.getCandidateNotes(companyId, currentUserId, candidateId, sort);

  res.json(new Response(data, data?'notes_retrieved_successful':'not_found', res));
}

async function addCandidateNote(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let note = req.body;

  let data = await talentCtrl.addCandidateNote(companyId, currentUserId, candidateId, note);

  res.json(new Response(data, data?'note_added_successful':'not_found', res));
}



async function removeCandidateNote(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let noteId = req.params.noteId;

  let data = await talentCtrl.removeCandidateNote(companyId, currentUserId, candidateId, noteId);

  res.json(new Response(data, data?'note_removed_successful':'not_found', res));
}


async function addCandidateTag(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let tags = req.body.tags;

  let data = await talentCtrl.addCandidateTag(companyId, currentUserId, candidateId, tags);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function removeCandidateTag(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let tagId = req.params.tagId;

  let data = await talentCtrl.removeCandidateTag(companyId, currentUserId, candidateId, tagId);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function addCandidateSources(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let sources = req.body.sources;

  let data = await talentCtrl.addCandidateSources(companyId, currentUserId, candidateId, sources);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}


async function addCandidateSource(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let source = ObjectID(req.body.source);

  let data = await talentCtrl.addCandidateSource(companyId, currentUserId, candidateId, source);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function removeCandidateSource(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let sourceId = req.params.sourceId;

  let data = await talentCtrl.removeCandidateSource(companyId, currentUserId, candidateId, sourceId);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function updateCandidatePool(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = req.params.candidateId;
  let poolIds = req.body.pools;

  let data = await talentCtrl.updateCandidatePool(companyId, currentUserId, candidateId, poolIds);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}


async function getCandidateEvaluations(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = isNaN(req.params.candidateId)?ObjectID(req.params.candidateId):parseInt(req.params.candidateId);
  let filter = req.body;
  let sort = req.query;
  console.log(req.params.candidateId)

  let data = await talentCtrl.getCandidateEvaluations(companyId, currentUserId, candidateId, filter, sort);

  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
}

async function getCandidateEvaluationById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let evaluationId = ObjectID(req.params.evaluationId);


  let data = await talentCtrl.getCandidateEvaluationById(company, currentUserId, evaluationId, res.locale);
  res.json(new Response(data, data?'evaluation_retrieved_successful':'not_found', res));
}


async function getCandidatesSimilar(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = req.params.candidateId;


  let data = await talentCtrl.getCandidatesSimilar(company, currentUserId, candidateId, res.locale);
  res.json(new Response(data, data?'candidates_retrieved_successful':'not_found', res));
}

async function getCandidateActivities(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let sort = req.query;

  let data = await talentCtrl.getCandidateActivities(company, currentUserId, candidateId, sort);
  res.json(new Response(data, data?'activities_retrieved_successful':'not_found', res));
}


async function addCandidateExperience(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;

  let data = await talentCtrl.addCandidateExperience(company, currentUserId, candidateId, form);
  res.json(new Response(data, data?'experiences_added_successful':'not_found', res));
}


async function getCandidateExperiences(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateExperiences(company, currentUserId, candidateId);
  res.json(new Response(data, data?'experiences_retrieved_successful':'not_found', res));
}


async function removeCandidateExperience(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let experienceId = ObjectID(req.params.experienceId);

  let data = await talentCtrl.removeCandidateExperience(company, currentUserId, candidateId, experienceId);
  res.json(new Response(data, data?'experience_deleted_successful':'not_found', res));
}

async function addCandidateEducation(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;

  let data = await talentCtrl.addCandidateEducation(company, currentUserId, candidateId, form);
  res.json(new Response(data, data?'educations_added_successful':'not_found', res));
}


async function getCandidateEducations(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateEducations(company, currentUserId, candidateId);
  res.json(new Response(data, data?'educations_retrieved_successful':'not_found', res));
}

async function removeCandidateEducation(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let educationId = ObjectID(req.params.educationId);

  let data = await talentCtrl.removeCandidateEducation(company, currentUserId, candidateId, educationId);
  res.json(new Response(data, data?'educations_deleted_successful':'not_found', res));
}


async function getCandidateSkills(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateSkills(company, currentUserId, candidateId);
  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}

async function addCandidateSkills(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;
  form = _.reduce(form, function(res, skill){
    if(skill._id){
      skill._id=ObjectID(skill._id);
    }
    res.push(skill);
    return res;
  }, []);

  let data = await talentCtrl.addCandidateSkills(company, currentUserId, candidateId, form);
  res.json(new Response(data, data?'skills_added_successful':'not_found', res));
}

async function removeCandidateSkill(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId);
  let skillId = req.params.skillId;

  let data = await talentCtrl.removeCandidateSkill(companyId, currentUserId, candidateId, sourceId);

  res.json(new Response(data, data?'skill_removed_successful':'not_found', res));
}


async function getCandidateAccomplishments(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);

  let data = await talentCtrl.getCandidateAccomplishments(company, currentUserId, candidateId);
  res.json(new Response(data, data?'accomplishments_retrieved_successful':'not_found', res));
}

async function addCandidateLanguages(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidateId = ObjectID(req.params.candidateId);
  let form = req.body;

  let data = await talentCtrl.addCandidateLanguages(company, currentUserId, candidateId, form);
  res.json(new Response(data, data?'languages_added_successful':'not_found', res));
}



async function uploadAvatar(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId)  ;
  let data = await talentCtrl.uploadAvatar(companyId, currentUserId, candidateId, req.files);

  res.json(new Response(data, data?'avatar_uploaded_successful':'not_found', res));
}


async function uploadCandidateResume(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId)  ;
  let data = await talentCtrl.uploadCandidateResume(companyId, currentUserId, candidateId, req.files);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}



async function getCandidateResumes(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = ObjectID(req.params.candidateId)  ;
  let data = await talentCtrl.getCandidateResumes(companyId, currentUserId, candidateId);

  res.json(new Response(data, data?'resume_uploaded_successful':'not_found', res));
}


async function assignCandidatesJobs(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let candidates = _.reduce(req.body.candidates, function(res, i){ res.push(ObjectID(i)); return res;}, []);
  let jobs = _.reduce(req.body.jobs, function(res, i){ res.push(ObjectID(i)); return res;}, []);

  let data = await talentCtrl.assignCandidatesJobs(company, currentUserId, candidates, jobs);
  res.json(new Response(data, data?'activities_retrieved_successful':'not_found', res));
}


async function checkCandidateEmail(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let email = req.query.email;

  let data = await talentCtrl.checkCandidateEmail(company, currentUserId, email);
  res.json(new Response(data, data?'email_retrieved_successful':'not_found', res));
}


async function getCandidateEvaluationsStats(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let candidateId = isNaN(req.params.candidateId)?ObjectID(req.params.candidateId):parseInt(req.params.candidateId);
  let filter = req.body;

  let data = await talentCtrl.getCandidateEvaluationsStats(companyId, currentUserId, candidateId, filter);

  res.json(new Response(data, data?'evaluationstats_retrieved_successful':'not_found', res));
}



async function getAllCandidatesSkills(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let evaluationId = req.params.evaluationId;


  let data = await talentCtrl.getAllCandidatesSkills(company, currentUserId, res.locale);
  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}

/************************** DEPARTMENT *****************************/

async function addCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let department = req.body;
  department.company = company;
  department.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyDepartment(company, currentUserId, department);
  res.json(new Response(data, data?'department_added_successful':'not_found', res));
}

async function updateCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let departmentId = ObjectID(req.params.departmentId);
  let department = req.body;
  department.company = company;
  department.updatedBy = currentUserId;
  department._id = departmentId;
  let data = await talentCtrl.updateCompanyDepartment(company, departmentId, currentUserId, department);
  res.json(new Response(data, data?'department_updated_successful':'not_found', res));
}

async function deleteCompanyDepartment(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let departmentId = req.params.departmentId;

  let data = await talentCtrl.deleteCompanyDepartment(company, departmentId, currentUserId);
  res.json(new Response(data, data?'department_updated_successful':'not_found', res));
}

async function getCompanyDepartments(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query?req.query.query:'';

  let data = await talentCtrl.getCompanyDepartments(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'departments_retrieved_successful':'not_found', res));
}


async function addCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let question = req.body;
  question.company = company;
  question.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyQuestionTemplate(company, currentUserId, question);
  res.json(new Response(data, data?'question_added_successful':'not_found', res));
}

async function getCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = ObjectID(req.params.questionTemplateId);

  let data = await talentCtrl.getCompanyQuestionTemplate(company, questionTemplateId, currentUserId);
  res.json(new Response(data, data?'question_retrieved_successful':'not_found', res));
}

async function updateCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = req.params.questionTemplateId;
  let question = req.body;
  question.company = company;
  question.updatedBy = currentUserId;

  let data = await talentCtrl.updateCompanyQuestionTemplate(company, questionTemplateId, currentUserId, question);
  res.json(new Response(data, data?'question_updated_successful':'not_found', res));
}

async function deleteCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = req.params.questionTemplateId;

  let data = await talentCtrl.deleteCompanyQuestionTemplate(company, questionTemplateId, currentUserId);
  res.json(new Response(data, data?'question_deleted_successful':'not_found', res));
}


async function deactivateCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = ObjectID(req.params.questionTemplateId);

  let data = await talentCtrl.deactivateCompanyQuestionTemplate(company, questionTemplateId, currentUserId);
  res.json(new Response(data, data?'question_deactivated_successful':'not_found', res));
}


async function activateCompanyQuestionTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let questionTemplateId = ObjectID(req.params.questionTemplateId);

  let data = await talentCtrl.activateCompanyQuestionTemplate(company, questionTemplateId, currentUserId);
  res.json(new Response(data, data?'question_activated_successful':'not_found', res));
}

async function getCompanyQuestionTemplates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query?req.query.query:'';

  let data = await talentCtrl.getCompanyQuestionTemplates(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'questions_retrieved_successful':'not_found', res));
}



async function addCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipeline = req.body;
  pipeline.company = company;
  pipeline.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyPipelineTemplate(company, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_added_successful':'not_found', res));
}

async function updateCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);
  let pipeline = req.body;

  let data = await talentCtrl.updateCompanyPipelineTemplate(company, pipelineId, currentUserId, pipeline);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}

async function deleteCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);

  let data = await talentCtrl.deleteCompanyPipelineTemplate(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_deleted_successful':'not_found', res));
}


async function getCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);

  let data = await talentCtrl.getCompanyPipelineTemplate(company, pipelineId, currentUserId, res.locale);
  res.json(new Response(data, data?'pipeline_retrieved_successful':'not_found', res));
}


async function deactivateCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);

  let data = await talentCtrl.deactivateCompanyPipelineTemplate(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}


async function activateCompanyPipelineTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pipelineId = ObjectID(req.params.pipelineId);

  let data = await talentCtrl.activateCompanyPipelineTemplate(company, pipelineId, currentUserId);
  res.json(new Response(data, data?'pipeline_updated_successful':'not_found', res));
}

async function getCompanyPipelineTemplates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await talentCtrl.getCompanyPipelineTemplates(company, currentUserId, res.locale);
  res.json(new Response(data, data?'pipelines_retrieved_successful':'not_found', res));
}


async function addCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let role = req.body;
  role.company = company;
  role.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyRole(company, currentUserId, role);
  res.json(new Response(data, data?'role_added_successful':'not_found', res));
}

async function updateCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;
  let role = req.body;

  let data = await talentCtrl.updateCompanyRole(company, currentUserId, roleId, role);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}

async function deleteCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;

  let data = await talentCtrl.deleteCompanyRole(company, currentUserId, roleId);
  res.json(new Response(data, data?'role_deleted_successful':'not_found', res));
}


async function disableCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = ObjectID(req.params.roleId);

  let data = await talentCtrl.disableCompanyRole(company, currentUserId, roleId);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}

async function enableCompanyRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let roleId = req.params.roleId;

  let data = await talentCtrl.enableCompanyRole(company, currentUserId, roleId);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}
async function getCompanyRoles(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let filter = req.query;
  filter.all = filter.all=='true'?true:false;

  let data = await talentCtrl.getCompanyRoles(company, currentUserId, filter, res.locale);
  res.json(new Response(data, data?'roles_retrieved_successful':'not_found', res));
}


/************************** LABELS *****************************/
async function getCompanyLabels(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;
  let types = req.query.type.split(',');

  let data = await talentCtrl.getCompanyLabels(company, query, types, res.locale);
  res.json(new Response(data, data?'labels_retrieved_successful':'not_found', res));
}

async function addCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let label = req.body;
  label.company = company;
  // label.createdBy = currentUserId;

  let data = await talentCtrl.addCompanyLabel(company, currentUserId, label);
  res.json(new Response(data, data?'label_added_successful':'not_found', res));
}

async function updateCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let labelId = req.params.labelId;
  let label = req.body;
  label.company = company;
  label.createdBy = currentUserId;

  let data = await talentCtrl.updateCompanyLabel(company, labelId, currentUserId, label);
  res.json(new Response(data, data?'label_updated_successful':'not_found', res));
}

async function deleteCompanyLabel(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let labelId = req.params.labelId;

  let data = await talentCtrl.deleteCompanyLabel(company, labelId, currentUserId);
  res.json(new Response(data, data?'label_deleted_successful':'not_found', res));
}




async function inviteMembers(req, res) {
  let company = parseInt(req.params.id);
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let form = req.body;

  let data = await talentCtrl.inviteMembers(company, currentUserId, form);
  res.json(new Response(data, data?'members_invited_successful':'not_found', res));
}


async function getCompanyMemberInvitations(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;

  let data = await talentCtrl.getCompanyMemberInvitations(company, currentUserId, query, res.locale);
  res.json(new Response(data, data?'members_retrieved_successful':'not_found', res));
}


async function cancelMemberInvitation(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let invitationId = ObjectID(req.params.invitationId);

  let data = await talentCtrl.cancelMemberInvitation(company, currentUserId, invitationId);
  res.json(new Response(data, data?'members_retrieved_successful':'not_found', res));
}


async function acceptMemberInvitation(req, res) {
  let company = parseInt(req.params.id);
  let member = req.body;
  let invitationId = req.query.invitationId;
  member.company = company;


  let data = await talentCtrl.acceptMemberInvitation(company, member, invitationId);
  res.json(new Response(data, data?'member_accepted_successful':'not_found', res));
}


async function getCompanyMembers(req, res) {
  console.log(req.user)
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;

  let data = await talentCtrl.getCompanyMembers(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'members_retrieved_successful':'not_found', res));
}


async function addCompanyMember(req, res) {
  let company = parseInt(req.params.id);
  let member = req.body;
  let invitationId = req.query.invitationId;
  member.company = company;


  let data = await talentCtrl.addCompanyMember(company, member, invitationId);
  res.json(new Response(data, data?'member_added_successful':'not_found', res));
}


async function getCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let memberId = req.params.memberId;

  let data = await talentCtrl.getCompanyMember(company, memberId, currentUserId);
  res.json(new Response(data, data?'member_retrieved_successful':'not_found', res));
}




async function updateCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let memberId = req.params.memberId;
  let member = req.body;
  member.company = company;
  member.createdBy = currentUserId;

  let data = await talentCtrl.updateCompanyMember(company, memberId, currentUserId, member);
  res.json(new Response(data, data?'member_updated_successful':'not_found', res));
}

async function updateCompanyMemberRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let memberId = req.params.memberId;
  let role = req.body.role;

  let data = await talentCtrl.updateCompanyMemberRole(company, memberId, currentUserId, role);
  res.json(new Response(data, data?'member_updated_successful':'not_found', res));
}

async function deleteCompanyMember(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let memberId = ObjectID(req.params.memberId);
  let data = await talentCtrl.deleteCompanyMember(company, currentUserId, memberId);
  res.json(new Response(data, data?'member_deleted_successful':'not_found', res));
}



async function getJobsSubscribed(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let sort = req.query;
  let data = await talentCtrl.getJobsSubscribed(company, currentUserId, sort);
  res.json(new Response(data, data?'jobs_retrieved_successful':'not_found', res));
}


async function getApplicationsSubscribed(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let sort = req.query;
  let data = await talentCtrl.getApplicationsSubscribed(company, currentUserId, sort);
  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}


async function getNotificationPreference(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let data = await talentCtrl.getNotificationPreference(company, currentUserId);
  res.json(new Response(data, data?'notification_preferene_retrieved_successful':'not_found', res));
}


async function updateNotificationPreference(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let data = await talentCtrl.updateNotificationPreference(company, currentUserId, req.body);
  res.json(new Response(data, data?'notification_preferene_updated_successful':'not_found', res));
}

async function searchTasks(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let filter = req.body;
  let sort = req.query;
  let query = req.query.query;
  let data = await talentCtrl.searchTasks(company, currentUserId, filter, sort, query);
  res.json(new Response(data, data?'applications_retrieved_successful':'not_found', res));
}



async function getCompanyPools(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;
  let candidateId = req.query.candidateId?ObjectID(req.query.candidateId):null;
  let id = req.query.id?parseInt(req.query.id):null;

  let data = await talentCtrl.getCompanyPools(company, currentUserId, query, candidateId, id, res.locale);
  res.json(new Response(data, data?'pools_retrieved_successful':'not_found', res));
}


async function getCompanyPoolById(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = ObjectID(req.params.poolId);

  let data = await talentCtrl.getCompanyPoolById(company, currentUserId, poolId, res.locale);
  res.json(new Response(data, data?'pool_retrieved_successful':'not_found', res));
}

async function addCompanyPool(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let pool = req.body;
  pool.company = company;


  let data = await talentCtrl.addCompanyPool(company, pool, currentUserId);
  res.json(new Response(data, data?'pool_added_successful':'not_found', res));
}

async function updateCompanyPool(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;
  let pool = req.body;
  pool.company = company;

  let data = await talentCtrl.updateCompanyPool(company, poolId, currentUserId, pool);
  res.json(new Response(data, data?'pool_updated_successful':'not_found', res));
}

async function deleteCompanyPool(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;

  let data = await talentCtrl.deleteCompanyPool(company, poolId, currentUserId);
  res.json(new Response(data, data?'pool_deleted_successful':'not_found', res));
}


async function getPoolCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = ObjectID(req.params.poolId);
  let sort = req.query;
  let query = req.query.query?req.query.query:'';

  let data = await talentCtrl.getPoolCandidates(company, currentUserId, poolId, query, sort);
  res.json(new Response(data, data?'candidate_retrieved_successful':'not_found', res));
}

async function addPoolCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;
  let candidates = _.reduce(req.body.candidates, function(res, item){res.push(ObjectID(item)); return res;}, []);

  let data = await talentCtrl.addPoolCandidates(company, currentUserId, poolId, candidates);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}


async function removePoolCandidate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;
  let candidateId = req.params.candidateId;

  let data = await talentCtrl.removePoolCandidate(company, poolId, candidateId, currentUserId);
  res.json(new Response(data, data?'candidate_removed_successful':'not_found', res));
}


async function removePoolCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let poolId = req.params.poolId;
  let candidates = req.body.candidates;

  let data = await talentCtrl.removePoolCandidates(company, poolId, candidates, currentUserId);
  res.json(new Response(data, data?'candidates_removed_successful':'not_found', res));
}



async function getCompanyProjects(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let query = req.query.query;

  let data = await talentCtrl.getCompanyProjects(company, query, currentUserId, res.locale);
  res.json(new Response(data, data?'projects_retrieved_successful':'not_found', res));
}


async function addCompanyProject(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let project = req.body;
  project.company = company;


  let data = await talentCtrl.addCompanyProject(company, project, currentUserId);
  res.json(new Response(data, data?'project_added_successful':'not_found', res));
}

async function updateCompanyProject(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let project = req.body;
  project.company = company;

  let data = await talentCtrl.updateCompanyProject(company, projectId, currentUserId, project);
  res.json(new Response(data, data?'project_updated_successful':'not_found', res));
}

async function deleteCompanyProject(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;

  let data = await talentCtrl.deleteCompanyProject(company, projectId, currentUserId);
  res.json(new Response(data, data?'project_deleted_successful':'not_found', res));
}


async function getProjectCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let sort = req.query;

  let data = await talentCtrl.getProjectCandidates(company, projectId, currentUserId, sort);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}

async function addProjectCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let candidates = req.body.candidates;

  candidates.forEach(function(id){ id = parseInt(id); });
  let data = await talentCtrl.addProjectCandidates(company, projectId, candidates, currentUserId);
  res.json(new Response(data, data?'candidate_added_successful':'not_found', res));
}


async function removeProjectCandidate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let candidateId = req.params.candidateId;

  let data = await talentCtrl.removeProjectCandidate(company, projectId, candidateId, currentUserId);
  res.json(new Response(data, data?'candidate_removed_successful':'not_found', res));
}


async function removeProjectCandidates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let projectId = req.params.projectId;
  let candidates = req.body.candidates;

  let data = await talentCtrl.removeProjectCandidates(company, projectId, candidates, currentUserId);
  res.json(new Response(data, data?'candidates_removed_successful':'not_found', res));
}


async function updateCandidateProject(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let peopleId = req.params.peopleId;
  let projectIdss = req.body.projects;

  let data = await talentCtrl.updateCandidateProject(companyId, currentUserId, peopleId, projectIdss);

  res.json(new Response(data, data?'projects_added_successful':'not_found', res));
}


async function updatePeoplePool(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let peopleId = parseInt(req.params.peopleId);
  let poolIds = req.body.pools;

  let data = await talentCtrl.updatePeoplePool(companyId, currentUserId, peopleId, poolIds);

  res.json(new Response(data, data?'tag_added_successful':'not_found', res));
}



async function getPeopleFlagged(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let sort = req.query;
  let data = await talentCtrl.getPeopleFlagged(companyId, currentUserId, sort);

  res.json(new Response(data, data?'blacklist_retrieved_successful':'not_found', res));
}


async function uploadApplication(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let data = await talentCtrl.uploadApplication(companyId, currentUserId, applicationId, req.files);

  res.json(new Response(data, data?'files_retrieved_successful':'not_found', res));
}

async function getFiles(req, res) {
  let companyId = parseInt(req.params.id);
  let currentUserId = parseInt(req.header('UserId'));
  let applicationId = req.params.applicationId;
  let data = await talentCtrl.getFiles(companyId, currentUserId, applicationId);

  res.json(new Response(data, data?'files_retrieved_successful':'not_found', res));
}




async function getCompanyEvaluationTemplates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let filter = req.query;
  filter.all = filter.all=='true'?true:false;

  let data = await talentCtrl.getCompanyEvaluationTemplates(companyId, filter, currentUserId, res.locale);
  res.json(new Response(data, data?'evaluations_retrieved_successful':'not_found', res));
}


async function addCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let evlaluation = req.body;
  evlaluation.company = company;


  let data = await talentCtrl.addCompanyEvaluationTemplate(company, evlaluation, currentUserId);
  res.json(new Response(data, data?'evaluation_added_successful':'not_found', res));
}



async function getCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = req.params.templateId;

  let data = await talentCtrl.getCompanyEvaluationTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'evaluation_retrieved_successful':'not_found', res));
}

async function updateCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let templateId = req.params.templateId;
  let template = req.body;
  template.company = ObjectID(template.company);
  let data = await talentCtrl.updateCompanyEvaluationTemplate(company, templateId, currentUserId, template);
  res.json(new Response(data, data?'evaluation_updated_successful':'not_found', res));
}

async function deleteCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = req.params.templateId;

  let data = await talentCtrl.deleteCompanyEvaluationTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'evlaluation_deleted_successful':'not_found', res));
}


async function deactivateCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = ObjectID(req.params.templateId);

  let data = await talentCtrl.deactivateCompanyEvaluationTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}


async function activateCompanyEvaluationTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = ObjectID(req.params.templateId);

  let data = await talentCtrl.activateCompanyEvaluationTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}


async function getEvaluationFilters(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);

  let data = await talentCtrl.getEvaluationFilters(companyId, currentUserId);
  res.json(new Response(data, data?'filters_retrieved_successful':'not_found', res));
}


async function getCompanyEmailTemplates(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let filter = req.query;
  filter.all = filter.all=='true'?true:false;
  let data = await talentCtrl.getCompanyEmailTemplates(companyId, currentUserId,  filter, res.locale);
  res.json(new Response(data, data?'emails_retrieved_successful':'not_found', res));
}


async function addCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let email = req.body;
  email.company = companyId;


  let data = await talentCtrl.addCompanyEmailTemplate(companyId, email, currentUserId);
  res.json(new Response(data, data?'email_added_successful':'not_found', res));
}

async function updateCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = req.params.templateId;
  let template = req.body;

  let data = await talentCtrl.updateCompanyEmailTemplate(companyId, templateId, currentUserId, template);
  res.json(new Response(data, data?'email_updated_successful':'not_found', res));
}

async function deleteCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let templateId = req.params.templateId;

  let data = await talentCtrl.deleteCompanyEmailTemplate(company, templateId, currentUserId);
  res.json(new Response(data, data?'email_deleted_successful':'not_found', res));
}


async function deactivateCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = ObjectID(req.params.templateId);

  let data = await talentCtrl.deactivateCompanyEmailTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}


async function activateCompanyEmailTemplate(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let templateId = ObjectID(req.params.templateId);

  let data = await talentCtrl.activateCompanyEmailTemplate(companyId, templateId, currentUserId);
  res.json(new Response(data, data?'template_updated_successful':'not_found', res));
}

async function searchContacts(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let companyId = parseInt(req.params.id);
  let query = req.query.query?req.query.query:'';
  let data = await talentCtrl.searchContacts(companyId, currentUserId, query);
  res.json(new Response(data, data?'contacts_retrieved_successful':'not_found', res));
}


