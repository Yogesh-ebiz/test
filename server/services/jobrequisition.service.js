const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const {convertToCompany, convertToAvatar} = require('../utils/helper');

const _ = require('lodash');

let SearchParam = require('../const/searchParam');
const statusEnum = require('../const/statusEnum');
const dateEnum = require('../const/dateEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');
const labelType = require('../const/labelType');
const adPosition = require('../const/adPosition');
const notificationType = require('../const/notificationType');
const notificationEvent = require('../const/notificationEvent');

const JobAlert = require('../models/job_alert.model');
const JobRequisition = require('../models/jobrequisition.model');
const QuestionTemplate = require('../models/questiontemplate.model');

const Promotion = require('../models/promotion.model');
const Pipeline = require('../models/pipeline.model');
const pipelineService = require('../services/pipeline.service');
const pipelineTemplateService = require('../services/pipelineTemplate.service');
const memberService = require('../services/member.service');
const feedService = require('../services/api/feed.service.api');
const activityService = require('../services/activity.service');
const labelService = require('../services/label.service');
const companyService = require('../services/company.service');
const applicationProgressService = require('../services/applicationprogress.service');
const CompanySalary = require("../models/companysalary.model");




const jobSchema = Joi.object({
  jobId: Joi.number().optional(),
  createdBy: Joi.object(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.number().optional(),
  minMonthExperience: Joi.number().optional(),
  maxMonthExperience: Joi.number().optional(),
  companyId: Joi.number().optional(),
  currency: Joi.string(),
  noOfResources: Joi.number(),
  type: Joi.string(),
  department: Joi.object().optional(),
  industry: Joi.array(),
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
  district: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow(''),
  country: Joi.string().allow(''),
  postalCode: Joi.string(),
  externalUrl: Joi.string().allow('').optional(),
  hasApplied: Joi.boolean(),
  questions: Joi.array(),
  tags: Joi.array(),
  applicationPreferences: Joi.object(),
  profileField: Joi.object(),
  autoConfirmationEmail: Joi.object(),
  // pipeline: Joi.object(),
  type: Joi.string()

});



async function addJob(companyId, member, form) {
  if(!companyId || !form){
    return;
  }

  let result;

  if(form.department) {
    form.department = ObjectID(form.department);
  }

  const company = await companyService.findByCompanyId(companyId);

  form = await Joi.validate(form, jobSchema, {abortEarly: false});
  form.companyId = companyId;

  if(company){
    form.company = company._id;
  }

  if(!form.pipeline){
    let pipeline = await pipelineTemplateService.getDefaultTemplate();
    form.pipeline = pipeline._id;
  }

  if(member){
    form.members = [member._id];
    form.createdBy = member._id;
  }

  if(form.tags){
    let tags = [];
    for (let tag of form.tags) {
      if(!tag._id) {
        tag.company = companyId;
        tag.type = labelType.KEYWORD;
        tag = await labelService.addLabel(tag);
        tags.push(tag._id);
      } else {

        tags.push(ObjectID(tag._id));
      }
    }
    form.tags = tags;
  }

  form.isExternal = form.externalUrl?true:false;
  result = await new JobRequisition(form).save();

  if(result && member){
    let subscription = {member: member._id, createdBy: member.userId, subjectType: subjectType.JOB, subject: result._id};
    await memberService.subscribe(subscription);
  }


  return result;

}


async function updateJob(jobId, member, form) {
  if(!jobId || !member || !form){
    return;
  }


  let result;

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
    job.maxMonthExperience = form.maxMonthExperience;
    job.skills = form.skills;
    job.employmentType = form.employmentType;
    job.education = form.education;
    job.industry = form.industry;
    // job.tags = form.tags;
    job.allowRemote=form.allowRemote;
    job.isExternal = form.externalUrl?true:false;
    job.skills = form.skills;

    let tags = [];
    for (let tag of form.tags) {
      if(!tag._id) {
        tag.company = member.company;
        tag.type = labelType.KEYWORD;
        tag = await labelService.addLabel(tag);
        tags.push(tag._id);
      } else {

        tags.push(ObjectID(tag._id));
      }
    }
    job.tags = tags;



    if(form.department){
      job.department =  ObjectID(form.department);
    }

    job.updatedBy = member;
    job.updatedDate = Date.now();

    result = await job.save();

    let activity = await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.UPDATED, meta: {job: job._id, jobTitle: job.title}});

  }

  return result;

}

