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

exports.uploadFromBuffer = function(path, file){

  var params = {
    Key: path,
    Body: data,
    ACL:'public-read'
  };
  return s3bucket.upload(params, function (err, data) {

    // console.log("PRINT FILE:", data);
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

exports.upload = function(dest, src){

  let data = fs.readFileSync(src);

  var params = {
    Key: dest,
    Body: data,
    ACL:'public-read'
  };
  return s3bucket.upload(params, function (err, data) {

    // console.log("PRINT FILE:", file);
    if (err) {
      console.log('ERROR MSG: ', err);
    }


    // Whether there is an error or not, delete the temp file
    fs.unlink(src, function (err) {
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




async function uploadBase64(dest, src){
  await base64Decode(base64Str, src);

  // let file = await fs.readFile(src);
  let file= src.split('/');
  let fileName = file[file.length-1].split('.');
  let fileExt = fileName[fileName.length - 1];
  // // let date = new Date();
  let timestamp = Date.now();
  let newName = fileName[0] + '_' + timestamp + '.' + fileExt;
  let path = dest + newName;
  let response = await upload(path, src);
  switch (fileExt) {
    case 'pdf':
      type = 'PDF';
      break;
    case 'doc':
      type = 'WORD';
      break;
    case 'docx':
      type = 'WORD';
      break;
    case 'jpg':
      type = 'JPG';
      break;
    case 'jpeg':
      type = 'JPG';
      break;
    case 'png':
      type = 'PNG';
      break;

  }

  return {filename: newName, fileType: type, path: path};


  // let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId});
  // application.resume = {filename: name, type: type};

  // if(file){
  //   application.resume = file._id;
  //   application.files.push(file._id);
  //
  //
  // }
}


exports.copy = function(source, path, file){

  // var params = {
  //   Key: path,
  //   Body: data,
  //   ACL:'public-read'
  // };

  var params = {
    Bucket : BUCKET_NAME,
    Key: path + "/" + file,
    CopySource: BUCKET_NAME + source,
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
