const bcrypt = require('bcrypt');
var path = require('path');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const _ = require('lodash');
const ejs = require('ejs');
const pdf = require('html-pdf');
const paymentService = require('../services/api/payment.service.api');

module.exports = {
  generate
}



async function generate(currentUserId, locale) {
  let result;
  try {
    var promise = new Promise(function (resolve, reject) {
    const data = {
      font: {
        "color" : "green",
        "include": "https://api.****.com/parser/v3/css/combined?face=Kruti%20Dev%20010,Calibri,DevLys%20010,Arial,Times%20New%20Roman"
      },
      job: null
    };

    const filePathName = path.resolve(__dirname, '../templates/resumes/template1/resume.html');
    const htmlString = fs.readFileSync(filePathName).toString();
    let  options = { format: 'Letter', "height": "10.5in", "width": "8in", "border": "0",  };
    const ejsData = ejs.render(htmlString, data);

    console.log(ejsData)
    pdf.create(ejsData, options).toFile('export/resume.pdf',(err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  }).then(function(res){
    // parserService.uploadJob(res.filename);
  }).then(function(res){
    console.log('finally')
    result = res;
  });
  } catch (error) {
    console.log(error);
  }

  return result;
}


