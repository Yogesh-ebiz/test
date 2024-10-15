const bcrypt = require('bcrypt');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const ISO6391 = require('iso-639-1');
const { Country, State, City }  = require('country-state-city');
const Company = require('../models/company.model');
const Company2 = require('../models/company2.model');
const Degree = require('../models/degree.model');
const FieldStudy = require('../models/fieldstudy.model');
const Industry = require('../models/industry.model');
const JobTitle = require('../models/jobtitle.model');
const Location = require('../models/location.model');
const Skill = require('../models/skill.model');
const School = require('../models/school.model');
const filterService = require('../services/filter.service');
const labelService = require('../services/label.service');
const jobFunctionService = require('../services/jobfunction.service');
const Response = require("../const/response");
const _ = require("lodash");
const industryCtl = require("./industry.controller");
const catchAsync = require("../utils/catchAsync");
const experienceLevelCtl = require("./experiencelevel.controller");
const employmentTypeCtl = require("./employmenttypes.controller");
const skillCtl = require("./skill.controller");
const jobFunctionCtl = require("./jobfunction.controller");
const { groupBy } = require('lodash');
const { matchSorter } = require('match-sorter');

const searchLocations = catchAsync(async (req, res) => {
  const { query } = req;
  let newOptions = [];
  let countries = Country.getAllCountries();
  let states = State.getAllStates();
  let cities = City.getAllCities();

  let statesByCountry = groupBy(states, "countryCode");
  let citiesByState = groupBy(cities, "stateCode");

  countries.forEach((country) => {
    newOptions.push({
      label: `${country.name}`,
      type: "country",
      meta: {
        ...country,
        region: null,
        city: null,
        country: country.name,
      },
    });

    let countryStates = statesByCountry[country.isoCode] || [];
    countryStates.forEach((state) => {
      newOptions.push({
        label: `${state.name}, ${country.name}`,
        type: "state",
        meta: {
          ...state,
          region: state.isoCode,
          country: country.name,
          city: null,
        },
      });

      const stateCities = citiesByState[state.isoCode] || [];
      stateCities.forEach((city) => {
        if (city.countryCode === state.countryCode) {
          newOptions.push({
            label: `${city.name}, ${state.name}, ${country.name}`,
            type: "city",
            meta: {
              ...city,
              locality: city.name,
              country: country.name,
              region: state.name,
            },
          });
        }
      });
    });
  });

  countries = null;
  states = null;
  cities = null;
  statesByCountry = null;
  citiesByState = null;

  const sortedOptions = matchSorter(newOptions, query.query, {
    keys: ['label', {maxRanking: matchSorter.rankings.STARTS_WITH, key: 'label'}],
  })

  res.json(sortedOptions.slice(0, 50));
});
const getAllCountries = catchAsync(async (req, res) => {
  const {query} = req;

  const data = await filterService.getAllCountries(query.query, res.locale);
  res.json(data);
});

const getAllStates = catchAsync(async (req, res) => {
  const {query} = req;

  const data = await filterService.getAllStates(query, res.locale);
  res.json(data);
});

const getAllCities = catchAsync(async (req, res) => {
  const {query} = req;

  let data = await filterService.getAllCities(query, res.locale);
  res.json(data);
});
const getLanguages = catchAsync(async (req, res) => {
  const { query } = req;

  let allCodes = ISO6391.getAllCodes();
  let allCodesAndLanguages = ISO6391.getLanguages(allCodes);
  let data;
  if (query.query) {
    data = _.filter(allCodesAndLanguages, function(o) {
      return o.name.match(query.query);
    });
  } else {
    data = allCodesAndLanguages;
  }

  res.json(data);
});
const getAllJobLocations = catchAsync(async (req, res) => {
  const { query } = req;

  let data = await filterService.getAllJobLocations(query.query);
  data = _.reduce(data, function(rs, item){
    let temp = item._id;
    temp.count = item.count;
    rs.push(temp);
    return rs;
  }, []);
  res.json(data);
});



async function getIndustryById(req, res) {
  let data = await industryCtl.getIndustryById(req.params.id, res.locale);
  res.json(new Response(data, data?'industry_retrieved_successful':'not_found', res));

}


async function getAllExperienceLevels(req, res) {
  let data = await experienceLevelCtl.getExperienceLevels(req.query, req.locale);
  res.json(new Response(data, data?'experiencelevels_retrieved_successful':'not_found', res));
}


