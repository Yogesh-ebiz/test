const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobAlert = require('../models/job_alert.model');
const JobRequisition = require('../models/jobrequisition.model');
const QuestionTemplate = require('../models/questiontemplate.model');

const Promotion = require('../models/promotion.model');
const Pipeline = require('../models/pipeline.model');
const PipelineTemplate = require('../models/pipelineTemplate.model');
const PipelineService = require('../services/pipeline.service');
const memberService = require('../services/member.service');

let SearchParam = require('../const/searchParam');



const jobSchema = Joi.object({
  jobId: Joi.number().optional(),
  createdBy: Joi.number(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.number().optional(),
  minMonthExperience: Joi.number().optional(),
  maxMonthExperience: Joi.number().optional(),
  currency: Joi.string(),
  noOfResources: Joi.number(),
  type: Joi.string(),
  department: Joi.object().optional(),
  industry: Joi.array().optional(),
  category: Joi.string(),
  internalCode: Joi.string().optional(),
  jobFunction: Joi.string(),
  expirationDate: Joi.number(),
  requiredOnDate: Joi.number(),
  salaryRangeLow: Joi.number().optional(),
  salaryRangeHigh: Joi.number().optional(),
  salaryFixed: Joi.any(),
  level: Joi.string(),
  responsibilities: Joi.array(),
  qualifications: Joi.array(),
  minimumQualifications: Joi.array(),
  skills: Joi.array().optional(),
  employmentType: Joi.string(),
  allowRemote: Joi.boolean(),
  education: Joi.string().allow(''),
  company: Joi.number(),
  district: Joi.any().optional(),
  city: Joi.any().optional(),
  state: Joi.string(),
  country: Joi.string(),
  postalCode: Joi.string(),
  externalUrl: Joi.string(),
  hasApplied: Joi.boolean(),
  questions: Joi.array(),
  tags: Joi.array(),
  applicationPreferences: Joi.object(),
  profileField: Joi.object(),
  autoConfirmationEmail: Joi.object(),
  pipeLine: Joi.object()
});



async function addJob(companyId, currentUserId, form) {
  if(!companyId || !currentUserId || !form){
    return;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);
  if(!member){
    return;
  }


  let result;
  form.createdBy = currentUserId;

  if(form.department) {
    form.department = ObjectID(form.department);
  }

  form = await Joi.validate(form, jobSchema, {abortEarly: false});


  form.members = [member._id];
  result = new JobRequisition(form).save();

  return result;

}


async function updateJob(jobId, currentUserId, form) {
  if(!jobId || !currentUserId || !form){
    return;
  }


  let result;

  if(form.department) {
    form.department = ObjectID(form.department);
  }

  form = await Joi.validate(form, jobSchema, {abortEarly: false});

  let job = await findJob_Id(jobId);

  if(job){
    job.title =  form.title,
    job.description =  form.description,
    job.internalCode =  form.internalCode,
    job.salaryRangeLow =  form.salaryRangeLow,
    job.salaryRangeHigh =  form.salaryRangeHigh,
    job.salaryFixed =  form.salaryFixed,
    job.jobFunction =  form.jobFunction,
    job.level =  form.level,
    job.category = form.category,
    job.district = form.district
    job.city =  form.city;
    job.state =  form.state;
    job.country =  form.country;
    job.responsibilities=  form.responsibilities;
    job.qualifications = form.qualifications;
    job.minimumQualifications = form.minimumQualifications;
    job.skills = form.skills;
    job.employmentType = form.employmentType;
    job.education = form.education;
    job.industry = form.industry;
    job.tags = form.tags;
    job.allowRemote=form.allowRemote;

    if(form.department){
      job.department =  ObjectID(form.department);
    }

    job.updatedBy = currentUserId;
    job.updatedDate = Date.now();
    result = new JobRequisition(job).save();
  }

  return result;

}

function searchTitle(keyword) {
  let data = null;

  if(keyword==null){
    return;
  }
  var regex = new RegExp(keyword, 'i');
  return JobRequisition.aggregate([
    { $match: {title: regex} },
    { $group: {_id:{title:'$title'}} },
    { $project: {_id: 0, keyword: '$_id.title'}}
  ])
}

async function findJobId(jobId, locale) {
  let data = null;

  if(jobId==null){
    return;
  }
  // let localeStr = locale? locale.toLowerCase() : 'en';
  // let propLocale = '$name.'+localeStr;


  data = JobRequisition.findOne({jobId: jobId}).populate('tags');

  // Promotion.populate(data, {path: "promotion"});


  return data;

  // return JobRequisition.findOne({jobId: jobId});
}


async function findJob_Id(jobId, locale) {
  let data = null;

  if(jobId==null){
    return;
  }
  data = JobRequisition.findById(jobId).populate('department').populate('tags').populate('members');
  return data;

  // return JobRequisition.findOne({jobId: jobId});
}

async function findJobIds(jobIds) {
  let data = null;

  if(jobIds==null){
    return;
  }


  return JobRequisition.find({jobId: {$in: jobIds }});
}


async function updateJobPipeline(jobId, form, currentUserId, locale) {
  let data = null;

  if(!jobId || !form || !currentUserId){
    return;
  }

  let pipeline=null;

  let job = await JobRequisition.findById(jobId);
  if(job) {
    form.createdBy = currentUserId
    form.jobId = job.jobId;
    pipeline = await PipelineService.addPipeline(jobId, form);

    if(pipeline){
      job.pipeline=pipeline._id;
      await job.save();
    }
  }

  return pipeline;
}

async function getJobPipeline(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  let job = await JobRequisition.findById(jobId);
  if(job){
    data = await Pipeline.findById(job.pipeline).populate({
      path: 'stages',
      populate:[{
        path: 'members',
        model: 'Member'
      }, {
        path: 'tasks',
        model: 'Task'
      }]
    });

  }


  return data;
}


async function updateJobMembers(jobId, members, currentUserId, locale) {
  let data = null;

  if(!jobId || !members || !currentUserId){
    return;
  }

  let pipeline=null;

  let job = await JobRequisition.findById(jobId);
  if(job) {
    job.members = members
    job.updatedBy = currentUserId;
    data = await JobRequisition.update({_id: ObjectID(jobId)}, {$set: {members: members, updatedBy: currentUserId}});
    console.log(data, jobId)
  }


  return data;
}

async function getJobMembers(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  let job = await JobRequisition.findById(jobId);
  if(job){
    data = await Pipeline.findById(job.pipeline).populate({
      path: 'stages',
      populate:[{
        path: 'members',
        model: 'Member'
      }, {
        path: 'tasks',
        model: 'Task'
      }]
    });

  }


  return data;
}

async function updateJobApplicationForm(jobId, form, currentUserId, locale) {
  let data = null;

  if(!jobId || !form || !currentUserId){
    return;
  }


  let job = await JobRequisition.findById(jobId);
  if(job){
    if(form.questionTemplateId) {
      let questionTemplate = await QuestionTemplate.findById(form.questionTemplateId);

      if (questionTemplate) {
        job.questionTemplate = questionTemplate._id;
        job.hasQuestions = true;
      }
    }

    if (form.applicationForm) {
      job.applicationForm = form.applicationForm;
    }

    if (!job.pipeLine) {
      job.pipeLine = null;
    }

    job.updatedBy = currentUserId;
    data = await job.save();
  }


  return data;
}


async function closeJob(jobId, currentUserId) {
  if(!jobId || !currentUserId){
    return;
  }

  let result = await JobRequisition.update({_id: ObjectID(jobId)}, {$set: {status: statusEnum.CLOSED, updatedBy: currentUserId, updatedDate: Date.now()}});
  return result;

}


async function archiveJob(jobId, currentUserId) {
  if(!jobId || !currentUserId){
    return;
  }

  let result = await JobRequisition.update({_id: ObjectID(jobId)}, {$set: {status: statusEnum.ARCHIVED, updatedBy: currentUserId, updatedDate: Date.now()}});
  return result;

}


function removeByJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobAlert.remove({partyId: userId, jobId: jobId});
}

