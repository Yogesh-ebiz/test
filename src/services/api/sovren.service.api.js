const fs = require('fs');
const path = require('path');
const async = require("async");
const Promise = require('promise');
const { Country, State, City }  = require('country-state-city');
const ApiClient = require('../apiManager');
const SovrenTransaction = require("../../models/sovrentransaction.model");
const _ = require("lodash");
const parsedResume = require('../../../migrations/resume4.json');

const client = new ApiClient('https://rest.resumeparsing.com');
const defaultIndex = 'accessed';
const options = {
  headers: {
    'Sovren-AccountId': '35186509',
    'Sovren-ServiceKey': '/sNTpg9udpEa2OV/o74nH1tZYma3sDiEYC7Ynt5g',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

const transform = (data)=> {
  const {ProfessionalSummary, ContactInformation, PersonalAttributes, SkillsData, LanguageCompetencies, Education, EmploymentHistory, ResumeMetadata} = data;
  const transformed = {};

  transformed.full_name = '';
  transformed.first_name = '';
  transformed.middle_name = '';
  transformed.last_name = '';
  transformed.first_initial = '';
  transformed.middle_initial = '';
  transformed.last_initial = '';

  transformed.gender = '';
  transformed.birth_date = '';
  transformed.birth_year = '';
  transformed.indstry = '';

  transformed.job_title = '';
  transformed.job_title_role = '';
  transformed.job_title_levels = '';


  transformed.mobile_phone = '';
  transformed.phone_numbers = [];

  transformed.recommended_personal_email = '';
  transformed.emails = [];
  transformed.personal_emails = [];

  transformed.experience = [];
  transformed.education = [];

  transformed.profiles = [];
  transformed.job_title_levels = [];
  transformed.skills = [];
  transformed.interests = [];


  transformed.regions = [];
  transformed.location_names = [];
  transformed.country = [];
  transformed.location_name = '';
  transformed.location_street_address = '';
  transformed.location_metro = '';
  transformed.location_region = '';
  transformed.location_country = '';
  transformed.location_postal_code = '';
  transformed.street_addresses = [];

  if(ProfessionalSummary){
    transformed.professional_summary = ProfessionalSummary;
  }

  if(ContactInformation){
    const {CandidateName, Telephones, EmailAddresses, Location} = ContactInformation;

    if(CandidateName){
      const {FormattedName, GivenName, MiddleName, FamilyName} = CandidateName;
      transformed.full_name = FormattedName?FormattedName.toLowerCase():'';
      transformed.first_name = GivenName?GivenName.toLowerCase():'';
      transformed.middle_name = MiddleName?MiddleName.toLowerCase():'';
      transformed.last_name = FamilyName?FamilyName.toLowerCase():'';
    }

    if(Telephones && Telephones.length){
      transformed.mobile_phone = Telephones[0].Normalized.replace(/[^0-9+]/g, '');

      Telephones.forEach((phone) => {
        transformed.phone_numbers.push(phone.Normalized.replace(/[^0-9+]/g, ''));
      });
    }

    if(EmailAddresses && EmailAddresses.length){
      transformed.recommended_personal_email = EmailAddresses[0].toLowerCase();

      EmailAddresses.forEach((email) => {
        transformed.personal_emails.push(email.toLowerCase());
        transformed.emails.push({ type: 'personal', address: email.toLowerCase() });
      });
    }


    if(Location){
      const {CountryCode, PostalCode, Regions, Municipality, StreetAddressLines, GeoCoordinates} = Location;

      transformed.location_postal_code = PostalCode?PostalCode:'';
      transformed.location_region = Regions?Regions:'';
      transformed.location_street_address = StreetAddressLines?StreetAddressLines:'';

      if(CountryCode){
        const country = Country.getCountryByCode(CountryCode.toUpperCase());
        if(country){
          transformed.country.push(country.isoCode.toLowerCase());
        }
      }

    }
  }

  if(PersonalAttributes){
    const {DateOfBirth, Gender, Nationality} = PersonalAttributes;
    transformed.birth_date = (DateOfBirth.FoundYear && DateOfBirth.FoundYear && DateOfBirth.FoundYear)?DateOfBirth.Date:'';
    transformed.gender = Gender?Gender.toLowerCase():'';
    transformed.nationality = Nationality?Nationality.toLowerCase():'';
  }




  transformed.skills_meta = [];
  if(SkillsData && SkillsData.length){
    transformed.skills_meta = _.reduce(SkillsData[0].Taxonomies, function(res, taxonomies){
      const {Name, SubTaxonomies} = taxonomies
      res.push({name: Name.toLowerCase(), noOfMonths: null});

      if(SubTaxonomies && SubTaxonomies.length){
        SubTaxonomies.forEach(subtaxonomy => {
          const {SubTaxonomyName, Skills} = subtaxonomy;
          res.push({name: SubTaxonomyName.toLowerCase(), noOfMonths: null});

          if(Skills && Skills.length){
            Skills.forEach(skill => {
              const {Name, MonthsExperience, Variations} = skill;
              const obj = {name: Name.toLowerCase()};
              if(MonthsExperience){
                obj.noOfMonths = MonthsExperience.Value;
              }
              res.push(obj);

              if(Variations && Variations.length){
                Variations.forEach(variation => {
                  const {Name} = variation;
                  res.push({name: Name.toLowerCase(), noOfMonths: null});
                });
              }
            });
          }

        });

      }

      return res;
    }, []);
  }


  transformed.languages = [];
  if(LanguageCompetencies && LanguageCompetencies.length){
    transformed.languages = _.reduce(LanguageCompetencies, function(res, item){
      const {Language, LanguageCode} = item
      res.push({name: Language.toLowerCase(), code: LanguageCode.toLowerCase()});
      return res;
    }, []);
  }

  if(EmploymentHistory){
    const {ExperienceSummary, Positions} = EmploymentHistory;

    if(Positions && Positions.length){
      transformed.experience = _.reduce(Positions, function(res, item){
        const {Employer, IsCurrent, JobTitle, StartDate, EndDate, JobLevel, Description} = item;
        let company = null;
        const obj = {
          company: company,
          title: {
            role: null,
            name: '',
            sub_role: null,
            levels: []
          }
        };

        if(JobTitle){
          obj.title.name = JobTitle.Normalized.toLowerCase();
        }

        if(Employer){
          const {Name, Location} = Employer;
          company = { location: null };
          if(Name){
            company.name = Name.Raw.toLowerCase();
          }



          if(Location){
            const location = {
              continent: '',
              geo: '',
              country: '',
              street_address: '',
              metro: '',
              name: '',
              locality: '',
              address_line_2: '',
              region: '',
              postal_code: ''
            };
            const {CountryCode, Regions, Municipality} = Location;
            let country = null;
            let state = null;

            if(CountryCode){
              country = Country.getCountryByCode(CountryCode);
              if(country){
                location.country = country.name.toLowerCase();
                location.geo = `${country.longitude},${country.latitude}`;
              }
            }

            if(CountryCode && Regions){
                state = State.getStateByCodeAndCountry(Regions[0], CountryCode);
                if(state){
                  location.region = state.name.toLowerCase();
                  location.geo = `${state.longitude},${state.latitude}`;
                }
            }
            if(Municipality){
              location.locality = Municipality.toLowerCase();
            }

            if(location.locality && state && country){
              const location_name = `${location.locality}, ${state.name.toLowerCase()}, ${country.name.toLowerCase()}`;
              location.name = location_name;
              location.location_names = [location_name];
            }
            company.location = location;
          }

          obj.company = company
        }

        if(StartDate){
          const {Date, FoundYear, FoundMonth, FoundDay} = StartDate;
          let date = null, start_date=null;

          if(FoundYear && FoundMonth && FoundDay){
            start_date = StartDate.Date.split('-');
            start_date = start_date.pop();
            date = start_date.join('-');
          } else if(FoundYear && FoundMonth){
            start_date = Date.split('-');
            if(start_date.length===3){
              start_date.pop();
            }
            date = start_date.join('-');
          }

          obj.start_date = date;
        }

        if(EndDate){
          const {Date, FoundYear, FoundMonth, FoundDay} = EndDate;
          let date = null, end_date=null;

          if(FoundYear && FoundMonth && FoundDay){
            end_date = StartDate.Date.split('-');
            end_date = start_date.pop();
            date = start_date.join('-');
          } else if(FoundYear && FoundMonth){
            end_date = Date.split('-');
            if(end_date.length===3){
              end_date.pop();
            }
            date = end_date.join('-');
          }

          obj.end_date = date;
        }

        res.push(obj);
        return res;
      }, []);
    }

  }

  if(Education){
    const {HighestDegree, EducationDetails} = Education;

    if(EducationDetails && EducationDetails.length){
      transformed.education = _.reduce(EducationDetails, function(res, item){
        const {SchoolName, SchoolType, Location, Degree, Majors, StartDate, EndDate} = item;
        let school = null;
        const obj = {
          end_date: null,
          start_date: null,
          majors: [],
          school: school,
          minors: [],
          gpa: null,
          degrees: []
        };

        if(Degree){
          const {Name, Type} = Degree;
          if(Type){
            obj.degrees.push(Type.toLowerCase());
          }
        }

        if(Majors && Majors.length){
          obj.majors = _.reduce(Majors, (res, item) => {res.push(item.toLowerCase()); return res;}, []);
        }

        if(SchoolName){
          school = {};
          school.name = SchoolName.Raw.toLowerCase();

          if(Location){
            const location = {
              continent: '',
              country: '',
              name: '',
              locality: '',
              region: ''
            };
            const {CountryCode, Regions, Municipality} = Location;
            let country = null;
            let state = null;

            if(CountryCode){
              country = Country.getCountryByCode(CountryCode);
              if(country){
                location.country = country.name.toLowerCase();
                location.geo = `${country.longitude},${country.latitude}`;
              }
            }

            if(CountryCode && Regions){
              state = State.getStateByCodeAndCountry(Regions[0], CountryCode);
              if(state){
                location.region = state.name.toLowerCase();
              }
            }
            if(Municipality){
              location.locality = Municipality.toLowerCase();
            }

            if(location.locality && state && country){
              const location_name = `${location.locality}, ${state.name.toLowerCase()}, ${country.name.toLowerCase()}`;
              location.name = location_name;
            }
            school.location = location;
          }

        }


        obj.school = school

        if(StartDate){
          const {Date, FoundYear, FoundMonth, FoundDay} = StartDate;
          let date = null, start_date=null;

          if(FoundYear && FoundMonth && FoundDay){
            start_date = StartDate.Date.split('-');
            start_date = start_date.pop();
            date = start_date.join('-');
          } else if(FoundYear && FoundMonth){
            start_date = Date.split('-');
            if(start_date.length===3){
              start_date.pop();
            }
            date = start_date.join('-');
          }

          obj.start_date = date;
        }

        if(EndDate){
          const {Date, FoundYear, FoundMonth, FoundDay} = EndDate;
          let date = null, end_date=null;

          if(FoundYear && FoundMonth && FoundDay){
            end_date = StartDate.Date.split('-');
            end_date = start_date.pop();
            date = start_date.join('-');
          } else if(FoundYear && FoundMonth){
            end_date = Date.split('-');
            if(end_date.length===3){
              end_date.pop();
            }
            date = end_date.join('-');
          }

          obj.end_date = date;
        }

        res.push(obj);
        return res;
      }, []);
    }

  }

  console.log(transformed)
  return transformed;
};

async function createIndex(form) {
  console.log('createIndex', form)
  let data = {
    "IndexType": form.indexType
  };

  let response = await client.post(`/v10/index/${form.name}`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};

async function deleteIndex(index) {
  console.log('deleteIndex', index)


  let response = await client.delete(`/v10/index/${index}`, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);
      return error.response;
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};

async function getResume(index, documentId) {
  console.log('getResume', index, documentId)

  let response = await client.get(`/v10/index/${index}/resume/${documentId}`, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data;
};

async function uploadResume(filePath, index, documentId) {
  var buffer = fs.readFileSync(filePath);
  var base64Doc = buffer.toString('base64');
  var modifiedDate = (new Date(fs.statSync(filePath).mtimeMs)).toISOString().substring(0, 10);

  var data = JSON.stringify({
    'DocumentAsBase64String': base64Doc,
    'DocumentLastModified': modifiedDate,
    'OutputCandidateImage':true,
    'IndexingOptions': {
      'IndexId': index,
      'DocumentId': documentId
    }
  });

  options.headers['Content-Length'] =  Buffer.byteLength(data);

  let response = await client.post(`/v10/parser/resume`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};

async function uploadResumeBase64(base64Doc, modifiedDate, index, documentId) {
  // console.log(base64Doc)
  if(!base64Doc || !modifiedDate || !index || !documentId){
    return;
  }
  let response = parsedResume;
  let data = JSON.stringify({
    'DocumentAsBase64String': base64Doc,
    'DocumentLastModified': modifiedDate,
    'OutputCandidateImage':true,
    'IndexingOptions': {
      'IndexId': index,
      'DocumentId': documentId
    }
  });
  options.headers['Content-Length'] =  Buffer.byteLength(data);

  // response = await client.post(`/v10/parser/resume`, data, options).catch(function (error) {
  //   if (error.response) {
  //     // Request made and server responded
  //     console.log(error.response);
  //
  //   } else if (error.request) {
  //     // The request was made but no response was received
  //     console.log(error.request);
  //   } else {
  //     // Something happened in setting up the request that triggered an Error
  //     console.log('Error', error.message);
  //   }
  //
  // });

  // console.log(response?.data)
  // if(response?.data.Info){
  //   const sovrenTransaction = new SovrenTransaction(response.data.Info);
  //   await sovrenTransaction.save();
  // }

  // if(response?.Value){
  //
  // }
  // fs.writeFile("parsedResume.json", Buffer.from(JSON.stringify(response.data)), (err) => {
  //   if (err) throw err;
  // });


  const transformed = transform(response.data.Value.ResumeData);
  return response.data;
};

async function addResume(form, index, documentId) {

  console.log(form)
  let response = await client.post(`/v10/index/${index}/resume/${documentId}`, form, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};

async function uploadJob(filePath, index, documentId) {
  var buffer = fs.readFileSync(filePath);
  var base64Doc = buffer.toString('base64');

  var modifiedDate = (new Date(fs.statSync(filePath).mtimeMs)).toISOString().substring(0, 10);

  var data = JSON.stringify({
    'DocumentAsBase64String': base64Doc,
    'DocumentLastModified': modifiedDate,
    'IndexingOptions': {
      'IndexId': index,
      'DocumentId': documentId
    }
  });

  options.headers['Content-Length'] =  Buffer.byteLength(data);

  let response = await client.post(`/v10/parser/joborder`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};

async function matchResume(data) {


  let response = await client.post(`/v10/matcher/resume`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data;
};


async function matchResumeByDocument(index, documentId, data) {


  let response = await client.post(`/v10/matcher/indexes/${index}/documents/${documentId}`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });


  return response.data;
};


async function addSkills(data) {

  let response = await client.post(`/v10/skills`, data, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};

async function listAllSkills() {

  let response = await client.get(`/v10/skills`, options).catch(function (error) {
    if (error.response) {
      // Request made and server responded
      console.log(error.response);

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

  });

  return response.data;
};



module.exports = {
  createIndex,
  deleteIndex,
  getResume,
  uploadResume,
  uploadResumeBase64,
  addResume,
  uploadJob,
  matchResume,
  matchResumeByDocument,
  addSkills,
  listAllSkills
}
