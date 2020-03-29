const config = require('./demo_config');
const JobRequisition = require('../../server/models/jobrequisition.model');

var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://localhost/accessed_job';
// const mongoDB = "mongodb://accessed:<dbpassword>@localhost:38485/accessed_job";
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

db.on("error", () => {
  console.log("> error occurred from the database");
});
db.once("open", () => {
  console.log("> successfully opened the database");
});



function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

let jobs = [];
for(var i=0; i<1000; i++) {

  let company = config.company[getRandomInt(config.company.length - 1)];
  let user = config.user[getRandomInt(config.user.length - 1)];
  let employmentType = config.employmentType[getRandomInt(config.employmentType.length - 1)];
  let level = config.level[getRandomInt(config.level.length - 1)];
  let jobFunction = config.jobFunction[getRandomInt(config.jobFunction.length - 1)];
  let industry = config.industry[getRandomInt(config.industry.length - 1)];
  let skill = [];
  let numSkill = getRandomInt(config.skill.length - 1);
  for (var n = 0; n < numSkill; n++) {
    skill.push(config.skill[getRandomInt(config.skill.length - 1)]);
  }

  let title = config.job.TECH[level][getRandomInt(config.job.TECH[level].length - 1)];

  let country = config.country[getRandomInt(config.country.length - 1)];
  let location = config.location[getRandomInt(config.location.length - 1)];
  let cityState = location[country][getRandomInt(location[country].length - 1)];


  let responsibility = [];
  let numResponsibility = getRandomInt(config.responsibility["TECH"].length - 1);
  for (var j = 0; j < numSkill; j++) {
    responsibility.push(config.responsibility["TECH"][getRandomInt(config.responsibility["TECH"].length - 1)]);
  }

  let qualification = [];
  let numQualify = getRandomInt(config.qualification["TECH"].length - 1);
  for (var k = 0; k < numQualify; k++) {
    qualification.push(config.qualification["TECH"][getRandomInt(config.qualification["TECH"].length - 1)]);
  }

  let promotion = config.promotion[getRandomInt(config.promotion.length - 1)];

  let date = new Date();
  date.setDate(date.getDate() - getRandomInt(30));

  // console.log(company, user, employmentType, level, jobFunction, skill, title, location, cityState, responsibility, qualification)

  let job = {
    createdDate: date.getTime(),
    title: title,
    company: company,
    employmentType: employmentType,
    experienceLevel: level,
    jobFunction: jobFunction,
    skills: skill,
    responsibilities: responsibility,
    qualifications: qualification,
    industry: industry,
    city: cityState.city,
    state: cityState.state,
    country: country,
    promotion: promotion,
    minMonthExperience: 72,
    maxMonthExperience: 96,
    lastCurrencyUom: "USD",
    workflowId: 100001,
    noOfResources: 1,
    expirationDate: 1580545602,
    requiredOnDate: 1581755202,
    salaryRangeLow: 65000,
    salaryRangeHigh: 80000,
    salaryFixed: null,
  }

  // console.log(i, job.title);
  // jobs.push(job);
  new JobRequisition(job).save();

}


// new JobRequisition(job).save();