function getCountsGroupByCompany(match){

  if(!match){
    return;
  }

  let res = JobRequisition.aggregate([
    {$match: match},
    { $group: {_id:{company:"$company"}, count:{$sum:1} } }
  ]);

  return res;
}


function getJobCount(filter) {
  let data = null;

  if(filter==null){
    return;
  }

  filter = {title: filter.title, jobId: filter.jobId, level: filter.level, jobFunction: filter.jobFunction, industry: filter.industry, city: filter.city, state: filter.state, country: filter.country, company: filter.company};
  let search = new SearchParam(filter);

  let res = JobRequisition.find(search).count();
  return res;
}


function getNewJobs(filter) {
  let data = null;

  // if(filter==null){
  //   return;
  // }

  var twoWeeksAgo = new Date(Date.now() - 12096e5);
  // filter = {createdDate: {$gte: twoWeeksAgo.getTime()},level: filter.level, jobFunction: filter.jobFunction, industry: filter.industry, city: filter.city, state: filter.state, country: filter.country, company: filter.company};
  filter = {createdDate: {$gte: twoWeeksAgo.getTime()}};

  let search = new SearchParam(filter);

  let res = JobRequisition.find(search).limit(10);

  return res;
}

async function getGroupOfCompanyJobs(listOfCompanyIds) {
  let data = null;

  if(listOfCompanyIds==null){
    return;
  }


  return await JobRequisition.aggregate([
    { $match: {company: {$in: listOfCompanyIds }} },
    { $group: {_id:'$company'} },
    {$lookup:{
        from:"jobrequisitions",
        as:"list",
        let:{g:"$_id"},
        pipeline:[
          {$match:{$expr:{$eq:["$company","$$g"]}}},
          {$limit:5},
          // {$project:{_id:0, company:1, jobId:1}}
        ]
      }}
  ])

}

