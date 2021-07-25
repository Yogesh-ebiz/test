// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const fs = require('fs');

// Set the region
AWS.config.update({region: 'us-west-2'});

// Create S3 service object
// s3 = new AWS.S3({apiVersion: '2006-03-01'});

const BUCKET_NAME = "accessed";
AWS.config.update({region: 'us-west-2'});
const s3bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  params: {Bucket: BUCKET_NAME}
});

// exports.upload = function(path, file){
//
//   fs.readFile(file.path, function (err, data) {
//     if (err) throw err; // Something went wrong!
//     var s3bucket = new AWS.S3({params: {Bucket: BUCKET_NAME}});
//     // s3bucket.createBucket(function () {
//
//
//
//     var params = {
//       Key: path,
//       Body: data
//     };
//     return s3bucket.upload(params, function (err, data) {
//       // Whether there is an error or not, delete the temp file
//       fs.unlink(file.path, function (err) {
//         if (err) {
//           console.error(err);
//         }
//         console.log('Temp File Delete');
//       });
//
//       // console.log("PRINT FILE:", file);
//       if (err) {
//         console.log('ERROR MSG: ', err);
//       }
//
//       return data;
//
//
//
//     });
//
//   });
// }


exports.upload = function(path, file){
  let data = fs.readFileSync(file.path);

  var params = {
    Key: path,
    Body: data,
    ACL:'public-read'
  };
  return s3bucket.upload(params, function (err, data) {

    // console.log("PRINT FILE:", file);
    if (err) {
      console.log('ERROR MSG: ', err);
    }


    // Whether there is an error or not, delete the temp file
    fs.unlink(file.path, function (err) {
      if (err) {
        console.error(err);
      }
      console.log('Temp File Delete');
    });



    return data;



  });

}


exports.uploadToS3 = async function(path, fileName) {
  const readStream = fs.createReadStream(fileName);

  const params = {
    Bucket: BUCKET_NAME,
    Key: path,
    Body: readStream
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, function(err, data) {
      readStream.destroy();

      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}



exports.copy = function(source, path, file){
  let data = fs.readFileSync(file.path);

  // var params = {
  //   Key: path,
  //   Body: data,
  //   ACL:'public-read'
  // };

  var params = {
    Key: path + "/" + file,
    CopySource: source,
    ACL:'public-read'
  };

  console.log(params)

  return s3bucket.copyObject(params, function (err, data) {

    // console.log("PRINT FILE:", file);
    if (err) {
      console.log('ERROR MSG: ', err);
    }

    return data;

  });

}
