const { S3Client, ListBucketsCommand, GetObjectCommand} = require("@aws-sdk/client-s3");

var fs = require('fs');
// Set the AWS Region.
const REGION = "us-west-2";
const s3Client = new S3Client({ region: REGION });

// Create a helper function to convert a ReadableStream into a string.
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
});


async function list(){
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log("Success", data.Buckets);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

async function getFile(bucket, key){
  try {
    const cmd = new GetObjectCommand({
      Bucket: 'accessed',
      Key: 'migrations/jobs/Affiliates List.xlsx',
    });
    const data = await s3Client.send(cmd);
    const bodyContents = await streamToString(data.Body);



    return bodyContents;
  } catch (err) {
    console.log("Error", err);
  }
};


module.exports = {
  list:list,
  getFile:getFile

}