async function getRelatedJobs(job) {
  let data = null;

  if(job==job){
    return;
  }

  let listOfRoles = ['Team Leader', 'Manager', 'Assistant Manager', 'Executive', 'Director', 'Coordinator', 'Administrator', 'Controller', 'Officer', 'Organizer', 'Supervisor', 'Superintendent', 'Head', 'Overseer', 'Chief', 'Foreman', 'Controller', 'Principal', 'President', 'Lead']

  let marketing = ['Marketing Specialist', 'Marketing Manager', 'Marketing Director', 'Graphic Designer', 'Marketing Research Analyst', 'Marketing Communications Manager', 'Marketing Consultant', 'Product Manager', 'Public Relations', 'Social Media Assistant', 'Brand Manager', 'SEO Manager', 'Content Marketing Manager', 'Copywriter', 'Media Buyer', 'Digital Marketing Manager', 'eCommerce Marketing Specialist', 'Brand Strategist', 'Vice President of Marketing', 'Media Relations Coordinator']
  let sales = ['Sales Associate', 'Sales Representative', 'Sales Manager', 'Retail Worker', 'Store Manager', 'Sales Representative', 'Sales Manager', 'Real Estate Broker', 'Sales Associate', 'Cashier', 'Store Manager', 'Account Executive', 'Account Manager', 'Area Sales Manager', 'Direct Salesperson', 'Director of Inside Sales', 'Outside Sales Manager', 'Sales Analyst', 'Market Development Manager', 'B2B Sales Specialist', 'Sales Engineer', 'Merchandising Associate']
  let constructions = ['Construction Worker', 'Taper', 'Plumber', 'Heavy Equipment Operator', 'Vehicle or Equipment Cleaner', 'Carpenter', 'Electrician', 'Painter', 'Welder', 'Handyman', 'Boilermaker', 'Crane Operator', 'Building Inspector', 'Pipefitter', 'Sheet Metal Worker', 'Iron Worker', 'Mason', 'Roofer', 'Solar Photovoltaic Installer', 'Well Driller'];
  let it = ['Computer Scientist', 'IT Professional', 'UX Designer & UI Developer', 'SQL Developer', 'Web Designer', 'Web Developer', 'Help Desk Worker/Desktop Support', 'Software Engineer', 'Data Entry', 'DevOps Engineer', 'Computer Programmer', 'Network Administrator', 'Information Security Analyst', 'Artificial Intelligence Engineer', 'Cloud Architect', 'IT Manager', 'Technical Specialist', 'Application Developer', 'Chief Technology Officer (CTO)', 'Chief Information Officer (CIO)'];
  let helpdesk = ['Virtual Assistant', 'Customer Service', 'Customer Support', 'Concierge', 'Help Desk', 'Customer Service Manager', 'Technical Support Specialist', 'Account Representative', 'Client Service Specialist', 'Customer Care Associate'];
  let operation = ['Operations Manager', 'Operations Assistant', 'Operations Coordinator', 'Operations Analyst', 'Operations Director', 'Vice President of Operations', 'Operations Professional', 'Scrum Master', 'Continuous Improvement Lead', 'Continuous Improvement Consultant'];
  let finance = ['Credit Authorizer', 'Benefits Manager', 'Credit Counselor', 'Accountant', 'Bookkeeper', 'Accounting Analyst', 'Accounting Director', 'Accounts Payable/Receivable Clerk', 'Auditor', 'Budget Analyst', 'Controller', 'Financial Analyst', 'Finance Manager', 'Economist', 'Payroll Manager', 'Payroll Clerk', 'Financial Planner', 'Financial Services Representative', 'Finance Director', 'Commercial Loan Officer'];
  let engineering = ['Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Assistant Engineer', 'Chemical Engineer', 'Chief Engineer', 'Drafter', 'Engineering Technician', 'Geological Engineer', 'Biological Engineer', 'Maintenance Engineer', 'Mining Engineer', 'Nuclear Engineer', 'Petroleum Engineer', 'Plant Engineer', 'Production Engineer', 'Quality Engineer', 'Safety Engineer', 'Sales Engineer'];
  let researchAnalyst = ['Researcher', 'Research Assistant', 'Data Analyst', 'Business Analyst', 'Financial Analyst', 'Biostatistician', 'Title Researcher', 'Market Researcher', 'Title Analyst', 'Medical Researcher'];
  let teach = ['Mentor', 'Tutor/Online Tutor', 'Teacher', 'Teaching Assistant', 'Substitute Teacher', 'Preschool Teacher', 'Test Scorer', 'Online ESL Instructor', 'Professor', 'Assistant Professor'];
  let artistic = ['Graphic Designer', 'Artist', 'Interior Designer', 'Video Editor', 'Video or Film Producer', 'Playwright', 'Musician', 'Novelist/Writer', 'Computer Animator', 'Photographer', 'Camera Operator', 'Sound Engineer', 'Motion Picture Director', 'Actor', 'Music Producer', 'Director of Photography'];
  let healthcare = ['Nurse', 'Travel Nurse', 'Nurse Practitioner', 'Doctor', 'Caregiver', 'CNA', 'Physical Therapist', 'Pharmacist', 'Pharmacy Assistant', 'Medical Administrator', 'Medical Laboratory Tech', 'Physical Therapy Assistant', 'Massage Therapy', 'Dental Hygienist', 'Orderly', 'Personal Trainer', 'Massage Therapy', 'Medical Laboratory Tech', 'Phlebotomist', 'Medical Transcriptionist', 'Telework Nurse/Doctor', 'Reiki Practitioner']
  let hospitality = ['Housekeeper', 'Flight Attendant', 'Travel Agent', 'Hotel Front Door Greeter', 'Bellhop', 'Cruise Director', 'Entertainment Specialist', 'Hotel Manager', 'Front Desk Associate', 'Front Desk Manager', 'Concierge', 'Group Sales', 'Event Planner', 'Porter', 'Spa Manager', 'Wedding Coordinator', 'Cruise Ship Attendant', 'Casino Host', 'Hotel Receptionist', 'Reservationist', 'Events Manager', 'Meeting Planner', 'Lodging Manager', 'Director of Maintenance', 'Valet']
  let foodservice = ['Waiter', 'Waitress', 'Server', 'Chef', 'Fast Food Worker', 'Barista', 'Line Cook', 'Cafeteria Worker', 'Restaurant Manager', 'Wait Staff Manager', 'Bus Person', 'Restaurant Chain Executive']
  let scientist = ['Political Scientist', 'Chemist', 'Conservation Scientist', 'Sociologist', 'Biologist', 'Geologist', 'Physicist', 'Astronomer', 'Atmospheric Scientist', 'Molecular Scientist']
  let onthephone = ['Call Center Representative', 'Customer Service', 'Telemarketer', 'Telephone Operator', 'Phone Survey Conductor', 'Dispatcher for Trucks or Taxis', 'Customer Support Representative', 'Over the Phone Interpreter', 'Phone Sales Specialist', 'Mortgage Loan Processor']
  let counseling = ['Counselor', 'Mental Health Counselor', 'Addiction Counselor', 'School Counselor', 'Speech Pathologist', 'Guidance Counselor', 'Social Worker', 'Therapist', 'Life Coach', 'Couples Counselor']
  let cosmetology = ['Beautician', 'Hair Stylist', 'Nail Technician', 'Cosmetologist', 'Salon Manager', 'Makeup Artist', 'Esthetician', 'Skin Care Specialist', 'Manicurist', 'Barber']
  let writing = ['Journalist', 'Copy Editor', 'Editor/Proofreader', 'Content Creator', 'Speechwriter', 'Communications Director', 'Screenwriter', 'Technical Writer', 'Columnist', 'Public Relations Specialist', 'Proposal Writer', 'Content Strategist', 'Grant Writer', 'Video Game Writer', 'Translator', 'Film Critic', 'Copywriter', 'Travel Writer', 'Social Media Specialist', 'Ghostwriter']
  let physicallabor = ['Warehouse Worker', 'Painter', 'Truck Driver', 'Heavy Equipment Operator', 'Welding', 'Physical Therapy Assistant', 'Housekeeper', 'Landscaping Worker', 'Landscaping Assistant', 'Mover']
  let jobswithanimals = ['Animal Breeder', 'Veterinary Assistant', 'Farm Worker', 'Animal Shelter Worker', 'Dog Walker / Pet Sitter', 'Zoologist', 'Animal Trainer', 'Service Dog Trainer', 'Animal Shelter Manager', 'Animal Control Officer']
  let driver = ['Delivery Driver', 'School Bus Driver', 'Truck Driver', 'Tow Truck Operator', 'UPS Driver', 'Mail Carrier', 'Recyclables Collector', 'Courier', 'Bus Driver', 'Cab Driver']
  let volunteer = ['Animal Shelter Board Member', 'Office Volunteer', 'Animal Shelter Volunteer', 'Hospital Volunteer', 'Youth Volunteer', 'Food Kitchen Worker', 'Homeless Shelter Worker', 'Conservation Volunteer', 'Meals on Wheels Driver', 'Habitat for Humanity Builder', 'Emergency Relief Worker', 'Red Cross Volunteer', 'Community Food Project Worker', 'Women’s Shelter Jobs', 'Suicide Hotline Volunteer', 'School Volunteer', 'Community Volunteer Jobs', 'Sports Volunteer', 'Church Volunteer ']
  let other = ['Archivist', 'Actuary', 'Architect', 'Personal Assistant', 'Entrepreneur', 'Security Guard', 'Mechanic', 'Recruiter', 'Mathematician', 'Locksmith', 'Management Consultant', 'Shelf Stocker', 'Caretaker or House Sitter', 'Library Assistant', 'Translator', 'HVAC Technician', 'Attorney', 'Paralegal', 'Executive Assistant', 'Personal Assistant', 'Bank Teller', 'Parking Attendant', 'Machinery Operator', 'Manufacturing Assembler', 'Funeral Attendant', 'Assistant Golf Professional', 'Yoga Instructor']

  return res;
}