async function getAllEmploymentTypes(req, res) {
  let data = await employmentTypeCtl.getEmploymentTypes(req.query, req.locale);
  res.json(new Response(data, data?'employmenttypes_retrieved_successful':'not_found', res));
}


async function getEmploymentTypeById(req, res) {
  let data = await employmentTypeCtl.getEmploymentTypeById(req.params.id, res.locale);
  res.json(new Response(data, data?'employmenttype_retrieved_successful':'not_found', res));
}


async function getAllSkills(req, res) {
  let filter = req.query;
  let data = await skillCtl.getSkills(filter, res.locale);

  res.json(new Response(data, data?'skills_retrieved_successful':'not_found', res));
}


const searchJobFunctions = catchAsync(async (req, res) => {
  const { query } = req;
  let data = await jobFunctionService.search(query.query, res.locale);

  res.json(data);
});

async function getJobFunctionById(req, res) {
  let data = await jobFunctionCtl.getJobFunctionById(req.params.id, res.locale);
  res.json(new Response(data, data?'jobfunction_retrieved_successful':'not_found', res));
}

const searchIndustries = catchAsync(async (req, res) => {
  const { query } = req;

  console.log(query)
  const keyword = query.query || '';
  query.shortCode = query.shortCode? query.shortCode.split(',').map(s => s) : [];
  query.ids = query.ids? query.ids.split(',').map(id => {console.log(id); return new ObjectId(id) }) : [];
  const filter = { ...query }
  let data = await filterService.searchIndustries(filter, res.locale);
  res.json(data);
});

const searchFieldStudy = catchAsync(async (req, res) => {
  const { query } = req;
  const data = await FieldStudy.aggregate([
    { $match: {name: { $regex: `${query.query}`, $options: 'i' }}},
    { $project: { _id: 1, name: 1}},
    { $limit: 10 }
  ]);
  res.json(data);
});

const searchJobTitles = catchAsync(async (req, res) => {
  const { query } = req;

  const data = await JobTitle.aggregate([
    { $match: {name: { $regex: `${query.query}`, $options: 'i' }}},
    { $project: { _id: 1, name: 1}},
    { $limit: 10 }
  ]);

  res.json(_.map(data, 'name'));
});
const searchCompany = catchAsync(async (req, res) => {
  const { query } = req;

  const data = Company2.aggregate([
    { $match: {name: { $regex: `${query.query}`, $options: 'i' }}},
    { $project: { _id: 1, name: 1}},
    { $limit: 10 }
  ]);

  res.json(data);
});
const searchSchool = catchAsync(async (req, res) => {
  const { query } = req;

  const data = await School.aggregate([
    { $match: {name: { $regex: `${query.query}`, $options: 'i' }}},
    { $project: { _id: 1, name: 1}},
    { $limit: 10 }
  ]);

  res.json(data);
});
const searchDegree = catchAsync(async (req, res) => {
  const { query } = req;

  const data = await Degree.aggregate([
    { $match: {name: { $regex: `${query.query}`, $options: 'i' }}},
    { $project: { _id: 1, name: 1}},
    { $limit: 10 }
  ]);

  res.json(data);
});
const searchSkills = catchAsync(async (req, res) => {
  const { query } = req;
  const keyword = query.query || '';

  const data = await Skill.aggregate([
    { $match: {name: { $regex: `${keyword}`, $options: 'i' }}},
    { $project: { _id: 1, name: 1}},
    { $limit: 10 }
  ]);

  res.json(data);
});


const searchSources = catchAsync(async (req, res) => {
  const { user, query } = req;
  let data = [];

  data = labelService.search(query.query, query.type, user?.company);

  res.json(data);
});

module.exports = {
  searchLocations,
  getAllCountries,
  getAllStates,
  getAllCities,
  getLanguages,
  getAllJobLocations,

  getIndustryById,
  getAllExperienceLevels,
  getAllEmploymentTypes,
  getEmploymentTypeById,
  getAllSkills,
  searchJobFunctions,
  getJobFunctionById,
  searchIndustries,
  searchFieldStudy,
  searchJobTitles,
  searchCompany,
  searchSchool,
  searchDegree,
  searchSkills,
  searchSources
}
