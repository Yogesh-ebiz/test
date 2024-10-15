// const MongoClient = require('mongodb').MongoClient;
// const mongoURL = "mongodb://localhost:27017";
// const jobs = require('./jobrequisitions');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://accessed:pDRCdTGGgbP4Va2@accessed.uvaet.mongodb.net/accessed_job?retryWrites=true&w=majority', {useNewUrlParser: true});
const JobRequisition = require('../../server/models/jobrequisition.model');
const Joi = require("joi");
const companyService = require("../../server/services/company.service");
const pipelineService = require("../../server/services/pipeline.service");
const labelType = require("../../server/const/labelType");
const labelService = require("../../server/services/label.service");
const subjectType = require("../../server/const/subjectType");
const memberService = require("../../server/services/member.service");


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
  pipeline: Joi.object(),
  type: Joi.string()

});


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected');
  let jobs = JobRequisition.find({}, function(err, res){
    console.log(res);
    return res;
  });

});


async function addJ(companyId, form) {
  if(!companyId || !form){
    return;
  }

  let result;

  if(form.department) {
    form.department = new ObjectID(form.department);
  }


  form = await Joi.validate(form, jobSchema, {abortEarly: false});
  let company = await companyService.findByCompanyId(companyId);

  let pipeline = new ObjectID("6100d4495003ec72aac89280");
  form.pipeline = pipeline._id;
  form.companyId = companyId;


  let tags = [];

  form.tags = tags;
  form.isExternal = form.externalUrl?true:false;
  result = await new JobRequisition(form).save();

  return result;

}

function insert(dbo, jobs) {
  return new Promise((resolve, reject) => {
    dbo.collection("jobrequisitions").insertMany(jobs, function(err, res) {
      if (err) throw err;
      console.log(res.jobId);
      resolve(res)
    });
  });
}
