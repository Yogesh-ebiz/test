const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const XLSX = require('xlsx');
const config = require('../config/config');
const statusEnum = require('../const/statusEnum');
const Skill = require('../models/skill.model');
const s3Service = require('../services/aws/s3/s3.service');

const parseWorkbookFromFile = (file, opts) => {
  const workbook = XLSX.readFile(`${process.env.PWD}/migrations/jobs/jobs.xlsx`, opts);
  // console.log(workbook);
  var sheet_name_list = workbook.SheetNames;

  sheet_name_list.forEach(function(y) {
    var worksheet = workbook.Sheets[y];
    let rowObject = XLSX.utils.sheet_to_json(worksheet);
    console.log(rowObject.length)
    var headers = {};
    var data = [];

    const allSkills = _.uniq(_.reduce(_.map(rowObject, 'skills'), function(r, i){
      const skills = _.map(JSON.parse(i), 'skills');
      return r.concat(skills);
    }, []));



    console.log(allSkills.length)
    for(const row of rowObject){

    }
  });

}

const parseWorkbookFromBuffer = (bodyContents, opts) => {
  var workbook = XLSX.read(bodyContents, opts);
  // console.log(workbook);
  var sheet_name_list = workbook.SheetNames;

  sheet_name_list.forEach(function(y) {
    var worksheet = workbook.Sheets[y];
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

      // console.log(row)
      if(col!=='M'){
        console.log(value)
      }

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
    // console.log(data);
  });

}

async function webscraperio(data) {

  let result = [];
  const bodyContents = await s3Service.getFile();
  // var workbook = parseWorkbookFromBuffer(bodyContents, {});

  var workbook = parseWorkbookFromFile('jobs.xlsx', {});
  // var workbook = XLSX.stream.to_json(data.Body);
  // var ws = workbook.Sheets["Sheet1"];


  return result;

}

module.exports = {
  webscraperio:webscraperio

}
