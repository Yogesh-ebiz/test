const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');

const SearchHistory = require('../models/searchhistory.model');
const {searchTitle} = require('../services/jobrequisition.service');
const {findSearchHistoryByKeyword, saveSearch} = require('../services/searchhistory.service');
const catchAsync = require("../utils/catchAsync");




const getSuggestion = catchAsync(async (req, res) => {
  const { query, locale } = req;
  const currentUserId = parseInt(req.header('UserId'));

  let data;
  try {
    data = await findSearchHistoryByKeyword(query.query);

    if(!data.length){
      data = await searchTitle(keyword);
    }

    data = _.reduce(data, function(res, item){
      res.push(item.keyword);
      return res
    }, []);

  } catch (error) {
    console.log(error);
  }

  res.json(data);
});



module.exports = {
  getSuggestion
}

