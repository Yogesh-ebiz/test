const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');

const PeopleSchema = new mongoose.Schema({
  id: {
    type: String
  },
  uuid: {
    type: String
  },
  ref_id: {
    type: String
  },
  full_name: {
    type: String
  },
  first_name: {
    type: String
  },
  middle_initial: {
    type: String
  },
  middle_name: {
    type: String
  },
  last_initial: {
    type: String
  },
  last_name: {
    type: String
  },
  gender: {
    type: String
  },
  birth_date: {
    type: String
  },
  birth_year: {
    type: Number
  },
  mobile_phone: {
    type: String
  },
  phone_numbers: {
    type: Array
  },
  emails: {
    type: Array
  },
  personal_emails: {
    type: Array
  },
  work_email: {
    type: String
  },
  location_name: {
    type: String
  },
  location_locality: {
    type: String
  },
  location_region: {
    type: String
  },
  location_metro: {
    type: String
  },
  location_country: {
    type: String
  },
  location_continent: {
    type: String
  },
  location_street_address: {
    type: String
  },
  location_address_line_2: {
    type: String
  },
  location_postal_code: {
    type: String
  },
  location_geo: {
    type: String
  },
  location_names: {
    type: Array
  },
  regions: {
    type: Array
  },
  linkedin_url: {
    type: String
  },
  linkedin_username: {
    type: String
  },
  linkedin_id: {
    type: String
  },
  facebook_url: {
    type: String
  },
  facebook_username: {
    type: String
  },
  facebook_id: {
    type: String
  },
  twitter_url: {
    type: String
  },
  twitter_username: {
    type: String
  },
  github_url: {
    type: String
  },
  github_username: {
    type: String
  },
  profiles: {
    type: Array
  },
  job_title: {
    type: String
  },
  job_title_role: {
    type: String
  },
  job_title_sub_role: {
    type: String
  },
  job_title_levels: {
    type: Array
  },
  job_start_date: {
    type: String
  },
  job_company_id: {
    type: String
  },
  job_company_name: {
    type: String
  },
  job_company_website: {
    type: String
  },
  job_company_size: {
    type: String
  },
  job_company_founded: {
    type: String
  },
  job_company_industry: {
    type: String
  },
  job_company_linkedin_url: {
    type: String
  },
  job_company_linkedin_id: {
    type: String
  },
  job_company_location_name: {
    type: String
  },
  job_company_location_locality: {
    type: String
  },
  job_company_location_region: {
    type: String
  },
  job_company_location_metro: {
    type: String
  },
  job_company_location_country: {
    type: String
  },
  job_company_location_continent: {
    type: String
  },
  job_company_location_street_address: {
    type: String
  },
  job_company_location_address_line_2: {
    type: String
  },
  job_company_location_postal_code: {
    type: String
  },
  job_company_location_geo: {
    type: String
  },
  industry: {
    type: String
  },
  interests: {
    type: Array
  },
  skills: {
    type: Array
  },
  experience: {
    type: Array
  },
  education: {
    type: Array
  },
  phones: {
    type: Array
  },
  user_id: {
    type: Number,
    required: false
  },
  last_applied: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  preferences: {
    type: Object,
    default: {
      openToRelocate: true,
      openToRemote: true,
      openToJob: true,
      jobTitles: [],
      jobLocations: [],
      jobTypes: [],
      startDate: "IMMEDIATE"
    }
  },
  resumes: [{ type: Schema.Types.ObjectId, ref: 'File' }]
},
{
  timestamps: true,
  versionKey: false
});

PeopleSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'email', 'picture', 'role', 'createdAt'];
    transformed.id = this.id;
    transformed.uuid = this.uuid;
    transformed.status = this.status;
    transformed.lastApplied = this.last_applied;
    transformed.fullName = this.full_name;
    transformed.firstName = this.first_name;
    transformed.middleName = this.middle_name;
    transformed.lastName = this.last_name;
    transformed.industry = this.indstry;
    transformed.jobTitle = this.job_title;
    transformed.role = this.job_title_role;
    transformed.levels = this.job_title_levels;
    transformed.jobTitle = this.job_title;
    transformed.gender = this.gender;
    transformed.dob = this.birth_date;
    transformed.skills = this.skills;
    transformed.links = this.profiles;
    transformed.languages = _.reduce(this.languages, function(res, language){
      res.push({name: language});
      return res;
    }, []);
    transformed.skills = _.reduce(this.skills, function(res, skill){
      res.push({name: skill});
      return res;
    }, []);
    transformed.experiences = _.reduce(this.experience, function(res, exp){
      const {title, company, start_date, end_date} = exp;
      let fromDate = '', thruDate = '';

      if(start_date){
        if(start_date.indexOf('-')>0){
          fromDate = start_date.split('-');
          if(fromDate.length===2){
            fromDate.splice(1, 0, '01');
          } else if(fromDate.length===3){
            fromDate.push(fromDate.splice(1, 1)[0]);
          }

        } else if(start_date.length===4){
          fromDate = [start_date];
          // fromDate.splice(1, 0, '01', '01');
          fromDate.splice(1, 0, '01', '01');
        }
        fromDate = fromDate.reverse().join('-');

      }

      if(end_date){
        if(end_date.indexOf('-')>0){
          thruDate = end_date.split('-');
          if(thruDate.length===2){
            thruDate.splice(1, 0, '01');
          } else if(thruDate.length===3){
            thruDate.push(thruDate.splice(1, 1)[0]);
          }
        } else if(end_date.length===4){
          thruDate = [end_date];
          thruDate.splice(1, 0, '01', '01');
        }
        thruDate = thruDate.reverse().join('-');
      }

      const experience = {
        employmentTitle: title.name,
        address: company?.location?.street_address,
        city: company?.location?.locality,
        state: company?.location?.region,
        country: company?.location?.country,
        employer: {
          name: company?.name? company.name:'',
          primaryAddress: {
            name: company?.location?.name,
            address: company?.location?.street_address,
            city: company?.location?.locality,
            state: company?.location?.region,
            country: company?.location?.country,
          }
        },
        fromDate: fromDate,
        thruDate: thruDate,
        isCurrent: exp.is_primary
      }
      res.push(experience);
      return res;
    }, []);
    transformed.educations = _.reduce(this.education, function(res, edu){
      const {title, school, degrees, majors, start_date, end_date} = edu;
      let fromDate = '', thruDate = '';

      if(start_date){
        if(start_date.indexOf('-')>0){
          fromDate = start_date.split('-');
          fromDate.splice(1, 0, '01');
        } else if(start_date.length===4){
          fromDate = [start_date];
          // fromDate.splice(1, 0, '01', '01');
          fromDate.splice(1, 0, '01', '01');
        }
        fromDate = fromDate.reverse().join('-');
      }

      if(end_date){
        if(end_date.indexOf('-')>0){
          thruDate = end_date.split('-');
          thruDate.splice(1, 0, '01');
        } else if(end_date.length===4){
          thruDate = [end_date];
          thruDate.splice(1, 0, '01', '01');
        }
        thruDate = thruDate.reverse().join('-');
      }

      const education = {
        degree: degrees.length?degrees[0]:'',
        fieldOfStudy: majors.length?{name: majors[0]}:null,
        institute: {
          name: school?.name,
          primaryAddress: {
            name: school?.location?.name,
            address: school?.location?.street_address,
            city: school?.location?.locality,
            state: school?.location?.region,
            country: school?.location?.country,
          }
        },
        fromDate: fromDate,
        thruDate: thruDate
      }
      res.push(education);
      return res;
    }, []);
    transformed.current = {
      jobTitle: this.job_title,
      company: {
        name: this.job_company_name,
        primaryAddress: {
          name: this.job_company_locality_name,
          address: '',
          city: this.job_company_locality,
          state: this.job_company_region,
          country: this.job_company_country,
        }
      },
      fromDate: this.job_start_date,
      thruDate: '',
      isCurrent: true
    }
    transformed.preferences = this.preferences;
    transformed.primaryAddress = {
      name: this.location_names,
      address: this.location_street_address,
      city: this.location_locality,
      state: this.location_region,
      country: this.location_country,
      postalCode: this.location_postal_code,
      longlat: this.location_geo,
    };

    transformed.hasPhone = this.phone_numbers.length? true:false;
    transformed.hasEmail = this.emails.length? true:false;
    transformed.phoneNumbers = [];
    transformed.emails = [];
    delete transformed.mobile_phone;
    delete transformed.personal_emails;

    // transformed.phoneNumbers = _.reduce(this.phone_numbers, function(res,  contact){
    //   const phone = {
    //     contactType: contact===this.mobile_phone?'MOBILE':'PERSONAL',
    //     isPrimary: contact===this.mobile_phone?true:false,
    //     value: contact
    //   }
    //   res.push(phone);
    //   return res;
    // }, []);
    // transformed.emails = _.reduce(this.emails, function(res,  contact){
    //   const primaryContact = _.find(this.emails, {type: 'personal'});
    //   const email = {
    //     contactType: contact.type==='current_professional'?'WORK':'PERSONAL',
    //     isPrimary: contact.type==='persoal'?true:false,
    //     value: contact.address
    //   }
    //   res.push(email);
    //   return res;
    // }, []);
    return transformed;
  },
  transformWithContacts() {
    const that = this;
    const transformed = {};
    const fields = ['id', 'name', 'email', 'picture', 'role', 'createdAt'];
    transformed.id = this.id;
    transformed.uuid = this.uuid;
    transformed.status = this.status;
    transformed.lastApplied = this.last_applied;
    transformed.fullName = this.full_name;
    transformed.firstName = this.first_name;
    transformed.middleName = this.middle_name;
    transformed.lastName = this.last_name;
    transformed.industry = this.indstry;
    transformed.jobTitle = this.job_title;
    transformed.role = this.job_title_role;
    transformed.levels = this.job_title_levels;
    transformed.jobTitle = this.job_title;
    transformed.gender = this.gender;
    transformed.dob = this.birth_date;
    transformed.skills = this.skills;
    transformed.links = this.profiles;
    transformed.languages = _.reduce(this.languages, function(res, language){
      res.push({name: language});
      return res;
    }, []);
    transformed.skills = _.reduce(this.skills, function(res, skill){
      res.push({name: skill});
      return res;
    }, []);
    transformed.experiences = _.reduce(this.experience, function(res, exp){
      const {title, company, start_date, end_date} = exp;
      let fromDate = '', thruDate = '';

      if(start_date){
        if(start_date.indexOf('-')>0){
          fromDate = start_date.split('-');
          if(fromDate.length===2){
            fromDate.splice(1, 0, '01');
          } else if(fromDate.length===3){
            fromDate.push(fromDate.splice(1, 1)[0]);
          }

        } else if(start_date.length===4){
          fromDate = [start_date];
          // fromDate.splice(1, 0, '01', '01');
          fromDate.splice(1, 0, '01', '01');
        }
        fromDate = fromDate.reverse().join('-');

      }

      if(end_date){
        if(end_date.indexOf('-')>0){
          thruDate = end_date.split('-');
          if(thruDate.length===2){
            thruDate.splice(1, 0, '01');
          } else if(thruDate.length===3){
            thruDate.push(thruDate.splice(1, 1)[0]);
          }
        } else if(end_date.length===4){
          thruDate = [end_date];
          thruDate.splice(1, 0, '01', '01');
        }
        thruDate = thruDate.reverse().join('-');
      }
      const experience = {
        employmentTitle: title.name,
        address: company?.location?.street_address,
        city: company?.location?.locality,
        state: company?.location?.region,
        country: company?.location?.country,
        employer: {
          name: company?.name? company.name:'',
          primaryAddress: {
            name: company?.location?.name,
            address: company?.location?.street_address,
            city: company?.location?.locality,
            state: company?.location?.region,
            country: company?.location?.country,
          }
        },
        fromDate: fromDate,
        thruDate: thruDate,
        isCurrent: exp.is_primary
      }
      res.push(experience);
      return res;
    }, []);
    transformed.educations = _.reduce(this.education, function(res, edu){
      const {title, school, degrees, majors, start_date, end_date} = edu;
      let fromDate = '', thruDate = '';

      if(start_date){
        if(start_date.indexOf('-')>0){
          fromDate = start_date.split('-');
          fromDate.splice(1, 0, '01');
        } else if(start_date.length===4){
          fromDate = [start_date];
          // fromDate.splice(1, 0, '01', '01');
          fromDate.splice(1, 0, '01', '01');
        }
        fromDate = fromDate.reverse().join('-');
      }

      if(end_date){
        if(end_date.indexOf('-')>0){
          thruDate = end_date.split('-');
          thruDate.splice(1, 0, '01');
        } else if(end_date.length===4){
          thruDate = [end_date];
          thruDate.splice(1, 0, '01', '01');
        }
        thruDate = thruDate.reverse().join('-');
      }

      const education = {
        degree: degrees.length?degrees[0]:'',
        fieldOfStudy: majors.length?{name: majors[0]}:null,
        institute: {
          name: school?.name,
          primaryAddress: {
            name: school?.location?.name,
            address: school?.location?.street_address,
            city: school?.location?.locality,
            state: school?.location?.region,
            country: school?.location?.country,
          }
        },
        fromDate: fromDate,
        thruDate: thruDate
      }
      res.push(education);
      return res;
    }, []);
    transformed.current = {
      jobTitle: this.job_title,
      company: {
        name: this.job_company_name,
        primaryAddress: {
          name: this.job_company_locality_name,
          address: '',
          city: this.job_company_locality,
          state: this.job_company_region,
          country: this.job_company_country,
        }
      },
      fromDate: this.job_start_date,
      thruDate: '',
      isCurrent: true
    }
    transformed.preferences = this.preferences;
    transformed.primaryAddress = {
      name: this.location_names,
      address: this.location_street_address,
      city: this.location_locality,
      state: this.location_region,
      country: this.location_country,
      postalCode: this.location_postal_code,
      longlat: this.location_geo,
    };

    transformed.hasPhone = this.mobile_phone || this.phone_numbers.length>0? true:false;
    transformed.hasEmail = this.emails.length? true:false;


    transformed.phoneNumbers = _.reduce(this.phone_numbers, function(res,  contact){
      const phone = {
        contactType: contact===that.mobile_phone?'MOBILE':'PERSONAL',
        isPrimary: contact===that.mobile_phone?true:false,
        value: contact
      }
      res.push(phone);
      return res;
    }, []);

    transformed.emails = _.reduce(this.emails, function(res,  contact){
      const primaryContact = _.find(that.emails, {type: 'personal'});
      const email = {
        contactType: contact.type==='current_professional'?'WORK':'PERSONAL',
        isPrimary: contact.type==='persoal'?true:false,
        value: contact.address
      }
      res.push(email);
      return res;
    }, []);

    if(this.personal_emails.length){
      transformed.primaryEmail = {
        contactType: 'PERSONAL',
        value: this.personal_emails[0]
      };
    }

    if(this.mobile_phone){
      transformed.primaryPhone = {
        contactType: 'PERSONAL',
        value: this.mobile_phone
      };
    } else if(this.phone_numbers && this.phone_numbers.length>0){
      transformed.primaryPhone = {
        contactType: 'PERSONAL',
        value: this.phone_numbers[0]
      };
    }


    return transformed;
  }
});

PeopleSchema.methods.fullContact = async function (type) {
  const transformed = {};
  transformed.id = this.id;
  transfom.uuid = this.uuid;
  if(type==='phones') {
    transformed.phoneNumbers = _.reduce(this.phone_numbers, function(res,  contact){
      const phone = {
        contactType: contact===this.mobile_phone?'MOBILE':'PERSONAL',
        isPrimary: contact===this.mobile_phone?true:false,
        value: contact
      }
      res.push(phone);
      return res;
    }, []);
  }
  if(type==='emails') {
    transformed.emails = _.reduce(this.emails, function(res,  contact){
      const primaryContact = _.find(this.emails, {type: 'personal'});
      const email = {
        contactType: contact.type==='current_professional'?'WORK':'PERSONAL',
        isPrimary: contact.type==='persoal'?true:false,
        value: contact.address
      }
      res.push(email);
      return res;
    }, []);
  }

  return transformed;
};
module.exports = mongoose.model('People', PeopleSchema);
// module.exports = mongoose.models['User'] || mongoose.('User', SectionSchema);
