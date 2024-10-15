const fs = require('fs');
const _ = require('lodash');
var XLSX = require('xlsx');
const { parse } = require("csv-parse");
const csv = require("csvtojson");

// const MongoClient = require('mongodb').MongoClient;
// const mongoURL = "mongodb://localhost:27017";
// const jobs = require('./jobrequisitions');
// const salaries = require('./salesforce.csv');

var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://accessed:pDRCdTGGgbP4Va2@accessed.uvaet.mongodb.net/accessed_job?retryWrites=true&w=majority', {useNewUrlParser: true});
const Salary = require('../../src/models/salary.model');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  // we're connected!
  console.log('connected');

  // let salary = new Salary({title: 'test'});
  // salary = await salary.save();
  // console.log(salary)

  // fs.createReadStream("./salesforce.csv")
  //   .pipe(parse({ delimiter: ",", from_line: 1, relax_quotes: true, escape: '\\', ltrim: true, rtrim: true }))
  //   .on("data", async function (row) {
  //     console.log(row);
  //     if(row[7]) {
  //       let salary = new Salary({ title: row[7] });
  //       salary = await salary.save();
  //     }
  //   })
  //   .on("end", function () {
  //     console.log("finished");
  //   })
  //   .on("error", function (error) {
  //     console.log(error.message);
  //   });

  let count = 0;
  csv({
    // headers: ['firstName', 'lastName', 'age'],
    // delimiter: '|',
    colParser:{
      "web-scraper-order":"omit",
      "web-scraper-start-url":"omit",
      "job-category-link":"omit",
      "job-category-link-href":"omit",
    },
    checkType:true
  })
    .fromFile('./accenture.csv')
    .then(async (data) => { //when parse finished, result will be emitted here.
      for (let item of data) {

        count++;
        if(item.jobTitle && item.payPeriod){
          let salary = {company: 23603, employmentTitle: item.jobTitle, country: item.country, employmentType: 'FULLTIME', currency: 'USD'};

          salary.basePayPeriod = parsePayPeriod(item);
          salary.jobFunction = parseJobFunction(item);
          salary.baseSalary = parseBasePay(item);
          salary.bonus = parseAdditionalPay(item, 'Bonus');
          salary.stock = parseAdditionalPay(item, 'Stock');
          salary.commission = parseAdditionalPay(item, 'Commission');
          salary.profitSharing = parseAdditionalPay(item, 'Profit Sharing');
          await add({...salary, title: salary.jobTitle});
        }

      }
    })

});

function parsePayPeriod(salary) {
  let res = '';
  if(salary.payPeriod){
    switch (salary.payPeriod){
      case 'Annual Pay':
        res = 'ANNUALLY';
        break;
      case 'Monthly Pay':
        res = 'MONTHLY';
        break;
      case 'Weekly Pay':
        res = 'WEEKLY';
        break;
    }
  } else if(salary.payPeriodCode){
    switch (salary.payPeriod){
      case '/yr':
        res = 'ANNUALLY';
        break;
      case '/mth':
        res = 'MONTHLY';
        break;
      case '/wk':
        res = 'WEEKLY';
        break;
    }
  }

  return res;
}

function parseJobFunction(salary) {
  let res = '';
  if(salary.jobFunction && salary.company){
    res = salary.jobFunction.replace(salary.company, '').replace('Salaries', '').trim();
  } else if(salary.payPeriodCode){

  }

  return res;
}

function parseBasePay(salary) {
  let res = 0, num;
  if(salary.basePayAvg){
    num = salary.basePayAvg.replace('$', '');
    if(num.indexOf('K')>-1){
       num = parseFloat(num) * 1000;
    } else if(basePayAvg.indexOf('M')>-1){
      num = parseFloat(num) * 1000000;
    } else {
      num = parseFloat(num) * 1000000;
    }

    res = num;
  } else if(salary.payType1 === 'Base Pay' && salary.pay1){
    num = salary.pay1.replace('$', '');
    if(num.indexOf('K')>-1){
      num = num.replace(/[^1-9]+/g, '');
      res = parseFloat(num) * 1000;
    } else if(num.indexOf('M')>-1){
      num = num.replace(/[^1-9]+/g, '');
      res = parseFloat(num) * 1000000;
    } else {
      num = num.replace(/[^1-9]+/g, '');
      res = parseFloat(num);
    }
  } else if(salary.basePayMin && salary.basePayMin.indexOf('x') == -1){

    num = salary.basePayMin.replace('$', '');
    if(num.indexOf('K')>-1){
      num = num.replace(/[^1-9]+/g, '');
      res = parseFloat(num) * 1000;
    } else if(num.indexOf('M')>-1){
      num = num.replace(/[^1-9]+/g, '');
      res = parseFloat(num) * 1000000;
    }

    // res = num;
  }

  return res;
}

function parseAdditionalPay(salary, fieldName) {
  let res = 0, num;
  const fields = ['payType1', 'payType2', 'payType3', 'payType4', 'payType5'];
  num = _.reduce(fields, function(res, o, index){
    if(fieldName=='Commission') {
      // console.log('index', index, salary[o], fieldName, salary['pay' + (index+1)])
    }
    if (salary[o]===fieldName){
      // console.log('index', index, salary[o], salary['pay'+(index++)])
      res = salary['pay'+(index+1)];
    }
    return res;
  }, null);

  if(num){
    num = num.replace('$', '');
    if(num.indexOf('K')>-1){
      num = num.replace(/[^1-9]+/g, '');
      num = parseFloat(num) * 1000;
    } else if(num.indexOf('M')>-1){
      num = num.replace(/[^1-9]+/g, '');
      num = parseFloat(num) * 1000000;
    } else {
      num = num.replace(/[^1-9]+/g, '');
      num = parseFloat(num);
    }
    res = num;
  }
  return res;
}

function add(data) {
  return new Promise((resolve, reject) => {
    const salary = new Salary(data);
    salary.save().then(savedDoc => {
      console.log('saved', savedDoc);
      resolve(savedDoc)
    });;

  });
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