async function findJobsByCompanyId(company) {
  let data = null;

  if(!company){
    return;
  }

  console.log(company)
  return await JobRequisition.find({company:company})

}


async function getGroupOfCompanyJobs(listOfCompanyIds) {
  let data = null;

  if(listOfCompanyIds==null){
    return;
  }


  return await JobRequisition.aggregate([
    { $match: {company: {$in: listOfCompanyIds }} },
    { $group: {_id:'$company'} },
    {$lookup:{
        from:"jobrequisitions",
        as:"list",
        let:{g:"$_id"},
        pipeline:[
          {$match:{$expr:{$eq:["$company","$$g"]}}},
          {$limit:5},
          // {$project:{_id:0, company:1, jobId:1}}
        ]
      }}
  ])

}






module.exports = {
  addJob:addJob,
  updateJob:updateJob,
  searchTitle: searchTitle,
  findJobId: findJobId,
  findJob_Id:findJob_Id,
  findJobIds: findJobIds,
  removeByJobId: removeByJobId,
  updateJobPipeline:updateJobPipeline,
  getJobPipeline:getJobPipeline,
  updateJobMembers:updateJobMembers,
  getJobMembers:getJobMembers,
  updateJobApplicationForm:updateJobApplicationForm,
  closeJob:closeJob,
  archiveJob:archiveJob,
  getCountsGroupByCompany,
  getJobCount:getJobCount,
  getNewJobs:getNewJobs,
  findJobsByCompanyId:findJobsByCompanyId,
  getGroupOfCompanyJobs:getGroupOfCompanyJobs
}
