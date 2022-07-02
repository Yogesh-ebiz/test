const { S3Client, ListBucketsCommand, GetObjectCommand} = require("@aws-sdk/client-s3");
const XLSX = require('xlsx');

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

async function getFile(file){
  try {
    const cmd = new GetObjectCommand({
      Bucket: 'accessed',
      Key: 'migrations/jobs/Information Technology and Internet - Developers.xlsx',
    });
    const data = await s3Client.send(cmd);
    const bodyContents = await streamToString(data.Body);
    // var workbook = XLSX.stream.to_csv(bodyContents);
    // var ws = workbook.Sheets["Sheet1"];
    var workbook = XLSX.read(bodyContents, {type:'buffer'});
    var sheet_name_list = workbook.SheetNames;
    sheet_name_list.forEach(function(y) {
      var worksheet = workbook.Sheets[y];
      console.log(worksheet)
      var headers = {};
      var data = [];
      for(z in worksheet) {
        if(z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
          if (!isNaN(z[i])) {
            tt = i;
            break;
          }
        };
        var col = z.substring(0,tt);
        var row = parseInt(z.substring(tt));
        var value = worksheet[z].v;

        //store header names
        if(row == 1 && value) {
          headers[col] = value;
          continue;
        }

        if(!data[row]) data[row]={};
        data[row][headers[col]] = value;
      }
      //drop those first two rows which are empty
      data.shift();
      data.shift();
      console.log(data);
    });
    // console.log('ws', sheetData);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};


module.exports = {
  list:list,
  getFile:getFile

}
