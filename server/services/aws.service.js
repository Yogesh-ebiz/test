// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const fs = require('fs');

// Set the region
AWS.config.update({region: 'us-west-2'});

// Create S3 service object
// s3 = new AWS.S3({apiVersion: '2006-03-01'});

const s3bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const BUCKET_NAME = "accessed";

exports.upload = function(path, file){

  fs.readFile(file.path, function (err, data) {
    if (err) throw err; // Something went wrong!
    var s3bucket = new AWS.S3({params: {Bucket: BUCKET_NAME}});
    // s3bucket.createBucket(function () {



    var params = {
      Key: path,
      Body: data
    };
    return s3bucket.upload(params, function (err, data) {
      // Whether there is an error or not, delete the temp file
      fs.unlink(file.path, function (err) {
        if (err) {
          console.error(err);
        }
        console.log('Temp File Delete');
      });

      // console.log("PRINT FILE:", file);
      if (err) {
        console.log('ERROR MSG: ', err);
      }

      return data;



    });

  });
}
