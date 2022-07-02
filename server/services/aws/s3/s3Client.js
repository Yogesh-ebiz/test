// Create service client module using ES6 syntax.
const { S3Client, ListBucketsCommand, GetObjectCommand} = require("@aws-sdk/client-s3");
// Set the AWS Region.
const REGION = "us-west-2"; //e.g. "us-east-1"
// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });


async function list(){
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log("Success", data.Buckets);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

async function getFile(file){
  try {
    const cmd = new GetObjectCommand({
      Bucket: 'accessed',
      Key: '/migrations/jobs/Information Technology and Internet - Developers.xlsx',
    });
    const data = await s3Client.send(cmd);
    console.log("Success", data.Body.toString('utf-8'));
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

module.exports = {
  list:list,
  getFile:getFile

}
