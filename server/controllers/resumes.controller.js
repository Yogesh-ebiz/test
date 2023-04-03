const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
var docparser = require('docparser-node');

var client = new docparser.Client("341fa2a59eac21b551f22d964f75beb846dfc21f");

let statusEnum = require('../const/statusEnum');

module.exports = {
  uploadResume,
  generate
}



async function uploadResume(currentUserId, files) {
  console.log('uploadResume', files)
  if(!currentUserId || !files){
    return null;
  }

  let result = null;
  let basePath = 'candidates/';
  try {

      let type, name;
      //------------Upload CV----------------

      if(files.file) {

        let cv = files.file[0];
        let fileName = cv.originalname.split('.');
        let fileExt = fileName[fileName.length - 1];
        let timestamp = Date.now();
        console.log(files.file)
        // name = candidate.firstName + '_' + candidate.lastName + '_' + candidate._id + '-' + timestamp + '.' + fileExt;
        // let path = basePath + candidate._id + '/' + name;

        // if(!_.some(candidate.resumes, {hash: hash})){
        //   await sovrenService.uploadResume(cv.path, candidate._id);
        // }
        //
        // await awsService.upload(path, cv.path);
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

        }

        const parserId = 'cgnhmvvikbci';
        // parserId: get from calling api get list of parsers
        client.uploadFileByPath(parserId, cv.path, {})
          .then(function (data) {
            console.log(data)
            client.getResultsByDocument(parserId, data.id, {format: 'object'})
              .then(function (resume) {
                console.log(resume);
                result = resume
              })
              .catch(function (err) {
                console.log(err)
              })
            result = data;
            // => {"id":"document_id","file_size":198989,"quota_used":16,"quota_left":34,"quota_refill":"1970-01-01T00:00:00+00:00"}
          })
          .catch(function (err) {
            console.log(err)
          })




        // let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId, hash: hash});
        // if(file){
        //   candidate.resumes.push(file._id);
        //   await candidate.save();
        //
        //
        //   result = file;
        // }

      //   result =  {
      //     "id": "62fc2efdd934f8f75663c0ce",
      //     "userId": 12,
      //     "createdDate": 1660694269845,
      //     "status": "ACTIVE",
      //     "company": 25,
      //     "firstName": "Pete",
      //     "middleName": "",
      //     "lastName": "Nguyen",
      //     "avatar": "https://accessed.s3.us-west-2.amazonaws.com/user/12/avatar/person_12_1629797667389.jpg",
      //     "email": "peter@gmail.com",
      //     "emails": [
      //       {
      //         "contactType": "WORK",
      //         "value": "pete@facebook.com",
      //         "isPrimary": true
      //       }
      //     ],
      //     "phoneNumber": "+84 45353425",
      //     "phoneNumbers": [
      //       {
      //         "contactType": "MOBILE",
      //         "value": "+84 45353425",
      //         "isPrimary": true
      //       }
      //     ],
      //     "primaryPhone": {
      //       "contactType": "MOBILE",
      //       "value": "+84 45353425",
      //       "isPrimary": true
      //     },
      //     "primaryEmail": {
      //       "contactType": "WORK",
      //       "value": "pete@facebook.com",
      //       "isPrimary": true
      //     },
      //     "primaryAddress": {
      //       "address1": "Nhi Dong 2",
      //       "address2": null,
      //       "district": "",
      //       "city": "Los Angeles",
      //       "state": "California",
      //       "country": "US"
      //     },
      //     "jobTitle": "Sr. Manager ",
      //     "about": "I'm Project Managaer",
      //     "gender": "MALE",
      //     "links": [],
      //     "experiences": [
      //       {
      //         "id": 21499,
      //         "isCurrent": false,
      //         "fromDate": 1380678299153,
      //         "thruDate": 1443750304230,
      //         "employmentTitle": "Business Analyst",
      //         "employmentType": "PARTTIME",
      //         "city": "Los Angeles",
      //         "state": "California",
      //         "country": "US",
      //         "description": "",
      //         "jobFunction": null,
      //         "employer": {
      //           "id": 577,
      //           "name": "TechCrunch",
      //           "avatar": "https://accessed.s3.us-west-2.amazonaws.com/company/577/avatar/logo.png",
      //           "partyType": "COMPANY",
      //           "primaryAddress": null
      //         }
      //       },
      //       {
      //         "id": 21494,
      //         "createdDate": 0,
      //         "isCurrent": false,
      //         "fromDate": 1443750367548,
      //         "thruDate": 1506908772129,
      //         "employmentTitle": "Receptionist",
      //         "employmentType": "FREELANCE",
      //         "city": "Quan 8",
      //         "state": "Ho Chi Minh",
      //         "country": "Viet Nam",
      //         "description": "",
      //         "jobFunction": null,
      //         "employer": {
      //           "id": 555,
      //           "name": "New Scientist",
      //           "tagname": "new_scientist",
      //           "avatar": "https://accessed.s3.us-west-2.amazonaws.com/company/555/avatar/logo.png",
      //           "partyType": "COMPANY",
      //           "primaryAddress": null
      //         }
      //       },
      //       {
      //         "id": 21497,
      //         "createdDate": 0,
      //         "isCurrent": false,
      //         "fromDate": 1317519849268,
      //         "thruDate": 1380678254661,
      //         "employmentTitle": "Project Manager",
      //         "employmentType": "FULLTIME",
      //         "city": "Tay Ho",
      //         "state": "Ha Noi",
      //         "country": "Viet Nam",
      //         "description": "",
      //         "jobFunction": null,
      //
      //         "employer": {
      //           "id": 571,
      //           "name": "NHL News",
      //           "avatar": "https://accessed.s3.us-west-2.amazonaws.com/company/571/avatar/logo.png",
      //           "partyType": "COMPANY",
      //           "primaryAddress": null
      //         }
      //       }
      //     ],
      //     "educations": [
      //       {
      //         "id": 21617,
      //         "createdDate": 0,
      //         "isCurrent": false,
      //         "fromDate": 1443750367548,
      //         "thruDate": 1506908772129,
      //         "city": "San Jose",
      //         "state": "California",
      //         "country": "US",
      //         "degree": "MASTER",
      //         "fieldOfStudy": null,
      //         "gpa": 9,
      //         "hasGraduated": true,
      //         "user": null,
      //         "institute": {
      //           "id": 2354,
      //           "name": "Yale University",
      //           "tagname": "yale_university",
      //           "avatar": "https://accessed.s3.us-west-2.amazonaws.com/institutes/2354/logo/logo.png",
      //           "cover": null,
      //           "partyType": "INSTITUTE",
      //           "headline": "",
      //           "primaryAddress": null,
      //           "images": [],
      //           "video": null,
      //           "rating": 0,
      //           "noOfFollowers": 0
      //         },
      //         "instituteId": 2354,
      //         "userId": 12
      //       }
      //     ],
      //     "resumes": [],
      //     "skills": [
      //       {
      //         "id": 10285,
      //         "createdDate": 1664162980,
      //         "createdBy": null,
      //         "lastModifiedDate": null,
      //         "lastModifiedBy": null,
      //         "status": "ACTIVE",
      //         "name": "Construction",
      //         "parentId": 0,
      //         "sequence": 0,
      //         "type": "INDUSTRY",
      //         "hasChildren": false,
      //         "locales": null,
      //         "children": null,
      //         "active": true,
      //         "_private": true
      //       },
      //       {
      //         "id": 10785,
      //         "createdDate": 1664162980,
      //         "createdBy": null,
      //         "lastModifiedDate": null,
      //         "lastModifiedBy": null,
      //         "status": "ACTIVE",
      //         "name": "New Business Development",
      //         "parentId": 0,
      //         "sequence": 0,
      //         "type": "INDUSTRY",
      //         "hasChildren": false,
      //         "locales": null,
      //         "children": null,
      //         "active": true,
      //         "_private": true
      //       },
      //       {
      //         "id": 10407,
      //         "createdDate": 1664162980,
      //         "createdBy": null,
      //         "lastModifiedDate": null,
      //         "lastModifiedBy": null,
      //         "status": "ACTIVE",
      //         "name": "Data Analysis",
      //         "parentId": 0,
      //         "sequence": 0,
      //         "type": "INDUSTRY",
      //         "hasChildren": false,
      //         "locales": null,
      //         "children": null,
      //         "active": true,
      //         "_private": true
      //       },
      //       {
      //         "id": 10778,
      //         "createdDate": 1664162980,
      //         "createdBy": null,
      //         "lastModifiedDate": null,
      //         "lastModifiedBy": null,
      //         "status": "ACTIVE",
      //         "name": "Financial Analysis",
      //         "parentId": 0,
      //         "sequence": 0,
      //         "type": "INDUSTRY",
      //         "hasChildren": false,
      //         "locales": null,
      //         "children": null,
      //         "active": true,
      //         "_private": true
      //       },
      //       {
      //         "id": 10310,
      //         "createdDate": 1664162980,
      //         "createdBy": null,
      //         "lastModifiedDate": null,
      //         "lastModifiedBy": null,
      //         "status": "ACTIVE",
      //         "name": "Customer Relationship Management (CRM)",
      //         "parentId": 0,
      //         "sequence": 0,
      //         "type": "INDUSTRY",
      //         "hasChildren": false,
      //         "locales": null,
      //         "children": null,
      //         "active": true,
      //         "_private": true
      //       },
      //       {
      //         "id": 9841,
      //         "createdDate": 1664162978,
      //         "createdBy": null,
      //         "lastModifiedDate": null,
      //         "lastModifiedBy": null,
      //         "status": "ACTIVE",
      //         "name": "Business Development",
      //         "parentId": 0,
      //         "sequence": 0,
      //         "type": "INDUSTRY",
      //         "hasChildren": null,
      //         "locales": null,
      //         "children": null,
      //         "active": true
      //       },
      //       {
      //         "id": 10057,
      //         "createdDate": 1664162978,
      //         "createdBy": null,
      //         "lastModifiedDate": null,
      //         "lastModifiedBy": null,
      //         "status": "ACTIVE",
      //         "name": "Business Strategy",
      //         "parentId": 0,
      //         "sequence": 0,
      //         "type": "INDUSTRY",
      //         "hasChildren": null,
      //         "locales": null,
      //         "children": null,
      //         "active": true
      //       },
      //       {
      //         "id": 10207,
      //         "createdDate": 1664162978,
      //         "createdBy": null,
      //         "lastModifiedDate": null,
      //         "lastModifiedBy": null,
      //         "status": "ACTIVE",
      //         "name": "Communication",
      //         "parentId": 0,
      //         "sequence": 0,
      //         "type": "INDUSTRY",
      //         "hasChildren": null,
      //         "locales": null,
      //         "children": null,
      //         "active": true
      //       }
      //     ],
      //     "preferences": {
      //       "openToRelocate": true,
      //       "openToRemote": true,
      //       "openToJob": true,
      //       "jobTitles": [],
      //       "jobLocations": [],
      //       "jobTypes": [],
      //       "startDate": "IMMEDIATE"
      //     },
      //     "languages": []
      //   }
      //
      }


  } catch (error) {
    console.log(error);
  }

  return result;

}


async function generate(currentUserId, locale) {
  let result;
  try {
    var promise = new Promise(function (resolve, reject) {
      const data = {
        font: {
          "color" : "green",
          "include": "https://api.****.com/parser/v3/css/combined?face=Kruti%20Dev%20010,Calibri,DevLys%20010,Arial,Times%20New%20Roman"
        },
        job: null
      };

      const filePathName = path.resolve(__dirname, '../templates/resumes/template2/resume.html');
      const htmlString = fs.readFileSync(filePathName).toString();
      let  options = {
        "format": "A4",
        "orientation": "portrait",
        "dpi": 200,
        "quality": 80,
        "border": {
          "left": ".5cm",
          "right": ".5cm",
          "top": ".5cm",
          "bottom": ".5cm"
        },
        "header": {
          "height": "10mm"
        },
        "footer": {
          "height": "10mm"
        }
      }
      const ejsData = ejs.render(htmlString, data);

      console.log(ejsData)
      pdf.create(ejsData, options).toFile('export/resume2.pdf',(err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    }).then(function(res){
      // parserService.uploadJob(res.filename);
    }).then(function(res){
      console.log('finally')
      result = res;
    });
  } catch (error) {
    console.log(error);
  }

  return result;
}

