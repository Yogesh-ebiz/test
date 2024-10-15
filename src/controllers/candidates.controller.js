const bcrypt = require('bcrypt');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const _ = require('lodash');

let statusEnum = require('../const/statusEnum');
const catchAsync = require("../utils/catchAsync");
const candidateService = require("../services/candidate.service");
const Pagination = require("../utils/pagination");
const feedService = require("../services/api/feed.service.api");
const flagService = require("../services/flag.service");
const { deleteFromCache } = require("../services/cacheService");



async function uploadResume(currentUserId, files) {
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

        // let file = await fileService.addFile({filename: name, fileType: type, path: path, createdBy: currentUserId, hash: hash});
        // if(file){
        //   candidate.resumes.push(file._id);
        //   await candidate.save();
        //
        //
        //   result = file;
        // }

        result =  {
          "id": "62fc2efdd934f8f75663c0ce",
          "userId": 12,
          "createdDate": 1660694269845,
          "status": "ACTIVE",
          "company": 25,
          "firstName": "Pete",
          "middleName": "",
          "lastName": "Nguyen",
          "avatar": "https://accessed.s3.us-west-2.amazonaws.com/user/12/avatar/person_12_1629797667389.jpg",
          "email": "peter@gmail.com",
          "emails": [
            {
              "contactType": "WORK",
              "value": "pete@facebook.com",
              "isPrimary": true
            }
          ],
          "phoneNumber": "+84 45353425",
          "phoneNumbers": [
            {
              "contactType": "MOBILE",
              "value": "+84 45353425",
              "isPrimary": true
            }
          ],
          "primaryPhone": {
            "contactType": "MOBILE",
            "value": "+84 45353425",
            "isPrimary": true
          },
          "primaryEmail": {
            "contactType": "WORK",
            "value": "pete@facebook.com",
            "isPrimary": true
          },
          "primaryAddress": {
            "address1": "Nhi Dong 2",
            "address2": null,
            "district": "",
            "city": "Los Angeles",
            "state": "California",
            "country": "US"
          },
          "jobTitle": "Sr. Manager ",
          "about": "I'm Project Managaer",
          "gender": "MALE",
          "links": [],
          "experiences": [
            {
              "id": 21499,
              "isCurrent": false,
              "fromDate": 1380678299153,
              "thruDate": 1443750304230,
              "employmentTitle": "Business Analyst",
              "employmentType": "PARTTIME",
              "city": "Los Angeles",
              "state": "California",
              "country": "US",
              "description": "",
              "jobFunction": null,
              "employer": {
                "id": 577,
                "name": "TechCrunch",
                "avatar": "https://accessed.s3.us-west-2.amazonaws.com/company/577/avatar/logo.png",
                "partyType": "COMPANY",
                "primaryAddress": null
              }
            },
            {
              "id": 21494,
              "createdDate": 0,
              "isCurrent": false,
              "fromDate": 1443750367548,
              "thruDate": 1506908772129,
              "employmentTitle": "Receptionist",
              "employmentType": "FREELANCE",
              "city": "Quan 8",
              "state": "Ho Chi Minh",
              "country": "Viet Nam",
              "description": "",
              "jobFunction": null,
              "employer": {
                "id": 555,
                "name": "New Scientist",
                "tagname": "new_scientist",
                "avatar": "https://accessed.s3.us-west-2.amazonaws.com/company/555/avatar/logo.png",
                "partyType": "COMPANY",
                "primaryAddress": null
              }
            },
            {
              "id": 21497,
              "createdDate": 0,
              "isCurrent": false,
              "fromDate": 1317519849268,
              "thruDate": 1380678254661,
              "employmentTitle": "Project Manager",
              "employmentType": "FULLTIME",
              "city": "Tay Ho",
              "state": "Ha Noi",
              "country": "Viet Nam",
              "description": "",
              "jobFunction": null,

              "employer": {
                "id": 571,
                "name": "NHL News",
                "avatar": "https://accessed.s3.us-west-2.amazonaws.com/company/571/avatar/logo.png",
                "partyType": "COMPANY",
                "primaryAddress": null
              }
            }
          ],
          "educations": [
            {
              "id": 21617,
              "createdDate": 0,
              "isCurrent": false,
              "fromDate": 1443750367548,
              "thruDate": 1506908772129,
              "city": "San Jose",
              "state": "California",
              "country": "US",
              "degree": "MASTER",
              "fieldOfStudy": null,
              "gpa": 9,
              "hasGraduated": true,
              "user": null,
              "institute": {
                "id": 2354,
                "name": "Yale University",
                "tagname": "yale_university",
                "avatar": "https://accessed.s3.us-west-2.amazonaws.com/institutes/2354/logo/logo.png",
                "cover": null,
                "partyType": "INSTITUTE",
                "headline": "",
                "primaryAddress": null,
                "images": [],
                "video": null,
                "rating": 0,
                "noOfFollowers": 0
              },
              "instituteId": 2354,
              "userId": 12
            }
          ],
          "resumes": [],
          "skills": [
            {
              "id": 10285,
              "createdDate": 1664162980,
              "createdBy": null,
              "lastModifiedDate": null,
              "lastModifiedBy": null,
              "status": "ACTIVE",
              "name": "Construction",
              "parentId": 0,
              "sequence": 0,
              "type": "INDUSTRY",
              "hasChildren": false,
              "locales": null,
              "children": null,
              "active": true,
              "_private": true
            },
            {
              "id": 10785,
              "createdDate": 1664162980,
              "createdBy": null,
              "lastModifiedDate": null,
              "lastModifiedBy": null,
              "status": "ACTIVE",
              "name": "New Business Development",
              "parentId": 0,
              "sequence": 0,
              "type": "INDUSTRY",
              "hasChildren": false,
              "locales": null,
              "children": null,
              "active": true,
              "_private": true
            },
            {
              "id": 10407,
              "createdDate": 1664162980,
              "createdBy": null,
              "lastModifiedDate": null,
              "lastModifiedBy": null,
              "status": "ACTIVE",
              "name": "Data Analysis",
              "parentId": 0,
              "sequence": 0,
              "type": "INDUSTRY",
              "hasChildren": false,
              "locales": null,
              "children": null,
              "active": true,
              "_private": true
            },
            {
              "id": 10778,
              "createdDate": 1664162980,
              "createdBy": null,
              "lastModifiedDate": null,
              "lastModifiedBy": null,
              "status": "ACTIVE",
              "name": "Financial Analysis",
              "parentId": 0,
              "sequence": 0,
              "type": "INDUSTRY",
              "hasChildren": false,
              "locales": null,
              "children": null,
              "active": true,
              "_private": true
            },
            {
              "id": 10310,
              "createdDate": 1664162980,
              "createdBy": null,
              "lastModifiedDate": null,
              "lastModifiedBy": null,
              "status": "ACTIVE",
              "name": "Customer Relationship Management (CRM)",
              "parentId": 0,
              "sequence": 0,
              "type": "INDUSTRY",
              "hasChildren": false,
              "locales": null,
              "children": null,
              "active": true,
              "_private": true
            },
            {
              "id": 9841,
              "createdDate": 1664162978,
              "createdBy": null,
              "lastModifiedDate": null,
              "lastModifiedBy": null,
              "status": "ACTIVE",
              "name": "Business Development",
              "parentId": 0,
              "sequence": 0,
              "type": "INDUSTRY",
              "hasChildren": null,
              "locales": null,
              "children": null,
              "active": true
            },
            {
              "id": 10057,
              "createdDate": 1664162978,
              "createdBy": null,
              "lastModifiedDate": null,
              "lastModifiedBy": null,
              "status": "ACTIVE",
              "name": "Business Strategy",
              "parentId": 0,
              "sequence": 0,
              "type": "INDUSTRY",
              "hasChildren": null,
              "locales": null,
              "children": null,
              "active": true
            },
            {
              "id": 10207,
              "createdDate": 1664162978,
              "createdBy": null,
              "lastModifiedDate": null,
              "lastModifiedBy": null,
              "status": "ACTIVE",
              "name": "Communication",
              "parentId": 0,
              "sequence": 0,
              "type": "INDUSTRY",
              "hasChildren": null,
              "locales": null,
              "children": null,
              "active": true
            }
          ],
          "preferences": {
            "openToRelocate": true,
            "openToRemote": true,
            "openToJob": true,
            "jobTitles": [],
            "jobLocations": [],
            "jobTypes": [],
            "startDate": "IMMEDIATE"
          },
          "languages": []
        }

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

const getCandidatesFlagged = catchAsync(async (req, res) => {
  const {params, body, query} = req;
  const {companyId} = params;

  let result = null;
  try {
    result = await candidateService.getCompanyBlacklisted(companyId, query);

    result.docs = _.reduce(result?.docs, function(res, item){
      item = _.pick(item, ['_i', 'firstName', 'lastName', 'userId', 'companyId', 'company', 'avatar', 'status', 'city', 'state', 'country', 'rating', 'jobTitle']);
      res.push(item);
      return res;
    }, []);
  } catch(e){
    console.log('getPeopleFlagged: Error', e);
  }


  res.json(new Pagination(result));
});

const addToBlacklist = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {id} = params;

  let result = null;
  let candidate = await candidateService.findById(new ObjectId(id));
  console.log(candidate)
  if(candidate && candidate.flag == null){
    body.company = user.company;
    body.createdBy = user._id;
    body.candidate = candidate._id;
    result = await flagService.add(body);
    candidate.flag = result._id;
    await candidate.save();
  }

  res.json(result);
});