function searchTitle(keyword) {
  let data = null;

  if(keyword==null){
    return;
  }
  var regex = new RegExp(keyword, 'i');
  console.log(regex)

  return JobRequisition.aggregate([
    { $match: {title: regex} },
    { $group: {_id:{title:'$title'}} },
    { $project: {_id: 0, keyword: '$_id.title'}}
  ])
}


function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return JobRequisition.findById(id);
}


async function findByIds(ids) {
  let data = null;

  if(ids==null){
    return;
  }


  return JobRequisition.find({_id: {$in: ids }});
}


function findJobId(jobId, locale) {
  let data = null;

  if(!jobId){
    return;
  }
  // let localeStr = locale? locale.toLowerCase() : 'en';
  // let propLocale = '$name.'+localeStr;


  data = JobRequisition.findOne({jobId: jobId});

  // Promotion.populate(data, {path: "promotion"});


  return data;

  // return JobRequisition.findOne({jobId: jobId});
}


async function findJob_Id(jobId, locale) {
  let data = null;

  if(!jobId){
    return;
  }
  data = await JobRequisition.findById(jobId).populate('department').populate('tags').populate('members').populate('createdBy');
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

async function findJob_Ids(jobIds) {
  let data = null;

  if(!jobIds){
    return;
  }


  return JobRequisition.find({_id: {$in: jobIds }});
}


async function updateJobPipeline(jobId, form, currentUserId, locale) {
  let data = null;

  if(!jobId || !form || !currentUserId){
    return;
  }



  let job = await JobRequisition.findById(jobId);
  const pipeline = await pipelineTemplateService.findById(ObjectID(form._id));
  console.log(form._id, pipeline)
  if(job && pipeline) {
    console.log(pipeline)
    job.pipeline = pipeline._id;
    await job.save();

  }

  return pipeline;
}

async function getJobPipeline(jobId) {
  let data;

  if(!jobId){
    return;
  }

  let job = await JobRequisition.findById(jobId).populate({
    path: 'pipeline',
    model: 'PipelineTemplate',
    // populate:[{
    //   path: 'stages',
    //   populate:[
    //     {
    //       path: 'members',
    //       model: 'Member'
    //     },
    //     {
    //       path: 'tasks.members',
    //       model: 'Member'
    //     }
    //   ]
    // }]
  });


  console.log(job.pipeline)
  if(job){
    data = job.pipeline;

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
  }


  return data;
}

async function getJobMembers(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  let job = await JobRequisition.findById(jobId).populate([
    {
      path: 'createdBy',
      model: 'Member'
    },
    {
      path: 'members',
      model: 'Member'
    },
    {
      path: 'pipeline',
      model: 'Pipeline',
      populate: {
        path: 'stages',
        model: 'Stage',
        populate: {
          path: 'members',
          model: 'Member'
        }
      }
    }
    ]);

  let members = _.reduce(job.pipeline.stages, function(res, stage){
    res = res.concat(stage.members);
    return res;
  }, []);

  members = members.concat(job.members);
  members.push(job.createdBy);

  let reduceMembers = [];
  members.forEach(function(member){
    if(!_.find(reduceMembers, {userId: member.userId})){
      reduceMembers.push(member);
    }

  });

  return reduceMembers;
}

async function updateJobApplicationForm(jobId, form, currentUserId, locale) {
  let data = null;

  if(!jobId || !form || !currentUserId){
    return;
  }


  let job = await JobRequisition.findById(jobId);
  console.log(job)
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


async function getSimilarJobList(jobId) {
  let data = [];

  if(!jobId){
    return data;
  }

  let job  = await JobRequisition.findOne({jobId: jobId});

  if(job) {
    data = await JobRequisition.aggregate([
      { $match: {
          status: statusEnum.ACTIVE,
          $text: {
            $search: job.title,
            $diacriticSensitive: true,
            $caseSensitive: false
          }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company'},
      { $limit: 9 }
    ])

      // .populate([
      // {
      //   path: 'searchAd',
      //   populate: {
      //     path: 'targeting',
      //     model: 'Target'
      //   }
      // },
      // {
      //   path: 'ads',
      //   model: 'Ad',
      //   populate: {
      //     path: 'targeting',
      //     model: 'Target'
      //   }
      // }]);
  }
  return data;
}


async function getSimilarJobsByTitle(title) {
  let data = [];

  if(!title){
    return data;
  }

  data = await JobRequisition.aggregate([
    { $match: {
        status: statusEnum.ACTIVE,
        $text: {
          $search: title,
          $diacriticSensitive: true,
          $caseSensitive: false
        }
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: '$company'},
    { $limit: 10}
  ])


  return data;
}

async function getJobAds(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  /*
  let job = await JobRequisition.aggregate([
    {$match: {_id: jobId}},
    {$lookup:{
        from:"ads",
        let:{ads:"$ads"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$ads"]}}},
          // {
          //   $lookup: {
          //     from: 'targets',
          //     localField: 'targeting',
          //     foreignField: '_id',
          //     as: 'targeting',
          //   },
          // }
        ],
        as: 'ads'
      }},
    // {$unwind: '$user'},
  ]);
 */

  let job = await JobRequisition.findOne({_id: jobId}).populate([
    {
      path: 'searchAd',
      populate: {
        path: 'targeting',
        model: 'Target'
      }
    },
    {
      path: 'ads',
      model: 'Ad',
      populate: {
        path: 'targeting',
        model: 'Target'
      }
    }]);

  return job;
}


async function closeJob(jobId, member) {
  if(!jobId || !member){
    return;
  }

  let job = await JobRequisition.findOneAndUpdate({_id: ObjectID(jobId)}, {$set: {status: statusEnum.CLOSED, updatedBy: member.userId, updatedDate: Date.now()}});
  await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.CLOSED, meta: {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, job: job._id}});

  let meta = {
    causer: member.userId,
    jobId: job.jobId,
    jobTitle: job.title,
    candidateId: candidate._id,
    name: candidate.firstName + ' ' + candidate.lastName,
    userId: candidate.userId,
    avatar: candidate.avatar
  };

  await await feedService.createNotification(job.createdBy.userId, notificationType.APPLICATION, applicationEnum.APPLIED, meta);


  return job;

}


async function archiveJob(jobId, member) {
  if(!jobId || !member){
    return;
  }

  let job = await JobRequisition.findOneAndUpdate({_id: ObjectID(jobId)}, {$set: {status: statusEnum.ARCHIVED, updatedBy: member.userId, updatedDate: Date.now()}});
  await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.ARCHIVED, meta: {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, job: job._id}});

  return job;

}



async function unarchiveJob(jobId, member) {
  if(!jobId || !member){
    return;
  }

  console.log(member)
  // let result = await JobRequisition.findOneAndUpdate({_id: ObjectID(jobId)}, {$set: {status: statusEnum.ACTIVE, updatedBy: member.userId, updatedDate: Date.now()}});
  let job = await JobRequisition.findById(ObjectID(jobId));
  if(job){
    job.status = job.publishedDate?statusEnum.ACTIVE:statusEnum.DRAFT;
    job = await job.save();

    let activity = await activityService.addActivity({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.UNARCHIVED, meta: {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, job: job._id}});
    console.log(activity)
  }

  return job;

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

  if(!filter){
    return;
  }


  filter.publishedDate = dateEnum.PASTMONTH;

  let search = new SearchParam(filter);

  let res = JobRequisition.find(search).populate({
    path: 'company',
    model: 'Company',
  }).limit(10);

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



async function getJobsEndingSoon(company) {
  let data = null;

  if(company==null){
    return;
  }


  return await JobRequisition.aggregate([
    {$match: {company: company, status: 'ACTIVE'} },
    { $addFields:
        {
          timeLeft: {$round: [ {$divide : [{$subtract: [{ $add:[ {$toDate: "$publishedDate"}, {$multiply: [30, 1*24*60*60000] } ] }, "$$NOW"]}, 86400000]}, 0 ] } ,
          datePublished: { $toDate: '$publishedDate' },
          after30: { $add:[ {$toDate: "$publishedDate"}, {$multiply: [30, 1*24*60*60000] } ] }
        }
    },
    {
      $match: { timeLeft: { $lte: 5 } }
    }
  ]);


}




async function search(currentUserId, query, filter, sort, locale) {
  if(!filter || !sort){
    return null;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };



  let result;
  let currentDate = Date.now();
  let aList = [];
  let match = {};
  let aSort;


  // if(query){
  //   let regex = new RegExp(query, 'i');
  //   match['$or'] =  [{title: { $regex: regex} }];
  // }



  // if(filter.company.length){
  //   let companies = await companyService.findByCompanyIds(filter.company, false);
  //   match.company = {$in: _.reduce(companies, function(res, item){res.push(item._id); return res;}, [])};
  //   filter.company = [];
  // }
  //
  // if(filter.status.length){
  //   match.status = {$in:filter.status};
  //   filter.status = [];
  // }


  filter.status = [statusEnum.ACTIVE];

  if(sort && sort.sortBy=='popular'){
    aSort = { $sort: { noOfViews: direction} };
  } else if(sort && sort.sortBy=='title'){
    aSort = { $sort: {title: direction} };
  } else {
    aSort = { $sort: {createdDate: direction} };
  }

  filter.query=query;
  filter.companyId = filter.company;
  delete filter.company;
  // console.log(new SearchParam(filter))

  aList.push({ $match: new SearchParam(filter)});
  aList.push(
    {
      $lookup: {
        from: 'companies',
        localField: "company",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'members',
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
        from: 'labels',
        localField: "tags",
        foreignField: "_id",
        as: "tags"
      }
    },
    {$lookup:{
      from:"ads",
      let:{ads: '$ads'},
      pipeline:[
        {$match:{$expr:{$in:["$_id", "$$ads"]}}},
        {
          $lookup: {
            from: 'targets',
            localField: "targeting",
            foreignField: "_id",
            as: "targeting"
          }
        },
        {$unwind: '$targeting' }
      ],
      as: 'ads'
    }},
    {
      $lookup: {
        from: 'applications',
        localField: "applications",
        foreignField: "_id",
        as: "applications"
      }
    },
    { $addFields: {
        hasApplied: {
          '$in': [
            currentUserId,
            '$applications.partyId'
          ]
        }
      }
    },
  );
  aList.push(aSort);

  const aggregate = JobRequisition.aggregate(aList);
  result = await JobRequisition.aggregatePaginate(aggregate, options);

  let foundCompanies = await feedService.lookupCompaniesIds(_.reduce(result.docs, function(res, i){ res.push(i.company.companyId); return res;},  []));
  let hasSaves = [];


  let today = Date.now();
  _.forEach(result.docs, function(job){
    job.hasSaved = _.find(hasSaves, {jobId: job._id})?true:false;
    job.company = convertToCompany(job.company);
    job.createdBy = convertToAvatar(job.createdBy);
    job.shareUrl = 'https://www.accessed.co/jobs/'+job.jobId;

    job.skills=[];
    job.industry=[];
    job.members=[];
    job.responsibilities=[];
    job.qualifications = [];
    job.minimumQualifications=[];
    // job.description = null;
    job.isHot = _.reduce(job.ads, function(res, ad){
      if(_.includes(ad.targeting.adPositions, adPosition.hottag)){
        if(ad.startTime < today && ad.endTime > today){
          res = true;
        }

      }
      return res;
    }, false);
    job.ads = [];

  })



  return result;

}

async function talentSearch(member, query, filter, sort, locale) {
  if(!member || !filter || !sort){
    return null;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };



  let result;
  let currentDate = Date.now();
  let aList = [];
  let match = {};
  let aSort;


  // if(query){
  //   let regex = new RegExp(query, 'i');
  //   match['$or'] =  [{title: { $regex: regex} }];
  // }



  // if(filter.company.length){
  //   let companies = await companyService.findByCompanyIds(filter.company, false);
  //   match.company = {$in: _.reduce(companies, function(res, item){res.push(item._id); return res;}, [])};
  //   filter.company = [];
  // }
  //
  // if(filter.status.length){
  //   match.status = {$in:filter.status};
  //   filter.status = [];
  // }



  if(sort && sort.sortBy=='popular'){
    aSort = { $sort: { noOfViews: direction} };
  } else if(sort && sort.sortBy=='title'){
    aSort = { $sort: {title: direction} };
  } else {
    aSort = { $sort: {createdDate: direction} };
  }

  filter.query=query;
  filter.companyId = filter.company;
  delete filter.company;
  // console.log(new SearchParam(filter))

  if(filter.hasSaved){
    let jobSubscribed = await memberService.findMemberSubscribedToSubjectType(member._id, subjectType.JOB);
    aList.push({ $match: {_id: {$in: _.map(jobSubscribed, 'subject')}} });
  }

  aList.push({ $match: new SearchParam(filter)});
  aList.push(
    {
      $lookup: {
        from: 'companies',
        localField: "company",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'members',
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
        from: 'labels',
        localField: "tags",
        foreignField: "_id",
        as: "tags"
      }
    },
    {$lookup:{
        from:"ads",
        let:{ads: '$ads'},
        pipeline:[
          {$match:{$expr:{$in:["$_id", "$$ads"]}}},
          {
            $lookup: {
              from: 'targets',
              localField: "targeting",
              foreignField: "_id",
              as: "targeting"
            }
          },
          {$unwind: '$targeting' }
        ],
        as: 'ads'
      }},
    {
      $lookup: {
        from: 'applications',
        localField: "applications",
        foreignField: "_id",
        as: "applications"
      }
    },
    { $addFields: {
        hasApplied: {
          '$in': [
            member.createdBy,
            '$applications.partyId'
          ]
        }
      }
    },
  );
  aList.push(aSort);

  const aggregate = JobRequisition.aggregate(aList);
  result = await JobRequisition.aggregatePaginate(aggregate, options);

  let foundCompanies = await feedService.lookupCompaniesIds(_.reduce(result.docs, function(res, i){ res.push(i.company.companyId); return res;},  []));
  let hasSaves = [];


  let today = Date.now();
  _.forEach(result.docs, function(job){
    job.hasSaved = _.find(hasSaves, {jobId: job._id})?true:false;
    job.company = convertToCompany(job.company);
    job.createdBy = convertToAvatar(job.createdBy);
    job.shareUrl = 'https://www.accessed.co/jobs/'+job.jobId;

    job.skills=[];
    job.industry=[];
    job.members=[];
    job.responsibilities=[];
    job.qualifications = [];
    job.minimumQualifications=[];
    // job.description = null;
    job.isHot = _.reduce(job.ads, function(res, ad){
      if(_.includes(ad.targeting.adPositions, adPosition.hottag)){
        if(ad.startTime < today && ad.endTime > today){
          res = true;
        }

      }
      return res;
    }, false);
    job.ads = [];

  })



  return result;

}


async function removePipeline(pipeline) {
  let data = null;

  if(pipeline==null){
    return;
  }


  return await JobRequisition.update({pipeline: pipeline}, {$set: {pipeline: null, _pipeline: pipeline}})
}



async function getCompanyJobsJobFunctions(company, locale) {
  let data = null;

  if(!company){
    return [];
  }


  let result = [];
  data = await JobRequisition.aggregate([
    {$match: {companyId: company}},
    {$group: {_id: {jobFunction: '$jobFunction'}, jobFunction: {$first: '$jobFunction'}, count: {'$sum': 1}}},
    {$project: {_id: 0, jobFunction: 1, count: 1}}
  ]);

  if(data.length) {

    let jobFunctions = await feedService.findJobfunction('', _.map(data, 'jobFunction'), locale);

    result = _.reduce(data, function (res, val, key) {
      console.log(val)
      if(val.jobFunction===null){
        res.push({name: 'Other', shortCode: '', count: val.count});
      } else {
        let found = _.find(jobFunctions, {shortCode: val.jobFunction});
        if(found){
          res.push({name: found.name, shortCode: found.shortCode, count: val.count});
        }
      }
      return res;
    }, []);
  }
  return result;
}


async function deactivateJobs(filter) {
  let data = null;

  if(!filter){
    return null;
  }


  let result = await JobRequisition.updateMany(new SearchParam(filter), {$set: {status: statusEnum.DEACTIVATED}});
  return result;
}


module.exports = {
  addJob:addJob,
  updateJob:updateJob,
  searchTitle: searchTitle,
  findById:findById,
  findByIds:findByIds,
  findJobId: findJobId,
  findJob_Id:findJob_Id,
  findJobIds: findJobIds,
  findJob_Ids:findJob_Ids,
  removeByJobId: removeByJobId,
  updateJobPipeline:updateJobPipeline,
  getJobPipeline:getJobPipeline,
  updateJobMembers:updateJobMembers,
  getJobMembers:getJobMembers,
  updateJobApplicationForm:updateJobApplicationForm,
  getSimilarJobList,
  getSimilarJobsByTitle,
  getJobAds:getJobAds,
  closeJob:closeJob,
  archiveJob:archiveJob,
  unarchiveJob:unarchiveJob,
  getCountsGroupByCompany,
  getJobCount:getJobCount,
  getNewJobs:getNewJobs,
  findJobsByCompanyId:findJobsByCompanyId,
  getGroupOfCompanyJobs:getGroupOfCompanyJobs,
  getJobsEndingSoon:getJobsEndingSoon,
  search:search,
  talentSearch:talentSearch,
  removePipeline:removePipeline,
  getCompanyJobsJobFunctions:getCompanyJobsJobFunctions,
  deactivateJobs: deactivateJobs
}
