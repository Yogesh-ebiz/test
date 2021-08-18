const fs = require('fs');
var path = require('path');
var async = require("async");
var Promise = require('promise');
const ApiClient = require('../apiManager');



const options = {
  headers: {
    'Sovren-AccountId': '35186509',
    'Sovren-ServiceKey': '/sNTpg9udpEa2OV/o74nH1tZYma3sDiEYC7Ynt5g',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

let client = new ApiClient('https://rest.resumeparsing.com');


async function uploadResume(filePath) {

  var buffer = fs.readFileSync(filePath);
  var base64Doc = buffer.toString('base64');

  var modifiedDate = (new Date(fs.statSync(filePath).mtimeMs)).toISOString().substring(0, 10);


  var data = JSON.stringify({
    'DocumentAsBase64String': base64Doc,
    'DocumentLastModified': modifiedDate,
    'OutputCandidateImage':true
  });


  options.headers['Content-Length'] =  Buffer.byteLength(data);

  let response = await client.post(`/v10/parser/resume`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data;
};

async function uploadJob(job) {
  var promise = new Promise(function (resolve, reject) {
    console.log('start')
    const data = {
      font: {
        "color" : "green",
        "include": "https://api.****.com/parser/v3/css/combined?face=Kruti%20Dev%20010,Calibri,DevLys%20010,Arial,Times%20New%20Roman"
      },
      job: job
    };

    const filePathName = path.resolve(__dirname, '../templates/jobtopdf.ejs');
    const htmlString = fs.readFileSync(filePathName).toString();
    let  options = { format: 'Letter', "height": "10.5in", "width": "8in", "border": "0",  };
    const ejsData = ejs.render(htmlString, data);

    console.log(ejsData)
    pdf.create(ejsData, options).toFile('job_' + job.jobId +' .pdf',(err, response) => {
      if (err) reject(err);
      console.log(response)
      resolve(response);
    });
  }).then(function(res){

    console.log(res);
    var buffer = fs.readFileSync(filePath);
    var base64Doc = buffer.toString('base64');
    var modifiedDate = (new Date(fs.statSync(filePath).mtimeMs)).toISOString().substring(0, 10);
    var data = JSON.stringify({
      'DocumentAsBase64String': base64Doc,
      'DocumentLastModified': modifiedDate,
      'OutputCandidateImage':true
    });


    options.headers['Content-Length'] =  Buffer.byteLength(data);

    // let response = client.post(`/v10/parser/joborder`, data, options).catch(function (error) {
    //   if (error.response) {
    //     // Request made and server responded
    //     console.log(error.response);
    //
    //   } else if (error.request) {
    //     // The request was made but no response was received
    //     console.log(error.request);
    //   } else {
    //     // Something happened in setting up the request that triggered an Error
    //     console.log('Error', error.message);
    //   }
    //
    // });

  })





  // return response.data;
};


async function addSkills(data) {

  let response = await client.post(`/v10/skills`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};

async function listAllSkills() {

  let response = await client.get(`/v10/skills`, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};



module.exports = {
  uploadResume:uploadResume,
  uploadJob:uploadJob,
  addSkills:addSkills,
  listAllSkills:listAllSkills
}