const addToBlacklistMultiple = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { candidateIds } = body;

  const candidates = await candidateService.findByIds(candidateIds.map(id => new ObjectId(id)));

  const flags = await Promise.all(candidates.map(async candidate => {
    if (candidate && candidate.flag == null) {
      const flagData = {
        companyId: body.companyId,
        createdBy: user._id,
        candidate: candidate._id,
        type: body.type,
        comment: body.comment,
      };
      const flag = await flagService.add(flagData);
      candidate.flag = flag._id;
      await candidate.save();
      return flag;
    }
    return null;
  }));

  const validFlags = flags.filter(flag => flag !== null);

  res.json({ success: true, flags: validFlags });
});


const removeFromBlacklist = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {id} = params;

  let result = null;
  // let candidate = await candidateService.findByUserIdAndCompanyId(userId, companyId).populate('flag');
  // if(candidate && candidate.flag) {
  //   await candidate.flag.delete();
  //   candidate.flag = null;
  //   await candidate.save();

  const candidate = await candidateService.findById(new ObjectId(id));
  if(candidate.flag){
    let flagId = candidate.flag;
    candidate.flag = null;
    await candidate.save();
    await flagService.removeById(flagId);
    result = {success: true}
  }
  res.json(result);
});

const getCandidateJobPreferences = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {id} = params;

  let result = null;
  let candidate = await candidateService.findById(id).populate('user');
  if(!candidate){
    return res.status(400).send({success: false, error: 'Candidate not found'});
  }

  result = candidate.preferences? candidate.preferences : candidate.user?.preferences ? candidate.user?.preferences : {};

  res.json(result);
});


