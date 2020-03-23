const config = require('./demo_config');
const JobRequisition = require('../../server/models/jobrequisition.model');

var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://localhost/accessed_job';
// const mongoDB = "mongodb://accessed:<dbpassword>@localhost:38485/accessed_job";
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

db.on("error", () => {
  console.log("> error occurred from the database");
});
db.once("open", () => {
  console.log("> successfully opened the database");
});


var job = new JobRequisition({ title: 'fluffy' }).save();



