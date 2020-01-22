// const MongoClient = require('mongodb').MongoClient;
// const mongoURL = "mongodb://localhost:27017";
// const jobs = require('./jobrequisitions');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/accessed_job', {useNewUrlParser: true});
const JobRequisition = require('../server/models/jobrequisition.model');


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected');
  let jobs = JobRequisition.find({}, function(err, res){
    console.log(res);
    return res;
  });

});


//
// MongoClient.connect(mongoURL, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("accessed_job");
//
//   var count = 0;
//
//
//   //
//   // dbo.collection("jobrequisitions").findOne({}, function(err, res) {
//   //   if (err) throw err;
//   //   console.log("found: " + res.);
//   //   db.close();
//   // });
//
//   // for (var i=100000; count<100050; i++){
//   //
//   //   for (var j=1; j<jobs.length; j++){
//   //     count++;
//   //     jobs[j].jobId=count;
//   //
//   //     console.log(count)
//   //
//   //   }
//   //
//   //
//   // }
//
//   var id = mongoose.Types.ObjectId();
//   console.log(id)
//   for(var i=0; i<10; i++){
//     insert(dbo, jobs).then(function (res) {
//       console.log('done.....', res);
//       db.close();
//
//     });
//   }
//
//
//
// });


function insert(dbo, jobs) {
  return new Promise((resolve, reject) => {
    dbo.collection("jobrequisitions").insertMany(jobs, function(err, res) {
      if (err) throw err;
      console.log(res.jobId);
      resolve(res)
    });
  });
}
