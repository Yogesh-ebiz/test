const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const fs = require('fs');
const ejs = require('ejs');
const pdf = require('html-pdf');
var path = require('path');


const parserService = require('../services/api/sovren.service.api');

module.exports = {
  uploadJob,
  getAllSkillLists
}

async function uploadJob(form) {


  let result;
  try {

    const data = {
      font: {
        "color" : "green",
        "include": "https://api.****.com/parser/v3/css/combined?face=Kruti%20Dev%20010,Calibri,DevLys%20010,Arial,Times%20New%20Roman"
      },
      testData: [
        {
          "name": "<p><span class=\"T1\" style=\"font-family:'DevLys 010'; margin: 0;\">0-06537 esa 5 dk LFkuh; eku gS&</span></p>"
        } ]
    };

        const filePathName = path.resolve(__dirname, '../templates/jobtopdf.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        let  options = { format: 'Letter' };
        const ejsData = ejs.render(htmlString, data);
        await pdf.create(ejsData, options).toFile('generatedfile.pdf',(err, response) => {
          if (err) return console.log(err);

        });

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function addSkillList(form) {


  let result;
  try {
    result = await parserService.addSkillList(form);
  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getAllSkillLists(locale) {


  let result;
  try {
    result = await parserService.listAllSkills();
  } catch (error) {
    console.log(error);
  }

  return result;
}