const getCandidateAccomplishments = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, id} = params;

  let result = {languages: [], publications:[], certifications:[]}
  try {
    let candidate = await candidateService.findById(new ObjectId(id));
    result.languages = candidate.languages;
    result.publications = candidate.publications;
    result.certifications = candidate.certifications

  } catch (error) {
    console.log(error);
  }

  res.json(result);
});

const addCandidateLanguages = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, id} = params;

  let result;
  let candidate = await candidateService.findById(new ObjectId(id));
  if(candidate) {
    const languageExists = candidate.languages.some(
      lang => lang.language.toLowerCase() === body.language.toLowerCase()
    );
    if(languageExists){
      return res.status(400).json({ success: false, message: 'Language already exists' });
    }
    candidate.languages.push(body);
    console.log(candidate.languages)
    candidate = await candidate.save();
    if (candidate) {
      let cacheKey = `candidate:${id}`;
      await deleteFromCache(cacheKey);
    }
  }
  res.json(candidate?.languages || []);
});

const updateCandidateLanguage = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, id, language} = params;

  let candidate;
  try{

    candidate = await candidateService.findById(new ObjectId(id));
    if(!candidate){
      return res.status(400).send({success: false, error: 'Candidate not found'});
    }

    const languageIndex = candidate.languages.findIndex(lang => lang.language.toLowerCase() === language.toLowerCase());
    if (languageIndex === -1) {
      return res.status(400).json({ success: false, error: 'Language does not exist for the candidate' });
    }
    let lang = candidate.languages[languageIndex];
    lang.level = body.level;
    candidate.languages[languageIndex] = lang;
    candidate = await candidate.save();

    await deleteFromCache(`candidate:${id}`);

  }catch(error){
    console.error('Error updating candidate language:', error);
    return res.status(500).send({ success: false, error: 'An error occurred while updating the candidate language' });
  }

  res.json(candidate?.languages || []);
});

const removeCandidateLanguage = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {companyId, id, language} = params;

  let result;
  let candidate = await candidateService.findById(new ObjectId(id));
  if(candidate){
    candidate.languages = _.filter(candidate.languages, function(o){ console.log(o, language); return o.language!=language});
    candidate = await candidate.save();
    if(candidate){
      let cacheKey = `candidate:${id}`;
      await deleteFromCache(cacheKey);
    }
  }


  res.json(candidate?.languages || []);
});

const updateCandidateJobPreferences = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {id} = params;

  let result = await candidateService.updateCandidateJobPreferences(id, body);

  res.json(result);
})

const lookupCandidatesByIds = catchAsync(async (req, res) => {
  const {body} = req;
  const { ids, messengerIds } = body;

  if ((!ids || !Array.isArray(ids) || ids.length === 0) && (!messengerIds || !Array.isArray(messengerIds) || messengerIds.length === 0)) {
    return res.json([]);
  }

  let candidates;
  const fields = ['firstName', 'lastName', 'avatar', 'messengerId'];
  if(messengerIds && messengerIds.length > 0){
    candidates = await candidateService.findByMessengerIds(messengerIds, fields);
  }else if(ids && ids.length > 0){
    candidates = await candidateService.findByIds(ids.map(id => new ObjectId(id)), fields);
  }


  res.json(candidates);
})

module.exports = {
  uploadResume,
  generate,
  getCandidatesFlagged,
  addToBlacklist,
  addToBlacklistMultiple,
  removeFromBlacklist,
  getCandidateJobPreferences,
  getCandidateAccomplishments,
  addCandidateLanguages,
  updateCandidateLanguage,
  removeCandidateLanguage,
  updateCandidateJobPreferences,
  lookupCandidatesByIds,

}

